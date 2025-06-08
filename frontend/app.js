const API_BASE = '';
function openTool(toolName) {
  const modal = document.getElementById('toolModal');
  const title = document.getElementById('toolModalTitle');
  const content = document.getElementById('toolModalContent');
  const toolContents = {
    converter: {
      title: '🖼️ 스마트 이미지 변환',
      content: ''
    },
    upscale: {
      title: '🔍 AI 업스케일링',
      content: ''
    }
  };
  const toolData = toolContents[toolName] || { title: '도구', content: '<p>이 도구는 준비 중입니다.</p>' };
  if (title) title.textContent = toolData.title;
  if (content) content.innerHTML = toolData.content;
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

window.openTool = openTool;
