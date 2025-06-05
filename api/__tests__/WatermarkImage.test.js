const watermark = require('../WatermarkImage');

test('GET returns watermark API message', async () => {
  const context = { log: () => {} };
  const req = { method: 'GET' };
  await watermark(context, req);
  expect(context.res.status).toBe(200);
  expect(context.res.body.message).toBe('Image Watermark API');
  expect(context.res.body.parameters).toEqual(['file','text','opacity','position']);
});
