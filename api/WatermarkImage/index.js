const multipart = require('parse-multipart-data');
const Jimp = require('jimp');
const { v4: uuidv4 } = require('uuid');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const R2_ENDPOINT = process.env.R2_ENDPOINT || 'https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'YOUR_ACCESS_KEY_ID';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || 'YOUR_SECRET_ACCESS_KEY';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'converted-images';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY
    }
});

module.exports = async function (context, req) {
    context.log('WatermarkImage function processed a request.');

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Origin, X-Requested-With, Accept',
        'Access-Control-Max-Age': '86400'
    };
    context.res = { headers: corsHeaders };

    if (req.method === 'OPTIONS') {
        context.res.status = 200;
        context.res.body = 'OK';
        return;
    }

    if (req.method === 'GET') {
        context.res.status = 200;
        context.res.body = {
            message: 'Image Watermark API',
            parameters: ['file', 'text', 'opacity', 'position']
        };
        return;
    }

    if (req.method !== 'POST') {
        context.res.status = 405;
        context.res.body = { error: 'Method not allowed' };
        return;
    }

    try {
        const contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('multipart/form-data')) {
            context.res.status = 400;
            context.res.body = { error: 'Content-Type must be multipart/form-data' };
            return;
        }
        const boundary = contentType.split('boundary=')[1];
        if (!boundary) {
            context.res.status = 400;
            context.res.body = { error: 'No boundary found in Content-Type' };
            return;
        }
        const bodyBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
        const parts = multipart.parse(bodyBuffer, boundary);
        if (!parts || parts.length === 0) {
            context.res.status = 400;
            context.res.body = { error: 'No multipart data found' };
            return;
        }

        const filePart = parts.find(p => p.name === 'file');
        const textPart = parts.find(p => p.name === 'text');
        const opacityPart = parts.find(p => p.name === 'opacity');
        const positionPart = parts.find(p => p.name === 'position');

        if (!filePart) {
            context.res.status = 400;
            context.res.body = { error: 'No file uploaded' };
            return;
        }
        if (!textPart) {
            context.res.status = 400;
            context.res.body = { error: 'text parameter is required' };
            return;
        }

        const opacity = opacityPart ? parseFloat(opacityPart.data.toString()) : 0.5;
        const position = (positionPart ? positionPart.data.toString() : 'bottom-right').toLowerCase();
        const allowedPositions = ['top-left','top-right','bottom-left','bottom-right','center'];
        if (!allowedPositions.includes(position)) {
            context.res.status = 400;
            context.res.body = { error: 'Invalid position' };
            return;
        }

        const image = await Jimp.read(filePart.data);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
        const text = textPart.data.toString();
        const textWidth = Jimp.measureText(font, text);
        const textHeight = Jimp.measureTextHeight(font, text, textWidth);
        const watermark = new Jimp(textWidth + 20, textHeight + 20, 0x00000000);
        watermark.print(font, 10, 10, text);
        watermark.opacity(opacity);

        let x = 0;
        let y = 0;
        const margin = 10;
        switch(position) {
            case 'top-left':
                x = margin;
                y = margin;
                break;
            case 'top-right':
                x = image.bitmap.width - watermark.bitmap.width - margin;
                y = margin;
                break;
            case 'bottom-left':
                x = margin;
                y = image.bitmap.height - watermark.bitmap.height - margin;
                break;
            case 'center':
                x = (image.bitmap.width - watermark.bitmap.width) / 2;
                y = (image.bitmap.height - watermark.bitmap.height) / 2;
                break;
            default:
                x = image.bitmap.width - watermark.bitmap.width - margin;
                y = image.bitmap.height - watermark.bitmap.height - margin;
        }

        image.composite(watermark, x, y);
        const outputBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

        const fileName = `${uuidv4()}.png`;
        const uploadParams = {
            Bucket: R2_BUCKET_NAME,
            Key: fileName,
            Body: outputBuffer,
            ContentType: 'image/png',
            Metadata: { 'expires-at': new Date(Date.now() + 3*60*1000).toISOString() }
        };
        await s3Client.send(new PutObjectCommand(uploadParams));

        const getCommand = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: fileName });
        const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

        context.res.status = 200;
        context.res.body = { success: true, downloadUrl: signedUrl };
    } catch (err) {
        context.log.error('Watermark error:', err);
        context.res.status = 500;
        context.res.body = { error: 'Watermark failed', message: err.message };
    }
};
