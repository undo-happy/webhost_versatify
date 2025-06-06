const API_BASE = import.meta.env.VITE_API_BASE || '';

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
                <div class="category-icon image-icon">🖼️</div>
                <div>
                    <div class="category-title">이미지 변환</div>
                    <div class="category-desc">모든 이미지 형식 지원</div>
                </div>
            </div>
            <div class="tool-list">
                <div class="tool-item" onclick="showFileConverter()">
                    <div class="tool-name">이미지 변환</div>
                    <div class="tool-desc">JPG, PNG, WebP, AVIF 등</div>
                </div>
                <div class="tool-item" onclick="openTool('image-resize')">
                    <div class="tool-name">이미지 크기 조정</div>
                    <div class="tool-desc">비율에 맞게 크기 변경</div>
                </div>
                <div class="tool-item" onclick="showUpscaleModal()">
                    <div class="tool-name">이미지 업스케일</div>
                    <div class="tool-desc">2배 또는 4배 확대</div>
                </div>
                <div class="tool-item" onclick="showZoomModal()">
                    <div class="tool-name">부분 확대</div>
                    <div class="tool-desc">영역 지정 확대</div>
                </div>
                <div class="tool-item" onclick="showWatermarkModal()">
                    <div class="tool-name">이미지 워터마크</div>
                    <div class="tool-desc">텍스트 삽입</div>
                </div>
                <div class="tool-item" onclick="showQrModal()">
                    <div class="tool-name">QR 코드 생성</div>
                    <div class="tool-desc">텍스트로 QR 이미지 만들기</div>
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
    if (toolName === 'image-resize') {
        showResizeModal();
    } else {
        alert(`${toolName} 도구를 준비 중입니다!`);
    }
}

// 파일 변환 모달
function showFileConverter() {
    document.getElementById('converterModal').classList.add('show');
    // 드래그 앤 드롭 기능 초기화
    setupDragAndDrop();
    
    // 파일 선택 단계 표시
    showFileSelectionStep();
}

