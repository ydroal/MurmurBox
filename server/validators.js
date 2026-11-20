// 入力検証用の小さなヘルパー

const MAX_CONTENT_LENGTH = 2000;

// 文字列を trim して、1〜max 文字なら trim 後の文字列を返す。それ以外は null
function normalizeText(value, max) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > max) return null;
  return trimmed;
}

module.exports = { MAX_CONTENT_LENGTH, normalizeText };
