#!/bin/bash

# DBMS Backend Deployment Script
# This script helps deploy/update the NestJS application with PM2

set -e # Exit on error

echo "🚀 DBMS Backend Deployment Script"
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run as root"
    exit 1
fi

# 1. Check if PM2 is installed
echo ""
echo "Checking dependencies..."
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 is not installed. Install with: npm install -g pm2"
    exit 1
else
    print_success "PM2 is installed"
fi

# 2. Check if Redis is running
if redis-cli ping &> /dev/null; then
    print_success "Redis is running"
else
    print_warning "Redis is not running. Starting Redis..."
    if command -v brew &> /dev/null; then
        brew services start redis
    else
        sudo systemctl start redis-server
    fi
fi

# 3. Create logs directory
echo ""
echo "Setting up logs directory..."
mkdir -p logs
print_success "Logs directory created"

# 4. Install dependencies
echo ""
echo "Installing dependencies..."
npm install
print_success "Dependencies installed"

# 5. Build application
echo ""
echo "Building application..."
npm run build
print_success "Build completed"

# 6. Check if app is already running in PM2
APP_NAME="dbms-backend"
if pm2 list | grep -q "$APP_NAME"; then
    echo ""
    echo "Application is already running. Choose an option:"
    echo "1) Reload (zero-downtime restart)"
    echo "2) Restart (stop and start)"
    echo "3) Stop"
    echo "4) Delete and start fresh"
    echo "5) Cancel"
    read -p "Enter choice [1-5]: " choice
    
    case $choice in
        1)
            echo "Reloading application..."
            pm2 reload $APP_NAME
            print_success "Application reloaded"
            ;;
        2)
            echo "Restarting application..."
            pm2 restart $APP_NAME
            print_success "Application restarted"
            ;;
        3)
            echo "Stopping application..."
            pm2 stop $APP_NAME
            print_success "Application stopped"
            exit 0
            ;;
        4)
            echo "Deleting and starting fresh..."
            pm2 delete $APP_NAME
            pm2 start ecosystem.config.js --env production
            print_success "Application started fresh"
            ;;
        5)
            print_warning "Cancelled"
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
else
    echo ""
    echo "Starting application with PM2..."
    pm2 start ecosystem.config.js --env production
    print_success "Application started"
fi

# 7. Save PM2 process list
echo ""
echo "Saving PM2 process list..."
pm2 save
print_success "PM2 configuration saved"

# 8. Show status
echo ""
echo "=================================="
echo "📊 Application Status"
echo "=================================="
pm2 list

echo ""
echo "=================================="
echo "📝 Recent Logs"
echo "=================================="
pm2 logs $APP_NAME --nostream --lines 20

echo ""
print_success "Deployment completed successfully!"
echo ""
echo "Useful commands:"
echo "  pm2 logs $APP_NAME         # View logs"
echo "  pm2 monit                  # Monitor CPU/Memory"
echo "  pm2 restart $APP_NAME      # Restart app"
echo "  pm2 reload $APP_NAME       # Zero-downtime reload"
echo "  pm2 stop $APP_NAME         # Stop app"
echo ""
