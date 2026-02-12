# PM2 Quick Reference

## 🚀 Quick Start

```bash
# First deployment
./deploy.sh

# Or manual
npm run build && pm2 start ecosystem.config.js --env production
```

## 📋 Essential Commands

### Start & Stop
```bash
pm2 start ecosystem.config.js          # Start app
pm2 start ecosystem.config.js --env production  # Start in production mode
pm2 stop dbms-backend                  # Stop app
pm2 restart dbms-backend               # Restart app
pm2 reload dbms-backend                # Zero-downtime reload
pm2 delete dbms-backend                # Remove from PM2
```

### Monitoring
```bash
pm2 list                               # List all apps
pm2 monit                              # Real-time monitoring
pm2 logs dbms-backend                  # View logs (live)
pm2 logs dbms-backend --lines 100      # Last 100 lines
pm2 logs dbms-backend --err            # Error logs only
pm2 flush                              # Clear all logs
```

### Information
```bash
pm2 show dbms-backend                  # Detailed info
pm2 describe dbms-backend              # Same as show
pm2 env 0                              # Show environment variables
```

### Process Management
```bash
pm2 save                               # Save current process list
pm2 resurrect                          # Restore saved processes
pm2 startup                            # Generate startup script
pm2 unstartup                          # Disable startup script
```

### Scaling
```bash
pm2 scale dbms-backend 4               # Scale to 4 instances
pm2 scale dbms-backend +2              # Add 2 more instances
```

## 🔧 Redis Commands

### Basic Operations
```bash
redis-cli ping                         # Test connection
redis-cli -a password ping             # With password
redis-cli                              # Open Redis CLI
```

### Inside Redis CLI
```
PING                                   # Test server
INFO                                   # Server info
DBSIZE                                 # Number of keys
KEYS *                                 # List all keys
LLEN notification_queue                # Queue length
LRANGE notification_queue 0 10         # View queue items
FLUSHDB                                # Clear current database
FLUSHALL                               # Clear all databases
SAVE                                   # Save data to disk
CONFIG GET *                           # View all config
CONFIG SET requirepass "newpass"       # Set password
AUTH password                          # Authenticate
EXIT                                   # Exit CLI
```

## 🔄 Update/Redeploy

```bash
# Method 1: Using deploy script
./deploy.sh

# Method 2: Manual
git pull origin main
npm install
npm run build
pm2 reload dbms-backend

# Method 3: With migrations
git pull
npm install
npm run build
npm run migration:run  # If you have migrations
pm2 reload dbms-backend
```

## 🐛 Debugging

### Check if app is running
```bash
pm2 list
pm2 logs dbms-backend --err --lines 50
```

### Check port usage
```bash
lsof -i :3000
netstat -an | grep 3000
```

### Check Redis
```bash
redis-cli ping
sudo systemctl status redis-server
```

### Check MongoDB
```bash
mongosh
# Or
mongo
# Then: show dbs
```

### Memory issues
```bash
pm2 list                               # Check memory usage
pm2 restart dbms-backend               # Restart to free memory
```

### High CPU
```bash
pm2 monit                              # Check CPU usage
# Consider reducing instances or optimizing code
```

## 📊 Monitoring & Logs

### Real-time logs
```bash
pm2 logs dbms-backend --lines 200      # Last 200 lines
pm2 logs --json                        # JSON format
pm2 logs --format                      # Formatted output
```

### Log files location
```
./logs/err.log                         # Error logs
./logs/out.log                         # Output logs
./logs/combined.log                    # All logs
```

### Rotate logs
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 🔐 Security Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Set Redis password
- [ ] Enable MongoDB authentication
- [ ] Configure firewall (ports 22, 80, 443 only)
- [ ] Set up SSL/HTTPS
- [ ] Use `.env.production` (not committed to git)
- [ ] Enable log rotation
- [ ] Set up automated backups
- [ ] Configure rate limiting
- [ ] Update all dependencies regularly

## 🆘 Emergency Commands

### App crashed - Hard restart
```bash
pm2 delete dbms-backend
pm2 start ecosystem.config.js --env production
pm2 save
```

### Clear everything and restart
```bash
pm2 kill                               # Kill PM2 daemon
pm2 resurrect                          # Restore processes
# Or
pm2 start ecosystem.config.js --env production
pm2 save
```

### Redis issues
```bash
sudo systemctl restart redis-server    # Restart Redis
redis-cli FLUSHALL                     # Clear all Redis data
```

## 📱 Notifications Queue

### Check queue status
```bash
redis-cli
LLEN notification_queue                # Queue length
LRANGE notification_queue 0 5          # First 5 items
```

### Clear stuck queue
```bash
redis-cli
DEL notification_queue                 # Clear queue
```

## 🌐 Nginx Commands (if using)

```bash
sudo nginx -t                          # Test config
sudo systemctl restart nginx           # Restart
sudo systemctl status nginx            # Check status
sudo tail -f /var/log/nginx/error.log  # Error log
sudo tail -f /var/log/nginx/access.log # Access log
```

## 💾 Backup Commands

### MongoDB backup
```bash
mongodump --db dbms_production --out ~/backups/mongodb/$(date +%Y%m%d)
```

### MongoDB restore
```bash
mongorestore --db dbms_production ~/backups/mongodb/20260212/dbms_production
```

### Redis backup
```bash
redis-cli SAVE
cp /var/lib/redis/dump.rdb ~/backups/redis/dump-$(date +%Y%m%d).rdb
```

## 📞 Support

- PM2 Docs: https://pm2.keymetrics.io/docs/
- Redis Docs: https://redis.io/documentation
- NestJS Docs: https://docs.nestjs.com/

---

**Pro Tip:** Create aliases in `~/.bashrc` or `~/.zshrc`:
```bash
alias pml='pm2 logs dbms-backend'
alias pmr='pm2 reload dbms-backend'
alias pms='pm2 show dbms-backend'
alias pmm='pm2 monit'
```
