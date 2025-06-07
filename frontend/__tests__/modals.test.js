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

  test('openTool opens upscale modal', () => {
    window.openTool('image-upscale');
    const modal = document.getElementById('upscaleModal');
    expect(modal.classList.contains('show')).toBe(true);
  });

  test('openTool opens zoom modal', () => {
    window.openTool('image-zoom');
    const modal = document.getElementById('zoomModal');
    expect(modal.classList.contains('show')).toBe(true);
  });
});
