#!/bin/bash

# Admin Panel Deployment Script

echo "🚀 Starting Admin Panel Deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create logs directory
mkdir -p logs

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${BLUE}📦 Installing dependencies...${NC}"
  npm install
fi

# Build the application
echo -e "${BLUE}🔨 Building admin panel...${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Build failed!${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
  echo -e "${RED}❌ PM2 is not installed. Install it with: npm install -g pm2${NC}"
  exit 1
fi

# Check if serve is installed
if ! command -v serve &> /dev/null; then
  echo -e "${BLUE}📦 Installing serve globally...${NC}"
  npm install -g serve
fi

# Check if app is already running
if pm2 list | grep -q "dbms-admin"; then
  echo -e "${BLUE}🔄 Reloading admin panel...${NC}"
  pm2 reload ecosystem.config.js
else
  echo -e "${BLUE}🚀 Starting admin panel...${NC}"
  pm2 start ecosystem.config.js
fi

# Save PM2 process list
pm2 save

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${BLUE}📊 Admin panel is running on http://localhost:5173${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 logs dbms-admin     - View logs"
echo "  pm2 monit               - Monitor process"
echo "  pm2 restart dbms-admin  - Restart"
echo "  pm2 stop dbms-admin     - Stop"
