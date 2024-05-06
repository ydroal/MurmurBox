const { db } = require('../firebaseAdmin');

class User {
  constructor({ uid, email, username, profileImageUrl, createdAt, lastLogin }) {
    this.uid = uid;
    this.email = email;
    this.username = username;
    this.profileImageUrl = profileImageUrl;
    this.createdAt = createdAt || new Date();
    this.lastLogin = lastLogin || new Date();
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
      searchKey: data.searchKey || '',
    });
  }

  // Firestore用にデータをシリアライズ
  toJson() {
    return {
      email: this.email,
      username: this.username,
      profileImageUrl: this.profileImageUrl,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin,
      searchKey: this.searchKey,
    };
  }
}

module.exports = User;