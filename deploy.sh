#!/bin/bash
# GABIA 배포 스크립트

echo "GABIA 배포 시작..."
npm run gabia:build
echo "빌드 완료!"

# 필요한 경우 여기에 SFTP 업로드 명령 추가
# 예: sftp -r public_html/* user@host:/path/to/deploy/
