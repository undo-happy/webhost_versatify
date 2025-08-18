const {
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions
} = require('@azure/storage-blob');

module.exports = async function (context, req) {
  try {
    const file = req.query.name || (req.body && req.body.name);
    if (!file) {
      context.res = { status: 400, body: 'name 파라미터 필요' };
      return;
    }

    const account = process.env.STORAGE_ACCOUNT;
    const key = process.env.STORAGE_KEY;
    if (!account || !key) {
      context.log.error('저장소 계정 또는 키가 설정되지 않았습니다.');
      context.res = { status: 500, body: { error: 'SAS URL 확보 실패: 서버 구성 오류' } };
      return;
    }

    const cred = new StorageSharedKeyCredential(account, key);

    const expiresOn = new Date();
    expiresOn.setMinutes(expiresOn.getMinutes() + 15);

    const permissions = BlobSASPermissions.parse('racwd');

    const sasOptions = {
      containerName: 'uploads',
      blobName: file,
      permissions,
      expiresOn,
      protocol: 'https'
    };

    const sas = generateBlobSASQueryParameters(sasOptions, cred).toString();

    const sasUrl = `https://${account}.blob.core.windows.net/uploads/${file}?${sas}`;

    context.res = { status: 200, body: { uploadUrl: sasUrl } };
  } catch (error) {
    context.log.error('SAS URL 생성 오류:', error);
    context.res = { status: 500, body: { error: `SAS URL 확보 실패: ${error.message}` } };
  }
};
<<<<<<< HEAD
=======

>>>>>>> 5f2fa307 (feat(frontend): replace UI with minimal NewHome landing (CSS-inlined via styles))
