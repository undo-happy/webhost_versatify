# Development Progress

This document tracks implemented features from the PRD.

- [x] File Conversion API using Cloudflare R2
- [x] Image Format Conversion with @napi-rs/image
- [x] Image Upscaling
- [x] Selective Image Zoom
- [x] QR Code Generation API
- [x] Image Watermarking

## Tests Performed
- `npm install` 및 `npm test`를 `api`와 `frontend` 디렉터리에서 실행하여 기본 동작을 확인함.

## Repository Review (June 2025)
모든 디렉터리(`api`, `frontend`, `docs`, 스크립트 포함)를 점검한 결과, 코드 상에 남아 있는 TODO 주석이나 미완성 기능은 발견되지 않았습니다. `azure-setup.ps1`와 `generate-admin-hash.js`에서 환경 변수 설정 방법이 명시되어 있으며, `staticwebapp.config.json`을 통해 배포 구성이 완료된 상태입니다.

## Next Steps
- Azure Static Web Apps 환경에 최종 배포를 준비합니다.
- PRD의 "Future Considerations" 섹션에 명시된 기능(동영상 변환, 고급 AI 편집, 다국어 지원, B2B/B2C API 제공) 구현을 검토합니다.
- `AZURE_SETUP.md`의 지침에 따라 관리자 비밀번호 해시와 기타 환경 변수를 설정합니다.
- 배포 후 `generate-admin-hash.js`로 새 비밀번호 해시를 생성해 보안을 유지합니다.
- [x] 프런트엔드에 QR 코드 생성 UI를 추가하여 Generate API와 연동했습니다.
- [x] Watermark API UI 연동을 완료합니다.
- `openTool('image-resize')`를 실제 이미지 크기 조정 모달로 구현하고 Convert API에 연동합니다.
- 관리자 패널의 `generateWebsiteCode()` 기능을 완성하여 편집한 콘텐츠를 정적 HTML로 내보냅니다.
- Cloudflare R2 저장소 정리 함수(`CleanupStorage`)를 타이머 트리거로 배포하여 자동화합니다.
- 새로 추가되는 모달과 API 연동 로직에 대한 테스트 코드를 작성합니다.
