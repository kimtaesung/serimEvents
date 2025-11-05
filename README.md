# SERIM ROBO - 지능형 로봇 솔루션

SERIM ROBO는 첨단 자율주행 로봇 플랫폼으로, 배송, 청소, 운반 등 다양한 산업 분야에서 활용됩니다.

## 프로젝트 구조

```
site/
├── App.tsx                 # 메인 애플리케이션
├── components/             # React 컴포넌트
│   ├── Header.tsx
│   ├── ProductList.tsx
│   ├── ProductCard.tsx
│   ├── ProductDetail.tsx
│   ├── AdminPage.tsx
│   └── ui/                # UI 컴포넌트 (Radix UI 기반)
├── data/
│   └── products.ts        # 상품 데이터
├── types/
│   └── product.ts         # TypeScript 타입 정의
├── server/
│   ├── index.js           # Express 서버
│   ├── database/          # DB 설정
│   ├── routes/            # API 라우트
│   └── uploads/           # 파일 업로드 디렉토리
├── scripts/
│   └── init-db.js         # DB 초기화
├── assets/                # 로고 및 이미지
│   ├── logo.svg
│   ├── 벨라.png
│   ├── 스위피블랙.png
│   └── 카고.png
├── package.json           # 의존성
├── vite.config.ts         # Vite 설정
├── tailwind.config.js     # Tailwind CSS 설정
└── render.yaml            # Render 배포 설정
```

## 기술 스택

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Radix UI + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL / MySQL
- **Deployment**: Render / GABIA

## 주요 기능

### 상품 관리
- 6가지 로봇 제품 표시
- 제품 상세 정보 조회
- 재고 상태 표시

### 관리자 기능
- 상품 추가/수정/삭제
- 파일 업로드 지원
- 데이터 관리

### 배포
- Render 클라우드 배포
- GABIA 호스팅 지원
- PostgreSQL 지원

## 상품 정보

1. **벨라봇 (Bella Bot)** - 배송 로봇
   - 가격: 15,000,000원
   - 자율주행, 최대 20kg 탑재

2. **스위피 (Sweepy) - 블랙** - 청소 로봇
   - 가격: 8,000,000원
   - LiDAR 매핑, 습식 청소 모드

3. **카고 (T300)** - 운반 로봇
   - 가격: 25,000,000원
   - 300kg 탑재량, 지게차 기능

4. **더스티 (MT1)** - 다목적 로봇
   - 가격: 12,000,000원
   - 모듈식 설계

5. **워시 (SH1)** - 청소 로봇
   - 가격: 18,000,000원
   - 고압 분사 시스템

6. **플래시봇 (Flashbot Pro)** - 배송 로봇
   - 가격: 20,000,000원
   - 초고속 배송, 30km/h

## 설정 및 배포

### 환경 변수 (.env)

```
NODE_ENV=production
PORT=10000
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=serimrobo
DB_USER=serimrobo_user
DB_PASSWORD=password
JWT_SECRET=your_jwt_secret
```

### 로컬 개발

```bash
npm install
npm run dev
```

### 빌드 및 배포

```bash
npm run build              # 빌드
npm run gabia:build        # GABIA 배포용 빌드
npm start                  # 프로덕션 실행
```

자세한 배포 가이드는 [DEPLOYMENT.md](DEPLOYMENT.md) 참조

## 라이선스

MIT

## 연락처

support@serimrobo.com
