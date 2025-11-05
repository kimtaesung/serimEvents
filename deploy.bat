@echo off
REM GABIA 배포 스크립트 (Windows)

echo GABIA 배포 시작...
call npm run gabia:build
echo 빌드 완료!

REM 필요한 경우 여기에 배포 명령 추가
REM 예: xcopy public_html\* \\host\deploy\ /S /Y
