const { db } = require('../firebaseAdmin');

class User {
  constructor({ uid, email, username, profileImageUrl, createdAt, lastLogin, lastVisitedEditMe }) {
    this.uid = uid;
    this.email = email;
    this.username = username;
    this.profileImageUrl = profileImageUrl;
    this.createdAt = createdAt || new Date();
    this.lastLogin = lastLogin || new Date();
    this.lastVisitedEditMe = lastVisitedEditMe || new Date();
    // ユーザー名の先頭1文字を小文字で`searchKey`に格納
    this.searchKey = username ? username.charAt(0).toLowerCase() : '';
  }

  // Firestoreにユーザー情報を保存
  async save() {
    await db.collection('users').doc(this.uid).set(this.toJson());
  }

  // FirestoreのDocumentSnapshotからUserインスタンスを生成
  static fromFirestore(doc) {
    const data = doc.data();
    return new User({
      uid: doc.id,
      email: data.email,
      username: data.username,
      profileImageUrl: data.profileImageUrl,
      createdAt: data.createdAt.toDate(),
      lastLogin: data.lastLogin.toDate(),
      lastVisitedEditMe: data.lastVisitedEditMe ? data.lastVisitedEditMe.toDate() : null,
      searchKey: data.searchKey || '',
    });
  }

  // Firestore用にデータをシリアライズ
  toJson() {
    return {
      uid: this.uid,
      email: this.email,
      username: this.username,
      profileImageUrl: this.profileImageUrl,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin,
      lastVisitedEditMe: this.lastVisitedEditMe,
      searchKey: this.searchKey,
    };
  }
}

module.exports = User;