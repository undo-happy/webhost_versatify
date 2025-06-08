const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const originalJs = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
const appJs = originalJs.replace(/const API_BASE.*\n/, "const API_BASE = '';\n");

describe('Modal UI', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html.toString();
    eval(appJs); // load patched script
  });

  test('openTool displays the selected tool modal', () => {
    window.openTool('upscale');
    const modal = document.getElementById('toolModal');
    const title = document.getElementById('toolModalTitle');
    expect(modal.style.display).toBe('flex');
    expect(title.textContent).toContain('업스케일');
  });

  test('openTool switches modal content', () => {
    window.openTool('converter');
    const modal = document.getElementById('toolModal');
    const title = document.getElementById('toolModalTitle');
    expect(modal.style.display).toBe('flex');
    expect(title.textContent).toContain('변환');
  });
});
