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

// Tab 전환 - 성능 최적화를 위해 이벤트 객체를 매개변수로 받음
function showTab(tabName, clickedButton) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    if (clickedButton) {
        clickedButton.classList.add('active');
    } else {
        document.querySelector(`.tab-button[data-tab="${tabName}"]`).classList.add('active');
    }
}

// 도구 열기
function openTool(toolName) {
    alert(`${toolName} 도구를 준비 중입니다!`);
}

// 파일 변환 모달
function showFileConverter() {
    document.getElementById('converterModal').classList.add('show');
    // 성능 최적화: 레이아웃 재계산 강제로 트리거하여 애니메이션 부드럽게
    void document.getElementById('converterModal').offsetWidth;
}

function closeConverterModal() {
    document.getElementById('converterModal').classList.remove('show');
    // 모달 닫을 때 상태 초기화 (성능 최적화)
    resetConverter();
}

// 모달 상태 초기화
function resetConverter() {
    const fileSelectAreaText = document.querySelector('.file-select-area p');
    if (fileSelectAreaText) {
        fileSelectAreaText.textContent = '파일을 드래그하거나 클릭하여 선택하세요';
    }
    
    const fileTypeButtons = document.querySelectorAll('.file-type-btn');
    fileTypeButtons.forEach(btn => btn.classList.remove('selected'));
    
    const formatSelector = document.getElementById('targetFormat');
    if (formatSelector) {
        formatSelector.innerHTML = '<option value="">변환할 형식을 선택하세요</option>';
    }
    
    // 파일 입력 초기화
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.value = '';
    }
    
    // 선택된 파일 초기화
    selectedFile = null;
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

// 파일 타입 버튼 클릭 이벤트
document.addEventListener('DOMContentLoaded', function() {
    // 탭 버튼 이벤트 핸들러
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const tabName = this.getAttribute('data-tab');
            if (tabName) {
                e.preventDefault();
                showTab(tabName, this);
            }
        });
    });
    
    // 파일 타입 버튼에 클릭 이벤트 추가 - 이벤트 위임 사용하여 성능 최적화
    const fileTypeButtonsContainer = document.querySelector('.file-type-buttons');
    if (fileTypeButtonsContainer) {
        fileTypeButtonsContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('file-type-btn')) {
                e.preventDefault();
                // 선택된 버튼 하이라이트
                document.querySelectorAll('.file-type-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
                e.target.classList.add('selected');
                
                // 파일 형식에 따라 변환 형식 옵션 업데이트
                updateFormatOptions(e.target.textContent.trim());
            }
        });
    }
    
    // 파일 선택 영역 클릭 이벤트
    const fileSelectArea = document.querySelector('.file-select-area');
    if (fileSelectArea) {
        fileSelectArea.addEventListener('click', function(event) {
            // 이벤트가 버튼에서 발생한 경우 파일 입력 다이얼로그를 열지 않음
            if (event.target.classList.contains('file-type-btn')) return;
            document.getElementById('fileInput').click();
        });
        
        // 드래그 앤 드롭 이벤트 처리
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileSelectArea.addEventListener(eventName, preventDefaults, { passive: false });
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // 드래그 효과 스타일링 - 디바운싱 적용하여 성능 최적화
        let dragDebounce;
        
        fileSelectArea.addEventListener('dragenter', function() {
            clearTimeout(dragDebounce);
            this.classList.add('highlight');
        }, { passive: true });
        
        fileSelectArea.addEventListener('dragover', function() {
            clearTimeout(dragDebounce);
            this.classList.add('highlight');
        }, { passive: true });
        
        fileSelectArea.addEventListener('dragleave', function() {
            clearTimeout(dragDebounce);
            const area = this;
            dragDebounce = setTimeout(() => {
                area.classList.remove('highlight');
            }, 50);
        }, { passive: true });
        
        // 파일 드롭 처리
        fileSelectArea.addEventListener('drop', function(e) {
            clearTimeout(dragDebounce);
            this.classList.remove('highlight');
            
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });
    }
    
    // 파일 입력 변경 이벤트
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            if (this.files.length > 0) {
                handleFileSelect(this.files[0]);
            }
        });
    }
});

// 파일 선택 처리 (성능 최적화를 위해 공통 함수로 분리)
function handleFileSelect(file) {
    // requestAnimationFrame으로 렌더링 최적화
    requestAnimationFrame(() => {
        // 파일 정보 표시
        const fileSelectAreaText = document.querySelector('.file-select-area p');
        if (fileSelectAreaText) {
            fileSelectAreaText.textContent = `선택된 파일: ${file.name}`;
        }
        
        // 파일 확장자에 따라 자동으로 버튼 선택
        const fileExt = file.name.split('.').pop().toLowerCase();
        selectFileTypeByExtension(fileExt);
        
        // 파일 선택됨을 상태로 저장
        selectedFile = file;
    });
}

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
                // 클릭 이벤트를 시뮬레이션하는 대신 직접 스타일 변경 및 함수 호출
                fileTypeButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                updateFormatOptions(buttonToSelect);
            }
        });
    }
}

// 변환 형식 옵션 업데이트 - 성능 최적화
function updateFormatOptions(fileType) {
    const formatSelector = document.getElementById('targetFormat');
    if (!formatSelector) return;
    
    // 최적화: 문서 프래그먼트 사용
    const fragment = document.createDocumentFragment();
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '변환할 형식을 선택하세요';
    fragment.appendChild(defaultOption);
    
    // 파일 타입에 따라 변환 형식 추가
    const options = getOptionsForFileType(fileType);
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        fragment.appendChild(option);
    });
    
    // 한 번에 DOM 업데이트
    formatSelector.innerHTML = '';
    formatSelector.appendChild(fragment);
}

// 파일 타입별 옵션 목록 반환 (성능 최적화를 위해 분리)
function getOptionsForFileType(fileType) {
    switch(fileType) {
        case 'PDF':
            return [
                { value: 'docx', text: 'DOCX (Word)' },
                { value: 'jpg', text: 'JPG 이미지' },
                { value: 'png', text: 'PNG 이미지' },
                { value: 'txt', text: '텍스트 파일' }
            ];
        case 'DOCX':
            return [
                { value: 'pdf', text: 'PDF' },
                { value: 'txt', text: '텍스트 파일' },
                { value: 'html', text: 'HTML' }
            ];
        case 'XLSX':
            return [
                { value: 'pdf', text: 'PDF' },
                { value: 'csv', text: 'CSV' },
                { value: 'json', text: 'JSON' }
            ];
        case '이미지':
            return [
                { value: 'jpg', text: 'JPG' },
                { value: 'png', text: 'PNG' },
                { value: 'gif', text: 'GIF' },
                { value: 'pdf', text: 'PDF' }
            ];
        default:
            return [];
    }
}

// 변환 시작 - 성능 최적화
function startConversion() {
    const fileInput = document.getElementById('fileInput');
    const targetFormat = document.getElementById('targetFormat');
    
    if (!selectedFile || !targetFormat.value) {
        alert('파일과 변환 형식을 모두 선택해주세요.');
        return;
    }
    
    // 여기서는 데모만 보여주기 위한 처리
    setTimeout(() => {
        alert(`변환이 완료되었습니다! (데모 모드)\n${selectedFile.name}을(를) ${targetFormat.value} 형식으로 변환했습니다.`);
        closeConverterModal();
    }, 100); // 약간의 지연으로 UI 블로킹 방지
}

// 초기화
window.onload = function() {
    loadContent();
};
