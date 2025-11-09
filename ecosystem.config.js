module.exports = {
  apps: [{
    name: 'crm-backend',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    instance_var: 'INSTANCE_ID',
  }],

  deploy: {
    production: {
      user: 'crm',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/vue-system-crm-backend.git',
      path: '/home/crm/vue-system-crm-backend',
      'post-deploy': 'npm install && npx prisma generate && npm run build && npx prisma migrate deploy && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
