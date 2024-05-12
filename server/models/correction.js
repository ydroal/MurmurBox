const { db, admin } = require('../firebaseAdmin');

class Correction {
  constructor({ correctionId, postId, uid, username, content, createdAt, updatedAt, profileImageUrl }) {
    this.correctionId = correctionId;
    this.postId = postId;
    this.uid = uid;
    this.username = username || '';
    this.content = content;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.profileImageUrl = profileImageUrl || '';
  }

  async save() {
    const correctionData = this.toJson();
    if (this.correctionId) {
      await db.collection('corrections').doc(this.correctionId).update(correctionData);
    } else {
      const docRef = await db.collection('corrections').add(correctionData);
      this.correctionId = docRef.id; // 新規作成した場合、IDをクラスにセット
    }
  }

  // FirestoreのDocumentSnapshotからCorrectionインスタンスを生成
  static fromFirestore(doc) {
    const data = doc.data();
    return new Correction({
      correctionId: doc.id,
      postId: data.postId,
      uid: data.uid,
      username: data.username,
      content: data.content, // 添削内容のみを保持
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      profileImageUrl: data.profileImageUrl,
    });
  }

  toJson() {
    let serializedData = {
      postId: this.postId,
      uid: this.uid,
      username: this.username,
      content: this.content,
      createdAt: this.createdAt instanceof admin.firestore.Timestamp ? this.createdAt.toDate().toISOString() : this.createdAt,
      updatedAt: this.updatedAt instanceof admin.firestore.Timestamp ? this.updatedAt.toDate().toISOString() : this.updatedAt,
      profileImageUrl: this.profileImageUrl,
    };
    if (this.correctionId) {
      serializedData.correctionId = this.correctionId;
    }
    return serializedData;
  }
}

module.exports = Correction;
