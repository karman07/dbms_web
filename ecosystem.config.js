module.exports = {
  apps: [
    {
      name: 'dbms-backend',
      script: './dist/main.js',
      
      // Clustering
      instances: 'max', // Use all available CPU cores, or specify: 1, 2, 4, etc.
      exec_mode: 'cluster',
      
      // Restart options
      autorestart: true,
      watch: false, // Set to true in development to auto-restart on file changes
      max_memory_restart: '1G',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      
      // Logging
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Advanced options
      min_uptime: '10s',
      max_restarts: 10,
      
      // Source map support for better error traces
      source_map_support: true,
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      
      // Cron restart (optional - restart daily at 2 AM)
      // cron_restart: '0 2 * * *',
      
      // Environment file (commented - using .env.production instead)
      // env_file: '.env.production',
    },
  ],
  
  // Deploy configuration (optional - for PM2 deploy)
  deploy: {
    production: {
      user: 'your-server-user',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/your-repo.git',
      path: '/var/www/dbms-backend',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
    },
  },
};
