#!/usr/bin/env node

/**
 * 문의 API 테스트 스크립트
 * 개발 서버가 실행 중인 상태에서 실행하세요
 */

const testData = {
  manager_name: '테스트 사용자',
  phone_number: '010-1234-5678',
  manager_address: '서울시 강남구',
  product_type: '청소로봇',
  consultation_contents: '테스트 문의 내용입니다.',
  has_agreement: true
};

console.log('📝 테스트 데이터:', testData);
console.log('📡 /api/inquiries에 POST 요청 전송 중...\n');

fetch('http://localhost:8088/api/inquiries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📤 응답 상태:', response.status, response.statusText);
  return response.json().then(data => ({ response, data }));
})
.then(({ response, data }) => {
  if (response.ok) {
    console.log('✅ 성공:', data);
  } else {
    console.log('❌ 실패:', data);
  }
})
.catch(error => {
  console.error('❌ 네트워크 오류:', error.message);
  process.exit(1);
});
