# Update Deployment Guide - Adding Push Notifications

Since you already have PM2 running, follow these steps to deploy the new version with push notifications and Redis:

## Pre-Deployment Checklist

- [x] Redis running (you confirmed this)
- [x] `.env` file has Redis config
- [ ] Firebase credentials in `.env`
- [ ] MongoDB accessible

## Step-by-Step Update

### 1️⃣ **Pull Latest Code** (if using Git)

```bash
cd /path/to/your/backend
git pull origin main
```

Or if you're copying files, make sure all new files are transferred:
- `src/notifications/` directory
- Updated `src/users/schemas/user.schema.ts`
- Updated `src/app.module.ts`

### 2️⃣ **Install New Dependencies**

```bash
npm install
```

New packages that will be installed:
- `firebase-admin`
- `@nestjs/bull`
- `bull`
- `redis`

### 3️⃣ **Build the Application**

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### 4️⃣ **Reload PM2 (Zero Downtime)**

```bash
# Option 1: Zero-downtime reload (RECOMMENDED)
pm2 reload dbms-backend

# Option 2: Hard restart (if reload fails)
pm2 restart dbms-backend
```

### 5️⃣ **Verify Deployment**

```bash
# Check if app is running
pm2 list

# Check logs for errors
pm2 logs dbms-backend --lines 50

# Monitor in real-time
pm2 logs dbms-backend
```

Look for these log messages indicating successful startup:
```
✓ Redis connected successfully
✓ Starting notification queue processor
✓ Nest application successfully started
```

### 6️⃣ **Test the New Features**

#### Test 1: Check Redis Connection
```bash
redis-cli ping
# Should return: PONG
```

#### Test 2: Check Notification Queue
```bash
redis-cli
> LLEN notification_queue
# Should return: 0 (empty queue initially)
> EXIT
```

#### Test 3: Test API Endpoint
```bash
# Register a test FCM token (replace with actual JWT token)
curl -X POST http://localhost:3000/notifications/register-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fcmToken": "test_token_123"}'
```

#### Test 4: Admin Send Notification
```bash
curl -X POST http://localhost:3000/admin/notifications/send \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "Testing new push notification system",
    "type": "system",
    "userIds": ["USER_ID_HERE"]
  }'
```

## 🔧 If You Encounter Issues

### Issue: Redis connection error

```bash
# Check if Redis is running
redis-cli ping

# Start Redis
# macOS:
brew services start redis

# Linux:
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Issue: Module not found errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart dbms-backend
```

### Issue: PM2 not picking up changes

```bash
# Hard restart
pm2 delete dbms-backend
pm2 start ecosystem.config.js --env production
pm2 save
```

### Issue: Check which version is running

```bash
# Check the built files
ls -la dist/

# Check if notification module exists
ls -la dist/notifications/

# Should see:
# - notifications.module.js
# - notifications.service.js
# - notifications.controller.js
# etc.
```

## 📊 Monitoring After Deployment

### Watch logs continuously
```bash
pm2 logs dbms-backend
```

### Check memory and CPU
```bash
pm2 monit
```

### Check Redis queue status
```bash
redis-cli
> LLEN notification_queue
> LRANGE notification_queue 0 10
> EXIT
```

### Check MongoDB for notifications
```bash
mongosh "your_connection_string"
> use your_database_name
> db.notifications.countDocuments()
> db.notifications.find().limit(5).pretty()
```

## 🎯 Quick Update Script

Save this as `quick-update.sh`:

```bash
#!/bin/bash
echo "🔄 Updating deployment..."

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building application..."
npm run build

echo "🔄 Reloading PM2..."
pm2 reload dbms-backend

echo "✅ Checking status..."
pm2 list

echo "📝 Recent logs:"
pm2 logs dbms-backend --nostream --lines 20

echo "✅ Update complete!"
```

Make it executable:
```bash
chmod +x quick-update.sh
```

Then run:
```bash
./quick-update.sh
```

## 🚀 Expected Results

After successful deployment, you should have:

✅ Redis running and connected  
✅ Background queue processor running (checks every 5 seconds)  
✅ New API endpoints available:
- `POST /notifications/register-token`
- `POST /notifications/remove-token`
- `POST /notifications/toggle`
- `GET /notifications/history`
- `POST /admin/notifications/send`
- `POST /admin/notifications/send-bulk`
- `GET /admin/notifications/history`
- `GET /admin/notifications/stats`

✅ User schema updated with `fcmTokens` and `notificationsEnabled`  
✅ Notifications stored in MongoDB  
✅ Queue processing in background  

## 📚 Documentation

Refer to these files for API details:
- `PUSH-NOTIFICATIONS-API.md` - Complete API documentation
- `FRONTEND-NOTIFICATIONS-GUIDE.md` - Frontend integration
- `ADMIN-NOTIFICATIONS-API.md` - Admin endpoints
- `PM2-QUICK-REFERENCE.md` - PM2 commands

## ⚡ One-Command Update

```bash
npm install && npm run build && pm2 reload dbms-backend && pm2 logs dbms-backend --lines 30
```

This will:
1. Install dependencies
2. Build the app
3. Reload PM2 (zero downtime)
4. Show recent logs

---

**That's it!** Your push notification system should now be live. 🎉
