const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || '';
const CONTENT_VERSION = '1.0';

// 전역 요청 관리
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 3;
const requestQueue = [];

// 요청 큐 관리 함수
async function queuedFetch(url, options) {
    return new Promise((resolve, reject) => {
        const queueItem = { url, options, resolve, reject };
        
        if (activeRequests < MAX_CONCURRENT_REQUESTS) {
            executeRequest(queueItem);
        } else {
            requestQueue.push(queueItem);
            showQueueStatus();
        }
    });
}

async function executeRequest(queueItem) {
    activeRequests++;
    updateRequestStatus();
    
    try {
        const response = await fetch(queueItem.url, queueItem.options);
        queueItem.resolve(response);
    } catch (error) {
        queueItem.reject(error);
    } finally {
        activeRequests--;
        
        // 큐에서 다음 요청 처리
        if (requestQueue.length > 0) {
            const nextItem = requestQueue.shift();
            executeRequest(nextItem);
        }
        updateRequestStatus();
    }
}

function showQueueStatus() {
    if (requestQueue.length > 0) {
        showNotification(`대기열: ${requestQueue.length}개 요청`, 'info');
    }
}

function updateRequestStatus() {
    const statusElement = document.getElementById('request-status');
    if (statusElement) {
        statusElement.textContent = `처리 중: ${activeRequests}개, 대기: ${requestQueue.length}개`;
    }
}

