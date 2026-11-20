const { db, Timestamp } = require('../firebaseAdmin');

class Post {
  constructor({ postId, uid, jpText, frText, aiText, createdAt, privacyLevel, revisionRequested, comments, revisions }) {
    this.postId = postId;
    this.uid = uid;
    this.jpText = jpText;
    this.frText = frText;
    this.aiText = aiText;
    this.createdAt = createdAt || new Date();
    this.privacyLevel = typeof privacyLevel === 'boolean' ? privacyLevel : false; // デフォルト値をfalse（public）とする
    this.revisionRequested = revisionRequested || false;
    this.comments = comments || [];
    this.revisions = revisions || [];
  }

  // Firestoreにポストデータを新規追加
  async save() {
    const docRef = await db.collection('posts').add(this.toJson());
    const postId = docRef.id;
    await docRef.update({ postId: postId }); // postIdを追加
  }

  // Postデータの削除(紐づくコメントと添削も同じ batch で削除する。失敗したら例外を上げる)
  async deletePost() {
    const [comments, corrections] = await Promise.all([
      db.collection('comments').where('postId', '==', this.postId).get(),
      db.collection('corrections').where('postId', '==', this.postId).get()
    ]);

    // batch の上限(500 件)を超える場合は分けて削除する。投稿は最後の batch で、残りのコメント・添削と一緒に削除する
    const refs = [...comments.docs, ...corrections.docs].map(doc => doc.ref);
    const BATCH_SIZE = 490;
    while (refs.length > BATCH_SIZE) {
      const batch = db.batch();
      refs.splice(0, BATCH_SIZE).forEach(ref => batch.delete(ref));
      await batch.commit();
    }
    const lastBatch = db.batch();
    refs.forEach(ref => lastBatch.delete(ref));
    lastBatch.delete(db.collection('posts').doc(this.postId));
    await lastBatch.commit();
  }

  // FirestoreのDocumentSnapshotからPostインスタンスを生成
  static fromFirestore(doc) {
    const data = doc.data();
    return new Post({
      postId: doc.id,
      uid: data.uid,
      jpText: data.jpText,
      frText: data.frText,
      aiText: data.aiText,
      createdAt: data.createdAt.toDate(),
      privacyLevel: data.privacyLevel,
      revisionRequested: data.revisionRequested,
      comments: data.comments || [],
      revisions: data.revisions || [],
    });
  }

  // Firestore用にデータをシリアライズ
  toJson() {
    let serializedData = {
      uid: this.uid,
      jpText: this.jpText,
      frText: this.frText,
      aiText: this.aiText,
      createdAt: this.createdAt instanceof Timestamp ? this.createdAt.toDate().toISOString() : this.createdAt,
      privacyLevel: this.privacyLevel,
      revisionRequested: this.revisionRequested,
      comments: this.comments,
      revisions: this.revisions,
    };
    if (this.postId) {
      serializedData.postId = this.postId;
    }
    return serializedData;
  }
}

module.exports = Post;
