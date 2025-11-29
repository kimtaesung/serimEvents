# Gmail SMTP 메일 발송 설정 가이드

## 개요
하이웍스(HiWorks) 메일 API에서 Gmail SMTP로 변경되었습니다. 더 이상 하이웍스 메일 API에 의존하지 않고 Gmail의 안정적인 SMTP 서버를 통해 메일을 발송합니다.

## 변경 사항

### 1. 패키지 업데이트
- `nodemailer` v6.9.7 추가 설치됨 (`package.json`에 의존성 추가)

### 2. 코드 수정
- `server/hiClient.js` 파일이 Gmail SMTP 지원으로 업데이트됨
- 메일 제공자(Gmail 또는 HiWorks)를 선택할 수 있는 설정 추가
- `MAIL_PROVIDER` 환경변수로 메일 서비스 선택 가능

### 3. 환경 변수 설정

#### `.env.example` 에 추가된 설정:
```bash
# 메일 발송 설정 (gmail 또는 hiworks)
MAIL_PROVIDER=gmail

# Gmail SMTP 설정 (MAIL_PROVIDER=gmail 일 때)
GMAIL_EMAIL=your_gmail_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password_here
GMAIL_SENDER_EMAIL=admin@events.serimrobotics.co.kr

# 하이웍스 메일 발송 설정 (MAIL_PROVIDER=hiworks 일 때)
HIWORKS_MAIL_USER_ID=your_hiworks_mail_user_id_here
# 메일 발송 쿨다운 시간 (분 단위, 기본값: 10)
MAIL_SEND_COOLDOWN_MINUTES=10
```

## Gmail 설정 방법

### 1. Gmail 앱 비밀번호 생성

1. [Google Account 설정](https://myaccount.google.com/)으로 이동
2. 왼쪽 메뉴에서 **보안** 선택
3. 2단계 인증 설정 (아직 설정하지 않았다면)
4. **앱 비밀번호** 클릭
5. **메일**과 **Windows 컴퓨터** 선택
6. 생성된 16자리 비밀번호 복사

### 2. 환경 변수 설정

개발 환경 (`.env.development`):
```bash
MAIL_PROVIDER=gmail
GMAIL_EMAIL=your_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx  # 복사한 16자리 비밀번호
GMAIL_SENDER_EMAIL=admin@events.serimrobotics.co.kr  # 메일 발송자 주소
```

배포 환경 (`.env.gabia`):
```bash
MAIL_PROVIDER=gmail
GMAIL_EMAIL=your_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
GMAIL_SENDER_EMAIL=admin@events.serimrobotics.co.kr
```

## 사용 가능한 메일 서비스

### Gmail (기본값)
- **장점**: 안정적, 스팸 필터링 우수, 무료
- **설정 필요**: Gmail 계정 + 앱 비밀번호
- **사용법**: `MAIL_PROVIDER=gmail`

### HiWorks (레거시)
- **설정 필요**: HiWorks API 토큰 + 메일 사용자 ID
- **사용법**: `MAIL_PROVIDER=hiworks`

## API 변경 사항

### HiWorksClient 클래스의 새로운 메서드

#### `sendMail(mailData, senderIp, db)`
- 메인 메서드로, `MAIL_PROVIDER` 설정에 따라 자동으로 Gmail 또는 HiWorks를 선택합니다.

#### `sendMailViaGmail(mailData, senderIp, db)` (신규)
- Gmail SMTP를 통해 메일 발송
- `mailData`: `{ to, subject, content }`
- 메일 로그를 DB에 기록하고 발송 결과 반환

#### `sendMailViaHiWorks(mailData, senderIp, db)` (레거시)
- HiWorks API를 통해 메일 발송
- 쿨다운(cooldown) 제한 적용

## 메일 로그 DB 레코드

모든 메일은 `mail_log` 테이블에 기록됩니다:

| 컬럼 | 설명 |
|------|------|
| id | 로그 ID |
| sender_ip | 발신자 IP |
| recipient_email | 수신자 이메일 |
| subject | 메일 제목 |
| content | 메일 내용 |
| status | 발송 상태 (pending, sent, failed) |
| sent_at | 발송 완료 시간 |
| error_message | 오류 메시지 |

## 테스트 방법

### 메일 발송 테스트
1. 관리 페이지에서 새로운 문의가 접수되도록 시뮬레이션
2. 메일이 설정된 구성원들에게 발송되는지 확인
3. Gmail 계정의 "발신 메일" 폴더에서 발송 내역 확인

### 로그 확인
```javascript
// 서버 콘솔에서 다음과 같은 로그 확인
[Gmail] SMTP 연결 성공
[Mail] 모든 구성원에게 메일 발송 시작...
[Gmail] 메일 발송 시작 - 수신자: user@example.com
[Gmail] 메일 발송 성공 - 수신자: user@example.com
[Mail] 메일 발송 완료: 성공 2건, 실패 0건
```

## 주의 사항

1. **Gmail 앱 비밀번호**: 일반 비밀번호가 아닌 "앱 비밀번호"를 사용해야 합니다.
2. **2단계 인증**: Gmail 앱 비밀번호 사용을 위해 2단계 인증이 활성화되어 있어야 합니다.
3. **보안**: 앱 비밀번호를 Git 저장소에 커밋하지 마세요. `.env` 파일에만 저장하세요.
4. **메일 전송 제한**: Gmail은 일일 발송량 제한이 있을 수 있습니다.

## 회전 (Rollback)

필요시 하이웍스로 되돌리려면:

1. `.env` 파일에서 `MAIL_PROVIDER=hiworks` 설정
2. `HIWORKS_MAIL_USER_ID` 환경변수 추가
3. `HIWORKS_OFFICE_TOKEN` 환경변수 추가

## 문제 해결

### "Gmail SMTP가 설정되지 않았습니다" 오류
- `GMAIL_EMAIL`과 `GMAIL_APP_PASSWORD` 환경변수 확인
- 2단계 인증이 활성화되어 있는지 확인
- 앱 비밀번호가 올바르게 입력되었는지 확인

### "Invalid credentials" 오류
- Gmail 앱 비밀번호가 올바른지 확인 (16자리)
- 공백 제거: `xxxx xxxx xxxx xxxx` → `xxxxxxxxxxxxxxxx`
- Gmail 계정의 2단계 인증 설정 확인

### 메일이 스팸 폴더로 감
- 메일 템플릿의 HTML 형식 확인
- Gmail의 "스팸 아님" 버튼으로 신고하여 평판 향상
