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
    // 드래그 앤 드롭 기능 초기화
    setupDragAndDrop();
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
        // 파일명 표시
        document.getElementById('dropZoneText').textContent = `선택된 파일: ${selectedFile.name}`;
        
        // 파일 타입 감지 및 변환 옵션 업데이트
        const fileType = getFileType(selectedFile.name);
        updateTargetFormatOptions(fileType);
        
        // 파일 정보 표시
        const fileInfo = document.getElementById('fileInfo');
        const fileTypeDisplay = document.querySelector('.file-type-display');
        
        if (fileInfo && fileTypeDisplay) {
            fileTypeDisplay.innerHTML = `
                <span class="file-type-tag" style="background: #3498db; color: white; margin-right: 10px;">
                    ${fileType ? fileType.toUpperCase() : '알 수 없음'}
                </span>
                <span class="file-size" style="color: #7f8c8d;">
                    ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
            `;
            fileInfo.style.display = 'block';
        }
        
        checkConversionReady();
    }
});

document.getElementById('targetFormat')?.addEventListener('change', checkConversionReady);

function checkConversionReady() {
    const hasFile = selectedFile !== null;
    const hasValidFormat = document.getElementById('targetFormat').value !== '';
    const isFormatSupported = !document.getElementById('targetFormat').disabled;
    
    const convertButton = document.getElementById('convertButton');
    const canConvert = hasFile && hasValidFormat && isFormatSupported;
    
    convertButton.disabled = !canConvert;
    
    // 버튼 텍스트 업데이트
    if (!hasFile) {
        convertButton.textContent = '파일을 선택하세요';
    } else if (!isFormatSupported) {
        convertButton.textContent = '지원하지 않는 파일 형식';
    } else if (!hasValidFormat) {
        convertButton.textContent = '변환 형식을 선택하세요';
    } else {
        convertButton.textContent = '🚀 변환 시작';
    }
}

async function startConversion() {
    if (!selectedFile) {
        alert('파일을 선택해주세요.');
        return;
    }

    const targetFormat = document.getElementById('targetFormat').value;
    if (!targetFormat) {
        alert('변환할 형식을 선택해주세요.');
        return;
    }

    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('statusMessage').textContent = '파일 업로드 중...';

    try {
        // FormData 생성
        const formData = new FormData();
        formData.append('file', selectedFile, selectedFile.name);
        formData.append('targetFormat', targetFormat);

        console.log('Sending file:', selectedFile.name, 'to format:', targetFormat);

        // 진행률 업데이트
        document.getElementById('progressFill').style.width = '25%';
        document.getElementById('statusMessage').textContent = '서버에 연결 중...';

        // API 호출
        const response = await fetch('/api/convert', {
            method: 'POST',
            body: formData
        });

        document.getElementById('progressFill').style.width = '50%';
        document.getElementById('statusMessage').textContent = '서버 응답 처리 중...';

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('Server response:', result);
        
        document.getElementById('progressFill').style.width = '100%';
        
        if (result.success) {
            document.getElementById('statusMessage').textContent = '파일 처리 완료!';
            // 실제 파일 다운로드는 백엔드에서 변환 완료 후 구현
            setTimeout(() => {
                alert(`변환 완료!\n원본: ${result.originalFile}\n형식: ${result.targetFormat}\n크기: ${result.fileSize} bytes`);
            }, 500);
        } else {
            throw new Error(result.message || '알 수 없는 오류가 발생했습니다.');
        }

    } catch (error) {
        console.error('변환 오류:', error);
        document.getElementById('statusMessage').textContent = `오류: ${error.message}`;
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('progressFill').style.backgroundColor = '#e74c3c';
        
        setTimeout(() => {
            document.getElementById('progressFill').style.backgroundColor = '#3498db';
        }, 3000);
    }
}

// 드래그 앤 드롭 기능 개선
function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    
    if (!dropZone) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight(e) {
        dropZone.style.backgroundColor = '#e8f4f8';
        dropZone.style.borderColor = '#3498db';
    }
    
    function unhighlight(e) {
        dropZone.style.backgroundColor = '';
        dropZone.style.borderColor = '';
    }
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            const file = files[0];
            selectedFile = file;
            
            // 파일 선택 이벤트와 동일한 처리
            document.getElementById('dropZoneText').textContent = `선택된 파일: ${file.name}`;
            
            const fileType = getFileType(file.name);
            updateTargetFormatOptions(fileType);
            
            const fileInfo = document.getElementById('fileInfo');
            const fileTypeDisplay = document.querySelector('.file-type-display');
            
            if (fileInfo && fileTypeDisplay) {
                fileTypeDisplay.innerHTML = `
                    <span class="file-type-tag" style="background: #3498db; color: white; margin-right: 10px;">
                        ${fileType ? fileType.toUpperCase() : '알 수 없음'}
                    </span>
                    <span class="file-size" style="color: #7f8c8d;">
                        ${(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                `;
                fileInfo.style.display = 'block';
            }
            
            checkConversionReady();
        }
    }
}

