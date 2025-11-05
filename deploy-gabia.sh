#!/bin/bash

echo "🚀 가비아 Node.js 컨테이너 배포 시작..."

# 현재 디렉토리 확인
echo "📂 현재 작업 디렉토리: $(pwd)"

# 1. 의존성 설치 확인
echo "📦 의존성 설치 확인..."
if [ ! -d "node_modules" ]; then
    echo "node_modules가 없습니다. 의존성을 설치합니다..."
    npm install --production
fi

# 2. 프론트엔드 빌드
echo "🏗️ 프론트엔드 빌드 중..."
npm run build

# 3. 로그 디렉토리 생성
echo "📁 로그 디렉토리 생성..."
mkdir -p logs

# 4. PM2가 설치되어 있는지 확인
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2가 설치되지 않았습니다. 전역으로 설치해주세요:"
    echo "npm install -g pm2"
    exit 1
fi

# 5. 기존 프로세스 중지 (있다면)
echo "🔄 기존 프로세스 중지..."
pm2 stop serimrobo-server 2>/dev/null || echo "중지할 기존 프로세스가 없습니다."
pm2 delete serimrobo-server 2>/dev/null || echo "삭제할 기존 프로세스가 없습니다."

# 6. 데이터베이스 초기화 (필요시)
echo "🗄️ 데이터베이스 초기화..."
if [ -f "scripts/init-db.js" ]; then
    node scripts/init-db.js
else
    echo "⚠️ 데이터베이스 초기화 스크립트가 없습니다."
fi

# 7. 환경 파일 확인
if [ ! -f ".env" ]; then
    echo "⚠️ .env 파일이 없습니다. .env.example을 복사하여 설정하세요."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env.example을 .env로 복사했습니다. 내용을 수정하세요."
    fi
fi

# 8. PM2로 애플리케이션 시작
echo "🔥 PM2로 서버 시작..."
pm2 start ecosystem.config.js --env production

# 9. PM2 부팅 시 자동 시작 설정
echo "⚙️ PM2 자동 시작 설정..."
pm2 startup
pm2 save

# 10. 상태 확인
echo "📊 서버 상태 확인..."
sleep 3
pm2 status

# 11. 로그 출력 (최근 10줄)
echo "📋 최근 로그 (10줄):"
pm2 logs serimrobo-server --lines 10

echo ""
echo "✅ 배포 완료!"
echo "🌐 서버 URL: http://localhost:8007"
echo "📊 모니터링: pm2 monit"
echo "📋 로그 확인: pm2 logs serimrobo-server"
echo "🔄 재시작: pm2 restart serimrobo-server"
echo "🛑 중지: pm2 stop serimrobo-server"