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
        DB_HOST: process.env.DB_HOST || '211.47.75.102',
        DB_PORT: process.env.DB_PORT || 3306,
        DB_NAME: process.env.DB_NAME || 'dbstorm566',
        DB_USER: process.env.DB_USER || 'storm566',
        DB_PASSWORD: process.env.DB_PASSWORD || 'serim1234#',
        JWT_SECRET: 'your_production_jwt_secret_change_this',
        ADMIN_USERNAME: 'admin',
        ADMIN_PASSWORD: 'admin123',
        ADMIN_EMAIL: 'admin@events.serimrobotics.co.kr',
        // HTTPS 설정 (Docker/자체 호스팅용)
        USE_HTTPS: process.env.USE_HTTPS || 'false',
        CERT_PATH: process.env.CERT_PATH || '/app/certs/fullchain.pem',
        KEY_PATH: process.env.KEY_PATH || '/app/certs/privkey.pem',
        // 하이웍스 카카오 알림톡 API 설정
        HIWORKS_OFFICE_TOKEN: process.env.HIWORKS_OFFICE_TOKEN || '2e6c7e4230c650d8d09c96e3c79ace07',
        HIWORKS_API_URL: process.env.HIWORKS_API_URL || 'https://api.hiworks.com',
        KAKAO_TEMPLATE_CODE: process.env.KAKAO_TEMPLATE_CODE || 'your_kakao_template_code_here',
        KAKAO_SENDER_PHONE: process.env.KAKAO_SENDER_PHONE || 'your_sender_phone_number_here',
        ENABLE_KAKAO_NOTIFICATION: process.env.ENABLE_KAKAO_NOTIFICATION || 'false',
        // 하이웍스 메일 발송 설정
        HIWORKS_MAIL_USER_ID: process.env.HIWORKS_MAIL_USER_ID || 'admin',
        MAIL_SEND_COOLDOWN_MINUTES: process.env.MAIL_SEND_COOLDOWN_MINUTES || '10'
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