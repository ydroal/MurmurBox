const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const deepl = require('deepl-node');
const verifyGoogleToken = require('./verifyGoogleToken'); 
const verifyJwtToken = require('./verifyJwtToken'); 
const { db } = require('./firebaseAdmin');
const User = require('./models/user');
const Post = require('./models/post');

const authKey = process.env.DEEPL_API_KEY;
const translator = new deepl.Translator(authKey);

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
    const decodedUser = await verifyGoogleToken(token);
    const userId = decodedUser.uid;

    // Firestoreでユーザーの存在を確認
    const userDoc = await db.collection('users').doc(userId).get();
    let user;
    
    if (userDoc.exists) {
      // 既存ユーザーのデータを更新
      console.log('User document exists:', userDoc.data());
      user = User.fromFirestore(userDoc);
      user.lastLogin = new Date();
    } else {
      // 新規ユーザーを作成
      const newUsername = decodedUser.name || '';
      user = new User({
        uid: userId,
        email: decodedUser.email,
        username: newUsername,
        profileImageUrl: '',
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
      jwt: jwtToken,
    });
  } catch (error) {
    console.error('Error validating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ユーザー設定エンドポイント
router.put('/user/update', verifyJwtToken, async (req, res) => {
  console.log('updateリクエスト来た')
  try {
    // JWT からユーザー ID を取得
    const userId = req.user.id; // verifyJwtToken ミドルウェアにより req.user がセットされている

    if (!userId) {
      return res.status(403).send({ message: 'Access forbidden for guest users' });
    }

    // Firestore からユーザーデータを取得
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).send({ message: 'User not found.' });
    }

    // User インスタンスを生成して更新
    let user = User.fromFirestore(userDoc);

    // リクエストから新しいデータを取得
    const { username, profileImageUrl } = req.body;

    // ユーザーデータを更新
    user.username = username || user.username;
    user.profileImageUrl = profileImageUrl || user.profileImageUrl;
    user.lastLogin = new Date(); // 最終ログイン日を更新

    await user.save();

    // 更新されたユーザーデータをクライアントに送信
    res.status(200).json({
      message: 'User updated successfully.',
      user: user.toJson()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send({ message: 'Failed to update user.' });
  }
});

// ユーザー情報を取得するエンドポイント
router.get('/user/info', verifyJwtToken, async (req, res) => {
  console.log('fetchリクエスト来た')
  // verifyJwtTokenでreq.userがセットされているが、ゲストの場合は undefined
  if (!req.user || !req.user.id) {
    return res.status(403).send({ message: 'Access forbidden for guest users' });
  }

  try {
    const userId = req.user.id;
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).send({ message: 'User not found' });
    }

    const user = User.fromFirestore(userDoc);
    res.status(200).json({ user: user.toJson() });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

// 日記投稿エンドポイント
router.post('/post', verifyJwtToken, async (req, res) => {
  try {
    const { jpText, frText, privacyLevel, revisionRequested } = req.body;

    console.log('User:', req.user);

    // テキストを翻訳する
    const result = await translator.translateText(jpText, 'ja', 'fr', { split_sentences: 'nonewlines' });
    const aiText = result.text;

    // ユーザーがログインしていない、且つprivacyLevelが'private'の場合はDB登録をスキップ
    if (!req.user && privacyLevel === true) {
      return res.status(200).json({ frText, aiText });
    }
     // DB登録処理を行う
    const newPost = new Post({
      uid: req.user ? req.user.id : 'guest',
      jpText,
      frText,
      aiText,
      createdAt: new Date(),
      privacyLevel,
      revisionRequested,
      comments: [], 
      revisions: []
    });
    await newPost.save();

    console.log('Post saved successfully');
    res.status(200).json({ message: 'Post saved successfully', frText, aiText });
   
} catch (error) {
    console.error('日記の翻訳中にエラーが発生しました:', error);
    res.status(500).json({ error: '日記の翻訳中にエラーが発生しました' });
}
});

module.exports = router;

 