// 파일 선택 단계 표시
function showFileSelectionStep() {
    const converterContent = document.querySelector('.converter-content');
    
    // 단계 표시기 추가
    if (!document.getElementById('conversionSteps')) {
        const stepsIndicator = document.createElement('div');
        stepsIndicator.id = 'conversionSteps';
        stepsIndicator.className = 'conversion-steps';
        stepsIndicator.innerHTML = `
            <div class="step active" id="step1">1</div>
            <div class="step" id="step2">2</div>
            <div class="step" id="step3">3</div>
        `;
        
        // 단계 설명 추가
        const stepsDescription = document.createElement('div');
        stepsDescription.className = 'steps-description';
        stepsDescription.innerHTML = `
            <div class="step-desc active" id="step1-desc">파일 선택</div>
            <div class="step-desc" id="step2-desc">옵션 설정</div>
            <div class="step-desc" id="step3-desc">변환 완료</div>
        `;
        
        converterContent.insertBefore(stepsIndicator, converterContent.firstChild.nextSibling);
        converterContent.insertBefore(stepsDescription, stepsIndicator.nextSibling);
    }
    
    // 파일 선택 단계만 표시
    document.getElementById('step1').classList.add('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.remove('active');
    
    document.getElementById('step1-desc').classList.add('active');
    document.getElementById('step2-desc').classList.remove('active');
    document.getElementById('step3-desc').classList.remove('active');
    
    // 파일 선택 섹션만 표시
    const sections = document.querySelectorAll('.converter-section');
    sections.forEach((section, index) => {
        if (index === 0) { // 첫 번째 섹션(파일 선택)만 표시
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
    
    // 다음 단계 버튼 표시
    if (!document.getElementById('nextStepBtn')) {
        const nextBtn = document.createElement('button');
        nextBtn.id = 'nextStepBtn';
        nextBtn.className = 'convert-button';
        nextBtn.disabled = true;
        nextBtn.textContent = '다음 단계 →';
        nextBtn.onclick = showOptionsStep;
        
        // 변환 시작 버튼 앞에 삽입
        const convertBtn = document.getElementById('convertButton');
        convertBtn.style.display = 'none';
        convertBtn.parentNode.insertBefore(nextBtn, convertBtn);
    } else {
        document.getElementById('nextStepBtn').style.display = 'block';
        document.getElementById('nextStepBtn').disabled = !selectedFile;
        document.getElementById('convertButton').style.display = 'none';
    }
    
    // 진행 상태 표시 숨기기
    document.getElementById('progressSection').style.display = 'none';
}

// 옵션 설정 단계 표시
function showOptionsStep() {
    if (!selectedFile) {
        alert('먼저 파일을 선택해주세요.');
        return;
    }
    
    // 단계 표시기 업데이트
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.add('active');
    document.getElementById('step3').classList.remove('active');
    
    document.getElementById('step1-desc').classList.remove('active');
    document.getElementById('step2-desc').classList.add('active');
    document.getElementById('step3-desc').classList.remove('active');
    
    // 모든 섹션 표시
    const sections = document.querySelectorAll('.converter-section');
    sections.forEach(section => {
        section.style.display = 'block';
    });
    
    // 버튼 전환
    document.getElementById('nextStepBtn').style.display = 'none';
    document.getElementById('convertButton').style.display = 'block';
    
    // 변환 버튼 활성화 상태 확인
    checkConversionReady();
}

// 변환 완료 단계 표시
function showCompletionStep() {
    // 단계 표시기 업데이트
    document.getElementById('step1').classList.remove('active');
    document.getElementById('step2').classList.remove('active');
    document.getElementById('step3').classList.add('active');

    document.getElementById('step1-desc').classList.remove('active');
    document.getElementById('step2-desc').classList.remove('active');
    document.getElementById('step3-desc').classList.add('active');
}

function showResizeModal() {
    document.getElementById('resizeModal').classList.add('show');
}

function closeResizeModal() {
    document.getElementById('resizeModal').classList.remove('show');
    const file = document.getElementById('resizeFile');
    if (file) file.value = '';
    const width = document.getElementById('resizeWidth');
    if (width) width.value = '';
    const height = document.getElementById('resizeHeight');
    if (height) height.value = '';
    const result = document.getElementById('resizeResult');
    if (result) result.style.display = 'none';
    const progress = document.getElementById('resizeProgress');
    if (progress) progress.style.display = 'none';
    const fill = document.getElementById('resizeFill');
    if (fill) fill.style.width = '0%';
}

function showUpscaleModal() {
    document.getElementById('upscaleModal').classList.add('show');
}

function closeUpscaleModal() {
    document.getElementById('upscaleModal').classList.remove('show');
    document.getElementById('upscaleFile').value = '';
    document.getElementById('upscaleProgress').style.display = 'none';
    document.getElementById('upscaleFill').style.width = '0%';
}


function showZoomModal() {
    document.getElementById('zoomModal').classList.add('show');
}

function closeZoomModal() {
    document.getElementById('zoomModal').classList.remove('show');
    document.getElementById('zoomFile').value = '';
    document.getElementById('zoomProgress').style.display = 'none';
    document.getElementById('zoomFill').style.width = '0%';
}

function closeConverterModal() {
    document.getElementById('converterModal').classList.remove('show');
}


async function startZoom() {
    const fileInput = document.getElementById('zoomFile');
    const scale = document.getElementById('zoomScale').value;
    const x = document.getElementById('zoomX').value;
    const y = document.getElementById('zoomY').value;
    const width = document.getElementById('zoomWidth').value;
    const height = document.getElementById('zoomHeight').value;

    if (!fileInput.files[0]) {
        alert('이미지를 선택하세요.');
        return;
    }
    if (!width || !height) {
        alert('잘라낼 영역의 크기를 입력하세요.');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('scale', scale);
    formData.append('x', x);
    formData.append('y', y);
    formData.append('width', width);
    formData.append('height', height);

    document.getElementById('zoomProgress').style.display = 'block';
    document.getElementById('zoomFill').style.width = '0%';
    document.getElementById('zoomStatus').textContent = '서버에 업로드 중...';

    try {
        const response = await fetch(`${API_BASE}/api/zoom`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text);
        }

        document.getElementById('zoomFill').style.width = '50%';
        document.getElementById('zoomStatus').textContent = '처리 중...';

        const result = await response.json();

        document.getElementById('zoomFill').style.width = '100%';
        document.getElementById('zoomStatus').innerHTML =
            `<a href="${result.downloadUrl}" target="_blank">확대된 이미지 다운로드</a>`;

    } catch (err) {
        document.getElementById('zoomStatus').textContent = `오류: ${err.message}`;
    }
}

function showQrModal() {
    document.getElementById('qrModal').classList.add('show');
}

function closeQrModal() {
    document.getElementById('qrModal').classList.remove('show');
    document.getElementById('qrText').value = '';
    document.getElementById('qrResult').style.display = 'none';
}

function showWatermarkModal() {
    document.getElementById('watermarkModal').classList.add('show');
}

function closeWatermarkModal() {
    document.getElementById('watermarkModal').classList.remove('show');
    document.getElementById('watermarkFile').value = '';
    document.getElementById('watermarkText').value = '';
    document.getElementById('watermarkResult').style.display = 'none';
}

async function startWatermark() {
    const fileInput = document.getElementById('watermarkFile');
    const text = document.getElementById('watermarkText').value.trim();
    const position = document.getElementById('watermarkPosition').value;
    const opacity = document.getElementById('watermarkOpacity').value;

    if (!fileInput.files[0] || !text) {
        alert('이미지와 텍스트를 입력하세요.');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('text', text);
    formData.append('position', position);
    formData.append('opacity', opacity);

    try {
        const response = await fetch(`${API_BASE}/api/watermark`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) throw new Error(await response.text());

        const result = await response.json();
        document.getElementById('watermarkDownload').href = result.downloadUrl;
        document.getElementById('watermarkResult').style.display = 'block';
    } catch (err) {
        alert('워터마크 실패: ' + err.message);
    }
}


async function generateQr() {
    const text = document.getElementById('qrText').value.trim();
    if (!text) {
        alert('텍스트를 입력하세요.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/generate?text=${encodeURIComponent(text)}`);
        if (!response.ok) throw new Error(await response.text());

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        document.getElementById('qrImage').src = url;
        document.getElementById('qrDownload').href = url;
        document.getElementById('qrResult').style.display = 'block';
    } catch (err) {
        alert('QR 코드 생성 실패: ' + err.message);
    }
}

// 관리자 모달
function showAdminModal() {
    // 차단 시간 확인
    const lockoutTime = sessionStorage.getItem('lockoutTime');
    if (lockoutTime) {
        const timePassed = Date.now() - parseInt(lockoutTime);
        const lockoutDuration = 5 * 60 * 1000; // 5분
        
        if (timePassed < lockoutDuration) {
            const remainingTime = Math.ceil((lockoutDuration - timePassed) / 1000);
            alert(`보안상 차단되었습니다. ${remainingTime}초 후에 다시 시도하세요.`);
            return;
        } else {
            // 차단 시간 만료, 초기화
            sessionStorage.removeItem('lockoutTime');
            sessionStorage.removeItem('loginAttempts');
        }
    }
    
    document.getElementById('adminModal').classList.add('show');
}

function closeAdminModal() {
    document.getElementById('adminModal').classList.remove('show');
    document.getElementById('adminPassword').value = '';
    document.getElementById('errorMessage').style.display = 'none';
}

async function checkAdminPassword() {
    const password = document.getElementById('adminPassword').value;
    
    if (!password) {
        document.getElementById('errorMessage').textContent = '비밀번호를 입력해주세요.';
        document.getElementById('errorMessage').style.display = 'block';
        return;
    }
    
    // 로딩 상태 표시
    const loginButton = document.querySelector('.modal-btn-primary');
    const originalText = loginButton.textContent;
    loginButton.textContent = '인증 중...';
    loginButton.disabled = true;
    
    try {
        // 백엔드 API로 인증 요청
        const response = await fetch(`${API_BASE}/api/admin-auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 인증 성공
            sessionStorage.setItem('adminLoggedIn', 'true');
            sessionStorage.setItem('adminToken', result.token);
            sessionStorage.setItem('adminSession', Date.now().toString());
            sessionStorage.setItem('adminExpires', result.expiresAt.toString());
            
            // 로그인 시도 횟수 초기화
            sessionStorage.removeItem('loginAttempts');
            sessionStorage.removeItem('lockoutTime');
            
            window.location.href = 'admin.html';
        } else {
            // 인증 실패
            document.getElementById('errorMessage').textContent = result.error || '인증에 실패했습니다.';
            document.getElementById('errorMessage').style.display = 'block';
            
            // 실패 횟수 증가
            const attempts = parseInt(sessionStorage.getItem('loginAttempts') || '0') + 1;
            sessionStorage.setItem('loginAttempts', attempts.toString());
            
            if (attempts >= 3) {
                sessionStorage.setItem('lockoutTime', Date.now().toString());
                document.getElementById('errorMessage').textContent = '너무 많은 로그인 시도로 5분간 차단됩니다.';
                closeAdminModal();
            }
        }
        
    } catch (error) {
        console.error('인증 오류:', error);
        document.getElementById('errorMessage').textContent = '서버 연결 오류가 발생했습니다.';
        document.getElementById('errorMessage').style.display = 'block';
        
    } finally {
        // 로딩 상태 해제
        loginButton.textContent = originalText;
        loginButton.disabled = false;
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
        
        // 다음 단계 버튼 활성화
        if (document.getElementById('nextStepBtn')) {
            document.getElementById('nextStepBtn').disabled = false;
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
        // 폼 데이터 생성
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('targetFormat', targetFormat);
        
        // 이미지 변환에 필요한 옵션 추가
        const width = document.getElementById('imageWidth')?.value || '';
        const height = document.getElementById('imageHeight')?.value || '';
        
        if (width) formData.append('width', width);
        if (height) formData.append('height', height);
        
        progressUpdate('변환 중... 서버로 이미지 전송 완료');
        
        // API 호출
        const response = await fetch(`${API_BASE}/api/convert`, {
            method: 'POST',
            body: formData
        });

        console.log('Response status:', response.status);
        console.log('Response statusText:', response.statusText);
        console.log('Response headers:', Object.fromEntries(response.headers));
        console.log('Response URL:', response.url);

        document.getElementById('progressFill').style.width = '50%';
        document.getElementById('statusMessage').textContent = '서버 응답 처리 중...';

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('Server response:', result);
        
        document.getElementById('progressFill').style.width = '100%';
        if (result.success) {
            // 변환 완료 단계로 전환
            showCompletionStep();
            
            document.getElementById('statusMessage').innerHTML = `
                <div style="text-align: center;">
                    <div style="margin-bottom: 15px;">
                        <span style="color: #27ae60; font-weight: bold;">✅ 변환 완료!</span>
                    </div>
                    <div style="margin-bottom: 10px; color: #666;">
                        <small>원본: ${result.originalFile || selectedFile.name}</small><br>
                        <small>형식: ${result.targetFormat || targetFormat}</small><br>
                        <small>크기: ${result.fileSize ? (result.fileSize / 1024 / 1024).toFixed(2) + ' MB' : '알 수 없음'}</small>
                    </div>
                    <button onclick="downloadConvertedFile('${result.downloadUrl || '#'}')" 
                            style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">
                        📥 파일 다운로드
                    </button>
                </div>
            `;
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

// 진행 상태 업데이트 함수
function progressUpdate(message, progress = null) {
    const statusMessage = document.getElementById('statusMessage');
    const progressFill = document.getElementById('progressFill');
    
    if (statusMessage) {
        statusMessage.textContent = message;
    }
    
    if (progress !== null && progressFill) {
        progressFill.style.width = `${progress}%`;
    }
}

// 파일 다운로드 함수
function downloadConvertedFile(downloadUrl) {
    if (!downloadUrl || downloadUrl === '#') {
        // 임시로 데모 다운로드 (실제로는 백엔드에서 제공해야 함)
        alert('다운로드 URL이 제공되지 않았습니다. 백엔드 구현이 필요합니다.');
        return;
    }
    
    // 실제 파일 다운로드
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = ''; // 서버에서 파일명 지정
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function startUpscale() {
    const fileInput = document.getElementById('upscaleFile');
    const scale = document.getElementById('upscaleScale').value;

    if (!fileInput.files[0]) {
        alert('이미지를 선택하세요.');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('scale', scale);

    document.getElementById('upscaleProgress').style.display = 'block';
    document.getElementById('upscaleFill').style.width = '0%';
    document.getElementById('upscaleStatus').textContent = '서버에 업로드 중...';

    try {
        const response = await fetch(`${API_BASE}/api/upscale`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text);
        }

        document.getElementById('upscaleFill').style.width = '50%';
        document.getElementById('upscaleStatus').textContent = '처리 중...';

        const result = await response.json();

        document.getElementById('upscaleFill').style.width = '100%';
        document.getElementById('upscaleStatus').innerHTML =
            `<a href="${result.downloadUrl}" target="_blank">업스케일된 이미지 다운로드</a>`;

    } catch (err) {
        document.getElementById('upscaleStatus').textContent = `오류: ${err.message}`;
    }
}

async function startResize() {
    const fileInput = document.getElementById('resizeFile');
    const width = document.getElementById('resizeWidth').value;
    const height = document.getElementById('resizeHeight').value;

    if (!fileInput.files[0]) {
        alert('이미지를 선택하세요.');
        return;
    }
    if (!width && !height) {
        alert('너비나 높이를 입력하세요.');
        return;
    }

    const file = fileInput.files[0];
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetFormat', ext);
    if (width) formData.append('width', width);
    if (height) formData.append('height', height);

    document.getElementById('resizeProgress').style.display = 'block';
    document.getElementById('resizeFill').style.width = '0%';
    document.getElementById('resizeStatus').textContent = '서버에 업로드 중...';

    try {
        const response = await fetch(`${API_BASE}/api/convert`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) throw new Error(await response.text());

        document.getElementById('resizeFill').style.width = '50%';
        document.getElementById('resizeStatus').textContent = '처리 중...';

        const result = await response.json();

        document.getElementById('resizeFill').style.width = '100%';
        document.getElementById('resizeStatus').innerHTML =
            `<a href="${result.downloadUrl}" target="_blank">변환된 이미지 다운로드</a>`;

    } catch (err) {
        document.getElementById('resizeStatus').textContent = `오류: ${err.message}`;
    }
}

// API 연결 상태 확인 함수
async function checkApiConnection() {
    try {
        console.log('API 연결 상태 확인 중...');
        
        // 먼저 convert API 확인
        const convertResponse = await fetch(`${API_BASE}/api/convert`, {
            method: 'OPTIONS'
        });
        console.log('Convert API 상태:', convertResponse.status, convertResponse.statusText);
        
        // Admin Auth API 확인
        const authResponse = await fetch(`${API_BASE}/api/admin-auth`, {
            method: 'OPTIONS'
        });
        console.log('Admin Auth API 상태:', authResponse.status, authResponse.statusText);
        
        return {
            convert: convertResponse.ok,
            auth: authResponse.ok
        };
        
    } catch (error) {
        console.error('API 연결 확인 실패:', error);
        return {
            convert: false,
            auth: false,
            error: error.message
        };
    }
}

// 페이지 로드 시 API 상태 확인
document.addEventListener('DOMContentLoaded', async () => {
    console.log('페이지 로드됨 - API 연결 상태 확인');
    const apiStatus = await checkApiConnection();
    console.log('API 연결 상태:', apiStatus);
    
    if (!apiStatus.convert || !apiStatus.auth) {
        console.warn('일부 API가 연결되지 않았습니다:', apiStatus);
    }
});

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
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'svg', 'heic', 'avif'],
        targetFormats: [
            { value: 'jpg', label: 'JPG (JPEG 이미지)' },
            { value: 'png', label: 'PNG (투명 이미지)' },
            { value: 'webp', label: 'WebP (웹 최적화)' },
            { value: 'avif', label: 'AVIF (최신 압축)' },
            { value: 'gif', label: 'GIF (애니메이션)' }
        ]
    }
};

// 파일 확장자로 파일 타입 감지
function getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    // 이미지 파일 타입만 지원
    if (CONVERSION_FORMATS['image'].extensions.includes(extension)) {
        return 'image';
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

// Inline 이벤트 핸들러에서 사용할 수 있도록 함수들을 전역 객체에 노출
window.showTab = showTab;
window.openTool = openTool;
window.showFileConverter = showFileConverter;
window.closeConverterModal = closeConverterModal;
window.showResizeModal = showResizeModal;
window.closeResizeModal = closeResizeModal;
window.showUpscaleModal = showUpscaleModal;
window.closeUpscaleModal = closeUpscaleModal;
window.showZoomModal = showZoomModal;
window.closeZoomModal = closeZoomModal;
window.startConversion = startConversion;
window.startResize = startResize;
window.startUpscale = startUpscale;
window.startZoom = startZoom;
window.showAdminModal = showAdminModal;
window.closeAdminModal = closeAdminModal;
window.checkAdminPassword = checkAdminPassword;
window.showQrModal = showQrModal;
window.closeQrModal = closeQrModal;
window.generateQr = generateQr;
window.showWatermarkModal = showWatermarkModal;
window.closeWatermarkModal = closeWatermarkModal;
window.startWatermark = startWatermark;
