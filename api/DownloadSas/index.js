const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { createPresignedUrl } = require("@aws-sdk/s3-request-presigner");

module.exports = async function(context, req) {
  try {
    const file = req.query.file || (req.body && req.body.file);
    if (!file) {
      context.res = { status: 400, body: "file 파라미터 필요" };
      return;
    }

    // 환경 변수 검증
    const requiredEnvVars = ['R2_ENDPOINT', 'R2_ACCESS_KEY', 'R2_SECRET_KEY', 'R2_BUCKET'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      context.log.error(`필수 환경 변수가 누락됨: ${missingEnvVars.join(', ')}`);
      context.res = { 
        status: 500, 
        body: { error: "SAS URL 확보 실패: 서버 구성 오류" } 
      };
      return;
    }

    const s3 = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY
      }
    });

    // GetObjectCommand 객체 생성
    const command = new GetObjectCommand({ 
      Bucket: process.env.R2_BUCKET, 
      Key: file 
    });

    // 5분 동안 유효한 Presigned URL 생성
    const url = await createPresignedUrl(s3, command, { expiresIn: 5 * 60 });

    // 응답 로깅 및 반환
    context.log.info(`다운로드 URL 생성 성공: ${file}`);
    context.res = { 
      status: 200,
      body: { downloadUrl: url } 
    };
  } catch (error) {
    context.log.error(`다운로드 URL 생성 오류: ${error.message}`);
    context.res = { 
      status: 500, 
      body: { error: `SAS URL 확보 실패: ${error.message}` } 
    };
  }
}; 