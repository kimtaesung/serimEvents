#!/usr/bin/env node

console.log('=== 환경변수 확인 ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('HIWORKS_OFFICE_TOKEN:', process.env.HIWORKS_OFFICE_TOKEN ? `설정됨 (${process.env.HIWORKS_OFFICE_TOKEN.substring(0, 10)}...)` : '미설정');
console.log('HIWORKS_API_URL:', process.env.HIWORKS_API_URL);
console.log('HIWORKS_MAIL_USER_ID:', process.env.HIWORKS_MAIL_USER_ID);
console.log('ENABLE_KAKAO_NOTIFICATION:', process.env.ENABLE_KAKAO_NOTIFICATION);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('');

// 하이웍스 API 테스트
const HiWorksClient = require('./server/hiClient');
const client = new HiWorksClient();

console.log('=== HiWorksClient 초기화 ===');
console.log('officeToken:', client.officeToken ? `설정됨 (${client.officeToken.substring(0, 10)}...)` : '미설정');
console.log('apiUrl:', client.apiUrl);
console.log('enableKakaoNotification:', client.enableKakaoNotification);
console.log('mailUserId:', client.mailUserId);

// API 연결 테스트
(async () => {
  console.log('\n=== API 연결 테스트 ===');
  const result = await client.testConnection();
  if (result) {
    console.log('✓ API 연결 성공!');
  } else {
    console.log('✗ API 연결 실패. 환경변수를 확인하세요.');
  }
  process.exit(result ? 0 : 1);
})();
