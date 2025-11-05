@echo off
chcp 65001 >nul

REM 용량 절감 모드 설정 (--slim 옵션)
setlocal enabledelayedexpansion
set SLIM_MODE=0

if "%1"=="--slim" (
    set SLIM_MODE=1
    echo.
    echo ========================================
    echo SerimRobo 가비아 배포 빌드 (용량 절감 모드)
    echo ========================================
    echo 📦 프로덕션 전용 의존성 설치로 용량 최소화
    echo.
) else (
    echo.
    echo ========================================
    echo SerimRobo 가비아 배포 빌드 시작
    echo ========================================
    echo 💡 팁: --slim 옵션으로 용량 절감 모드 실행 가능
    echo    예: deploy-gabia.bat --slim
    echo.
)

REM 현재 디렉토리 확인
if not exist "package.json" (
    echo 오류: package.json을 찾을 수 없습니다.
    echo 이 스크립트는 프로젝트 루트 디렉토리에서 실행하세요.
    pause
    exit /b 1
)

echo [1/6] npm 의존성 설치 중...
if !SLIM_MODE! equ 1 (
    echo ⚡ 프로덕션 전용 모드 (개발 의존성 제외)
    call npm install --production
) else (
    echo 📦 전체 모드 (개발 의존성 포함)
    call npm install
)
if errorlevel 1 (
    echo 오류: npm install 실패
    pause
    exit /b 1
)
echo ✓ npm install 완료

echo.
echo [2/6] 프로덕션 빌드 중...
call npm run build
if errorlevel 1 (
    echo 오류: npm run build 실패
    pause
    exit /b 1
)
echo ✓ 빌드 완료

echo.
echo [3/6] gabiaPublish 폴더 준비 중...
if exist "gabiaPublish" (
    echo gabiaPublish 폴더 제거 중...
    rmdir /s /q "gabiaPublish"
)
mkdir "gabiaPublish"
mkdir "gabiaPublish\logs"
mkdir "gabiaPublish\uploads"
echo ✓ gabiaPublish 폴더 생성 완료

echo.
echo [4/6] 빌드된 파일 복사 중...
echo - public_html 복사 중...
xcopy /E /I /Y "public_html" "gabiaPublish\public_html"
echo - server 복사 중...
xcopy /E /I /Y "server" "gabiaPublish\server"

if !SLIM_MODE! equ 1 (
    echo - node_modules 최소화 (프로덕션 전용)
) else (
    echo - node_modules 복사 중...
    xcopy /E /I /Y "node_modules" "gabiaPublish\node_modules"
)
echo ✓ 파일 복사 완료

echo.
echo [5/6] 배포 파일 복사 중...
copy /Y "package.json" "gabiaPublish\package.json"
copy /Y "ecosystem.config.js" "gabiaPublish\ecosystem.config.js"
if exist ".env.example" (
    copy /Y ".env.example" "gabiaPublish\.env.example"
)
if exist "DEPLOYMENT_GUIDE.md" (
    copy /Y "DEPLOYMENT_GUIDE.md" "gabiaPublish\DEPLOYMENT_GUIDE.md"
)
echo ✓ 배포 파일 복사 완료

echo.
echo [6/6] 크기 최적화 중...
if !SLIM_MODE! equ 1 (
    echo ⚡ 캐시 파일 제거 중...
    if exist "gabiaPublish\node_modules\.cache" (
        rmdir /s /q "gabiaPublish\node_modules\.cache"
    )
    if exist "gabiaPublish\.next" (
        rmdir /s /q "gabiaPublish\.next"
    )
)
echo ✓ 최적화 완료

echo.
echo ========================================
echo ✅ 배포 빌드 완료!
echo ========================================
echo.
if !SLIM_MODE! equ 1 (
    echo 📦 모드: 용량 절감 (프로덕션 전용)
    echo 📁 배포 폴더: gabiaPublish\ (약 100-200MB)
) else (
    echo 📦 모드: 표준 배포
    echo � 배포 폴더: gabiaPublish\ (약 700-900MB)
)
echo.
echo �📋 다음 단계:
if !SLIM_MODE! equ 1 (
    echo   1. gabiaPublish\.env 파일 생성 (환경변수 설정)
    echo   2. gabiaPublish 폴더를 서버에 업로드
    echo   3. 서버에서: npm install --production
    echo   4. 서버에서: npm run gabia:deploy
) else (
    echo   1. gabiaPublish\.env 파일 생성 (환경변수 설정)
    echo   2. gabiaPublish 폴더를 서버에 업로드
    echo   3. 서버에서: npm run gabia:deploy
)
echo.
echo 💡 팁: 호스팅 용량 제한이 있다면 --slim 옵션 사용
echo    deploy-gabia.bat --slim
echo.
echo 📄 상세 가이드: gabiaPublish\DEPLOYMENT_GUIDE.md 참고
echo.

pause