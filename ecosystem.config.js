module.exports = {
  apps: [
    {
      name: 'dbms-admin',
      script: 'serve',
      args: 'dist -s -l 5173', // -s for SPA mode, -l for port
      
      // Restart options
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
      },
      
      // Logging
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Options
      min_uptime: '10s',
      max_restarts: 10,
    },
  ],
};
