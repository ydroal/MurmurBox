// クライアントの IP を返す。取れない場合は null。
// `trust proxy` は設定しない(ホップ数は Hosting 経由の実測で決める)ので、今は接続元の IP になる。
// X-Forwarded-For を直接読まない(クライアントが偽装できるため)。
function getClientIp(req) {
  return req.ip || null;
}

module.exports = { getClientIp };
