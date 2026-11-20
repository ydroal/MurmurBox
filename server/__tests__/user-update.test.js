import { describe, it, expect, beforeEach } from 'vitest';
import { api, db, authCookie, clearFirestore, seedUser } from './helpers.js';

const BUCKET = process.env.FIREBASE_STORAGE_BUCKET;
const own = (uid, file = 'a.jpg?alt=media&token=t') =>
  `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/profile_images%2F${uid}%2F${file}`;

beforeEach(async () => {
  await clearFirestore();
  await seedUser('alice');
  await seedUser('bob');
});

const update = (uid, body) => api().put('/api/user/update').set('Cookie', authCookie(uid)).send(body);

describe('PUT /api/user/update', () => {
  it('updates a valid username (trimmed) and own profile image', async () => {
    const res = await update('alice', { username: '  Alice  ', profileImageUrl: own('alice') });
    expect(res.status).toBe(200);
    const doc = await db.collection('users').doc('alice').get();
    expect(doc.data().username).toBe('Alice');
    expect(doc.data().profileImageUrl).toBe(own('alice'));
  });

  it('keeps current values when nothing is sent', async () => {
    const res = await update('alice', {});
    expect(res.status).toBe(200);
    expect((await db.collection('users').doc('alice').get()).data().username).toBe('user-alice');
  });

  it('returns 403 for guests', async () => {
    expect((await api().put('/api/user/update').send({ username: 'x' })).status).toBe(403);
  });

  it.each([[''], ['   '], ['a'.repeat(31)], [123], [null]])('returns 400 for username %j', async username => {
    const res = await update('alice', { username });
    expect(res.status).toBe(400);
    expect((await db.collection('users').doc('alice').get()).data().username).toBe('user-alice');
  });

  it('accepts a username of exactly 30 characters', async () => {
    expect((await update('alice', { username: 'a'.repeat(30) })).status).toBe(200);
  });

  it.each([
    ['an external URL', 'https://evil.example.com/track.png'],
    ['another bucket', 'https://firebasestorage.googleapis.com/v0/b/other-bucket/o/profile_images%2Falice%2Fa.jpg'],
    ['another user folder', own('bob')],
    ['a different folder', `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/other%2Falice%2Fa.jpg`],
    ['only the prefix', own('alice', '')],
    ['a javascript URL', 'javascript:alert(1)'],
    ['a non-string', { url: 1 }]
  ])('returns 400 for profileImageUrl: %s', async (_name, profileImageUrl) => {
    const res = await update('alice', { profileImageUrl });
    expect(res.status).toBe(400);
    expect((await db.collection('users').doc('alice').get()).data().profileImageUrl).toBe('');
  });
});
