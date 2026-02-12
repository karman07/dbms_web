#!/bin/bash

# Quick Update Script for Existing PM2 Deployment
# Use this when you already have the app running and just need to update

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔄 Quick Update - Adding Push Notifications"
echo "=========================================="

# 1. Install dependencies
echo ""
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# 2. Build application
echo ""
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build
echo -e "${GREEN}✓ Build completed${NC}"

# 3. Reload PM2
echo ""
echo -e "${YELLOW}🔄 Reloading PM2 (zero downtime)...${NC}"
pm2 reload dbms-backend || pm2 restart dbms-backend
echo -e "${GREEN}✓ PM2 reloaded${NC}"

# 4. Save PM2 state
echo ""
pm2 save
echo -e "${GREEN}✓ PM2 state saved${NC}"

# 5. Show status
echo ""
echo "=========================================="
echo "📊 Current Status"
echo "=========================================="
pm2 list

echo ""
echo "=========================================="
echo "📝 Recent Logs (last 30 lines)"
echo "=========================================="
pm2 logs dbms-backend --nostream --lines 30

echo ""
echo -e "${GREEN}✅ Update completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Check logs: pm2 logs dbms-backend"
echo "  2. Monitor: pm2 monit"
echo "  3. Test notifications using Postman/API"
echo ""
