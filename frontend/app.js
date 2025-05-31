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

// 초기화
window.onload = function() {
    loadContent();
};
