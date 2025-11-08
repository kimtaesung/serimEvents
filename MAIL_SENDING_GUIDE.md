# 하이웍스 메일 발송 기능 사용 가이드

## 개요
하이웍스 API를 통해 이메일을 발송하고, IP 주소별로 발송 횟수를 제어하는 기능입니다.

## 주요 기능

### 1. 메일 발송
- 하이웍스 메일 API를 사용한 이메일 전송
- 발신자 IP 주소 자동 기록
- CC, BCC 지원

### 2. 발송 쿨다운 (Cooldown)
- 같은 IP에서 10분 이내 중복 발송 방지
- 설정 가능한 쿨다운 시간 (환경변수)
- DB에 발송 기록 저장

### 3. 발송 상태 관리
- 발송 상태: pending, sent, failed
- 오류 메시지 기록
- 발송 시간 자동 기록

## 설정 방법

### 1. 환경변수 설정 (`.env`)

```bash
# 하이웍스 메일 발송 설정
HIWORKS_MAIL_USER_ID=your_hiworks_mail_user_id_here
# 메일 발송 쿨다운 시간 (분 단위, 기본값: 10)
MAIL_SEND_COOLDOWN_MINUTES=10
```

#### 설정값 설명
- `HIWORKS_MAIL_USER_ID`: 메일을 발송할 하이웍스 사용자 ID
- `MAIL_SEND_COOLDOWN_MINUTES`: 같은 IP에서 재발송 가능까지의 대기 시간 (분)

### 2. 필수 패키지 설치

```bash
npm install request
```

`request` 패키지가 이미 설치되어 있는지 확인하세요.

## 메일 내용 포맷팅

### 자동 HTML 포맷팅

메일 발송 시 내용이 자동으로 아래와 같이 포맷팅되어 보냅니다:

#### 1. 객체 형태의 내용 (권장)
```javascript
{
  "recipient_email": "admin@example.com",
  "subject": "신규 문의 알림",
  "content": {
    "manager_name": "김태성",
    "phone_number": "010-1234-5678",
    "manager_address": "경기도 용인",
    "product_type": "청소로봇",
    "consultation_contents": "제품에 대해 문의합니다.",
    "inquiry_time": "2024-11-08 10:00:00"
  }
}
```

**출력 결과 (HTML 이메일로 표시):**
- 📋 신규 문의 접수 제목
- 표 형식으로 정보 정렬
- 성명, 연락처, 소재지, 제품, 내용, 접수시간 표시
- 프로페셔널 스타일링

#### 2. 문자열 형태의 내용
```javascript
{
  "recipient_email": "admin@example.com",
  "subject": "안내 메일",
  "content": "안녕하세요.\n이것은 테스트 메일입니다."
}
```

**출력 결과:**
```
안녕하세요.
이것은 테스트 메일입니다.
```

### 포맷팅 특징

- **자동 HTML 변환**: 평문을 HTML로 자동 변환
- **보안**: HTML 특수문자 자동 이스케이프 처리
- **가독성**: CSS를 이용한 전문적 스타일링
- **반응형**: 다양한 클라이언트에서 최적화
- **정보 보존**: 줄바꿈(`\n`) 유지

### 메일 내용 객체 필드

| 필드명 | 타입 | 설명 | 필수 |
|-------|------|------|------|
| manager_name | string | 문의자 성명 | × |
| phone_number | string | 문의자 연락처 | × |
| manager_address | string | 문의자 소재지 | × |
| product_type | string | 문의 제품 | × |
| consultation_contents | string | 문의 내용 (줄바꿈 지원) | × |
| inquiry_time | string | 문의 접수 시간 | × |

모든 필드는 선택사항입니다. 빈 필드는 표시되지 않습니다.

## API 엔드포인트

### 1. 메일 발송
```
POST /api/inquiries/send-mail
```

