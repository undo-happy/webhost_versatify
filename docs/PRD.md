# Versatify Product Requirements Document

## 1. Executive Summary
Versatify is a unified web service hosted at **versatify.me** that provides a suite of tools for file and image management. Users can convert files, upscale images and apply legally safe watermarks without switching between multiple apps. The solution is deployed on **Microsoft Azure Static Web Apps** with backend APIs running as Azure Functions. Processed files are stored temporarily on **Cloudflare R2**, not Azure Blob Storage.

## 2. Problem Statement
Existing image and file tools are fragmented. Users often download and upload files repeatedly across different services, leading to wasted time and poor experience. Access to advanced features like watermarking or upscaling is limited and legally risky. Versatify aims to solve this by providing all tools in one website.

## 3. Goals and Objectives
- **Primary Goal:** Provide all file and image tools from a single website, reducing friction for users.
- **Secondary Goals:**
  - Support multiple extensions and advanced image features.
  - Introduce AI-based assistance for improved workflows.
  - Offer legally compliant watermarking.
- **Success Metrics:**
  - Monthly active users.
  - Usage frequency per tool.
  - User satisfaction surveys.
  - Average processing time.

## 4. Target Audience
- **Primary Users:** Ages 10--30, digital natives needing quick file and image tasks.
- **Secondary Users:** Professionals in marketing, design, education, or small businesses requiring watermark protection.

## 5. User Stories
- As a student, I want to convert images for school assignments in a few clicks.
- As a creator, I want to upscale and zoom specific image regions for high-quality results.
- As an employee, I want to insert legal watermarks with company branding.
- As anyone, I want to generate a QR code to share information easily.
- As a user, I want AI to recommend the right tool automatically.

## 6. Functional Requirements
- **File Conversion** between formats such as JPG, PNG, PDF, DOC (up to 50MB per file).
- **Image Format Conversion** with quality preservation and processing within 5 seconds.
- **Image Upscaling** using AI to enhance resolution by 2--4x.
- **Selective Image Zoom** allowing users to pick a region for high-quality enlargement.
- **QR Code Generation** with custom designs, supporting static and dynamic codes.
- **Image Watermarking** with configurable opacity, position, and size that meets legal standards.

### Supporting Features
- AI-driven tool suggestions.
- Batch processing for multiple files.
- Result downloads and potential integration with external storage (e.g., Google Drive).
- Basic editing tools like crop and rotate.

## 7. Non-Functional Requirements
- **Performance:** Average response time within 3 seconds.
- **Security:** SSL for file transfer and temporary storage, authentication for restricted features.
- **Usability:** Responsive interface for desktop and mobile.
- **Scalability:** Support 100k monthly concurrent users.
- **Compatibility:** Modern browsers (Chrome, Firefox, Safari, Edge).

## 8. Technical Considerations
- **Architecture:** Single Page Application front end (e.g., React or Vue) with Node.js Azure Functions.
- **Storage:** Files temporarily stored on Cloudflare R2. Auto deletion policy to clean up expired files.
- **Integration:** AI services for image processing and QR code libraries.
- **Data Handling:** Minimal user data, encrypted file transfers.

## 9. Success Metrics and KPIs
- Monthly active users above 10,000.
- Average session time above 5 minutes.
- Conversion success rate above 95%.
- Net Promoter Score above 60.

## 10. Timeline and Milestones
1. **Phase 1 (3 months):** MVP with file/image conversion, QR generation, basic watermarking.
2. **Phase 2 (2 months):** Add upscaling, selective zoom, and AI tool suggestions.
3. **Phase 3 (2 months):** Batch processing, advanced editing, and feature refinement.

## 11. Risks and Mitigation
- **Technical:** Large image processing might fail. Mitigate with cloud buffering and retries.
- **Legal:** Watermark disputes. Mitigate by continuous legal review.
- **Adoption:** Competing services may overshadow Versatify. Mitigate through AI automation and integrated user experience.

