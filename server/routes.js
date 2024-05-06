const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verifyGoogleToken = require('./verifyGoogleToken'); 
const { db } = require('./firebaseAdmin');
const User = require('./models/user');

// `/api`のトップレベルエンドポイント
router.get('/', (req, res) => {
  res.send('Hello from API');
});

// トークン生成関数
function generateJwtToken(userId) {
  const payload = { id: userId }; 
  const jwtSecret = process.env.JWT_SECRET;
  return jwt.sign(payload, jwtSecret, { expiresIn: '1d' }); // 有効期限を1日とする
}

// ユーザー認証エンドポイント
router.post('/auth/google/validate', async (req, res) => {
  const { token } = req.body;
  console.log('Received ID token:', token);

  
  try {
    console.log(token);
    const decodedUser = await verifyGoogleToken(token);
    const userId = decodedUser.uid;

    // Firestoreでユーザーの存在を確認
    const userDoc = await db.collection('users').doc(userId).get();
    let user;
    
    if (userDoc.exists) {
      // 既存ユーザーのデータを更新
      user = User.fromFirestore(userDoc);
      user.lastLogin = new Date();
    } else {
      // 新規ユーザーを作成
      const newUsername = decodedUser.name || '';
      user = new User({
        uid: userId,
        email: decodedUser.email,
        username: newUsername,
        profileImageUrl: decodedUser.picture || '',
        createdAt: new Date(),
        lastLogin: new Date(),
        searchKey: newUsername ? newUsername.charAt(0).toLowerCase() : '',
      });
    }
    // Firestoreにユーザーデータを保存
    await user.save();

    const jwtToken = generateJwtToken(userId);

    // ユーザー情報とJWTトークンをクライアントに返す
    res.status(200).json({
      message: 'User validated',
      user: user.toJson(), // ユーザーデータをシリアライズして返す
      token: jwtToken,
    });
  } catch (error) {
    console.error('Error validating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;

 