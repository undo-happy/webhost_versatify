# Versatify

Versatify는 이미지와 파일 도구를 한곳에서 제공하는 웹 서비스입니다. Azure Functions 기반 API와 간단한 프론트엔드를 통해 다음 기능을 제공합니다.

- 이미지 변환
- 이미지 업스케일
- 선택 영역 확대
- QR 코드 생성
- 이미지 워터마킹

Versatify is built with Azure Static Web Apps and provides these tools via serverless functions.

## Development

```bash
# Install dependencies for the API
cd api && npm install

# Install dependencies for the frontend
cd ../frontend && npm install

# Return to repo root and run tests
cd .. && npm test
cd api && npm test
cd ../frontend && npm test
```

```bash
# Build frontend and API
cd frontend && npm run build
cd ../api && npm run build
```

환경 변수 설정 예시는 `.env.example` 파일을 참고하세요. Cloudflare R2와 관리자 비밀번호 해시 등을 설정해야 합니다.

See `docs/PROGRESS.md` for feature checklist and progress.
