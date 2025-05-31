# Azure Static Web Apps 환경변수 설정 가이드

## 🔐 보안 환경변수 설정 (필수)

Versatify가 안전하게 작동하려면 Azure Portal에서 다음 환경변수를 설정해야 합니다.

### 📋 설정할 환경변수

```
ADMIN_PASSWORD_HASH = 759ed13f2c90f62b475d12cbe0f9900f
ADMIN_SALT = versatify_salt_2025
```

### 🖥️ Azure Portal에서 설정하기

1. **Azure Portal** (https://portal.azure.com) 접속
2. **Static Web Apps** 서비스로 이동
3. **webhost-versatify** (또는 본인의 앱 이름) 선택
4. 왼쪽 메뉴에서 **Configuration** 클릭
5. **Application settings** 탭에서 **+ Add** 버튼 클릭

**첫 번째 설정:**
- Name: `ADMIN_PASSWORD_HASH`
- Value: `759ed13f2c90f62b475d12cbe0f9900f`
- **Add** 클릭

**두 번째 설정:**
- Name: `ADMIN_SALT`
- Value: `versatify_salt_2025`
- **Add** 클릭

6. 상단의 **Save** 버튼 클릭

### 🚀 자동 설정 (Azure CLI 사용)

Azure CLI가 설치되어 있다면 다음 스크립트를 실행하세요:

```powershell
.\azure-setup.ps1 -ResourceGroupName "your-resource-group" -StaticWebAppName "your-app-name"
```

### 🔑 새 관리자 비밀번호

환경변수 설정 후 다음 비밀번호로 로그인하세요:

**비밀번호: `VersatifyAdmin2025!`**

### ⚠️ 중요 사항

- 환경변수를 설정하지 않으면 관리자 로그인이 **완전히 차단**됩니다
- 이는 보안을 위한 의도된 동작입니다
- 설정 후 배포가 완료되기까지 2-3분 소요됩니다

### 🔍 설정 확인

1. Versatify 웹사이트 접속
2. 관리자 로그인 시도
3. 새 비밀번호 `VersatifyAdmin2025!` 입력
4. 성공적으로 로그인되면 설정 완료!

### 🆘 문제 해결

**"Server configuration error" 오류가 나는 경우:**
- Azure Portal에서 환경변수가 올바르게 설정되었는지 확인
- 2-3분 기다린 후 다시 시도
- 브라우저 캐시 새로고침 (Ctrl+F5)

**Azure CLI 오류가 나는 경우:**
- `az login` 명령으로 다시 로그인
- 리소스 그룹명과 앱 이름이 정확한지 확인
- 수동 설정 방법 사용
