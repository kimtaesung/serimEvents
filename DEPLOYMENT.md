# 배포 설명서

## Render 배포 (권장)

### 사전 요구사항
- GitHub 계정
- Render 계정 (https://render.com)

### 배포 단계

1. 리포지토리를 GitHub에 푸시
2. Render 대시보드 접속
3. "Create New" > "Web Service" 선택
4. GitHub 리포지토리 연결
5. 다음 설정 확인:
   - **Build Command**: `npm install --include=dev && npm run build && node scripts/init-db.js`
   - **Start Command**: `npm start`
   - **Environment**: Node

6. "Create Web Service" 클릭
7. 자동 배포 시작

### 환경 변수 설정

Render 대시보드에서 Environment 섹션에 다음 변수 추가:
- `NODE_ENV`: production
- `JWT_SECRET`: 안전한 값 생성
- 기타 필요한 DB 변수

## GABIA 배포

### 사전 요구사항
- GABIA 호스팅 계정
- SSH/SFTP 접근 권한

### 배포 단계

1. 로컬에서 빌드:
```bash
npm run gabia:build
```

2. 생성된 `public_html` 디렉토리를 GABIA 서버에 업로드

3. 서버에서 의존성 설치 및 실행:
```bash
npm install
npm start
```

### 배포 스크립트 수정

`deploy.sh` 또는 `deploy.bat` 파일을 수정하여 실제 호스팅 정보 입력:

```bash
# deploy.sh 예시
sftp -r public_html/* user@gabia-host:/path/to/deploy/
```

## 데이터베이스 설정

### PostgreSQL (권장)

1. PostgreSQL 설치 및 실행
2. 데이터베이스 생성:
```sql
CREATE DATABASE serimrobo;
CREATE USER serimrobo_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE serimrobo TO serimrobo_user;
```

3. 스키마 초기화:
```bash
node scripts/init-db.js
```

### MySQL

`.env`에서 `DB_TYPE=mysql` 설정 후 같은 방식으로 진행

## 보안 설정

1. `.env` 파일을 `.gitignore`에 추가
2. 프로덕션 환경변수는 호스팅 서비스에서 설정
3. JWT_SECRET 변경 및 관리자 비밀번호 설정

## 문제 해결

- 포트 충돌: PORT 환경변수 변경
- DB 연결 오류: 호스트, 사용자명, 비밀번호 확인
- 빌드 오류: `npm install --legacy-peer-deps` 시도