// 파일 타입별 변환 가능한 형식 매핑
const CONVERSION_FORMATS = {
    // 이미지 파일들
    'image': {
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp'],
        targetFormats: [
            { value: 'jpg', label: 'JPG (JPEG 이미지)' },
            { value: 'png', label: 'PNG (투명 이미지)' },
            { value: 'gif', label: 'GIF (움짤)' },
            { value: 'bmp', label: 'BMP (비트맵)' },
            { value: 'tiff', label: 'TIFF (고품질)' },
            { value: 'webp', label: 'WebP (웹 최적화)' },
            { value: 'pdf', label: 'PDF (문서)' }
        ]
    },
    
    // 문서 파일들
    'document': {
        extensions: ['doc', 'docx', 'odt', 'rtf', 'txt'],
        targetFormats: [
            { value: 'pdf', label: 'PDF (범용 문서)' },
            { value: 'docx', label: 'DOCX (Word 문서)' },
            { value: 'odt', label: 'ODT (OpenDocument)' },
            { value: 'rtf', label: 'RTF (서식 있는 텍스트)' },
            { value: 'txt', label: 'TXT (일반 텍스트)' },
            { value: 'html', label: 'HTML (웹 페이지)' }
        ]
    },
    
    // 스프레드시트 파일들
    'spreadsheet': {
        extensions: ['xls', 'xlsx', 'ods', 'csv'],
        targetFormats: [
            { value: 'xlsx', label: 'XLSX (Excel)' },
            { value: 'xls', label: 'XLS (Excel 97-2003)' },
            { value: 'ods', label: 'ODS (OpenDocument 스프레드시트)' },
            { value: 'csv', label: 'CSV (쉼표로 구분)' },
            { value: 'pdf', label: 'PDF (문서)' },
            { value: 'html', label: 'HTML (웹 테이블)' }
        ]
    },
    
    // 프레젠테이션 파일들
    'presentation': {
        extensions: ['ppt', 'pptx', 'odp'],
        targetFormats: [
            { value: 'pptx', label: 'PPTX (PowerPoint)' },
            { value: 'ppt', label: 'PPT (PowerPoint 97-2003)' },
            { value: 'odp', label: 'ODP (OpenDocument 프레젠테이션)' },
            { value: 'pdf', label: 'PDF (문서)' },
            { value: 'html', label: 'HTML (웹 슬라이드)' },
            { value: 'jpg', label: 'JPG (이미지로 변환)' }
        ]
    },
    
    // PDF 파일
    'pdf': {
        extensions: ['pdf'],
        targetFormats: [
            { value: 'docx', label: 'DOCX (Word 문서)' },
            { value: 'txt', label: 'TXT (텍스트 추출)' },
            { value: 'html', label: 'HTML (웹 페이지)' },
            { value: 'jpg', label: 'JPG (이미지로 변환)' },
            { value: 'png', label: 'PNG (이미지로 변환)' }
        ]
    }
};

// 파일 확장자로 파일 타입 감지
function getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    for (const [type, config] of Object.entries(CONVERSION_FORMATS)) {
        if (config.extensions.includes(extension)) {
            return type;
        }
    }
    
    return null; // 지원하지 않는 파일 타입
}

// 대상 형식 옵션 업데이트
function updateTargetFormatOptions(fileType) {
    const targetFormatSelect = document.getElementById('targetFormat');
    
    // 기존 옵션 제거
    targetFormatSelect.innerHTML = '<option value="">변환할 형식을 선택하세요</option>';
    
    if (!fileType || !CONVERSION_FORMATS[fileType]) {
        targetFormatSelect.innerHTML = '<option value="">❌ 지원하지 않는 파일 형식입니다</option>';
        targetFormatSelect.disabled = true;
        return;
    }
    
    targetFormatSelect.disabled = false;
    
    // 새로운 옵션 추가
    CONVERSION_FORMATS[fileType].targetFormats.forEach(format => {
        const option = document.createElement('option');
        option.value = format.value;
        option.textContent = format.label;
        targetFormatSelect.appendChild(option);
    });
    
    // 첫 번째 옵션에 도움말 추가
    const helpOption = document.createElement('option');
    helpOption.value = '';
    helpOption.textContent = `💡 ${CONVERSION_FORMATS[fileType].targetFormats.length}개 형식으로 변환 가능`;
    helpOption.disabled = true;
    targetFormatSelect.insertBefore(helpOption, targetFormatSelect.children[1]);
}

// 초기화
window.onload = function() {
    loadContent();
    setupDragAndDrop();
};
