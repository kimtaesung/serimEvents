const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const { initializeAdmin } = require('./database/init-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 8080 : 8088);
const USE_HTTPS = process.env.USE_HTTPS === 'true' || false;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files - 가비아 호스팅 환경에 맞게 경로 설정
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public_html')));

// API Routes
app.use('/api/sections', require('./routes/sections'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/basic-info', require('./routes/basic-info'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/inquiries', require('./routes/inquiries'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// SPA fallback - React Router를 위한 설정
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public_html/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // 관리자 계정 초기화
    await initializeAdmin();
  } catch (error) {
    console.error('Warning: Admin initialization failed. Please check database connection.');
  }

  if (USE_HTTPS) {
    // HTTPS 서버 시작
    const certPath = process.env.CERT_PATH || '/app/certs/fullchain.pem';
    const keyPath = process.env.KEY_PATH || '/app/certs/privkey.pem';

    try {
      if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
        console.error(`❌ HTTPS 인증서를 찾을 수 없습니다:`);
        console.error(`   - 인증서: ${certPath}`);
        console.error(`   - 키: ${keyPath}`);
        console.error(`💡 해결 방법:`);
        console.error(`   1. Docker: 볼륨 마운트 설정 확인`);
        console.error(`   2. 로컬: USE_HTTPS=false로 설정`);
        process.exit(1);
      }

      const options = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath)
      };

      https.createServer(options, app).listen(PORT, () => {
        console.log(`🔒 HTTPS 서버 실행 중: https://localhost:${PORT}`);
        console.log(`환경: ${process.env.NODE_ENV || 'development'}`);
        console.log(`가비아 호스팅 모드 활성화`);
      });
    } catch (error) {
      console.error('❌ HTTPS 초기화 실패:', error.message);
      process.exit(1);
    }
  } else {
    // HTTP 서버 시작
    app.listen(PORT, () => {
      console.log(`SerimRobo 서버 실행 중: http://localhost:${PORT}`);
      console.log(`환경: ${process.env.NODE_ENV || 'development'}`);
      console.log(`가비아 호스팅 모드 활성화`);
    });
  }
};

startServer();

module.exports = app;