#### Request Body - 문자열 방식
```json
{
  "recipient_email": "receiver@example.com",
  "cc_email": "cc@example.com",          // 선택사항
  "bcc_email": "bcc@example.com",        // 선택사항
  "subject": "메일 제목",
  "content": "메일 본문 내용"
}
```

#### Request Body - 객체 방식 (권장)
```json
{
  "recipient_email": "admin@example.com",
  "subject": "신규 문의 알림",
  "content": {
    "manager_name": "김태성",
    "phone_number": "010-1234-5678",
    "manager_address": "경기도 용인",
    "product_type": "청소로봇",
    "consultation_contents": "제품에 대해 문의합니다.",
    "inquiry_time": "2024-11-08 10:00:00"
  }
}
```

#### Response (성공)
```json
{
  "success": true,
  "message": "메일이 성공적으로 발송되었습니다.",
  "logId": 1
}
```

#### Response (실패 - 쿨다운 중)
```json
{
  "success": false,
  "message": "메일을 보낸 지 10분이 경과하지 않았습니다. 540초 후 다시 시도해주세요.",
  "remainingTime": 540,
  "canSend": false
}
```

### 2. 메일 발송 가능 여부 확인
```
GET /api/inquiries/mail-status
```

#### Response
```json
{
  "canSend": true,
  "remainingTime": 0,
  "cooldownMinutes": 10,
  "senderIp": "192.168.1.1"
}
```

### 3. 메일 발송 기록 조회 (관리자용)
```
GET /api/inquiries/mail-logs
```

최근 100건의 메일 발송 기록을 조회합니다.

#### Response
```json
[
  {
    "id": 1,
    "sender_ip": "192.168.1.1",
    "recipient_email": "test@example.com",
    "subject": "테스트 메일",
    "content": "테스트 내용",
    "status": "sent",
    "error_message": null,
    "created_at": "2024-11-08T10:00:00Z",
    "sent_at": "2024-11-08T10:00:05Z",
    "updated_at": "2024-11-08T10:00:05Z"
  }
]
```

### 4. 특정 IP의 메일 발송 기록 조회
```
GET /api/inquiries/mail-logs/:ip
```

특정 IP 주소에 대한 메일 발송 기록 (최근 50건)을 조회합니다.

## DB 스키마

### mail_log 테이블

| 컬럼명 | 타입 | 설명 |
|-------|------|------|
| id | INT | 고유 ID (자동 증가) |
| sender_ip | VARCHAR(45) | 메일 발송 요청자의 IP 주소 |
| recipient_email | VARCHAR(255) | 수신자 이메일 |
| subject | VARCHAR(255) | 메일 제목 |
| content | LONGTEXT | 메일 본문 |
| status | ENUM | sent, pending, failed 중 하나 |
| error_message | LONGTEXT | 발송 실패 시 오류 메시지 |
| created_at | TIMESTAMP | 발송 요청 시간 |
| sent_at | TIMESTAMP | 실제 발송 시간 |
| updated_at | TIMESTAMP | 마지막 업데이트 시간 |

## 메일 내용 포맷팅

### 자동 HTML 포맷팅

메일 발송 시 내용이 자동으로 아래와 같이 포맷팅되어 보냅니다:

#### 1. 객체 형태의 내용 (권장)
```javascript
{
  "recipient_email": "admin@example.com",
  "subject": "신규 문의 알림",
  "content": {
    "manager_name": "김태성",
    "phone_number": "010-1234-5678",
    "manager_address": "경기도 용인",
    "product_type": "청소로봇",
    "consultation_contents": "제품에 대해 문의합니다.",
    "inquiry_time": "2024-11-08 10:00:00"
  }
}
```

**출력 결과:**
```
📋 신규 문의 접수

성명(상호명): 김태성
연락처: 010-1234-5678
소재지: 경기도 용인
문의제품: 청소로봇
문의내용: 제품에 대해 문의합니다.
접수시간: 2024-11-08 10:00:00
```

