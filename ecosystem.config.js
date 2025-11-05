module.exports = {
  apps: [
    {
      name: 'serimrobo',
      script: './server/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 8088,
        DB_HOST: 'localhost',
        DB_PORT: 3306,
        DB_NAME: 'serimrobo',
        DB_USER: 'root',
        DB_PASSWORD: 'serrim123#'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080,
        DB_TYPE: 'mysql',
        DB_HOST: process.env.DB_HOST || 'db.storm566.gabia.io',
        DB_PORT: process.env.DB_PORT || 3306,
        DB_NAME: process.env.DB_NAME || 'serimrobo',
        DB_USER: process.env.DB_USER || 'storm566',
        DB_PASSWORD: process.env.DB_PASSWORD || '',
        JWT_SECRET: 'your_production_jwt_secret_change_this',
        ADMIN_USERNAME: 'admin',
        ADMIN_PASSWORD: 'admin123',
        ADMIN_EMAIL: 'admin@serimrobo.com'
      },
      // 로그 설정
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      
      // 재시작 설정
      max_memory_restart: '1G',
      restart_delay: 4000,
      
      // 감시 설정 (개발 시에만)
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'public_html'],
      
      // 환경별 추가 설정
      merge_logs: true,
      kill_timeout: 5000
    }
  ],
  
  deploy: {
    production: {
      user: 'your_user',
      host: 'your_server_ip',
      ref: 'origin/main',
      repo: 'git@github.com:kimtaesung/serimRobot.git',
      path: '/home/your_user/serimrobo',
      'pre-deploy-local': '',
      'post-deploy': 'npm install --production && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};