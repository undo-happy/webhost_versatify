const multipart = require('parse-multipart-data');
const { Transformer } = require('@napi-rs/image');
const { v4: uuidv4 } = require('uuid');

// 로컬 개발 모드 확인
const isLocalDevelopment = process.env.NODE_ENV !== 'production' && 
                          (!process.env.R2_ENDPOINT || process.env.R2_ENDPOINT.includes('demo'));

// R2 설정 (프로덕션용)
let s3Client = null;
if (!isLocalDevelopment) {
    const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    
    const R2_ENDPOINT = process.env.R2_ENDPOINT;
    const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
    const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
    const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'converted-images';

    s3Client = new S3Client({
        region: 'auto',
        endpoint: R2_ENDPOINT,
        credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY
        }
    });
}

// 간단한 동시성 카운터
let currentProcessing = 0;
const MAX_CONCURRENT = 8;

module.exports = async function (context, req) {
    context.log('UpscaleImage function processed a request.');

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
            message: 'Image Upscale API',
            mode: isLocalDevelopment ? 'Local Development' : 'Production (R2)',
            supportedScale: [2, 4],
            serverStatus: {
                currentProcessing,
                maxConcurrent: MAX_CONCURRENT
            }
        };
        return;
    }

    // 동시 처리 제한 확인
    if (currentProcessing >= MAX_CONCURRENT) {
        context.res.status = 503;
        context.res.body = { 
            error: 'Upscale service busy. Please try again in a moment.',
            currentLoad: currentProcessing,
            maxCapacity: MAX_CONCURRENT,
            retryAfter: '3-8 seconds'
        };
        return;
    }

    if (req.method !== 'POST') {
        context.res.status = 405;
        context.res.body = { error: 'Method not allowed' };
        return;
    }

    currentProcessing++;
    context.log(`Upscale processing started. Current load: ${currentProcessing}/${MAX_CONCURRENT}`);

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
        const scalePart = parts.find(p => p.name === 'scale');
        if (!filePart) {
            context.res.status = 400;
            context.res.body = { error: 'No file uploaded' };
            return;
        }
        const scale = scalePart ? parseInt(scalePart.data.toString()) : 2;
        if (![2,4].includes(scale)) {
            context.res.status = 400;
            context.res.body = { error: 'scale must be 2 or 4' };
            return;
        }

        // 이미지 처리 시작
        const transformer = new Transformer(filePart.data);
        
        // 메타데이터 가져오기
        const metadata = await transformer.metadata();
        
        // 업스케일링 팩터 적용
        const newWidth = metadata.width * scale;
        const newHeight = metadata.height * scale;
        
        // 이미지 리사이즈 (업스케일링)
        const upscaledTransformer = transformer.resize(newWidth, newHeight);
        
        // 결과 이미지 인코딩 (PNG로 고품질 유지)
        const outputBuffer = await upscaledTransformer.png();

        // 로컬 개발 모드에서는 base64로 직접 반환
        if (isLocalDevelopment) {
            const base64Data = outputBuffer.toString('base64');
            const dataUrl = `data:image/png;base64,${base64Data}`;
            
            context.res.status = 200;
            context.res.body = {
                success: true,
                message: 'Image upscaled successfully (Local Development Mode)',
                scale,
                downloadUrl: dataUrl,
                mode: 'Local Development',
                originalDimensions: {
                    width: metadata.width,
                    height: metadata.height
                },
                newDimensions: {
                    width: newWidth,
                    height: newHeight
                },
                fileSize: outputBuffer.length
            };
            return;
        }

        // 프로덕션 모드에서는 R2에 업로드
        const fileName = `${uuidv4()}.png`;
        const uploadParams = {
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: outputBuffer,
            ContentType: 'image/png',
            Metadata: { 'expires-at': new Date(Date.now() + 3*60*1000).toISOString() }
        };
        await s3Client.send(new PutObjectCommand(uploadParams));

        const getCommand = new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: fileName });
        const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

        context.res.status = 200;
        context.res.body = {
            success: true,
            scale,
            downloadUrl: signedUrl,
            width: metadata.width,
            height: metadata.height
        };
    } catch (err) {
        context.log('Upscale error:', err);
        context.res.status = 500;
        context.res.body = { error: 'Upscale failed', message: err.message };
    } finally {
        currentProcessing--;
        context.log(`Upscale processing completed. Current load: ${currentProcessing}/${MAX_CONCURRENT}`);
    }
};
