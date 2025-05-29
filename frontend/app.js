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
    document.getElementById('progressSection').style.display = 'block';
    const statusMessage = document.getElementById('statusMessage');
    const progressFill = document.getElementById('progressFill');
    const convertButton = document.getElementById('convertButton');

    convertButton.disabled = true;
    statusMessage.textContent = '준비 중...';
    progressFill.style.width = '0%';

    if (!selectedFile || !document.getElementById('targetFormat').value) {
        statusMessage.textContent = '파일과 변환 형식을 선택해주세요.';
        convertButton.disabled = false;
        return;
    }

    const targetFormat = document.getElementById('targetFormat').value;

    try {
        statusMessage.textContent = '업로드 준비 중...';
        progressFill.style.width = '10%';

        // 1. Call IssueSas API
        const issueSasResponse = await fetch('/api/IssueSas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: selectedFile.name }),
        });

        progressFill.style.width = '20%';

        if (!issueSasResponse.ok) {
            const errorText = await issueSasResponse.text();
            throw new Error(`SAS URL 확보 실패: ${issueSasResponse.status} ${errorText}`);
        }

        const { uploadUrl } = await issueSasResponse.json();

        if (!uploadUrl) {
            throw new Error('SAS URL이 응답에 포함되지 않았습니다.');
        }

        statusMessage.textContent = '파일 업로드 중...';
        progressFill.style.width = '30%';

        // 2. Upload the File to Azure Blob Storage
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': selectedFile.type,
                'x-ms-blob-type': 'BlockBlob',
            },
            body: selectedFile,
        });
        
        // Simulate upload progress for fetch
        let progress = 30;
        const uploadInterval = setInterval(() => {
            progress += 5;
            if (progress <= 80) { // Cap at 80% before actual completion
                progressFill.style.width = `${progress}%`;
                statusMessage.textContent = `파일 업로드 중... ${progress}%`;
            } else {
                clearInterval(uploadInterval);
            }
        }, 100);


        if (!uploadResponse.ok) {
            clearInterval(uploadInterval);
            const errorText = await uploadResponse.text();
            throw new Error(`파일 업로드 실패: ${uploadResponse.status} ${errorText}`);
        }
        
        clearInterval(uploadInterval);
        progressFill.style.width = '100%';
        statusMessage.textContent = '파일 업로드 완료. 백엔드에서 변환이 처리 중입니다. 완료 시 알림 예정 (현재는 수동 확인).';

    } catch (error) {
        console.error('변환 프로세스 오류:', error);
        statusMessage.textContent = `오류 발생: ${error.message}`;
        progressFill.style.width = '0%'; // Reset progress on error
    } finally {
        // Re-enable button after a delay or based on outcome
        // For now, keep it simple, it might be better to leave it disabled
        // until a "new conversion" button is clicked or file is changed.
        // convertButton.disabled = false; 
        checkConversionReady(); // Re-evaluates if button should be enabled

        // Simulate backend processing delay then enable download
        const currentFileName = selectedFile.name; // Keep a local copy of selectedFile.name
        const currentTargetFormat = document.getElementById('targetFormat').value; // Get target format

        // document.getElementById('statusMessage').textContent = `File ${currentFileName} uploaded. Conversion processing...`;
        // document.getElementById('progressFill').style.width = '100%'; // Show upload as complete

        // Hide progress bar section after a short delay, show download button
        setTimeout(() => {
            document.getElementById('progressSection').style.display = 'none';
            prepareDownloadLink(currentFileName, currentTargetFormat);
            // Reset for next conversion
            document.getElementById('convertButton').disabled = true;
            selectedFile = null; 
            // document.getElementById('fileInput').value = null; // Clear file input if desired
            document.getElementById('targetFormat').value = ''; // Clear format 
            document.getElementById('dropZoneText').textContent = '드래그 앤 드롭 또는 클릭하여 파일 선택';
            document.getElementById('fileInput').value = null; // Clear file input display


        }, 3000); // Simulate 3 seconds of conversion time
    }
}

function prepareDownloadLink(originalFileName, targetFormat) {
    const downloadButton = document.getElementById('downloadButton');
    const statusMessage = document.getElementById('statusMessage');
    
    // Construct the expected converted file name. 
    // Assuming backend saves as base_name.target_format (e.g., myimage.png)
    // If originalFileName is 'myimage.jpg' and targetFormat is 'png'.
    const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.'));
    const convertedFileName = baseName + '.' + targetFormat;

    statusMessage.textContent = `File ${originalFileName} converted to ${targetFormat}. Ready for download.`;
    downloadButton.style.display = 'block';
    downloadButton.disabled = false;


    downloadButton.onclick = async () => {
        statusMessage.textContent = `Preparing download for ${convertedFileName}...`;
        downloadButton.disabled = true;
        try {
            // TODO: This is where the call to the backend to get a download SAS URL would go.
            // Example: const response = await fetch(`/api/GetAzureDownloadSas?fileName=${convertedFileName}`);
            // if (!response.ok) throw new Error('Failed to get download link.');
            // const data = await response.json();
            // const downloadUrl = data.downloadUrl;
            
            // For now, simulate getting a URL and log it.
            const simulatedDownloadUrl = `https://example.com/converted/${convertedFileName}`; // Replace with actual logic
            console.log(`TODO: Would download from: ${simulatedDownloadUrl}`);
            
            // Simulate download by opening a new tab (or could create an 'a' tag and click it)
            // window.open(simulatedDownloadUrl, '_blank'); 

            statusMessage.textContent = `Download would start for ${convertedFileName}. (Placeholder - check console).`;
            // Re-enable button after a delay or if user needs to retry
            setTimeout(() => { 
               // downloadButton.disabled = false; // Keep disabled after click for now
            }, 3000);

        } catch (error) {
            console.error('Download error:', error);
            statusMessage.textContent = `Error preparing download: ${error.message}`;
            downloadButton.style.display = 'block'; // Keep button visible for retry
            downloadButton.disabled = false;
        }
    };
}

// 초기화
window.onload = function() {
    loadContent();
};