// 재시도 로직이 포함된 fetch 함수
async function fetchWithRetry(url, options, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await queuedFetch(url, options);
            
            if (response.status === 503) {
                // 서버 과부하 시 대기 후 재시도
                const waitTime = delay * attempt;
                showNotification(`서버 과부하. ${waitTime/1000}초 후 재시도... (${attempt}/${maxRetries})`, 'warning');
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            
            return response;
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            
            const waitTime = delay * attempt;
            showNotification(`연결 실패. ${waitTime/1000}초 후 재시도... (${attempt}/${maxRetries})`, 'warning');
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
}

// 기본 콘텐츠 로드
function loadContent() {
    const savedVersion = localStorage.getItem('versatifyVersion');
    const savedContent = localStorage.getItem('versatifyContent');

    if (savedContent && savedVersion === CONTENT_VERSION) {
        document.getElementById('content').innerHTML = savedContent;
    } else {
        if (savedVersion !== CONTENT_VERSION) {
            localStorage.removeItem('versatifyContent');
            localStorage.setItem('versatifyVersion', CONTENT_VERSION);
        }
        loadDefaultContent();
    }
}

function loadDefaultContent() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <!-- 인기 도구 섹션 -->
        <section class="popular-tools-section">
            <div class="section-header">
                <h2><span class="section-icon">🔥</span>인기 도구</h2>
                <p class="section-desc">가장 많이 사용되는 도구들을 빠르게 이용하세요</p>
            </div>
            <div class="popular-tools-grid">
                <div class="popular-tool-card" onclick="openTool('fileConverter')">
                    <div class="tool-icon">📸</div>
                    <h3>이미지 변환</h3>
                    <p>JPG, PNG, WebP, AVIF 등 다양한 형식으로 변환</p>
                    <div class="tool-badge">인기</div>
                </div>
                <div class="popular-tool-card" onclick="openTool('qr')">
                    <div class="tool-icon">📱</div>
                    <h3>QR 코드 생성</h3>
                    <p>텍스트나 URL을 QR 코드로 빠르게 변환</p>
                    <div class="tool-badge">빠름</div>
                </div>
                <div class="popular-tool-card" onclick="openTool('upscale')">
                    <div class="tool-icon">🔍</div>
                    <h3>이미지 업스케일</h3>
                    <p>이미지를 2x, 4x로 확대하여 해상도 향상</p>
                    <div class="tool-badge">고급</div>
                </div>
            </div>
        </section>

        <!-- 전체 도구 목록 -->
        <section class="all-tools-section">
            <div class="section-header">
                <h2><span class="section-icon">🛠️</span>전체 도구</h2>
                <p class="section-desc">다양한 이미지 처리 도구를 이용해보세요</p>
            </div>
            
            <!-- 이미지 처리 도구 -->
            <div class="tool-category-section">
                <h3 class="category-title">
                    <span class="category-icon">🖼️</span>
                    이미지 처리
                </h3>
                <div class="tools-grid">
                    <div class="tool-card" onclick="openTool('fileConverter')">
                        <div class="tool-card-header">
                            <div class="tool-card-icon">📸</div>
                            <div class="tool-info">
                                <h4>이미지 변환</h4>
                                <p>형식 변환 및 크기 조정</p>
                            </div>
                        </div>
                        <div class="tool-features">
                            <span class="feature-tag">JPG</span>
                            <span class="feature-tag">PNG</span>
                            <span class="feature-tag">WebP</span>
                            <span class="feature-tag">AVIF</span>
                        </div>
                    </div>

                    <div class="tool-card" onclick="openTool('upscale')">
                        <div class="tool-card-header">
                            <div class="tool-card-icon">🔍</div>
                            <div class="tool-info">
                                <h4>이미지 업스케일</h4>
                                <p>해상도 2x, 4x 확대</p>
                            </div>
                        </div>
                        <div class="tool-features">
                            <span class="feature-tag">고화질</span>
                            <span class="feature-tag">AI 확대</span>
                        </div>
                    </div>

                    <div class="tool-card" onclick="openTool('zoom')">
                        <div class="tool-card-header">
                            <div class="tool-card-icon">🎯</div>
                            <div class="tool-info">
                                <h4>선택 영역 확대</h4>
                                <p>원하는 부분만 잘라서 확대</p>
                            </div>
                        </div>
                        <div class="tool-features">
                            <span class="feature-tag">정확한 선택</span>
                            <span class="feature-tag">고품질</span>
                        </div>
                    </div>

                    <div class="tool-card" onclick="openTool('watermark')">
                        <div class="tool-card-header">
                            <div class="tool-card-icon">©️</div>
                            <div class="tool-info">
                                <h4>워터마크 추가</h4>
                                <p>이미지에 텍스트 워터마크</p>
                            </div>
                        </div>
                        <div class="tool-features">
                            <span class="feature-tag">저작권 보호</span>
                            <span class="feature-tag">투명도 조절</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 생성 도구 -->
            <div class="tool-category-section">
                <h3 class="category-title">
                    <span class="category-icon">⚡</span>
                    생성 도구
                </h3>
                <div class="tools-grid">
                    <div class="tool-card" onclick="openTool('qr')">
                        <div class="tool-card-header">
                            <div class="tool-card-icon">📱</div>
                            <div class="tool-info">
                                <h4>QR 코드 생성</h4>
                                <p>텍스트나 URL을 QR로 변환</p>
                            </div>
                        </div>
                        <div class="tool-features">
                            <span class="feature-tag">즉시 생성</span>
                            <span class="feature-tag">고해상도</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 관리자 링크 -->
        <div class="admin-section">
            <a href="#" onclick="showAdminModal()" class="admin-link">
                🔧 관리자 도구
            </a>
        </div>
    `;
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
    switch(toolName) {
        case 'fileConverter':
            showConverterModal();
            break;
        case 'upscale':
            showUpscaleModal();
            break;
        case 'zoom':
            showZoomModal();
            break;
        case 'watermark':
            showWatermarkModal();
            break;
        case 'qr':
            showQrModal();
            break;
        default:
            console.log('도구를 찾을 수 없습니다:', toolName);
    }
}

// 파일 변환 모달 표시
function showConverterModal() {
    document.getElementById('converterModal').classList.add('show');
}

// 컨버터 모달 닫기
function closeConverterModal() {
    document.getElementById('converterModal').classList.remove('show');
    resetConverter();
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

// 업스케일 모달 표시  
function showUpscaleModal() {
    alert('이미지 업스케일 도구를 준비 중입니다!');
}

// 줌 모달 표시
function showZoomModal() {
    alert('선택 영역 확대 도구를 준비 중입니다!');
}

// 워터마크 모달 표시
function showWatermarkModal() {
    alert('워터마크 추가 도구를 준비 중입니다!');
}

// QR 코드 모달 표시
function showQrModal() {
    alert('QR 코드 생성 도구를 준비 중입니다!');
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
        const response = await fetchWithRetry(`${API_BASE}/api/admin-auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
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
        
        // 파일 정보 표시
        const fileInfo = document.getElementById('fileInfo');
        const fileTypeDisplay = document.querySelector('.file-type-display');
        
        if (fileInfo && fileTypeDisplay) {
            const currentExt = getCurrentFileExtension(selectedFile.name);
            fileTypeDisplay.innerHTML = `
                <span class="file-type-tag" style="background: #3498db; color: white; margin-right: 10px;">
                    ${currentExt ? currentExt.toUpperCase() : '알 수 없음'}
                </span>
                <span class="file-size" style="color: #7f8c8d;">
                    ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
            `;
            fileInfo.style.display = 'block';
        }
        
        // 파일 타입 감지 및 변환 옵션 업데이트
        const fileType = getFileType(selectedFile.name);
        updateTargetFormatOptions(fileType, selectedFile);
        
        // 변환 불가능한 파일에 대한 안내
        if (!fileType) {
            const conversionSection = document.querySelector('.conversion-options');
            if (conversionSection) {
                conversionSection.innerHTML = `
                    <div style="text-align: center; padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; margin: 15px 0;">
                        <h3 style="color: #856404; margin: 0 0 10px 0;">⚠️ 지원하지 않는 파일 형식</h3>
                        <p style="color: #856404; margin: 0;">
                            지원 형식: JPG, PNG, WebP, AVIF, GIF, BMP, TIFF, SVG, HEIC<br>
                            현재 파일: <strong>${getCurrentFileExtension(selectedFile.name).toUpperCase()}</strong>
                        </p>
                    </div>
                `;
            }
            return;
        }
        
        showOptionsStep();
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
        
        // 기본 이미지 변환 (크기 조정 제거)
        
        progressUpdate('변환 중... 서버로 이미지 전송 완료');
        
        // API 호출
        const response = await fetchWithRetry(`${API_BASE}/api/convert`, {
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
        alert('다운로드 URL이 제공되지 않았습니다.');
        return;
    }

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            updateTargetFormatOptions(fileType, file);
            
            const fileInfo = document.getElementById('fileInfo');
            const fileTypeDisplay = document.querySelector('.file-type-display');
            
            if (fileInfo && fileTypeDisplay) {
                const currentExt = getCurrentFileExtension(file.name);
                fileTypeDisplay.innerHTML = `
                    <span class="file-type-tag" style="background: #3498db; color: white; margin-right: 10px;">
                        ${currentExt ? currentExt.toUpperCase() : '알 수 없음'}
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
            { value: 'jpeg', label: 'JPG (JPEG 이미지)', extensions: ['jpg', 'jpeg'] },
            { value: 'png', label: 'PNG (투명 이미지)', extensions: ['png'] },
            { value: 'webp', label: 'WebP (웹 최적화)', extensions: ['webp'] },
            { value: 'avif', label: 'AVIF (최신 압축)', extensions: ['avif'] }
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

// 현재 파일의 확장자 감지
function getCurrentFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

// 대상 형식 옵션 업데이트
function updateTargetFormatOptions(fileType, currentFile = null) {
    const targetFormatSelect = document.getElementById('targetFormat');
    
    // 기존 옵션 제거
    targetFormatSelect.innerHTML = '<option value="">변환할 형식을 선택하세요</option>';
    
    if (!fileType || !CONVERSION_FORMATS[fileType]) {
        targetFormatSelect.innerHTML = '<option value="">❌ 지원하지 않는 파일 형식입니다</option>';
        targetFormatSelect.disabled = true;
        return;
    }
    
    targetFormatSelect.disabled = false;
    
    // 현재 파일의 확장자 확인
    let currentExtension = null;
    if (currentFile) {
        currentExtension = getCurrentFileExtension(currentFile.name);
    }
    
    // 새로운 옵션 추가 (현재 확장자는 제외)
    const availableFormats = CONVERSION_FORMATS[fileType].targetFormats.filter(format => {
        // 현재 파일의 확장자와 같은 포맷은 제외
        if (currentExtension) {
            return !format.extensions.includes(currentExtension);
        }
        return true;
    });
    
    if (availableFormats.length === 0) {
        targetFormatSelect.innerHTML = '<option value="">💡 이미 최적의 형식입니다</option>';
        targetFormatSelect.disabled = true;
        return;
    }
    
    availableFormats.forEach(format => {
        const option = document.createElement('option');
        option.value = format.value;
        option.textContent = format.label;
        targetFormatSelect.appendChild(option);
    });
    
    // 현재 형식 표시와 도움말 추가
    const currentFormatInfo = document.createElement('option');
    currentFormatInfo.value = '';
    currentFormatInfo.textContent = currentExtension 
        ? `📁 현재: ${currentExtension.toUpperCase()} → ${availableFormats.length}개 형식으로 변환 가능`
        : `💡 ${availableFormats.length}개 형식으로 변환 가능`;
    currentFormatInfo.disabled = true;
    targetFormatSelect.insertBefore(currentFormatInfo, targetFormatSelect.children[1]);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
    console.log('페이지 로딩 중...');
    
    // 콘텐츠 로드
    loadDefaultContent();
    
    // 드래그 앤 드롭 설정
    setupDragAndDrop();
    
    // API 연결 상태 확인
    await checkApiConnection();
});

// Window exports (필요한 것만)
window.showAdminModal = showAdminModal;
window.closeAdminModal = closeAdminModal;
window.checkAdminPassword = checkAdminPassword;
window.openTool = openTool;
window.showConverterModal = showConverterModal;
window.closeConverterModal = closeConverterModal;
window.startConversion = startConversion;
window.resetConverter = resetConverter;

async function checkApiConnection() {
    try {
        console.log('API 연결 상태 확인 중...');
        
        const services = [
            { name: 'Convert', endpoint: '/api/convert' },
            { name: 'Upscale', endpoint: '/api/upscale' },
            { name: 'Zoom', endpoint: '/api/zoom' },
            { name: 'QR Generation', endpoint: '/api/qr' },
            { name: 'Watermark', endpoint: '/api/watermark' },
            { name: 'Admin Auth', endpoint: '/api/admin-auth' }
        ];

        const serviceStatus = {};
        
        // 모든 서비스 상태를 병렬로 확인
        const statusPromises = services.map(async (service) => {
            try {
                const response = await fetchWithRetry(`${API_BASE}${service.endpoint}`, {
                    method: 'GET'
                }, 1, 500); // 1회만 시도, 빠른 타임아웃
                
                const data = await response.json();
                serviceStatus[service.name] = {
                    status: response.ok ? 'online' : 'error',
                    serverStatus: data.serverStatus || null,
                    message: data.message || 'Unknown'
                };
                
                console.log(`${service.name} API:`, response.ok ? '✅' : '❌', data.serverStatus);
            } catch (error) {
                serviceStatus[service.name] = {
                    status: 'offline',
                    error: error.message
                };
                console.log(`${service.name} API: ❌ Offline -`, error.message);
            }
        });

        await Promise.all(statusPromises);
        
        // 전체 서비스 상태 업데이트
        updateServiceStatusDisplay(serviceStatus);
        
        return serviceStatus;
        
    } catch (error) {
        console.error('API 상태 확인 중 오류:', error);
        return null;
    }
}

// 서비스 상태 표시 업데이트
function updateServiceStatusDisplay(serviceStatus) {
    const statusElement = document.getElementById('request-status');
    if (!statusElement) return;
    
    const onlineServices = Object.values(serviceStatus).filter(s => s.status === 'online').length;
    const totalServices = Object.keys(serviceStatus).length;
    
    let totalProcessing = 0;
    let statusText = `서비스 상태: ${onlineServices}/${totalServices} 온라인`;
    
    // 각 서비스의 현재 처리량 합계
    Object.values(serviceStatus).forEach(service => {
        if (service.serverStatus && service.serverStatus.currentProcessing) {
            totalProcessing += service.serverStatus.currentProcessing;
        }
    });
    
    if (totalProcessing > 0) {
        statusText += ` | 전체 처리 중: ${totalProcessing}개`;
    }
    
    statusElement.textContent = statusText;
    
    // 상태에 따른 색상 변경
    if (onlineServices === totalServices) {
        statusElement.style.color = '#27ae60'; // 모든 서비스 온라인
    } else if (onlineServices > totalServices / 2) {
        statusElement.style.color = '#f39c12'; // 일부 서비스 오프라인
    } else {
        statusElement.style.color = '#e74c3c'; // 대부분 서비스 오프라인
    }
}

// 주기적 상태 확인 (30초마다)
setInterval(checkApiConnection, 30000);
