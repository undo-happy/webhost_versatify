// ===== 기본 설정 =====
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || '';

// ===== DOM 요소 관리 =====
class DOMManager {
    static getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id '${id}' not found`);
        }
        return element;
    }

    static createElement(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }
}

// ===== UI 컴포넌트 =====
class UIComponents {
    static createToolCard(tool) {
        return `
            <div class="tool-card" onclick="ToolManager.openTool('${tool.id}')">
                <div class="tool-card-header">
                    <div class="tool-card-icon">${tool.icon}</div>
                    <div class="tool-info">
                        <h4>${tool.name}</h4>
                        <p>${tool.description}</p>
                    </div>
                </div>
                <div class="tool-features">
                    ${tool.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
            </div>
        `;
    }

    static createPopularCard(tool) {
        return `
            <div class="popular-tool-card" onclick="ToolManager.openTool('${tool.id}')">
                <div class="tool-icon">${tool.icon}</div>
                <h3>${tool.name}</h3>
                <p>${tool.description}</p>
                <div class="tool-badge">${tool.badge}</div>
            </div>
        `;
    }
}

// ===== 데이터 관리 =====
class DataManager {
    static tools = [
        {
            id: 'fileConverter',
            name: '이미지 변환',
            description: 'JPG, PNG, WebP, AVIF 등 다양한 형식으로 변환',
            icon: '📸',
            features: ['JPG', 'PNG', 'WebP', 'AVIF'],
            category: 'image',
            popular: true,
            badge: '인기'
        },
        {
            id: 'upscale',
            name: '이미지 업스케일',
            description: '이미지를 2x, 4x로 확대하여 해상도 향상',
            icon: '🔍',
            features: ['고화질', 'AI 확대'],
            category: 'image',
            popular: true,
            badge: '고급'
        },
        {
            id: 'zoom',
            name: '선택 영역 확대',
            description: '원하는 부분만 잘라서 확대',
            icon: '🎯',
            features: ['정확한 선택', '고품질'],
            category: 'image',
            popular: false
        },
        {
            id: 'watermark',
            name: '워터마크 추가',
            description: '이미지에 텍스트 워터마크',
            icon: '©️',
            features: ['저작권 보호', '투명도 조절'],
            category: 'image',
            popular: false
        },
        {
            id: 'qr',
            name: 'QR 코드 생성',
            description: '텍스트나 URL을 QR 코드로 빠르게 변환',
            icon: '📱',
            features: ['즉시 생성', '고해상도'],
            category: 'generate',
            popular: true,
            badge: '빠름'
        }
    ];

    static getPopularTools() {
        return this.tools.filter(tool => tool.popular);
    }

    static getToolsByCategory(category) {
        return this.tools.filter(tool => tool.category === category);
    }

    static getTool(id) {
        return this.tools.find(tool => tool.id === id);
    }
}

// ===== 페이지 렌더링 =====
class PageRenderer {
    static renderMainContent() {
        const contentElement = DOMManager.getElement('content');
        if (!contentElement) {
            console.error('Content element not found!');
            return;
        }

        const popularTools = DataManager.getPopularTools();
        const imageTools = DataManager.getToolsByCategory('image');
        const generateTools = DataManager.getToolsByCategory('generate');

        contentElement.innerHTML = `
            <!-- 인기 도구 섹션 -->
            <section class="popular-tools-section">
                <div class="section-header">
                    <h2><span class="section-icon">🔥</span>인기 도구</h2>
                    <p class="section-desc">가장 많이 사용되는 도구들을 빠르게 이용하세요</p>
                </div>
                <div class="popular-tools-grid">
                    ${popularTools.map(tool => UIComponents.createPopularCard(tool)).join('')}
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
                        ${imageTools.map(tool => UIComponents.createToolCard(tool)).join('')}
                    </div>
                </div>

                <!-- 생성 도구 -->
                <div class="tool-category-section">
                    <h3 class="category-title">
                        <span class="category-icon">⚡</span>
                        생성 도구
                    </h3>
                    <div class="tools-grid">
                        ${generateTools.map(tool => UIComponents.createToolCard(tool)).join('')}
                    </div>
                </div>
            </section>

            <!-- 관리자 링크 -->
            <div class="admin-section">
                <a href="#" onclick="AdminManager.showModal()" class="admin-link">
                    🔧 관리자 도구
                </a>
            </div>
        `;

        console.log('✅ 메인 콘텐츠 렌더링 완료');
    }
}

// ===== 도구 관리 =====
class ToolManager {
    static openTool(toolId) {
        const tool = DataManager.getTool(toolId);
        if (!tool) {
            console.error(`Tool '${toolId}' not found`);
            return;
        }

        console.log(`🔧 ${tool.name} 도구 열기`);

        switch(toolId) {
            case 'fileConverter':
                ConverterManager.showModal();
                break;
            case 'upscale':
            case 'zoom':
            case 'watermark':
            case 'qr':
                this.showComingSoon(tool.name);
                break;
            default:
                console.log('알 수 없는 도구:', toolId);
        }
    }

    static showComingSoon(toolName) {
        alert(`${toolName} 도구를 준비 중입니다! 곧 만나보실 수 있어요. 😊`);
    }
}

// ===== 컨버터 관리 =====
class ConverterManager {
    static showModal() {
        const modal = DOMManager.getElement('converterModal');
        if (modal) {
            modal.classList.add('show');
            console.log('📸 이미지 변환 모달 열림');
        }
    }

    static closeModal() {
        const modal = DOMManager.getElement('converterModal');
        if (modal) {
            modal.classList.remove('show');
            this.resetForm();
            console.log('📸 이미지 변환 모달 닫힘');
        }
    }

    static resetForm() {
        const fileInput = DOMManager.getElement('fileInput');
        const targetFormat = DOMManager.getElement('targetFormat');
        const convertButton = DOMManager.getElement('convertButton');
        const progressSection = DOMManager.getElement('progressSection');

        if (fileInput) fileInput.value = '';
        if (targetFormat) targetFormat.value = '';
        if (convertButton) convertButton.disabled = true;
        if (progressSection) progressSection.style.display = 'none';
    }

    static async startConversion() {
        console.log('🚀 이미지 변환 시작');
        // TODO: 실제 변환 로직 구현
        alert('이미지 변환 기능을 구현 중입니다!');
    }
}

// ===== 관리자 관리 =====
class AdminManager {
    static showModal() {
        const modal = DOMManager.getElement('adminModal');
        if (modal) {
            modal.classList.add('show');
            console.log('🔐 관리자 모달 열림');
        }
    }

    static closeModal() {
        const modal = DOMManager.getElement('adminModal');
        const passwordInput = DOMManager.getElement('adminPassword');
        const errorMessage = DOMManager.getElement('errorMessage');

        if (modal) modal.classList.remove('show');
        if (passwordInput) passwordInput.value = '';
        if (errorMessage) errorMessage.style.display = 'none';
        
        console.log('🔐 관리자 모달 닫힘');
    }

    static async checkPassword() {
        const passwordInput = DOMManager.getElement('adminPassword');
        const password = passwordInput ? passwordInput.value : '';
        
        if (!password) {
            this.showError('비밀번호를 입력해주세요.');
            return;
        }

        console.log('🔍 관리자 인증 시도');
        // TODO: 실제 인증 로직 구현
        alert('관리자 인증 기능을 구현 중입니다!');
    }

    static showError(message) {
        const errorElement = DOMManager.getElement('errorMessage');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
}

// ===== 애플리케이션 초기화 =====
class App {
    static init() {
        console.log('🚀 Versatify 애플리케이션 시작');
        
        // DOM이 로드된 후 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.onDOMReady.bind(this));
        } else {
            this.onDOMReady();
        }
    }

    static onDOMReady() {
        console.log('📄 DOM 준비 완료');
        
        try {
            // 메인 콘텐츠 렌더링
            PageRenderer.renderMainContent();
            
            // 드래그 앤 드롭 설정
            this.setupDragAndDrop();
            
            // 전역 함수 등록
            this.registerGlobalFunctions();
            
            console.log('✅ 애플리케이션 초기화 완료');
            
        } catch (error) {
            console.error('❌ 애플리케이션 초기화 실패:', error);
        }
    }

    static setupDragAndDrop() {
        const dropZone = DOMManager.getElement('dropZone');
        if (!dropZone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
        });

        dropZone.addEventListener('drop', this.handleDrop, false);
        
        console.log('📎 드래그 앤 드롭 설정 완료');
    }

    static preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    static handleDrop(e) {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            console.log('📁 파일 드롭됨:', files[0].name);
            // TODO: 파일 처리 로직
        }
    }

    static registerGlobalFunctions() {
        // HTML에서 직접 호출할 수 있도록 전역 함수 등록
        window.ToolManager = ToolManager;
        window.ConverterManager = ConverterManager;
        window.AdminManager = AdminManager;
        
        // 호환성을 위한 별칭
        window.openTool = ToolManager.openTool;
        window.showConverterModal = ConverterManager.showModal;
        window.closeConverterModal = ConverterManager.closeModal;
        window.startConversion = ConverterManager.startConversion;
        window.showAdminModal = AdminManager.showModal;
        window.closeAdminModal = AdminManager.closeModal;
        window.checkAdminPassword = AdminManager.checkPassword;
        
        console.log('🌐 전역 함수 등록 완료');
    }
}

// ===== 애플리케이션 시작 =====
App.init(); 