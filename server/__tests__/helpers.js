import { createRequire } from 'node:module';
import request from 'supertest';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');

// CommonJS のサーバーコードは vitest の変換を通さず、そのまま require する
export const app = require('../app');
export const { db } = require('../firebaseAdmin');

export const api = () => request(app);

// ログイン済みユーザーの Cookie を作る
export const authCookie = uid => [`jwt=${jwt.sign({ id: uid }, process.env.JWT_SECRET, { expiresIn: '1d' })}`];

// Emulator の全データを消す
export async function clearFirestore() {
  const res = await fetch(
    `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/demo-murmurbox/databases/(default)/documents`,
    { method: 'DELETE' }
  );
  if (!res.ok) throw new Error(`failed to clear emulator: ${res.status}`);
}

export async function seedUser(uid, overrides = {}) {
  await db.collection('users').doc(uid).set({
    uid,
    email: `${uid}@example.com`,
    username: `user-${uid}`,
    profileImageUrl: '',
    createdAt: new Date(),
    lastLogin: new Date(),
    lastVisitedEditMe: new Date(),
    searchKey: 'u',
    ...overrides
  });
}

export async function seedPost(uid, overrides = {}) {
  const ref = db.collection('posts').doc();
  await ref.set({
    postId: ref.id,
    uid,
    jpText: 'こんにちは',
    frText: 'Bonjour',
    aiText: 'Bonjour',
    createdAt: new Date(),
    privacyLevel: false,
    revisionRequested: false,
    comments: [],
    revisions: [],
    ...overrides
  });
  return ref.id;
}
