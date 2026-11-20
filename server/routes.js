const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const deepl = require('deepl-node');
const verifyGoogleToken = require('./verifyGoogleToken'); 
const verifyJwtToken = require('./verifyJwtToken'); 
const { db, FieldValue } = require('./firebaseAdmin');
const User = require('./models/user');
const Post = require('./models/post');
const Comment = require('./models/comment');
const Correction = require('./models/correction');
const Dico = require('./models/dico');
const { MAX_CONTENT_LENGTH, MAX_USERNAME_LENGTH, normalizeText, isOwnProfileImageUrl } = require('./validators');
const clientIp = require('./clientIp');
const { consumeGuestQuota } = require('./guestQuota');

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

// 閲覧できる投稿を返す。存在しない、または非公開で本人以外の場合は null(呼び出し側で 404 にする)
async function getReadablePost(postId, userId) {
  if (typeof postId !== 'string' || !postId || postId.includes('/')) return null;
  const postDoc = await db.collection('posts').doc(postId).get();
  if (!postDoc.exists) return null;
  const postData = postDoc.data();
  if (postData.privacyLevel === true && postData.uid !== userId) return null;
  return postData;
}

// ユーザー認証エンドポイント
router.post('/auth/google/validate', async (req, res) => {
  const { token } = req.body;
  
  try {
    const decodedUser = await verifyGoogleToken(token);
    const userId = decodedUser.uid;

    // Firestoreでユーザーの存在を確認
    const userDoc = await db.collection('users').doc(userId).get();
    let user;
    
    if (userDoc.exists) {
      // 既存ユーザーのデータを更新
      user = User.fromFirestore(userDoc);
      user.lastLogin = new Date();
      user.lastVisitedEditMe = user.lastVisitedEditMe || new Date(); // 既存ユーザーに新フィールドを初期化
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
        lastVisitedEditMe: new Date(), // 新規ユーザーのフィールドを初期化
        searchKey: newUsername ? newUsername.charAt(0).toLowerCase() : '',
      });
    }
    // Firestoreにユーザーデータを保存
    await user.save();

    const jwtToken = generateJwtToken(userId);

    // HttpOnly CookieにJWTを設定
    res.cookie('jwt', jwtToken, {
      httpOnly: true, // クライアント側のJavaScriptからはアクセス不可
      secure: process.env.NODE_ENV === 'production', // HTTPS通信でのみ送信 (本番環境で有効)
      sameSite: 'Strict', // CSRF攻撃を防ぐためのオプション
      maxAge: 24 * 60 * 60 * 1000, // 1日（ミリ秒単位）
    });

    // ユーザー情報とJWTトークンをクライアントに返す
    res.status(200).json({
      message: 'User validated',
      user: user.toJson(), // ユーザーデータをシリアライズして返す
      // jwt: jwtToken,
    });
  } catch (error) {
    console.error('Error validating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ユーザー設定エンドポイント
router.put('/user/update', verifyJwtToken, async (req, res) => {
  try {
    // JWT からユーザー ID を取得
    // ゲストの場合は req.user が undefined
    if (!req.user || !req.user.id) {
      return res.status(403).send({ message: 'Access forbidden for guest users' });
    }
    const userId = req.user.id; // verifyJwtToken ミドルウェアにより req.user がセットされている

    // Firestore からユーザーデータを取得
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).send({ message: 'User not found.' });
    }

    // User インスタンスを生成して更新
    let user = User.fromFirestore(userDoc);

    // リクエストから新しいデータを取得
    const { username, profileImageUrl } = req.body;

    // 指定された項目だけ検証する(未指定なら今の値を保つ)
    let newUsername = user.username;
    if (username !== undefined) {
      newUsername = normalizeText(username, MAX_USERNAME_LENGTH);
      if (newUsername === null) {
        return res.status(400).send({ message: `username must be 1-${MAX_USERNAME_LENGTH} characters` });
      }
    }
    if (profileImageUrl !== undefined && !isOwnProfileImageUrl(profileImageUrl, userId, process.env.FIREBASE_STORAGE_BUCKET)) {
      return res.status(400).send({ message: 'profileImageUrl must be an image uploaded to your own profile folder' });
    }

    // ユーザーデータを更新
    user.username = newUsername;
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

    // 文字数の上限(DeepL の利用量を抑える)
    if (
      typeof jpText !== 'string' || jpText.trim().length === 0 || jpText.length > MAX_CONTENT_LENGTH ||
      typeof frText !== 'string' || frText.length > MAX_CONTENT_LENGTH
    ) {
      return res.status(400).json({ error: `jpText (1-${MAX_CONTENT_LENGTH} characters) and frText (up to ${MAX_CONTENT_LENGTH} characters) are required` });
    }

    // ゲストは IP ごと・全体の上限を確認してから翻訳する
    if (!req.user) {
      const ip = clientIp.getClientIp(req);
      if (!ip) {
        return res.status(403).json({ error: 'Cannot identify the client' });
      }
      const quota = await consumeGuestQuota(ip, jpText.length);
      if (!quota.ok) {
        return res.status(429).json({ error: 'Too many translation requests. Please log in or try again later.' });
      }
    }

    // テキストを翻訳する
    const result = await translator.translateText(jpText, 'ja', 'fr', { split_sentences: 'nonewlines' });
    const aiText = result.text;

    // ユーザーがログインしていない場合はDB登録をスキップ
    if (!req.user) {
      return res.status(200).json({ frText, aiText });
    }
     // ログインユーザーの場合は（privacyLevelにかかわらず）DB登録処理を行う
    const newPost = new Post({
      uid: req.user.id,
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

    res.status(200).json({ message: 'Post saved successfully', frText, aiText });
   
} catch (error) {
    console.error('日記の翻訳中にエラーが発生しました:', error);
    res.status(500).json({ error: '日記の翻訳中にエラーが発生しました' });
}
});

// フィルタリングされたPostデータ（privacyLevel: false）とpostのユーザー情報を取得するエンドポイント
router.get('/posts-with-details', verifyJwtToken, async (req, res) => {

  if (!req.user || !req.user.id) {
    return res.status(403).send({ message: 'Access forbidden for guest users' });
  }

  try {
    // postsSnapshotは投稿データ全体のスナップショットオブジェクト。各ドキュメントの参照を保持
    const postsSnapshot = await db.collection('posts')
      .where('privacyLevel', '==', false)
      .orderBy('createdAt', 'desc')
      .get(); //getはPromiseを返しawaitで結果をpostsSnapshotに格納

    if (postsSnapshot.empty) {
      return res.status(404).json({ message: 'No posts found' });
    }

      const postsDetailedInfo = await Promise.all(postsSnapshot.docs.map(async (postDoc) => {
        const postData = postDoc.data();
        const userSnapshot = await db.collection('users').doc(postData.uid).get();
        if (!userSnapshot.exists) {
          console.error(`ユーザードキュメントが見つかりません: ${postData.uid}`);
        };
        const user = userSnapshot.data();
  
        // コメント数をカウント
        const commentCountSnapshot = await db.collection('comments').where('postId', '==', postDoc.id).get();
        const commentCount = commentCountSnapshot.size; // コメント数
        // 添削数をカウント
        const correctionCountSnapshot = await db.collection('corrections').where('postId', '==', postDoc.id).get();
        const correctionCount = correctionCountSnapshot.size; // 添削数

        // createdAtをISO 8601形式に変換
        const createdAt = new Date(postData.createdAt.seconds * 1000).toISOString();


        return {
          ...postData,
          username: user.username,
          profileImageUrl: user.profileImageUrl,
          commentCount,
          correctionCount,
          createdAt
        };
      }));
  
      res.status(200).json({ posts: postsDetailedInfo });
    } catch (error) {
    console.error('Error fetching posts with users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 指定のpostIdのポストデータを取得するエンドポイント
router.get('/post-details/:postId', verifyJwtToken, async (req, res) => {
  
  if (!req.user || !req.user.id) {
    return res.status(403).send({ message: 'Access forbidden for guest users' });
  }
  
  const postId = req.params.postId;
  try {
    const postData = await getReadablePost(postId, req.user.id);

    if (!postData) {
      return res.status(404).send({ message: 'Post not found' });
    }

    const userSnapshot = await db.collection('users').doc(postData.uid).get();
    const user = userSnapshot.data();

    const commentCountSnapshot = await db.collection('comments').where('postId', '==', postId).get();
    const commentCount = commentCountSnapshot.size;

    const correctionCountSnapshot = await db.collection('corrections').where('postId', '==', postId).get();
    const correctionCount = correctionCountSnapshot.size;

    const createdAt = postData.createdAt.toDate().toISOString();

    res.status(200).json({
      ...postData,
      username: user.username,
      profileImageUrl: user.profileImageUrl,
      commentCount,
      correctionCount,
      createdAt
    });

  } catch (error) {
    console.error('Error fetching post details:', error);
    res.status(500).send({ message: 'Server Error' });
  }
});

// ログインユーザーの投稿を取得するAPIエンドポイント（Diaryページ用）
router.get('/my-posts', verifyJwtToken, async (req, res) => {

  if (!req.user || !req.user.id) {
    return res.status(403).send({ message: 'Access forbidden for guest users' });
  }
  
  try {
    const uid = req.user.id;
    const postsSnapshot = await db.collection('posts')
      .where('uid', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

      const posts = await Promise.all(postsSnapshot.docs.map(async doc => {
        const postData = doc.data(); // ドキュメントからデータを取得
        postData.createdAt = postData.createdAt.toDate().toISOString(); // createdAtをISO 8601形式に変換
  
        const commentCountSnapshot = await db.collection('comments').where('postId', '==', doc.id).get();
        const commentCount = commentCountSnapshot.size;
        const correctionCountSnapshot = await db.collection('corrections').where('postId', '==', doc.id).get();
        const correctionCount = correctionCountSnapshot.size;

      return {
        ...postData,
        commentCount,
        correctionCount,
      };
    }));
    res.json({ posts });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
});

// Postデータを更新するAPIエンドポイント
const UPDATABLE_POST_FIELDS = ['privacyLevel', 'revisionRequested'];
router.put('/update-post-details', verifyJwtToken, async (req, res) => {

  if (!req.user || !req.user.id) {
    return res.status(403).send({ message: 'Access forbidden for guest users' });
  }

  const { postId, updates } = req.body;

  if (!postId || typeof postId !== 'string' || !updates || typeof updates !== 'object' || Array.isArray(updates)) {
    return res.status(400).json({ message: 'Post ID and valid updates are required' });
  }

  // 受け付けるキーは privacyLevel と revisionRequested のみ(どちらも boolean)
  const updateKeys = Object.keys(updates);
  const isValidUpdates =
    updateKeys.length > 0 &&
    updateKeys.every(key => UPDATABLE_POST_FIELDS.includes(key) && typeof updates[key] === 'boolean');
  if (!isValidUpdates) {
    return res.status(400).json({ message: 'Only privacyLevel and revisionRequested (boolean) can be updated' });
  }

  try {
    const postRef = db.collection('posts').doc(postId);
    const postSnapshot = await postRef.get();

    // 他人の投稿は存在を知らせないため 404 を返す
    if (!postSnapshot.exists || postSnapshot.data().uid !== req.user.id) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // アップデートのフィールドのみを更新
    await postRef.update(updates);

    // 更新後のポストデータを取得
    const updatedPost = Post.fromFirestore(await postRef.get());

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error updating post details:', error);
    res.status(500).json({ message: 'Error updating post details' });
  }
});

// コメント・添削の追加(作成と投稿への ID 追加を 1 回の batch で行う)
async function addPostReply(req, res, { collection, arrayField, Model, idKey, errorMessage }) {
  if (!req.user || !req.user.id) {
    return res.status(403).send({ message: 'Access forbidden for guest users' });
  }

  const { postId } = req.body;
  const content = normalizeText(req.body.content, MAX_CONTENT_LENGTH);
  if (!postId || typeof postId !== 'string' || content === null) {
    return res.status(400).send({
      message: `Post ID and content (1-${MAX_CONTENT_LENGTH} characters) are required`
    });
  }

  try {
    // 存在しない、または非公開で本人以外の投稿には書き込めない
    if (!(await getReadablePost(postId, req.user.id))) {
      return res.status(404).send({ message: 'Post not found' });
    }

    // ユーザー情報を取得
    const userSnapshot = await db.collection('users').doc(req.user.id).get();
    if (!userSnapshot.exists) {
      return res.status(404).send({ message: 'User not found' });
    }
    const userData = userSnapshot.data();

    const item = new Model({
      postId,
      uid: req.user.id,
      username: userData.username,
      profileImageUrl: userData.profileImageUrl,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // ドキュメントの作成と、投稿の配列への ID 追加を同時に行う
    const itemRef = db.collection(collection).doc();
    const batch = db.batch();
    batch.set(itemRef, item.toJson());
    batch.update(db.collection('posts').doc(postId), { [arrayField]: FieldValue.arrayUnion(itemRef.id) });
    await batch.commit();

    item[idKey] = itemRef.id;
    res.status(201).json(item.toJson());
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    res.status(500).send({ message: errorMessage });
  }
}

// コメントの追加エンドポイント
router.post('/comments', verifyJwtToken, (req, res) =>
  addPostReply(req, res, {
    collection: 'comments',
    arrayField: 'comments',
    Model: Comment,
    idKey: 'commentId',
    errorMessage: 'コメントの追加に失敗しました'
  })
);

// 特定のPostに紐づくコメントを取得
router.get('/comments/:postId', verifyJwtToken, async (req, res) => {

  if (!req.user || !req.user.id) {
      return res.status(403).send({ message: 'Access forbidden for guest users' });
  }

  const postId = req.params.postId;
  try {
      if (!(await getReadablePost(postId, req.user.id))) {
        return res.status(404).send({ message: 'Post not found' });
      }
      const commentsSnapshot = await db.collection('comments').where('postId', '==', postId).get();

      const comments = commentsSnapshot.empty ? [] : commentsSnapshot.docs.map(doc => {
          let comment = doc.data();
          comment.createdAt = comment.createdAt.toDate();
          comment.updatedAt = comment.updatedAt.toDate();
          return comment;
      });
      res.status(200).json({ comments: comments });
  } catch (error) {
      console.error('コメントの取得に失敗しました:', error);
      res.status(500).send({ message: 'コメントの取得に失敗しました' });
  }
});

// 添削の追加エンドポイント
router.post('/corrections', verifyJwtToken, (req, res) =>
  addPostReply(req, res, {
    collection: 'corrections',
    arrayField: 'revisions',
    Model: Correction,
    idKey: 'correctionId',
    errorMessage: '添削の追加に失敗しました'
  })
);

// 特定のPostに紐づく添削を取得
router.get('/corrections/:postId', verifyJwtToken, async (req, res) => {

  if (!req.user || !req.user.id) {
      return res.status(403).send({ message: 'Access forbidden for guest users' });
  }

  const postId = req.params.postId;
  try {
    if (!(await getReadablePost(postId, req.user.id))) {
      return res.status(404).send({ message: 'Post not found' });
    }
    const correctionsSnapshot = await db.collection('corrections').where('postId', '==', postId).get();

    const corrections = correctionsSnapshot.empty ? [] : correctionsSnapshot.docs.map(doc => {
        let correction = doc.data();
        correction.createdAt = correction.createdAt.toDate();
        correction.updatedAt = correction.updatedAt.toDate();
        return correction;
    });
    res.status(200).json({ corrections: corrections });
} catch (error) {
    console.error('添削の取得に失敗しました:', error);
    res.status(500).send({ message: '添削の取得に失敗しました' });
}
});

// EditMeページへの最終訪問日をアップデートするエンドポイント
router.put('/user/last-visit-editme', verifyJwtToken, async (req, res) => {

  if (!req.user || !req.user.id) {
      return res.status(403).send({ message: 'Access forbidden for guest users' });
  }

  try {
    const userId = req.user.id;
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = User.fromFirestore(userDoc);
    user.lastVisitedEditMe = new Date(); // 現在日時に更新
    await user.save();
    const userJson = user.toJson();

    // 日時フィールドをISO 8601形式に変換してレスポンスに含める
    res.status(200).json({
      user: {
        ...userJson,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin.toISOString(),
        lastVisitedEditMe: user.lastVisitedEditMe.toISOString()
      },
      message: 'Last visit date updated successfully'
    });
  } catch (error) {
    console.error('Error updating last visit edit me info:', error);
    res.status(500).json({ message: 'Failed to update last visit edit me info' });
  }
});

// Postを削除するエンドポイント
router.delete('/delete-post/:postId', verifyJwtToken, async (req, res) => {

  if (!req.user || !req.user.id) {
    return res.status(403).send({ message: 'Access forbidden for guest users' });
  }

  const { postId } = req.params;

  try {
    const postSnapshot = await db.collection('posts').doc(postId).get();
    if (!postSnapshot.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = Post.fromFirestore(postSnapshot);

    // 投稿の所有者が現在のユーザーと一致するか確認
    if (post.uid !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this post' });
    }

    await post.deletePost();

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 辞書データを追加するPOSTエンドポイント
router.post('/dico', verifyJwtToken, async (req, res) => {

  if (!req.user || !req.user.id) {
    return res.status(403).send({ message: 'Access forbidden for guest users' });
  }

  const { term, definition } = req.body;
  if (!term || !definition) {
    return res.status(400).send({ message: 'Term and definition are required.' });
  }

  try {
    const alphabet = term.charAt(0).toUpperCase();
    const newDico = new Dico({
      uid: req.user.id,
      term,
      definition,
      alphabet,
      createdAt: new Date()
    });
    
    await newDico.save();

    res.status(201).send({ message: 'Dico data added successfully', dicoId: newDico.dicoid });
  } catch (error) {
    console.error('Error adding Dico data:', error);
    res.status(500).send({ message: 'Failed to add Dico data', error: error.message });
  }
});


module.exports = router;
