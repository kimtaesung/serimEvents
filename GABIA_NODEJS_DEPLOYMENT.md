# 가비아 Node.js 컨테이너 호스팅 배포 가이드

## 개요
가비아 Node.js 컨테이너 호스팅 환경에서 PM2를 사용한 프로세스 관리로 배포하는 방법을 안내합니다.

## 1. PM2 설정 파일 생성

PM2 ecosystem 파일로 애플리케이션을 관리합니다.

### ecosystem.config.js
```javascript
module.exports = {
  apps: [
    {
      name: 'serimrobo-server',
      script: './server/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 8007
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8007,
        DB_TYPE: 'mysql',
        DB_HOST: 'localhost',
        DB_PORT: 3306,
        DB_NAME: 'serimrobo',
        DB_USER: 'your_db_user',
        DB_PASSWORD: 'your_db_password',
        JWT_SECRET: 'your_jwt_secret_key_here',
        ADMIN_USERNAME: 'admin',
        ADMIN_PASSWORD: 'admin123',
        ADMIN_EMAIL: 'admin@serimrobo.com'
      },
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
```

## 2. 배포 스크립트

### deploy-gabia.sh (Linux/Mac)
```bash
#!/bin/bash

echo "🚀 가비아 Node.js 컨테이너 배포 시작..."

# 1. 프론트엔드 빌드
echo "📦 프론트엔드 빌드 중..."
npm run build

# 2. 로그 디렉토리 생성
mkdir -p logs

# 3. PM2로 기존 프로세스 중지 (있다면)
echo "🔄 기존 프로세스 중지..."
pm2 stop serimrobo-server 2>/dev/null || echo "기존 프로세스가 없습니다."
pm2 delete serimrobo-server 2>/dev/null || echo "삭제할 프로세스가 없습니다."

# 4. 데이터베이스 초기화 (필요시)
echo "🗄️ 데이터베이스 초기화..."
node scripts/init-db.js

# 5. PM2로 애플리케이션 시작
echo "🔥 PM2로 서버 시작..."
pm2 start ecosystem.config.js --env production

# 6. PM2 상태 확인
pm2 status

# 7. 서버 시작 확인
sleep 3
echo "✅ 배포 완료!"
echo "서버 상태: http://localhost:8007"
pm2 logs serimrobo-server --lines 10
```

### deploy-gabia.bat (Windows)
```batch
@echo off

echo 🚀 가비아 Node.js 컨테이너 배포 시작...

REM 1. 프론트엔드 빌드
echo 📦 프론트엔드 빌드 중...
call npm run build

REM 2. 로그 디렉토리 생성
if not exist "logs" mkdir logs

REM 3. PM2로 기존 프로세스 중지 (있다면)
echo 🔄 기존 프로세스 중지...
pm2 stop serimrobo-server 2>nul || echo 기존 프로세스가 없습니다.
pm2 delete serimrobo-server 2>nul || echo 삭제할 프로세스가 없습니다.

REM 4. 데이터베이스 초기화 (필요시)
echo 🗄️ 데이터베이스 초기화...
node scripts/init-db.js

REM 5. PM2로 애플리케이션 시작
echo 🔥 PM2로 서버 시작...
pm2 start ecosystem.config.js --env production

REM 6. PM2 상태 확인
pm2 status

REM 7. 서버 시작 확인
timeout /t 3 /nobreak >nul
echo ✅ 배포 완료!
echo 서버 상태: http://localhost:8007
pm2 logs serimrobo-server --lines 10

pause
```

## 3. package.json 스크립트 추가

배포 관련 스크립트를 추가합니다.

```json
{
  "scripts": {
    "gabia:deploy": "pm2 start ecosystem.config.js --env production",
    "gabia:stop": "pm2 stop serimrobo-server",
    "gabia:restart": "pm2 restart serimrobo-server",
    "gabia:logs": "pm2 logs serimrobo-server",
    "gabia:monitor": "pm2 monit",
    "gabia:status": "pm2 status"
  }
}
```

## 4. 환경 설정

### .env.gabia (가비아 전용 환경 파일)
```bash
# 가비아 Node.js 컨테이너 환경 설정
NODE_ENV=production
PORT=8007

# 데이터베이스 (가비아 제공 정보로 변경)
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=serimrobo
DB_USER=가비아제공유저명
DB_PASSWORD=가비아제공패스워드

# JWT 설정 (보안상 변경 필수)
JWT_SECRET=your_production_jwt_secret_change_this

# 관리자 계정
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_EMAIL=admin@serimrobo.com

# API URL (가비아 도메인으로 변경)
VITE_API_BASE_URL=https://yourdomain.gabia.io
```

## 5. 배포 순서

### 1단계: 로컬에서 준비
```bash
# 의존성 설치
npm install

# PM2 전역 설치 (필요시)
npm install -g pm2

# 빌드 테스트
npm run build
```

### 2단계: 가비아 서버에 업로드
- 전체 프로젝트 파일을 가비아 컨테이너에 업로드
- FTP, Git, 또는 파일 매니저 사용

### 3단계: 가비아 서버에서 실행
```bash
# 의존성 설치
npm install --production

# 환경 설정 복사
cp .env.gabia .env

# PM2로 배포
chmod +x deploy-gabia.sh
./deploy-gabia.sh
```

## 6. PM2 주요 명령어

```bash
# 애플리케이션 시작
pm2 start ecosystem.config.js --env production

# 상태 확인
pm2 status

# 로그 확인
pm2 logs serimrobo-server

# 재시작
pm2 restart serimrobo-server

# 중지
pm2 stop serimrobo-server

# 삭제
pm2 delete serimrobo-server

# 모니터링
pm2 monit

# 부팅시 자동 시작 설정
pm2 startup
pm2 save
```

## 7. 주의사항

1. **포트 설정**: 가비아 컨테이너에서 허용하는 포트 사용
2. **데이터베이스**: 가비아 MySQL 연결 정보 정확히 입력
3. **파일 권한**: 실행 파일에 적절한 권한 부여
4. **로그 관리**: PM2 로그 파일 정기적 관리
5. **보안**: .env 파일의 비밀키들 반드시 변경

## 8. 트러블슈팅

### 포트 충돌 시
```bash
# 포트 사용 중인 프로세스 확인
lsof -i :8007

# 프로세스 종료
kill -9 PID
```

### PM2 관련 문제
```bash
# PM2 프로세스 전체 재시작
pm2 restart all

# PM2 데몬 재시작
pm2 kill
pm2 resurrect
```

이 가이드를 따라 가비아 Node.js 컨테이너에 성공적으로 배포하실 수 있습니다.