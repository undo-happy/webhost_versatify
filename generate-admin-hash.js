const crypto = require('crypto');

/**
 * 관리자 비밀번호 해시 생성 유틸리티
 * 새로운 비밀번호를 설정할 때 이 스크립트를 사용하세요.
 * 
 * 사용법: node generate-admin-hash.js [새_비밀번호]
 */

const newPassword = process.argv[2];
const salt = 'versatify_salt_2025';

if (!newPassword) {
    console.log('사용법: node generate-admin-hash.js [새_비밀번호]');
    console.log('예시: node generate-admin-hash.js mySecurePassword123');
    process.exit(1);
}

// 비밀번호 강도 검사
function checkPasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);
    
    if (password.length < minLength) {
        return '비밀번호는 최소 8자 이상이어야 합니다.';
    }
    
    let score = 0;
    if (hasUpperCase) score++;
    if (hasLowerCase) score++;
    if (hasNumbers) score++;
    if (hasNonalphas) score++;
    
    if (score < 3) {
        return '비밀번호는 대문자, 소문자, 숫자, 특수문자 중 최소 3가지를 포함해야 합니다.';
    }
    
    return null;
}

const strengthError = checkPasswordStrength(newPassword);
if (strengthError) {
    console.error('⚠️  비밀번호 강도 부족:', strengthError);
    process.exit(1);
}

// 해시 생성
const hash = crypto.createHash('sha256');
hash.update(newPassword + salt);
const passwordHash = hash.digest('hex');

console.log('🔐 새로운 관리자 비밀번호 해시가 생성되었습니다:');
console.log('');
console.log('ADMIN_PASSWORD_HASH=' + passwordHash.substring(0, 32));
console.log('ADMIN_SALT=' + salt);
console.log('');
console.log('📋 Azure Portal에서 다음 설정을 추가하세요:');
console.log('Application Settings > New application setting');
console.log('Name: ADMIN_PASSWORD_HASH');
console.log('Value: ' + passwordHash.substring(0, 32));
console.log('');
console.log('Name: ADMIN_SALT');
console.log('Value: ' + salt);
console.log('');
console.log('⚠️  이 정보를 안전한 곳에 보관하고 화면을 지우세요!');
