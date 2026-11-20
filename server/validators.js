// 入力検証用の小さなヘルパー

const MAX_CONTENT_LENGTH = 2000;

// 文字列を trim して、1〜max 文字なら trim 後の文字列を返す。それ以外は null
function normalizeText(value, max) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > max) return null;
  return trimmed;
}

const MAX_USERNAME_LENGTH = 30;
const MAX_URL_LENGTH = 2048;

// プロフィール画像の URL は、本人のフォルダ(profile_images/{uid}/)の Firebase Storage の URL だけ許可する。
// バケット名は環境変数 FIREBASE_STORAGE_BUCKET で受け取る。未設定なら全て拒否する。
function isOwnProfileImageUrl(url, uid, bucket) {
  if (typeof url !== 'string' || url.length > MAX_URL_LENGTH || !bucket || !uid) return false;
  const prefix = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/profile_images%2F${encodeURIComponent(uid)}%2F`;
  return url.startsWith(prefix) && url.length > prefix.length;
}

module.exports = { MAX_CONTENT_LENGTH, MAX_USERNAME_LENGTH, normalizeText, isOwnProfileImageUrl };
