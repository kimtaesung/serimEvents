# 가비아 Node.js 컨테이너 배포 - 단계별 가이드

## 현재 상황
✅ 모든 배포 파일이 준비되었습니다.
✅ 프로젝트 빌드가 완료되었습니다.
⚠️ Windows 환경에서는 chmod 명령어가 작동하지 않습니다 (정상).

## 1단계: 가비아 서버에 파일 업로드

### 업로드할 파일 목록:
```
📁 전체 프로젝트 폴더를 업로드하세요:
├── server/                     (백엔드 API 서버)
├── public_html/               (빌드된 프론트엔드)
├── node_modules/              (선택사항 - 서버에서 npm install 가능)
├── ecosystem.config.js        (PM2 설정)
├── deploy-gabia.sh           (배포 스크립트)
├── setup-gabia.sh            (초기 설정)
├── .env.gabia                (환경 설정 템플릿)
├── package.json              (의존성 정보)
└── 기타 설정 파일들
```

### FTP/SFTP로 업로드하거나 Git Clone 사용:
```bash
# Git을 사용하는 경우 (가비아 서버에서)
git clone https://github.com/kimtaesung/serimRobot.git
cd serimRobot
```

## 2단계: 가비아 서버에서 실행할 명령어

### A. 초기 환경 설정
```bash
# 1. 프로젝트 디렉토리로 이동
cd /your/project/path

# 2. 스크립트 실행 권한 부여 (Linux에서만)
chmod +x deploy-gabia.sh setup-gabia.sh

# 3. 초기 환경 설정 실행
./setup-gabia.sh
```

### B. 데이터베이스 정보 수정
```bash
# .env 파일 편집 (가비아 제공 DB 정보로 변경)
nano .env

# 또는 vi 에디터 사용
vi .env
```

**수정해야 할 항목:**
```bash
DB_HOST=가비아제공DB호스트
DB_USER=가비아제공DB사용자명  
DB_PASSWORD=가비아제공DB비밀번호
DB_NAME=가비아제공DB이름
JWT_SECRET=보안강화된새로운시크릿키
```

### C. 서버 배포 및 시작
```bash
# PM2로 서버 시작
./deploy-gabia.sh

# 또는 직접 PM2 명령 사용
npm run gabia:deploy
```

## 3단계: 상태 확인

### 서버 상태 확인
```bash
# PM2 프로세스 상태
pm2 status

# 실시간 로그 확인
pm2 logs serimrobo-server

# 실시간 모니터링
pm2 monit
```

### 웹사이트 접속 테스트
- **프론트엔드**: `http://your-domain.gabia.io`
- **API 테스트**: `http://your-domain.gabia.io:8007/api/test`

## 4단계: 주요 PM2 명령어

```bash
# 서버 재시작
pm2 restart serimrobo-server

# 서버 중지  
pm2 stop serimrobo-server

# 서버 삭제
pm2 delete serimrobo-server

# 로그 확인 (최근 100줄)
pm2 logs serimrobo-server --lines 100

# 부팅시 자동 시작 설정
pm2 startup
pm2 save
```

## 5단계: 문제 해결

### 포트 관련 문제
```bash
# 8007 포트 사용 중인 프로세스 확인
lsof -i :8007

# 프로세스 종료
kill -9 [PID]
```

### 데이터베이스 연결 문제
```bash
# MySQL 연결 테스트
mysql -h [DB_HOST] -u [DB_USER] -p[DB_PASSWORD] [DB_NAME]

# 데이터베이스 초기화 재실행
node scripts/init-db.js
```

### PM2 관련 문제
```bash
# PM2 완전 재시작
pm2 kill
pm2 resurrect

# 또는 전체 재시작
pm2 restart all
```

## ✅ 체크리스트

- [ ] 파일 업로드 완료
- [ ] chmod 권한 설정 (Linux에서만)
- [ ] Node.js 및 PM2 설치 확인
- [ ] npm install 실행
- [ ] .env 파일 DB 정보 수정
- [ ] ./setup-gabia.sh 실행
- [ ] ./deploy-gabia.sh 실행
- [ ] pm2 status로 서버 확인
- [ ] 웹사이트 접속 테스트

## 🚨 중요 사항

1. **보안**: JWT_SECRET을 반드시 강력한 값으로 변경
2. **데이터베이스**: 가비아 제공 MySQL 정보 정확히 입력
3. **포트**: 8007 포트가 가비아에서 허용되는지 확인
4. **로그**: 에러 발생시 `pm2 logs` 명령으로 확인

이제 가비아 서버에 파일을 업로드하고 위 가이드를 따라 진행하시면 됩니다!