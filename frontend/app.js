console.log('🚀 Versatify 시작!');

// 페이지 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM 로드 완료');
    
    // 콘텐츠 로드
    loadMainContent();
});

// 메인 콘텐츠 로드 함수
function loadMainContent() {
    console.log('🔄 콘텐츠 로딩 시작');
    
    const contentElement = document.getElementById('content');
    if (!contentElement) {
        console.error('❌ content 요소를 찾을 수 없습니다!');
        return;
    }

    // HTML 콘텐츠 생성
    const htmlContent = `
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

    // DOM에 삽입
    contentElement.innerHTML = htmlContent;
    console.log('✅ 콘텐츠 로딩 완료!');
}

// 도구 열기 함수
function openTool(toolName) {
    console.log('🔧 도구 열기:', toolName);
    
    if (toolName === 'fileConverter') {
        showConverterModal();
    } else {
        alert(`${toolName} 도구를 준비 중입니다! 곧 만나보실 수 있어요. 😊`);
    }
}

// 컨버터 모달 표시
function showConverterModal() {
    console.log('📸 컨버터 모달 열기');
    const modal = document.getElementById('converterModal');
    if (modal) {
        modal.classList.add('show');
    } else {
        console.error('❌ converterModal을 찾을 수 없습니다!');
    }
}

// 컨버터 모달 닫기
function closeConverterModal() {
    console.log('📸 컨버터 모달 닫기');
    const modal = document.getElementById('converterModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// 관리자 모달 표시
function showAdminModal() {
    console.log('🔐 관리자 모달 열기');
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.classList.add('show');
    } else {
        console.error('❌ adminModal을 찾을 수 없습니다!');
    }
}

// 관리자 모달 닫기
function closeAdminModal() {
    console.log('🔐 관리자 모달 닫기');
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.classList.remove('show');
    }
    
    // 입력값 초기화
    const passwordInput = document.getElementById('adminPassword');
    const errorMessage = document.getElementById('errorMessage');
    
    if (passwordInput) passwordInput.value = '';
    if (errorMessage) errorMessage.style.display = 'none';
}

// 관리자 비밀번호 확인
function checkAdminPassword() {
    console.log('🔍 관리자 인증 확인');
    const passwordInput = document.getElementById('adminPassword');
    const password = passwordInput ? passwordInput.value : '';
    
    if (!password) {
        showAdminError('비밀번호를 입력해주세요.');
        return;
    }

    // TODO: 실제 인증 로직 구현
    alert('관리자 인증 기능을 구현 중입니다!');
}

// 관리자 에러 표시
function showAdminError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// 변환 시작
function startConversion() {
    console.log('🚀 변환 시작');
    alert('이미지 변환 기능을 구현 중입니다!');
}

console.log('📝 JavaScript 로드 완료!'); 