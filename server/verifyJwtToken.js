const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET;

// JWTの検証
const verifyJwtToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log(authHeader);
  const token = authHeader && authHeader.split(' ')[1]; // Bearerトークンの形式に対応

  if (!token) {
    // ゲストユーザーの場合はユーザー情報を設定せずに処理を続行
    return next();
    // return res.status(403).send({ message: 'No token provided!' });
  }
  jwt.verify(token, secretKey, (err, user) => { // secretKeyは実際のJWT秘密鍵
    if (err) {
      return res.status(401).send({ message: 'Failed to authenticate token.' });
    }
    console.log('Authenticated user:', user);  // ユーザー情報をログ出力
    // ユーザー情報をreq.userに保存
    req.user = user;
    next();
  });
};

module.exports = verifyJwtToken;