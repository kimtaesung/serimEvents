# 배포 시 이미지 경로 문제 해결 가이드

## 🔍 문제

배포 후 assets 이미지가 보이지 않음

### 원인
1. 소스 코드: `/src/assets/1.png` (개발 환경)
2. 빌드 후: `/assets/index-xxxxx.js` (Vite가 JS/CSS만 번들링)
3. 빌드 결과물이 `public_html/assets/`에 이미지 파일이 없음

---

## ✅ 해결 방법

### 1. Vite 설정 수정 (`vite.config.ts`)
- Vite 플러그인으로 빌드 후 이미지 파일 자동 복사
- `src/assets/*.png` → `public_html/assets/` 복사

### 2. 이미지 경로 변경
- **products.ts**: `/src/assets/1.png` → `/assets/1.png`
- **Header.tsx**: `/src/assets/logo.svg` → `/assets/logo.svg`

### 3. 절대 경로 사용
- 빌드된 정적 파일은 절대경로 `/assets/` 사용
- 상대경로 대신 `/assets/` 사용으로 서버 루트에서 제공

---

## 📋 배포 전 체크리스트

### 로컬 테스트
```bash
# 빌드 실행
npm run build

# 빌드 결과 확인
ls public_html/assets/
# 다음 파일들이 있는지 확인:
# - index-xxxxxx.js (React 번들)
# - index-xxxxxx.css (스타일)
# - 1.png, 2.png, 3.png, logo.svg (이미지들)
```

### 서버 실행 및 테스트
```bash
npm start
# http://localhost:8007 접속
# 이미지가 정상 표시되는지 확인
```

---

## 🚀 배포 후 확인

### Render 배포 시
```bash
git add .
git commit -m "fix: update image paths for deployment"
git push origin main
```

배포 후 로그 확인:
```
✓ Assets copied successfully
```

### 브라우저에서 확인
1. 개발자도구 → Network 탭
2. 이미지 요청 경로 확인:
   - ✓ `/assets/1.png` (정상)
   - ✗ `/src/assets/1.png` (잘못됨)

---

## 🔧 빌드 프로세스

### `npm run build` 실행 순서

1. **Vite 번들링**
   - React 코드 컴파일
   - 스타일 번들링
   - JS/CSS를 `public_html/assets/`에 생성

2. **이미지 복사** (Vite 플러그인)
   - `src/assets/` 의 모든 이미지 파일
   - → `public_html/assets/` 로 복사

3. **데이터베이스 초기화**
   - `npm run postbuild` 실행
   - `scripts/init-db.js` 실행

---

## 📊 최종 디렉토리 구조

```
public_html/
├── index.html (메인 페이지)
├── assets/
│   ├── index-B6vybsJh.js (React 번들)
│   ├── index-D0Yu5WKN.css (스타일)
│   ├── 1.png (벨라봇 이미지)
│   ├── 2.png (스위피 이미지)
│   ├── 3.png (카고 이미지)
│   └── logo.svg (로고)
```

---

## 🎯 결과

| 환경 | 이미지 경로 | 상태 |
|------|-----------|------|
| 개발 | `/src/assets/1.png` | Vite dev server가 해석 |
| 배포 | `/assets/1.png` | 절대경로로 정적 파일 제공 |

