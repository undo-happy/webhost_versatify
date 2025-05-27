// 기본 콘텐츠 로드
function loadContent() {
    const savedContent = localStorage.getItem('versatifyContent');
    if (savedContent) {
        document.getElementById('toolsContent').innerHTML = savedContent;
    } else {
        loadDefaultContent();
    }
}

function loadDefaultContent() {
    const defaultContent = `
        <div class="tool-category">
            <div class="category-header">
                <div class="category-icon pdf-icon">🏠</div>
                <div>
                    <div class="category-title">HUB</div>
                    <div class="category-desc">통합 조작 센터</div>
                </div>
            </div>
            <div class="tool-list">
                <div class="tool-item" onclick="showFileConverter()">
                    <div class="tool-name">파일 변환</div>
                    <div class="tool-desc">모든 형식 지원</div>
                </div>
                <div class="tool-item" onclick="openTool('batch-process')">
                    <div class="tool-name">일괄 처리</div>
                    <div class="tool-desc">여러 작업 동시</div>
                </div>
            </div>
        </div>
        
        <div class="tool-category">
            <div class="category-header">
                <div class="category-icon image-icon">📋</div>
                <div>
                    <div class="category-title">INDEX</div>
                    <div class="category-desc">지식 검색 허브</div>
                </div>
            </div>
            <div class="tool-list">
                <div class="tool-item" onclick="openTool('search')">
                    <div class="tool-name">FLOWS 검색</div>
                    <div class="tool-desc">도구 빠른 검색</div>
                </div>
                <div class="tool-item" onclick="openTool('categories')">
                    <div class="tool-name">카테고리</div>
                    <div class="tool-desc">체계적 분류</div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('toolsContent').innerHTML = defaultContent;
}

// Tab 전환
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// 도구 열기
function openTool(toolName) {
    alert(`${toolName} 도구를 준비 중입니다!`);
}

// 파일 변환 모달
function showFileConverter() {
    document.getElementById('converterModal').classList.add('show');
}

function closeConverterModal() {
    document.getElementById('converterModal').classList.remove('show');
}

// 관리자 모달
function showAdminModal() {
    document.getElementById('adminModal').classList.add('show');
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.remove('show');
    document.getElementById('adminPassword').value = '';
    document.getElementById('errorMessage').style.display = 'none';
}

function checkAdminPassword() {
    const password = document.getElementById('adminPassword').value;
    if (password === '1234') {
        sessionStorage.setItem('adminLoggedIn', 'true');
        window.location.href = 'admin.html';
    } else {
        document.getElementById('errorMessage').style.display = 'block';
    }
}

// 파일 변환 데모
let selectedFile = null;

document.getElementById('fileInput')?.addEventListener('change', function(e) {
    selectedFile = e.target.files[0];
    if (selectedFile) {
        document.getElementById('dropZoneText').textContent = `선택된 파일: ${selectedFile.name}`;
        checkConversionReady();
    }
});

document.getElementById('targetFormat')?.addEventListener('change', checkConversionReady);

function checkConversionReady() {
    const hasFile = selectedFile !== null;
    const hasFormat = document.getElementById('targetFormat').value !== '';
    document.getElementById('convertButton').disabled = !(hasFile && hasFormat);
}

function startConversion() {
    document.getElementById('progressSection').style.display = 'block';
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('statusMessage').textContent = `변환 중... ${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            document.getElementById('statusMessage').textContent = '변환 완료! (데모 모드)';
        }
    }, 200);
}

// 파일 타입 버튼 클릭 이벤트
document.addEventListener('DOMContentLoaded', function() {
    // 파일 타입 버튼에 클릭 이벤트 추가
    const fileTypeButtons = document.querySelectorAll('.file-type-btn');
    fileTypeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // 선택된 버튼 하이라이트
            fileTypeButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            
            // 파일 형식에 따라 변환 형식 옵션 업데이트
            updateFormatOptions(this.textContent.trim());
        });
    });
    
    // 파일 선택 영역 클릭 이벤트
    const fileSelectArea = document.querySelector('.file-select-area');
    if (fileSelectArea) {
        fileSelectArea.addEventListener('click', function() {
            document.getElementById('fileInput').click();
        });
    }
    
    // 파일 입력 변경 이벤트
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            if (this.files.length > 0) {
                const fileName = this.files[0].name;
                const fileSelectAreaText = document.querySelector('.file-select-area p');
                if (fileSelectAreaText) {
                    fileSelectAreaText.textContent = `선택된 파일: ${fileName}`;
                }
                
                // 파일 확장자에 따라 자동으로 버튼 선택
                const fileExt = fileName.split('.').pop().toLowerCase();
                selectFileTypeByExtension(fileExt);
            }
        });
    }
});

// 파일 확장자에 따라 버튼 선택
function selectFileTypeByExtension(extension) {
    const fileTypeButtons = document.querySelectorAll('.file-type-btn');
    let buttonToSelect = null;
    
    if (['pdf'].includes(extension)) {
        buttonToSelect = 'PDF';
    } else if (['doc', 'docx'].includes(extension)) {
        buttonToSelect = 'DOCX';
    } else if (['xls', 'xlsx'].includes(extension)) {
        buttonToSelect = 'XLSX';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
        buttonToSelect = '이미지';
    }
    
    if (buttonToSelect) {
        fileTypeButtons.forEach(btn => {
            if (btn.textContent.trim() === buttonToSelect) {
                btn.click();
            }
        });
    }
}

// 변환 형식 옵션 업데이트
function updateFormatOptions(fileType) {
    const formatSelector = document.getElementById('targetFormat');
    if (!formatSelector) return;
    
    // 기존 옵션 초기화
    formatSelector.innerHTML = '<option value="">변환할 형식을 선택하세요</option>';
    
    // 파일 타입에 따라 변환 형식 추가
    if (fileType === 'PDF') {
        addOption(formatSelector, 'docx', 'DOCX (Word)');
        addOption(formatSelector, 'jpg', 'JPG 이미지');
        addOption(formatSelector, 'png', 'PNG 이미지');
        addOption(formatSelector, 'txt', '텍스트 파일');
    } else if (fileType === 'DOCX') {
        addOption(formatSelector, 'pdf', 'PDF');
        addOption(formatSelector, 'txt', '텍스트 파일');
        addOption(formatSelector, 'html', 'HTML');
    } else if (fileType === 'XLSX') {
        addOption(formatSelector, 'pdf', 'PDF');
        addOption(formatSelector, 'csv', 'CSV');
        addOption(formatSelector, 'json', 'JSON');
    } else if (fileType === '이미지') {
        addOption(formatSelector, 'jpg', 'JPG');
        addOption(formatSelector, 'png', 'PNG');
        addOption(formatSelector, 'gif', 'GIF');
        addOption(formatSelector, 'pdf', 'PDF');
    }
}

// 셀렉트 박스에 옵션 추가
function addOption(selectElement, value, text) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    selectElement.appendChild(option);
}

// 변환 시작
function startConversion() {
    const fileInput = document.getElementById('fileInput');
    const targetFormat = document.getElementById('targetFormat');
    
    if (!fileInput.files.length || !targetFormat.value) {
        alert('파일과 변환 형식을 모두 선택해주세요.');
        return;
    }
    
    // 여기서는 데모만 보여주기 위한 처리
    alert(`변환이 완료되었습니다! (데모 모드)\n${fileInput.files[0].name}을(를) ${targetFormat.value} 형식으로 변환했습니다.`);
    closeConverterModal();
}

// 초기화
window.onload = function() {
    loadContent();
};
