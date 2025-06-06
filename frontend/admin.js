// 관리자 인증 및 세션 확인
function checkAdminAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const sessionTime = sessionStorage.getItem('adminSession');
    
    if (!isLoggedIn) {
        redirectToLogin();
        return false;
    }
    
    // 세션 만료 확인 (4시간)
    if (sessionTime) {
        const timeElapsed = Date.now() - parseInt(sessionTime);
        const maxSessionTime = 4 * 60 * 60 * 1000; // 4시간
        
        if (timeElapsed > maxSessionTime) {
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminSession');
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
            redirectToLogin();
            return false;
        }
    }
    
    return true;
}

function redirectToLogin() {
    window.location.href = 'index.html';
}

// 초기 인증 확인
if (!checkAdminAuth()) {
    // 이미 리다이렉트됨
}

// 콘텐츠 로드
function loadContent() {
    const savedContent = localStorage.getItem('versatifyContent');
    if (savedContent) {
        // contenteditable 속성 추가
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = savedContent;
        
        // 모든 텍스트 요소에 contenteditable 추가
        tempDiv.querySelectorAll('.category-title, .category-desc, .tool-name, .tool-desc, .expertise-badge').forEach(el => {
            el.setAttribute('contenteditable', 'true');
        });
        
        // 관리자 컨트롤 추가
        tempDiv.querySelectorAll('.tool-category').forEach((card, index) => {
            if (!card.querySelector('.admin-controls')) {
                const controls = `
                    <div class="admin-controls">
                        <button class="control-btn edit-btn" onclick="editCard(${index})">✏️</button>
                        <button class="control-btn duplicate-btn" onclick="duplicateCard(${index})">📋</button>
                        <button class="control-btn delete-btn" onclick="deleteCard(${index})">🗑️</button>
                    </div>
                `;
                card.insertAdjacentHTML('afterbegin', controls);
            }
        });
        
        document.getElementById('toolsGrid').innerHTML = tempDiv.innerHTML;
    } else {
        loadDefaultContent();
    }
    
    attachEventListeners();
}

// 이벤트 리스너 추가
function attachEventListeners() {
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.addEventListener('blur', saveContent);
    });
}

// 콘텐츠 저장
function saveContent() {
    const content = document.getElementById('toolsGrid').innerHTML;
    
    // 관리자 전용 요소 제거
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    tempDiv.querySelectorAll('.admin-controls').forEach(el => el.remove());
    tempDiv.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable');
    });
    
    localStorage.setItem('versatifyContent', tempDiv.innerHTML);
    showNotification('변경사항이 저장되었습니다', 'success');
}

// 카드 삭제
function deleteCard(index) {
    if (confirm('정말 이 카드를 삭제하시겠습니까?')) {
        const cards = document.querySelectorAll('.tool-category:not(.add-card-btn)');
        cards[index].remove();
        saveContent();
    }
}

// 카드 복제
function duplicateCard(index) {
    const cards = document.querySelectorAll('.tool-category:not(.add-card-btn)');
    const original = cards[index];
    const clone = original.cloneNode(true);
    original.parentNode.insertBefore(clone, original.nextSibling);
    loadContent(); // 이벤트 리스너 재설정
}

// 새 카드 추가
function addNewCard() {
    const newCard = `
        <div class="tool-category">
            <div class="admin-controls">
                <button class="control-btn edit-btn">✏️</button>
                <button class="control-btn duplicate-btn">📋</button>
                <button class="control-btn delete-btn">🗑️</button>
            </div>
            <div class="category-header">
                <div class="category-icon convert-icon">📁</div>
                <div>
                    <div class="category-title" contenteditable="true">새로운 카테고리</div>
                    <div class="category-desc" contenteditable="true">설명을 입력하세요</div>
                </div>
            </div>
            <div class="tool-list">
                <div class="tool-item">
                    <div class="tool-name" contenteditable="true">도구 이름</div>
                    <div class="tool-desc" contenteditable="true">도구 설명</div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('toolsGrid').insertAdjacentHTML('beforeend', newCard);
    loadContent(); // 이벤트 리스너 재설정
}

// 데이터 내보내기
function exportData() {
    const content = localStorage.getItem('versatifyContent');
    const data = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        content: content
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `versatify-backup-${Date.now()}.json`;
    a.click();
    
    showNotification('데이터가 내보내졌습니다', 'success');
}

// 데이터 가져오기
function importData(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.content) {
                localStorage.setItem('versatifyContent', data.content);
                loadContent();
                showNotification('데이터를 성공적으로 가져왔습니다', 'success');
            }
        } catch (error) {
            showNotification('데이터 가져오기 실패: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

// 미리보기 토글
function togglePreview() {
    // 새 창에서 index.html 열기
    window.open('index.html', '_blank');
}

// 사이트로 돌아가기
function backToSite() {
    if (confirm('변경사항이 저장되었는지 확인하셨나요?')) {
        sessionStorage.removeItem('adminLoggedIn');
        window.location.href = 'index.html';
    }
}

// 알림 표시
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 웹사이트 코드 생성
function generateWebsiteCode() {
    const saved = localStorage.getItem('versatifyContent') || '';
    fetch('index.html')
        .then(r => r.text())
        .then(html => {
            const output = html.replace('<!-- 동적 콘텐츠 로드 -->', saved);
            const blob = new Blob([output], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'versatify-static.html';
            a.click();
            URL.revokeObjectURL(url);
            showNotification('정적 HTML 파일이 생성되었습니다', 'success');
        })
        .catch(err => {
            showNotification('코드 생성 실패: ' + err.message, 'error');
        });
}

// 자동 저장 (5초마다)
setInterval(saveContent, 5000);

// 초기화
window.onload = function() {
    loadContent();
};
