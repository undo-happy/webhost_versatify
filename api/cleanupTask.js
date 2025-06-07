const { S3Client, ListObjectsV2Command, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

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

async function cleanupTask(context) {
    const now = new Date();
    let deletedCount = 0;
    let continuationToken = undefined;
    let totalProcessed = 0;

    do {
        const listCommand = new ListObjectsV2Command({
            Bucket: R2_BUCKET_NAME,
            MaxKeys: 1000,
            ContinuationToken: continuationToken
        });

        const response = await s3Client.send(listCommand);
        totalProcessed += response.Contents ? response.Contents.length : 0;

        if (response.Contents && response.Contents.length > 0) {
            for (const object of response.Contents) {
                try {
                    const headCommand = new HeadObjectCommand({
                        Bucket: R2_BUCKET_NAME,
                        Key: object.Key
                    });
                    const headResponse = await s3Client.send(headCommand);
                    const metadata = headResponse.Metadata;
                    if (metadata && metadata['expires-at']) {
                        const expiresAt = new Date(metadata['expires-at']);
                        if (expiresAt < now) {
                            const deleteCommand = new DeleteObjectCommand({
                                Bucket: R2_BUCKET_NAME,
                                Key: object.Key
                            });
                            await s3Client.send(deleteCommand);
                            deletedCount++;
                            if (context.log) context.log(`만료된 파일 삭제: ${object.Key}`);
                        }
                    } else {
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
                            if (context.log) context.log(`7일 이상 경과된 파일 삭제: ${object.Key}`);
                        }
                    }
                } catch (objError) {
                    if (context.log) context.log.error(`객체 처리 중 오류 발생: ${object.Key}`, objError);
                }
            }
        }

        continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    const message = `스토리지 정리 완료: 총 ${totalProcessed}개 파일 중 ${deletedCount}개 만료 파일 삭제됨`;
    return { deletedCount, totalProcessed, message };
}

module.exports = cleanupTask;
