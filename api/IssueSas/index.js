const {
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions
} = require("@azure/storage-blob");

module.exports = async function(context, req) {
  try {
    const file = req.query.name || (req.body && req.body.name);
    if (!file) {
      context.res = { status: 400, body: "name 파라미터 필요" };
      return;
    }

    const account = process.env.STORAGE_ACCOUNT;
    const key = process.env.STORAGE_KEY;
    
    if (!account || !key) {
      context.log.error("저장소 계정 또는 키가 설정되지 않았습니다.");
      context.res = { 
        status: 500, 
        body: { error: "SAS URL 확보 실패: 서버 구성 오류" } 
      };
      return;
    }
    
    const cred = new StorageSharedKeyCredential(account, key);

    // SAS 토큰 만료 시간 (15분)
    const expiresOn = new Date();
    expiresOn.setMinutes(expiresOn.getMinutes() + 15);

    // SAS 권한 설정 (읽기, 쓰기, 생성)
    const permissions = BlobSASPermissions.parse("racwd");

    const sasOptions = {
      containerName: "uploads",
      blobName: file,
      permissions: permissions,
      expiresOn: expiresOn,
      protocol: "https" // HTTPS 프로토콜 명시적 지정
    };

    const sas = generateBlobSASQueryParameters(sasOptions, cred).toString();

    // SAS URL 생성
    const sasUrl = `https://${account}.blob.core.windows.net/uploads/${file}?${sas}`;
    
    context.log.info(`SAS URL 생성 성공: ${file}`);
    context.res = {
      status: 200,
      body: { uploadUrl: sasUrl }
    };
  } catch (error) {
    context.log.error(`SAS URL 생성 오류: ${error.message}`);
    context.res = {
      status: 500,
      body: { error: `SAS URL 확보 실패: ${error.message}` }
    };
  }
}; 