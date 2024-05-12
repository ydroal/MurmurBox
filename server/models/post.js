const { db, admin } = require('../firebaseAdmin');

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

  // Postデータの削除
  async deletePost() {
      try {
        await db.collection('posts').doc(this.postId).delete();
      } catch (error) {
        console.error('投稿の削除中にエラーが発生しました:', error);
      }
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
      createdAt: this.createdAt instanceof admin.firestore.Timestamp ? this.createdAt.toDate().toISOString() : this.createdAt,
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
