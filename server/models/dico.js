const { db, admin } = require('../firebaseAdmin');

class Dico {
  constructor({ dicoid, uid, term, definition, createdAt, alphabet }) {
    this.dicoid = dicoid;
    this.uid = uid;
    this.term = term;
    this.definition = definition;
    this.createdAt = createdAt || new Date();
    this.alphabet = alphabet;
  }

  // FirestoreにDicoデータを新規追加
  async save() {
    const docRef = await db.collection('dico').add(this.toJson());
    const dicoid = docRef.id;
    await docRef.update({ dicoid: dicoid });
  }

  async deleteDico() {
      try {
        await db.collection('dico').doc(this.dicoid).delete();
      } catch (error) {
        console.error('辞書データの削除中にエラーが発生しました:', error);
      }
  }

  // FirestoreのDocumentSnapshotからDicoインスタンスを生成
  static fromFirestore(doc) {
    const data = doc.data();
    return new Dico({
      dicoid: doc.id,
      uid: data.uid,
      term: data.term,
      definition: data.definition,
      createdAt: data.createdAt.toDate(),
      alphabet: data.alphabet,
    });
  }

  // Firestore用にデータをシリアライズ
  toJson() {
    let serializedData = {
      uid: this.uid,
      term: this.term,
      definition: this.definition,
      createdAt: this.createdAt instanceof admin.firestore.Timestamp ? this.createdAt.toDate().toISOString() : this.createdAt,
      alphabet: this.alphabet,
    };
    if (this.dicoid) {
      serializedData.dicoid = this.dicoid;
    }
    return serializedData;
  }
}

module.exports = Dico;
