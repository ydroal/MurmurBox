const crypto = require('crypto');
const { db } = require('./firebaseAdmin');

// ゲストの翻訳(DeepL)の上限
const GUEST_IP_LIMIT_PER_HOUR = 5;
const GUEST_CHARS_LIMIT_PER_DAY = 10000;

const pad = n => String(n).padStart(2, '0');

// UTC の YYYYMMDD / YYYYMMDDHH
function dayKey(date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
}
function hourKey(date) {
  return `${dayKey(date)}${pad(date.getUTCHours())}`;
}

// IP は生のまま保存せず、ハッシュ化して保存する
function hashIp(ip) {
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32);
}

// 上限を超えていなければカウンタを増やして { ok: true } を返す。超えたら { ok: false, reason } を返す。
// 確認と加算は 1 つのトランザクションで行う。
async function consumeGuestQuota(ip, chars, now = new Date()) {
  const guestRef = db.collection('quotas').doc(`guest_${dayKey(now)}`);
  const ipRef = db.collection('quotas').doc(`ip_${hashIp(ip)}_${hourKey(now)}`);

  return db.runTransaction(async tx => {
    const [guestDoc, ipDoc] = await Promise.all([tx.get(guestRef), tx.get(ipRef)]);
    const usedChars = guestDoc.exists ? guestDoc.data().chars || 0 : 0;
    const usedRequests = ipDoc.exists ? ipDoc.data().count || 0 : 0;

    if (usedRequests >= GUEST_IP_LIMIT_PER_HOUR) return { ok: false, reason: 'ip' };
    if (usedChars + chars > GUEST_CHARS_LIMIT_PER_DAY) return { ok: false, reason: 'daily' };

    tx.set(guestRef, { chars: usedChars + chars, updatedAt: now });
    tx.set(ipRef, { count: usedRequests + 1, updatedAt: now });
    return { ok: true };
  });
}

module.exports = {
  GUEST_IP_LIMIT_PER_HOUR,
  GUEST_CHARS_LIMIT_PER_DAY,
  consumeGuestQuota
};
