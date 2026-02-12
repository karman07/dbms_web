# PM2 Deployment Guide

Complete guide for deploying your NestJS backend with Redis using PM2.

## Prerequisites

- Node.js (v16 or higher)
- Redis installed on your server
- PM2 globally installed

## 1. Install PM2

```bash
npm install -g pm2
```

## 2. Install Redis

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### macOS
```bash
brew install redis
brew services start redis
```

### Verify Redis is running
```bash
redis-cli ping
# Should return: PONG
```

## 3. Create PM2 Ecosystem File

Create `ecosystem.config.js` in your project root:

```javascript
module.exports = {
  apps: [
    {
      name: 'dbms-backend',
      script: './dist/main.js',
      instances: 'max', // Or specify number like 2, 4
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
  ],
};
```

## 4. Production Environment Setup

### Create `.env.production` file:

```env
# Server
NODE_ENV=production
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/dbms_production
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/dbms_production

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_if_set

# Cloudinary (if using)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (if configured)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

## 5. Deployment Steps

### Step 1: Build the application
```bash
npm run build
```

### Step 2: Install production dependencies only (optional)
```bash
npm ci --production
# Or keep all dependencies: npm install
```

### Step 3: Create logs directory
```bash
mkdir -p logs
```

### Step 4: Start with PM2
```bash
# Using ecosystem file
pm2 start ecosystem.config.js

# Or direct command
pm2 start dist/main.js --name dbms-backend -i max
```

## 6. PM2 Commands

### Basic Commands
```bash
# Start application
pm2 start ecosystem.config.js

# Stop application
pm2 stop dbms-backend

# Restart application
pm2 restart dbms-backend

# Reload (zero-downtime restart)
pm2 reload dbms-backend

# Delete from PM2
pm2 delete dbms-backend

# View logs
pm2 logs dbms-backend

# View logs in real-time
pm2 logs dbms-backend --lines 100

# Monitor CPU/Memory
pm2 monit

# List all applications
pm2 list

# Show detailed info
pm2 show dbms-backend

# Flush logs
pm2 flush
```

### Save PM2 Configuration
```bash
# Save current PM2 processes
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# This will output a command like:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u your-user --hp /home/your-user
# Run that command
```

## 7. Redis Configuration for Production

### Edit Redis config (Ubuntu/Debian)
```bash
sudo nano /etc/redis/redis.conf
```

### Important Redis settings:

```conf
# Bind to localhost only (or your server IP)
bind 127.0.0.1

# Set password
requirepass your_strong_password_here

# Enable persistence
save 900 1
save 300 10
save 60 10000

# Log level
loglevel notice

# Max memory policy
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### Restart Redis
```bash
sudo systemctl restart redis-server
```

### Update your `.env.production`
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_strong_password_here
```

## 8. Nginx Configuration (Recommended)

### Install Nginx
```bash
sudo apt install nginx
```

### Create Nginx config
```bash
sudo nano /etc/nginx/sites-available/dbms-backend
```

### Nginx configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # File upload size
    client_max_body_size 50M;
}
```

### Enable site and restart Nginx
```bash
sudo ln -s /etc/nginx/sites-available/dbms-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Add SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

## 9. Monitoring and Maintenance

### PM2 Plus (Optional - Advanced Monitoring)
```bash
pm2 link <secret_key> <public_key>
```
Get keys from: https://app.pm2.io

### Check Application Health
```bash
# CPU and Memory
pm2 monit

# Logs
pm2 logs --lines 50

# Restart if high memory
pm2 restart dbms-backend
```

### Database Backup (MongoDB)
```bash
# Backup
mongodump --db dbms_production --out /backup/mongodb/$(date +%Y%m%d)

# Restore
mongorestore --db dbms_production /backup/mongodb/20260212/dbms_production
```

### Redis Backup
```bash
# Redis auto-saves to /var/lib/redis/dump.rdb
# Manual save
redis-cli -a your_password SAVE

# Backup the dump file
cp /var/lib/redis/dump.rdb /backup/redis/dump-$(date +%Y%m%d).rdb
```

## 10. Update/Redeployment Process

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Build application
npm run build

# 4. Reload PM2 (zero-downtime)
pm2 reload dbms-backend

# Or restart if reload doesn't work
pm2 restart dbms-backend

# 5. Check logs
pm2 logs dbms-backend --lines 50
```

## 11. Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs dbms-backend --err

# Check if port is in use
sudo lsof -i :3000

# Check Redis connection
redis-cli -h localhost -p 6379 -a your_password ping
```

### High memory usage
```bash
# Check memory
pm2 list

# Restart specific instance
pm2 restart dbms-backend

# Or reload all
pm2 reload all
```

### Redis connection issues
```bash
# Test Redis
redis-cli -h localhost -p 6379 -a your_password

# Check if Redis is running
sudo systemctl status redis-server

# Restart Redis
sudo systemctl restart redis-server
```

### Check notification queue
```bash
redis-cli -a your_password

# In Redis CLI:
LLEN notification_queue
LRANGE notification_queue 0 10
```

## 12. Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Set Redis password
- [ ] Configure MongoDB with authentication
- [ ] Set up SSL certificate (HTTPS)
- [ ] Configure firewall (UFW/iptables)
- [ ] Set up automated backups
- [ ] Configure error monitoring (e.g., Sentry)
- [ ] Set up log rotation
- [ ] Configure CORS properly
- [ ] Disable debug/verbose logging
- [ ] Set up health check endpoint
- [ ] Configure rate limiting
- [ ] Test notification system
- [ ] Document environment variables
- [ ] Set up monitoring alerts

## 13. Security Recommendations

```bash
# 1. Firewall setup
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# 2. Fail2ban for SSH protection
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 3. Keep system updated
sudo apt update && sudo apt upgrade -y

# 4. Use environment variables (never commit .env files)
echo ".env*" >> .gitignore
```

## 14. PM2 Log Rotation

```bash
# Install PM2 log rotation
pm2 install pm2-logrotate

# Configure rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

## Quick Start Commands

```bash
# First time deployment
npm install
npm run build
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Updates
git pull
npm install
npm run build
pm2 reload dbms-backend

# Monitoring
pm2 monit
pm2 logs dbms-backend
```

## Additional Resources

- PM2 Documentation: https://pm2.keymetrics.io/docs/
- Redis Documentation: https://redis.io/documentation
- NestJS Production: https://docs.nestjs.com/
- Let's Encrypt: https://letsencrypt.org/

---

**Note:** Replace all placeholder values (passwords, domains, API keys) with your actual production values. Keep your `.env.production` file secure and never commit it to version control.
