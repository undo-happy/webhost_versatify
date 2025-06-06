# Versatify

Versatify는 이미지와 파일 도구를 한곳에서 제공하는 웹 서비스입니다. Azure Functions 기반 API와 간단한 프론트엔드를 통해 다음 기능을 제공합니다.

- 이미지 변환
- 이미지 업스케일
- 선택 영역 확대
- QR 코드 생성
- 이미지 워터마킹

Versatify is built with Azure Static Web Apps and provides these tools via serverless functions.

### Watermark API

`POST /api/watermark`

Parameters:

- `file`: image file to watermark (multipart field)
- `text`: watermark text
- `opacity`: optional transparency between 0 and 1
- `position`: `top-left`, `top-right`, `bottom-left`, `bottom-right`, or `center`

The API returns a signed URL for downloading the watermarked image.

### QR Code API

`GET /api/generate?text=YOUR_TEXT`

Parameters:

- `text`: string to encode in the QR code

The API returns the QR code image (PNG by default).

## Development

```bash
# Install root dependencies (dev tools)
npm install

# Install dependencies for the API
cd api && npm install

# Install dependencies for the frontend
cd ../frontend && npm install

# Return to repo root and run tests
cd .. && npm test
cd api && npm test
cd ../frontend && npm test
```

### Local Development

Start both the Azure Functions backend and the Vite frontend together:

```bash
npm run dev
```

The script uses `npx` to launch Azure Functions. If you prefer a global
installation, run `npm install -g azure-functions-core-tools@4`.

Copy `api/local.settings.json.example` to `api/local.settings.json` for local
credentials. The default values use the Azurite emulator and dummy R2
credentials.

```bash
# Build frontend and API
cd frontend && npm run build
cd ../api && npm run build
```

환경 변수 설정 예시는 `.env.example` 파일을 참고하세요. Cloudflare R2와 관리자 비밀번호 해시 등을 설정해야 합니다.

See `docs/PROGRESS.md` for feature checklist and progress.
