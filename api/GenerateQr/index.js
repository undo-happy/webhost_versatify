const QRCode = require('qrcode');

module.exports = async function (context, req) {
    const text = req.query.text || (req.body && req.body.text);
    const format = (req.query.format || (req.body && req.body.format) || 'png').toLowerCase();

    if (!text) {
        context.res = {
            status: 400,
            body: { error: 'text parameter is required' }
        };
        return;
    }

    try {
        const mimeType = format === 'svg' ? 'image/svg+xml' : 'image/png';
        const qrDataUrl = await QRCode.toDataURL(text, { type: mimeType });
        const base64Data = qrDataUrl.split(',')[1];

        context.res = {
            status: 200,
            headers: { 'Content-Type': mimeType },
            isRaw: true,
            body: Buffer.from(base64Data, 'base64')
        };
    } catch (err) {
        context.log.error('QR generation failed:', err);
        context.res = {
            status: 500,
            body: { error: 'Failed to generate QR code' }
        };
    }
};
