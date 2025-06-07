const multipart = require('parse-multipart-data');
const { Transformer } = require('@napi-rs/image');
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
    context.log('ZoomImage function processed a request.');

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
            message: 'Image Zoom API',
            supportedScale: [2, 4]
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
        const xPart = parts.find(p => p.name === 'x');
        const yPart = parts.find(p => p.name === 'y');
        const widthPart = parts.find(p => p.name === 'width');
        const heightPart = parts.find(p => p.name === 'height');
        const scalePart = parts.find(p => p.name === 'scale');

        if (!filePart) {
            context.res.status = 400;
            context.res.body = { error: 'No file uploaded' };
            return;
        }
        const x = xPart ? parseInt(xPart.data.toString()) : 0;
        const y = yPart ? parseInt(yPart.data.toString()) : 0;
        const width = widthPart ? parseInt(widthPart.data.toString()) : null;
        const height = heightPart ? parseInt(heightPart.data.toString()) : null;
        const scale = scalePart ? parseInt(scalePart.data.toString()) : 2;

        if (!width || !height) {
            context.res.status = 400;
            context.res.body = { error: 'width and height are required' };
            return;
        }
        if (![2,4].includes(scale)) {
            context.res.status = 400;
            context.res.body = { error: 'scale must be 2 or 4' };
            return;
        }

        const transformer = new Transformer(filePart.data);
        
        const metadata = await transformer.metadata();
        
        const croppedTransformer = transformer.crop(x, y, width, height);
        
        const zoomedTransformer = croppedTransformer.resize(width * scale, height * scale);
        
        const outputBuffer = await zoomedTransformer.png();

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
        context.res.body = {
            success: true,
            scale,
            downloadUrl: signedUrl,
            width: width * scale,
            height: height * scale
        };
    } catch (err) {
        context.log('Zoom error:', err);
        context.res.status = 500;
        context.res.body = { error: 'Zoom failed', message: err.message };
    }
};
