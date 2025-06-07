const multipart = require('parse-multipart-data');
const { Transformer } = require('@napi-rs/image');
const { v4: uuidv4 } = require('uuid');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// R2 설정
const R2_ENDPOINT = process.env.R2_ENDPOINT || 'https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'YOUR_ACCESS_KEY_ID';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || 'YOUR_SECRET_ACCESS_KEY';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'converted-images';

// S3 클라이언트 초기화 (R2 호환)
const s3Client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY
    }
});

module.exports = async function (context, req) {
    context.log('HTTP trigger function processed a request.');
    
    // CORS 헤더 설정
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Origin, X-Requested-With, Accept, Authorization, Cache-Control',
        'Access-Control-Max-Age': '86400'
    };

    // 모든 응답에 CORS 헤더 포함
    context.res = {
        headers: corsHeaders
    };

    // OPTIONS 요청 처리 (CORS preflight)
    if (req.method === 'OPTIONS') {
        context.res.status = 200;
        context.res.body = 'OK';
        return;
    }

    // GET 요청 처리 (테스트용)
    if (req.method === 'GET') {
        context.res.status = 200;
        context.res.body = { 
            message: 'Image Conversion API is running', 
            timestamp: new Date().toISOString(),
            supportedFormats: ['jpeg', 'png', 'webp', 'avif'],
            endpoint: '/api/convert',
            storage: 'Cloudflare R2',
            library: '@napi-rs/image'
        };
        return;
    }

    // POST 요청만 허용
    if (req.method !== 'POST') {
        context.res.status = 405;
        context.res.body = { 
            error: 'Method not allowed. Use POST for image conversion or GET for status check.',
            allowedMethods: ['GET', 'POST', 'OPTIONS']
        };
        return;
    }

    try {
        // Content-Type 확인
        const contentType = req.headers['content-type'];
        
        if (!contentType || !contentType.includes('multipart/form-data')) {
            context.res.status = 400;
            context.res.body = { error: 'Content-Type must be multipart/form-data' };
            return;
        }

        // 요청 바디 확인
        if (!req.body) {
            context.res.status = 400;
            context.res.body = { error: 'No request body' };
            return;
        }

        // multipart 데이터 파싱
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

        // 파일 찾기
        const filePart = parts.find(part => part.name === 'file');
        const formatPart = parts.find(part => part.name === 'targetFormat');
        const widthPart = parts.find(part => part.name === 'width');
        const heightPart = parts.find(part => part.name === 'height');

        if (!filePart) {
            context.res.status = 400;
            context.res.body = { error: 'No file found in form data' };
            return;
        }

        const fileName = filePart.filename || 'unknown';
        const fileBuffer = filePart.data;
        
        // 이미지 형식 확인 및 변환
        const targetFormat = formatPart ? formatPart.data.toString() : 'webp';
        
        // 지원하는 형식 확인 (@napi-rs/image 지원 포맷)
        const supportedFormats = ['jpeg', 'png', 'webp', 'avif'];
        if (!supportedFormats.includes(targetFormat)) {
            context.res.status = 400;
            context.res.body = { 
                error: 'Unsupported format', 
                supportedFormats 
            };
            return;
        }
        
        // 이미지 처리 (@napi-rs/image 사용)
        // Buffer에서 이미지 로드
        const transformer = new Transformer(fileBuffer);
        
        // 메타데이터 가져오기
        const metadata = await transformer.metadata();
        let currentTransformer = transformer;
        
        // 크기 조정 요청이 있으면 적용
        const width = widthPart ? parseInt(widthPart.data.toString()) : null;
        const height = heightPart ? parseInt(heightPart.data.toString()) : null;
        
        if (width && height) {
            currentTransformer = currentTransformer.resize(width, height);
        } else if (width) {
            // 너비만 지정된 경우 비율 유지
            const aspectRatio = metadata.height / metadata.width;
            const newHeight = Math.round(width * aspectRatio);
            currentTransformer = currentTransformer.resize(width, newHeight);
        } else if (height) {
            // 높이만 지정된 경우 비율 유지
            const aspectRatio = metadata.width / metadata.height;
            const newWidth = Math.round(height * aspectRatio);
            currentTransformer = currentTransformer.resize(newWidth, height);
        }
        
        // 형식 변환 적용 및 인코딩
        let outputBuffer;
        switch (targetFormat) {
            case 'jpeg':
                outputBuffer = await currentTransformer.jpeg(90);
                break;
            case 'png':
                outputBuffer = await currentTransformer.png();
                break;
            case 'webp':
                outputBuffer = await currentTransformer.webp(90);
                break;
            case 'avif':
                outputBuffer = await currentTransformer.avif({ quality: 85 });
                break;
            default:
                outputBuffer = await currentTransformer.webp(90);
        }
        
        // 고유 파일 이름 생성
        const convertedFileName = `${uuidv4()}.${targetFormat}`;
        
        // 파일 만료 시간 설정 (현재 시간 + 3분)
        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 3);

        // R2에 업로드
        const uploadParams = {
            Bucket: R2_BUCKET_NAME,
            Key: convertedFileName,
            Body: outputBuffer,
            ContentType: `image/${targetFormat}`,
            Metadata: {
                'expires-at': expirationTime.toISOString(),
                'original-filename': encodeURIComponent(fileName)
            }
        };
        
        await s3Client.send(new PutObjectCommand(uploadParams));
        
        // 서명된 URL 생성
        const getCommand = new GetObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: convertedFileName
        });
        
        const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
        
        // 응답 반환
        context.res.status = 200;
        context.res.body = {
            success: true,
            message: 'Image converted successfully with @napi-rs/image',
            originalFile: fileName,
            targetFormat: targetFormat,
            fileSize: outputBuffer.length,
            downloadUrl: signedUrl,
            storage: 'Cloudflare R2',
            dimensions: {
                width: metadata.width,
                height: metadata.height
            }
        };

    } catch (error) {
        context.log('Error processing request:', error);
        
        context.res.status = 500;
        context.res.body = { 
            error: 'Internal server error', 
            message: error.message 
        };
    }
};
