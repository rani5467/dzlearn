module.exports = {
  apps: [{
    name: 'dzlearn-api',
    script: './backend/src/server.js',
    cwd: '/var/www/dzlearn',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '400M',
    env: { NODE_ENV: 'production' },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
