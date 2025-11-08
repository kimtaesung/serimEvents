# 하이웍스 카카오 알림톡 연동 설정 가이드

## 개요
문의가 접수될 때 모든 사원에게 카카오 알림톡을 자동으로 전송하는 기능입니다.

## 설정 방법

### 1. 하이웍스 오피스 토큰 발급
1. 하이웍스 관리자 계정으로 로그인
2. [오피스 관리 > 오피스 API] 페이지로 이동
3. officeToken 발급
4. 발급받은 토큰을 안전하게 보관

### 2. 카카오 알림톡 템플릿 등록
1. 하이웍스에서 카카오 알림톡 서비스 신청
2. 알림톡 템플릿 등록 및 승인
3. 템플릿 코드 확인

### 3. 환경변수 설정
`.env` 파일에 다음 설정을 추가하세요:

```bash
# 하이웍스 카카오 알림톡 API 설정
HIWORKS_OFFICE_TOKEN=your_hiworks_office_token_here
HIWORKS_API_URL=https://api.hiworks.com
KAKAO_TEMPLATE_CODE=your_kakao_template_code_here
KAKAO_SENDER_PHONE=your_sender_phone_number_here
# 카카오 알림톡 전송 활성화 여부 (true: 활성화, false: 비활성화)
ENABLE_KAKAO_NOTIFICATION=true
```

### 4. 설정값 설명
- `HIWORKS_OFFICE_TOKEN`: 하이웍스에서 발급받은 오피스 토큰
- `HIWORKS_API_URL`: 하이웍스 API 엔드포인트 (기본값: https://api.hiworks.com)
- `KAKAO_TEMPLATE_CODE`: 등록된 카카오 알림톡 템플릿 코드
- `KAKAO_SENDER_PHONE`: 발신자 전화번호 (사전 등록된 번호)
- `ENABLE_KAKAO_NOTIFICATION`: 카카오 알림톡 전송 활성화 여부
  - `true`: 활성화 (기본값)
  - `false`: 비활성화

## 기능 설명

### 자동 알림 전송
- 문의가 접수되면 자동으로 모든 사원에게 카카오 알림톡 전송
- 전송 실패 시 SMS로 자동 재전송
- 백그라운드 처리로 응답 속도 영향 없음

### 알림톡 전송 제어

카카오 알림톡 전송은 **두 가지 레벨**에서 제어됩니다:

#### 1. 서버 차원 (환경변수)
```bash
ENABLE_KAKAO_NOTIFICATION=true  # 전역 활성화/비활성화
```

#### 2. 사용자 차원 (문의 폼)
- "담당자에게 카카오톡 알림 전송" 체크박스
- 기본값: 체크됨 (활성화)

#### 전송 로직
- ✅ **전송**: 환경변수 = true AND 사용자 선택 = true
- ❌ **미전송**: 환경변수 = false OR 사용자 선택 = false

### 템플릿 변수
알림톡 템플릿에서 사용 가능한 변수들:
- `manager_name`: 문의자 성명
- `phone_number`: 문의자 연락처
- `manager_address`: 문의자 소재지
- `product_type`: 문의 제품
- `consultation_contents`: 문의 내용
- `inquiry_time`: 문의 접수 시간

### 테스트 엔드포인트
개발 및 테스트를 위한 API 엔드포인트:

1. **하이웍스 API 연결 테스트**
   ```
   GET /api/inquiries/test/hiworks
   ```

2. **카카오톡 알림 테스트 전송**
   ```
   POST /api/inquiries/test/kakao-notification
   ```

## 주의사항

### 보안
- `HIWORKS_OFFICE_TOKEN`은 강력한 권한을 가지므로 절대 노출하지 말 것
- 코드나 URL에 토큰을 직접 포함하지 말 것
- 관리자 외에는 토큰을 공유하지 말 것

### API 제한
- 하이웍스 API는 오피스당 최대 1,000건/일 호출 제한
- 대량 문의 시 제한에 주의

### 템플릿 관리
- 카카오 알림톡 템플릿은 사전 승인 필요
- 템플릿 변경 시 재승인 과정 필요

## 문제 해결

### 일반적인 오류
1. **401 Unauthorized**: 토큰이 유효하지 않음
2. **404 Not Found**: 템플릿 코드가 잘못됨
3. **400 Bad Request**: 필수 파라미터 누락

### 로그 확인
서버 로그에서 다음과 같은 메시지를 확인할 수 있습니다:
- `📢 신규 문의 알림 전송 시작...`
- `✅ 전송 완료: 성공 X건, 실패 Y건`
- `❌ 카카오톡 알림 전송 실패:`

## API 문서 참조
- [하이웍스 API 문서](https://documenter.getpostman.com/view/6863253/S1TVWcri)
- [카카오 알림톡 API](https://documenter.getpostman.com/view/6863253/S1TVWcri#e050f696-2f5f-4540-ad33-553eeab87c80)