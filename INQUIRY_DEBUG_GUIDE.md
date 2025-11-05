# 문의 DB 저장 문제 진단 가이드

## 1. 데이터베이스 연결 확인
```bash
# MySQL 접속 테스트
mysql -h localhost -u root -pserrim123# serimrobo -e "SHOW TABLES;"
```

## 2. inquiries 테이블 스키마 확인
```bash
mysql -h localhost -u root -pserrim123# serimrobo -e "DESC inquiries;"
```

## 3. 현재 저장된 데이터 확인
```bash
mysql -h localhost -u root -pserrim123# serimrobo -e "SELECT * FROM inquiries;"
```

## 4. 개발 서버 로그 확인

### 브라우저 콘솔 (F12)
- 📤 Response status 메시지 확인
- 네트워크 탭에서 `/api/inquiries` POST 요청 상태 코드 확인

### 서버 콘솔 (터미널)
- 📝 "Received inquiry data" 메시지 확인
- ❌ 에러 메시지 있는지 확인
- ✅ "Inquiry saved successfully" 메시지 확인

## 5. 체크 항목

### 필수 필드
- [ ] manager_name (성명) - 입력되어 있는가?
- [ ] phone_number (연락처) - 입력되어 있는가?
- [ ] has_agreement (개인정보 동의) - 체크되어 있는가?

### 서버 응답
- [ ] Response 상태 코드가 201인가?
- [ ] 응답에 id, success, message가 있는가?

### 데이터베이스
- [ ] inquiries 테이블에 새로운 행이 추가되었는가?

## 문제 해결

### 문제: "Missing required fields" 에러
→ 폼에서 필수 필드를 모두 입력했는지 확인

### 문제: "Failed to create inquiry" 에러
→ 서버 콘솔에서 상세 에러 메시지 확인

### 문제: 요청이 서버에 도달하지 않음
→ 브라우저 개발자 도구 네트워크 탭 확인
→ CORS 에러가 있는지 확인