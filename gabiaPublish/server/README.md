# Products API Server

PostgreSQL을 사용한 상품 관리 REST API 서버입니다.

## 설치

```bash
npm install express pg dotenv cors
```

## 환경 변수 설정

`.env` 파일을 루트 디렉토리에 생성하고 다음 내용을 입력하세요:

```
DB_USER=your_database_user
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_database_password
DB_PORT=5432
PORT=3000
```

## 데이터베이스 설정

PostgreSQL에서 `schema.sql` 파일을 실행하여 테이블을 생성합니다:

```bash
psql -U your_username -d your_database -f schema.sql
```

## 서버 실행

```bash
node server/example-api.js
```

## API 엔드포인트

### 상품 목록 조회
```
GET /api/products
GET /api/products?category=전자기기
GET /api/products?in_stock=true
```

### 특정 상품 조회
```
GET /api/products/:id
```

### 상품 생성
```
POST /api/products
Content-Type: application/json

{
  "name": "상품명",
  "description": "설명",
  "price": 100000,
  "image": "https://example.com/image.jpg",
  "category": "카테고리",
  "features": ["특징1", "특징2"],
  "in_stock": true
}
```

### 상품 수정
```
PUT /api/products/:id
Content-Type: application/json

{
  "name": "수정된 상품명",
  "price": 150000
}
```

### 상품 삭제
```
DELETE /api/products/:id
```

## 프론트엔드 연동

프론트엔드에서 `/api/products.ts` 파일의 함수들을 사용하여 API를 호출할 수 있습니다:

```typescript
import { getProducts, createProduct, updateProduct, deleteProduct } from './api/products';

// 상품 목록 조회
const products = await getProducts();

// 상품 생성
const newProduct = await createProduct({
  name: "새 상품",
  description: "설명",
  price: 100000,
  image: "",
  category: "카테고리",
  features: [],
  inStock: true
});

// 상품 수정
const updated = await updateProduct(1, { price: 150000 });

// 상품 삭제
await deleteProduct(1);
```
