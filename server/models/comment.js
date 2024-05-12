const { db, admin } = require('../firebaseAdmin');

class Comment {
  constructor({ commentId, postId, uid, username, content, createdAt, updatedAt, profileImageUrl }) {
    this.commentId = commentId;
    this.postId = postId;
    this.uid = uid;
    this.username = username || '';
    this.profileImageUrl = profileImageUrl || '';
    this.content = content;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  // コメントデータを新規追加または更新
  async save() {
    const commentData = this.toJson();
    if (this.commentId) { // コメントIDが存在する場合は更新
      await db.collection('comments').doc(this.commentId).update(commentData);
    } else { // 新規作成
      const docRef = await db.collection('comments').add(commentData);
      this.commentId = docRef.id;  // 新規作成した場合、IDをクラスにセット
    }
  }

  // コメントをFirestoreから削除
  async deleteComment() {
    try {
      await db.collection('comments').doc(this.commentId).delete();
    } catch (error) {
      console.error('コメントの削除中にエラーが発生しました:', error);
    }
  }

  // FirestoreのDocumentSnapshotからCommentインスタンスを生成
  static fromFirestore(doc) {
    const data = doc.data();
    return new Comment({
      commentId: doc.id,
      postId: data.postId,
      uid: data.uid,
      username: data.username,
      profileImageUrl: data.profileImageUrl,
      content: data.content,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    });
  }

  // Firestore用にデータをシリアライズ
  toJson() {
    let serializedData = {
      postId: this.postId,
      uid: this.uid,
      username: this.username,
      profileImageUrl: this.profileImageUrl,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
    // commentId が存在する場合のみ serializedData に追加
    if (this.commentId) {
      serializedData.commentId = this.commentId;
    }
    return serializedData;
  }
}

module.exports = Comment;