## 12. Future Considerations
- Video conversion and editing.
- More advanced AI editing and recommendations.
- Multi-language and global user support.
- Offer APIs for B2B/B2C partners.

## 13. Development Status (June 2025)
현재 개발 진행 상황은 `docs/PROGRESS.md` 문서에 기록되어 있습니다. 요약은 다음과 같습니다:

- [x] 파일 변환 API (Cloudflare R2)
- [x] 이미지 포맷 변환
- [x] 이미지 업스케일링 *(API only)*
- [x] 선택 영역 확대 *(API only)*
- [x] QR 코드 생성 API
- [x] 이미지 워터마킹

테스트는 각 패키지에서 `npm install` 후 `npm test` 명령을 실행하여 기본 동작을 확인했습니다.

일부 기능은 API 수준에서만 구현되어 있으며, 이를 호출할 수 있는 사용자 인터페이스가 제공되지 않은 상태입니다. 따라서 웹사이트에서는 업스케일링, 선택 영역 확대와 같은 도구가 눈에 띄지 않아 기능 존재 여부를 파악하기 어렵습니다. 환경 변수 설정 방법은 `AZURE_SETUP.md`를 참고하세요.

Repository reference: [https://github.com/undo-happy/webhost_versatify](https://github.com/undo-happy/webhost_versatify)

## 14. 인수인계
이 문서는 개발 인수인계를 위한 요약입니다. 다음 정보를 참고하여 프로젝트를 이어서 진행하십시오.

1. 기능 진행 상황은 위 개발 상태 요약 및 `docs/PROGRESS.md`를 확인합니다.
2. 추가 기능 개발 시 PRD와 PROGRESS 문서를 함께 갱신합니다.
3. 테스트는 각 패키지 디렉터리(`api`, `frontend`)에서 `npm install` 후 `npm test`를 실행해 기본 동작을 확인합니다.
4. Azure Static Web Apps 배포는 `.github/workflows/azure-static-web-apps.yml` 파일을 통해 자동화되어 있습니다.

## 15. Web UI Integration Tasks (July 2025)
현재 API 함수들은 동작 가능하지만 프런트엔드와 완전히 연결되지 않은 기능들이 있습니다. 사이트 내에 진입 경로가 부족해 사용자가 기능 존재 자체를 알기 어렵습니다. 다음 작업을 통해 웹사이트를 완성합니다.

1. **이미지 크기 조정 도구**
   - 현재 홈 화면에 해당 기능을 여는 버튼이 없으며, `openTool('image-resize')` 호출 시 알림만 표시됩니다.
   - Convert API(`/api/convert`)의 `width`와 `height` 매개변수를 사용하여 실제 이미지 리사이즈 모달을 구현하고, 메뉴에서 접근할 수 있도록 링크를 추가합니다.

2. **워터마킹 기능 연동** ✅
   - 워터마크 모달을 통해 텍스트, 위치, 투명도 옵션을 입력 받아 `/api/watermark`와 연결했습니다.

3. **QR 코드 생성기 추가** ✅
   - 문자열 입력 후 `/api/generate` 호출로 QR 이미지를 표시하는 모달을 구현했습니다.

4. **관리자 패널 기능 강화**
   - `generateWebsiteCode()`는 미구현 상태입니다. 편집된 카드 정보를 기반으로 정적 HTML을 생성하고 다운로드할 수 있게 합니다. 또한 업스케일, 부분 확대 등 숨겨진 기능에 대한 편집 옵션을 추가합니다.

5. **자동 스토리지 정리**
   - `CleanupStorage` 함수는 GitHub Actions 스케줄러가 매일 호출하도록 설정합니다.

6. **테스트 보강**
   - 프런트엔드 모달 렌더링 테스트와 각 API 성공 케이스 테스트를 추가해 품질을 유지합니다.

7. **문서 업데이트** ✅
   - 위 작업을 완료한 후 `README.md`의 사용 예와 배포 절차를 갱신했습니다.