#### 2. 문자열 형태의 내용
```javascript
{
  "recipient_email": "admin@example.com",
  "subject": "안내 메일",
  "content": "안녕하세요.\n이것은 테스트 메일입니다."
}
```

**출력 결과:**
```
안녕하세요.
이것은 테스트 메일입니다.
```

### 포맷팅 특징

- **자동 HTML 변환**: 평문을 HTML로 자동 변환
- **보안**: HTML 특수문자 자동 이스케이프
- **가독성**: CSS를 이용한 스타일링
- **반응형**: 다양한 클라이언트에서 최적화
- **정보 보존**: 줄바꿈(`\n`) 유지

### 메일 내용 객체 필드

1. **IP 추출**: 요청 헤더에서 발신자 IP 주소 추출
2. **쿨다운 확인**: DB에서 해당 IP의 마지막 발송 시간 조회
3. **가능 여부 판단**:
   - 이전 발송 후 10분 미경과 → 요청 거절
   - 10분 이상 경과 또는 발송 기록 없음 → 진행
4. **DB 기록**: 발송 기록을 `mail_log` 테이블에 `pending` 상태로 저장
5. **API 호출**: 하이웍스 메일 API 호출
6. **결과 업데이트**: 
   - 성공 시: 상태를 `sent`로 변경, `sent_at` 시간 기록
   - 실패 시: 상태를 `failed`로 변경, `error_message` 기록

## 사용 예시

### JavaScript/fetch를 이용한 메일 발송

```javascript
const sendMail = async () => {
  const response = await fetch('/api/inquiries/send-mail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipient_email: 'admin@example.com',
      subject: '신규 문의 알림',
      content: '새로운 고객 문의가 접수되었습니다.'
    })
  });

  const result = await response.json();
  
  if (result.success) {
    alert('메일 발송 성공');
  } else {
    alert(`메일 발송 실패: ${result.message}\n${result.remainingTime}초 후 재시도 가능`);
  }
};
```

### 발송 가능 여부 미리 확인

```javascript
const checkMailStatus = async () => {
  const response = await fetch('/api/inquiries/mail-status');
  const data = await response.json();

  if (data.canSend) {
    console.log('✅ 메일 발송 가능');
  } else {
    console.log(`⏳ 메일 발송 대기 중 (${data.remainingTime}초)`);
  }
};
```

## 주의사항

### 보안
- `HIWORKS_MAIL_USER_ID`는 환경변수로만 관리
- 코드에 직접 하드코딩하지 말 것
- 로그에서 민감한 정보 노출 주의

### 성능
- 대량 메일 발송 시 쿨다운 시간을 고려한 스케줄링 필요
- 발송 실패 시 재시도 로직 구현 권장

### 테스트
- 프로덕션 환경 전에 개발 환경에서 충분히 테스트
- 메일 수신자 주소 확인 필수
- 하이웍스 계정의 메일 설정 확인

## 문제 해결

### 메일이 발송되지 않음
1. `HIWORKS_MAIL_USER_ID` 확인
2. 하이웍스 계정의 메일 권한 확인
3. 수신자 이메일 주소 유효성 확인
4. `/api/inquiries/mail-logs`에서 발송 기록 확인

### "10분이 경과하지 않았습니다" 오류
- 정상 작동입니다. 쿨다운 시간이 지난 후 재시도하세요.
- `MAIL_SEND_COOLDOWN_MINUTES` 환경변수로 시간 조정 가능

### 쿨다운 시간 변경
`.env` 파일의 `MAIL_SEND_COOLDOWN_MINUTES` 값 변경 후 서버 재시작

```bash
# 예: 5분으로 변경
MAIL_SEND_COOLDOWN_MINUTES=5
```

## API 문서 참조
- [하이웍스 메일 API 문서](https://documenter.getpostman.com/view/6863253/S1TVWcri)