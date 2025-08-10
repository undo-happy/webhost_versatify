# Azure Static Web Apps 환경변수 설정 스크립트
# 사용법: .\azure-setup.ps1 -ResourceGroupName "your-rg" -StaticWebAppName "your-app-name"

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,

    [Parameter(Mandatory=$true)]
    [string]$StaticWebAppName,

    [string]$AdminPassword,
    [string]$AdminSalt = "versatify_salt_2025",
    [string]$StorageAccount,
    [string]$StorageKey
)

Write-Host "🔐 Versatify Azure 환경변수 설정 시작..." -ForegroundColor Green

if (-not $AdminPassword) {
    $AdminPassword = $Env:ADMIN_PASSWORD
}

# Blob Storage 계정/키가 파라미터로 없으면 환경변수 사용
if (-not $StorageAccount) { $StorageAccount = $Env:STORAGE_ACCOUNT }
if (-not $StorageKey) { $StorageKey = $Env:STORAGE_KEY }

if (-not $AdminPassword) {
    Write-Host "❌ -AdminPassword 매개변수 또는 ADMIN_PASSWORD 환경 변수를 지정하세요." -ForegroundColor Red
    exit 1
}

function Get-PasswordHash([string]$Password, [string]$Salt) {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Password + $Salt)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    $hashBytes = $sha256.ComputeHash($bytes)
    $hashHex = [System.BitConverter]::ToString($hashBytes).Replace("-", "").ToLower()
    return $hashHex.Substring(0, 32)
}

$AdminPasswordHash = Get-PasswordHash $AdminPassword $AdminSalt

try {
    # Azure CLI 로그인 확인
    Write-Host "Azure 로그인 상태 확인 중..." -ForegroundColor Yellow
    az account show --output none
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Azure 로그인이 필요합니다. 로그인을 진행합니다..." -ForegroundColor Yellow
        az login
    }

    # 환경변수 설정 - 관리자 해시
    Write-Host "관리자 비밀번호 해시 설정 중..." -ForegroundColor Yellow
    az staticwebapp appsettings set `
        --name $StaticWebAppName `
        --resource-group $ResourceGroupName `
        --setting-names "ADMIN_PASSWORD_HASH=$AdminPasswordHash"

    # 환경변수 설정 - 관리자 솔트
    Write-Host "관리자 솔트 설정 중..." -ForegroundColor Yellow
    az staticwebapp appsettings set `
        --name $StaticWebAppName `
        --resource-group $ResourceGroupName `
        --setting-names "ADMIN_SALT=$AdminSalt"

    # 환경변수 설정 - Blob Storage (둘 다 있을 때만 설정)
    if ($StorageAccount -and $StorageKey) {
        Write-Host "스토리지 계정/키 설정 중..." -ForegroundColor Yellow
        az staticwebapp appsettings set `
            --name $StaticWebAppName `
            --resource-group $ResourceGroupName `
            --setting-names "STORAGE_ACCOUNT=$StorageAccount" "STORAGE_KEY=$StorageKey"
    } else {
        Write-Host "경고: STORAGE_ACCOUNT 또는 STORAGE_KEY가 없어 Blob SAS 기능 설정을 건너뜁니다." -ForegroundColor Yellow
    }

    Write-Host "✅ Azure 환경변수 설정 완료!" -ForegroundColor Green
    Write-Host "🚀 몇 분 후 배포가 완료되면 지정한 비밀번호로 로그인하세요." -ForegroundColor Cyan

} catch {
    Write-Host "❌ 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "수동으로 Azure Portal에서 설정하세요:" -ForegroundColor Yellow
    Write-Host "ADMIN_PASSWORD_HASH = $AdminPasswordHash" -ForegroundColor White
    Write-Host "ADMIN_SALT = $AdminSalt" -ForegroundColor White
    if ($StorageAccount -and $StorageKey) {
        Write-Host "STORAGE_ACCOUNT = $StorageAccount" -ForegroundColor White
        Write-Host "STORAGE_KEY = $StorageKey" -ForegroundColor White
    }
}

Write-Host "`n📋 수동 설정 방법:" -ForegroundColor Cyan
Write-Host "1. Azure Portal → Static Web Apps → $StaticWebAppName" -ForegroundColor White
Write-Host "2. Settings → Configuration" -ForegroundColor White
Write-Host "3. Application settings → + Add" -ForegroundColor White
Write-Host "4. Name: ADMIN_PASSWORD_HASH, Value: $AdminPasswordHash" -ForegroundColor White
Write-Host "5. Name: ADMIN_SALT, Value: $AdminSalt" -ForegroundColor White
if ($StorageAccount -and $StorageKey) {
    Write-Host "6. Name: STORAGE_ACCOUNT, Value: $StorageAccount" -ForegroundColor White
    Write-Host "7. Name: STORAGE_KEY, Value: $StorageKey" -ForegroundColor White
}
