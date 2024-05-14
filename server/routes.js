const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const deepl = require('deepl-node');
const verifyGoogleToken = require('./verifyGoogleToken'); 
const verifyJwtToken = require('./verifyJwtToken'); 
const { db, admin } = require('./firebaseAdmin');
const User = require('./models/user');
const Post = require('./models/post');
const Comment = require('./models/comment');
const Correction = require('./models/correction');
const Dico = require('./models/dico');

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

// Postsデータを取得するエンドポイント
router.get('/posts', verifyJwtToken, async (req, res) => {
  console.log('Postsのfetchリクエスト来た');

  // verifyJwtTokenでreq.userがセットされているが、ゲストの場合は undefined
  if (!req.user || !req.user.id) {
    return res.status(403).send({ message: 'Access forbidden for guest users' });
  }

  try {
    const snapshot = await db.collection('posts').get();
    const posts = [];

    // 取得したデータをPostクラスのインスタンスに変換
    snapshot.forEach(doc => {
      const post = Post.fromFirestore(doc);
      posts.push(post);
    });

    res.json({ posts: posts.map(post => post.toJson())});
  } catch (error) {
    console.error('Postデータの取得中にエラーが発生しました:', error);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました。Postデータの取得に失敗しました。',
    });
  }
});

// フィルタリングされたPostデータ（privacyLevel: false）とpostのユーザー情報を取得するエンドポイント
router.get('/posts-with-details', verifyJwtToken, async (req, res) => {
  console.log('Feed用Postsのfetchリクエスト来た');

  if (!req.user || !req.user.id) {
    return res.status(403).send({ message: 'Access forbidden for guest users' });
  }

  try {
    // postsSnapshotは投稿データ全体のスナップショットオブジェクト。各ドキュメントの参照を保持
    const postsSnapshot = await db.collection('posts')
      .where('privacyLevel', '==', false)
      .orderBy('createdAt', 'desc')
      .get(); //getはPromiseを返しawaitで結果をpostsSnapshotに格納

      const postsDetailedInfo = await Promise.all(postsSnapshot.docs.map(async (postDoc) => {
        const postData = postDoc.data();
        const userSnapshot = await db.collection('users').doc(postData.uid).get();
        const user = userSnapshot.data();
  
        // コメント数をカウント
        const commentCountSnapshot = await db.collection('comments').where('postId', '==', postDoc.id).get();
        const commentCount = commentCountSnapshot.size; // コメント数
        // 添削数をカウント
        const correctionCountSnapshot = await db.collection('corrections').where('postId', '==', postDoc.id).get();
        const correctionCount = correctionCountSnapshot.size; // 添削数
        console.log('correctionCount:', correctionCount);

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
  console.log('個別Postのfetchリクエスト来た');
  
  if (!req.user || !req.user.id) {
    return res.status(403).send({ message: 'Access forbidden for guest users' });
  }
  
  const postId = req.params.postId;
  try {
    const postDoc = await db.collection('posts').doc(postId).get();

    if (!postDoc.exists) {
      return res.status(404).send({ message: 'Post not found' });
    }

    const postData = postDoc.data();
    const userSnapshot = await db.collection('users').doc(postData.uid).get();
    const user = userSnapshot.data();

    const commentCountSnapshot = await db.collection('comments').where('postId', '==', postId).get();
    const commentCount = commentCountSnapshot.size;

    const correctionCountSnapshot = await db.collection('corrections').where('postId', '==', postId).get();
    const correctionCount = correctionCountSnapshot.size;

    const createdAt = new Date(postData.createdAt);

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
  console.log('Diary用Postsのfetchリクエスト来た');

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
router.put('/update-post-details', verifyJwtToken, async (req, res) => {
  console.log('postデータ更新リクエスト来た');

  if (!req.user || !req.user.id) {
    return res.status(403).send({ message: 'Access forbidden for guest users' });
  }

  const { postId, updates } = req.body;

  if (!postId || !updates || typeof updates !== 'object') {
    return res.status(400).json({ message: 'Post ID and valid updates are required' });
  }

  try {
    const postRef = db.collection('posts').doc(postId);
    const postSnapshot = await postRef.get();

    if (!postSnapshot.exists) {
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

// コメントの追加エンドポイント
router.post('/comments', verifyJwtToken, async (req, res) => {
  console.log('コメント追加リクエスト来たー');
  console.log(req.user.id);

  if (!req.user || !req.user.id) {
    return res.status(403).send({ message: 'Access forbidden for guest users' });
  }

  const { postId, content } = req.body;
  console.log('postId:', postId);
  console.log('content:', content);
  if (!postId || !content) {
    return res.status(400).send({ message: 'Post ID and content are required' });
  }

  try {
    // ユーザー情報を取得
    const userSnapshot = await db.collection('users').doc(req.user.id).get();
    const userData = userSnapshot.data();
    console.log('userData:', userData);

    // 新しいコメントを作成
    const newComment = new Comment({
      postId,
      uid: req.user.id,
      username: userData.username,
      profileImageUrl: userData.profileImageUrl,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await newComment.save();
    const commentId = newComment.commentId;

    // Postモデルの comments 配列に新しいコメントIDを追加
    const postRef = db.collection('posts').doc(postId);
    await postRef.update({
      comments: admin.firestore.FieldValue.arrayUnion(commentId)
    });

    res.status(201).json(newComment.toJson());
  } catch (error) {
    console.error('コメントの追加に失敗しました:', error);
    res.status(500).send({ message: 'コメントの追加に失敗しました' });
  }
});

// 特定のPostに紐づくコメントを取得
router.get('/comments/:postId', verifyJwtToken, async (req, res) => {
  console.log('コメントのfetchリクエスト来た');

  if (!req.user || !req.user.id) {
      return res.status(403).send({ message: 'Access forbidden for guest users' });
  }

  const postId = req.params.postId;
  console.log('postId:', postId);
  try {
      const commentsSnapshot = await db.collection('comments').where('postId', '==', postId).get();

      const comments = commentsSnapshot.empty ? [] : commentsSnapshot.docs.map(doc => {
          let comment = doc.data();
          comment.createdAt = comment.createdAt.toDate();
          comment.updatedAt = comment.updatedAt.toDate();
          console.log('コメント:', comment);
          return comment;
      });
      res.status(200).json({ comments: comments });
  } catch (error) {
      console.error('コメントの取得に失敗しました:', error);
      res.status(500).send({ message: 'コメントの取得に失敗しました' });
  }
});

// 添削の追加エンドポイント
router.post('/corrections', verifyJwtToken, async (req, res) => {
  console.log('添削追加リクエスト来たー');
  if (!req.user || !req.user.id) {
    return res.status(403).send({ message: 'Access forbidden for guest users' });
  }

  const { postId, content } = req.body;
  if (!postId || !content) {
    return res.status(400).send({ message: 'Post ID and content are required' });
  }

  try {
    // ユーザー情報を取得
    const userSnapshot = await db.collection('users').doc(req.user.id).get();
    const userData = userSnapshot.data();

    // 新しい添削を作成
    const newCorrection = new Correction({
      postId,
      uid: req.user.id,
      username: userData.username,
      profileImageUrl: userData.profileImageUrl,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newCorrection.save();
    const correctionId = newCorrection.correctionId;

    // Postモデルのrevisions配列に新しいコメントIDを追加
    const postRef = db.collection('posts').doc(postId);
    await postRef.update({
      revisions: admin.firestore.FieldValue.arrayUnion(correctionId)
    });

    res.status(201).json(newCorrection.toJson());
  } catch (error) {
    console.error('添削の追加に失敗しました:', error);
    res.status(500).send({ message: '添削の追加に失敗しました' });
  }
});

// 特定のPostに紐づく添削を取得
router.get('/corrections/:postId', verifyJwtToken, async (req, res) => {
  console.log('添削のfetchリクエスト来た');

  if (!req.user || !req.user.id) {
      return res.status(403).send({ message: 'Access forbidden for guest users' });
  }

  const postId = req.params.postId;
  console.log('postId:', postId);
  try {
    const correctionsSnapshot = await db.collection('corrections').where('postId', '==', postId).get();

    const corrections = correctionsSnapshot.empty ? [] : correctionsSnapshot.docs.map(doc => {
        let correction = doc.data();
        correction.createdAt = correction.createdAt.toDate();
        correction.updatedAt = correction.updatedAt.toDate();
        console.log('添削:', correction);
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
  console.log('EditMeページへの最終訪問日をアップデートリクエスト来た');

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
  console.log('Post削除リクエストが来た');

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
  console.log('辞書登録リクエスト来たー');

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
