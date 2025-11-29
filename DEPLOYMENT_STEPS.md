# 배포 서버에서 실행할 명령어

가비아 배포 서버에서 다음 명령어를 순서대로 실행하세요:

```bash
# 1. 프로젝트 디렉토리로 이동 (실제 경로는 서버의 배포 경로로 변경하세요)
cd /web/serim_rending

# 2. 최신 코드 가져오기
git pull origin main

# 3. 의존성 설치 (nodemailer, request 등 새로 추가된 패키지 설치)
npm install

# 4. PM2 프로세스 재시작
pm2 restart serimrobo

# 5. 로그 확인
pm2 logs serimrobo
```

## 각 단계별 설명

### 1. 프로젝트 디렉토리로 이동
배포된 프로젝트 경로로 이동합니다. 현재 로그에 보이는 경로: `/web/serim_rending`

### 2. 최신 코드 가져오기
GitHub에 푸시된 최신 코드를 가져옵니다.
- `.env` 파일 변경사항 포함
- `hiClient.js` Gmail 지원 코드 포함
- `package.json` nodemailer, request 패키지 추가 포함

### 3. npm install
새로 추가된 패키지들을 설치합니다:
- `nodemailer` (Gmail SMTP 사용)
- `request` (HiWorks API 호출 시 사용)

### 4. PM2 프로세스 재시작
변경된 코드를 로드하기 위해 프로세스를 재시작합니다.

### 5. 로그 확인
성공적으로 시작되었는지 확인합니다.

## 예상 로그 (정상 작동)

```
[Gmail] SMTP 연결 성공
Server running on port 8080
```

## 주의사항

1. **GitHub에 코드 푸시 필수**: 로컬에서 수정한 파일들을 먼저 GitHub에 푸시해야 합니다.
   ```bash
   git add .
   git commit -m "Gmail SMTP 메일 발송 설정"
   git push origin main
   ```

2. **환경변수 확인**: ecosystem.config.js의 Gmail 설정이 올바른지 확인
   - `MAIL_PROVIDER: 'gmail'`
   - `GMAIL_EMAIL: 'storm56660@gmail.com'`
   - `GMAIL_APP_PASSWORD: 'lxif mwsa wizq njcg'`

3. **.env 파일**: 서버에서 `.env` 파일이 필요한 경우 수동으로 설정

## 문제 해결

### "Cannot find module 'request'" 오류
```bash
# npm install 재실행
npm install

# 캐시 초기화 후 재설치
npm cache clean --force
npm install
```

### "Cannot find module 'nodemailer'" 오류
동일하게 npm install 재실행

### PM2가 프로세스를 시작하지 않음
```bash
# PM2 로그 확인
pm2 logs serimrobo

# PM2 전체 재시작
pm2 kill
npm install
pm2 start ecosystem.config.js --env production
```
