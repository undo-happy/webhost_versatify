const generateQr = require('../GenerateQr');

// simple test to ensure PNG data is returned
async function run() {
  const context = { log: () => {} };
  const req = { method: 'GET', query: { text: 'hello' } };
  await generateQr(context, req);
  expect(context.res.status).toBe(200);
  expect(context.res.headers['Content-Type']).toBe('image/png');
  expect(context.res.isRaw).toBe(true);
  expect(Buffer.isBuffer(context.res.body)).toBe(true);
}

test('GET generates PNG', run);
