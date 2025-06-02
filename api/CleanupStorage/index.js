const { S3Client, ListObjectsV2Command, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

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

module.exports = async function (context, myTimer) {
    const timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue) {
        context.log('CleanupStorage 함수가 예정보다 늦게 실행되었습니다.');
    }
    
    context.log('CleanupStorage 함수가 실행됨:', timeStamp);
    
    try {
        const now = new Date();
        let deletedCount = 0;
        let continuationToken = undefined;
        let totalProcessed = 0;
        
        // R2의 모든 객체를 페이지별로 조회
        do {
            const listCommand = new ListObjectsV2Command({
                Bucket: R2_BUCKET_NAME,
                MaxKeys: 1000,
                ContinuationToken: continuationToken
            });
            
            const response = await s3Client.send(listCommand);
            totalProcessed += response.Contents ? response.Contents.length : 0;
            
            // 각 객체의 메타데이터 확인
            if (response.Contents && response.Contents.length > 0) {
                for (const object of response.Contents) {
                    try {
                        // 객체의 메타데이터 가져오기
                        const headCommand = new HeadObjectCommand({
                            Bucket: R2_BUCKET_NAME,
                            Key: object.Key
                        });
                        
                        const headResponse = await s3Client.send(headCommand);
                        
                        // 만료 시간이 존재하고 현재 시간을 지났는지 확인
                        const metadata = headResponse.Metadata;
                        if (metadata && metadata['expires-at']) {
                            const expiresAt = new Date(metadata['expires-at']);
                            
                            // 만료된 파일 삭제
                            if (expiresAt < now) {
                                const deleteCommand = new DeleteObjectCommand({
                                    Bucket: R2_BUCKET_NAME,
                                    Key: object.Key
                                });
                                
                                await s3Client.send(deleteCommand);
                                deletedCount++;
                                context.log(`만료된 파일 삭제: ${object.Key}, 만료시간: ${metadata['expires-at']}`);
                            }
                        } else {
                            // 만료 시간이 없는 파일은 기본적으로 7일 이상 된 파일 삭제
                            const lastModified = new Date(object.LastModified);
                            const sevenDaysAgo = new Date();
                            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                            
                            if (lastModified < sevenDaysAgo) {
                                const deleteCommand = new DeleteObjectCommand({
                                    Bucket: R2_BUCKET_NAME,
                                    Key: object.Key
                                });
                                
                                await s3Client.send(deleteCommand);
                                deletedCount++;
                                context.log(`7일 이상 경과된 파일 삭제: ${object.Key}, 마지막 수정: ${lastModified.toISOString()}`);
                            }
                        }
                    } catch (objError) {
                        context.log.error(`객체 처리 중 오류 발생: ${object.Key}`, objError);
                    }
                }
            }
            
            // 다음 페이지 토큰 설정
            continuationToken = response.NextContinuationToken;
        } while (continuationToken);
        
        context.log(`스토리지 정리 완료: 총 ${totalProcessed}개 파일 중 ${deletedCount}개 만료 파일 삭제됨`);
    } catch (error) {
        context.log.error('스토리지 정리 중 오류 발생:', error);
    }
}; 