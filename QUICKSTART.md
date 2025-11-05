# SERIM ROBO - 빠른 시작 가이드

## 설치

```bash
npm install
```

## 개발

클라이언트와 서버를 함께 실행:
```bash
npm run dev
```

또는 각각 실행:
```bash
npm run dev:client  # Vite 개발 서버
npm run dev:server  # Node.js 서버
```

## 빌드

```bash
npm run build
```

## 배포

### Render 배포

1. `render.yaml` 파일이 루트 디렉토리에 있는지 확인
2. Render 대시보드에서 git 리포지토리 연결
3. 자동으로 배포됨

### Gabia 배포

```bash
npm run gabia:build
```

배포 스크립트 사용:
```bash
./deploy.sh  # macOS/Linux
deploy.bat   # Windows
```

## 환경 설정

`.env` 파일을 생성하여 다음 변수 설정:
```
NODE_ENV=production
PORT=10000
DB_TYPE=postgres
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=serimrobo
DB_USER=your_user
DB_PASSWORD=your_password
JWT_SECRET=your_secret
```

## 데이터베이스 초기화

```bash
node scripts/init-db.js
```
