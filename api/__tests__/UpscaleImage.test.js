const upscale = require('../UpscaleImage');

test('GET returns supported scale values', async () => {
  const context = { log: () => {} };
  const req = { method: 'GET' };
  await upscale(context, req);
  expect(context.res.status).toBe(200);
  expect(context.res.body.supportedScale).toEqual([2,4]);
});
