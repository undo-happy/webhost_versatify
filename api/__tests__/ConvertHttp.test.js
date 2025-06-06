const convert = require('../ConvertHttp');

test('GET returns API status', async () => {
  const context = { log: () => {} };
  const req = { method: 'GET' };
  await convert(context, req);
  expect(context.res.status).toBe(200);
  expect(context.res.body.message).toBe('Image Conversion API is running');
});
