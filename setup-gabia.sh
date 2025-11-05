#!/bin/bash

echo "🔧 가비아 Node.js 환경 설정 스크립트"

# 1. Node.js 버전 확인
echo "📋 Node.js 버전 확인..."
node --version
npm --version

# 2. PM2 설치 확인
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2를 전역으로 설치합니다..."
    npm install -g pm2
else
    echo "✅ PM2가 이미 설치되어 있습니다."
    pm2 --version
fi

# 3. 의존성 설치
echo "📦 프로젝트 의존성 설치..."
npm install --production

# 4. 환경 파일 설정
if [ ! -f ".env" ]; then
    if [ -f ".env.gabia" ]; then
        echo "📝 가비아 환경 설정 파일을 .env로 복사..."
        cp .env.gabia .env
        echo "⚠️ .env 파일의 데이터베이스 정보를 가비아 제공 정보로 수정하세요!"
    else
        echo "❌ .env.gabia 파일이 없습니다."
        exit 1
    fi
fi

# 5. 필요한 디렉토리 생성
echo "📁 필요한 디렉토리 생성..."
mkdir -p logs
mkdir -p uploads

# 6. 파일 권한 설정
echo "🔒 파일 권한 설정..."
chmod +x deploy-gabia.sh
chmod +x setup-gabia.sh

# 7. 프론트엔드 빌드
echo "🏗️ 프론트엔드 빌드..."
npm run build

echo ""
echo "✅ 가비아 환경 설정 완료!"
echo ""
echo "📋 다음 단계:"
echo "1. .env 파일에서 데이터베이스 정보를 가비아 제공 정보로 수정"
echo "2. JWT_SECRET을 보안이 강화된 값으로 변경"
echo "3. ./deploy-gabia.sh 실행하여 서버 시작"
echo ""
echo "🚀 서버 시작: ./deploy-gabia.sh"
echo "📊 상태 확인: pm2 status"
echo "📋 로그 확인: pm2 logs serimrobo-server"