import { describe, it, expect, beforeEach } from 'vitest';
import { api, db, authCookie, clearFirestore, seedUser, seedPost } from './helpers.js';

let postId;

beforeEach(async () => {
  await clearFirestore();
  await seedUser('alice');
  await seedUser('bob');
  postId = await seedPost('alice');
});

const update = (uid, body) =>
  api().put('/api/update-post-details').set('Cookie', authCookie(uid)).send(body);

describe('PUT /api/update-post-details', () => {
  it('updates the allowed keys for the owner', async () => {
    const res = await update('alice', { postId, updates: { privacyLevel: true, revisionRequested: true } });
    expect(res.status).toBe(200);
    const doc = await db.collection('posts').doc(postId).get();
    expect(doc.data().privacyLevel).toBe(true);
    expect(doc.data().revisionRequested).toBe(true);
  });

  it('rejects guests with 403', async () => {
    const res = await api().put('/api/update-post-details').send({ postId, updates: { privacyLevel: true } });
    expect(res.status).toBe(403);
  });

  it('returns 404 for a non-owner and does not change the post', async () => {
    const res = await update('bob', { postId, updates: { privacyLevel: true } });
    expect(res.status).toBe(404);
    const doc = await db.collection('posts').doc(postId).get();
    expect(doc.data().privacyLevel).toBe(false);
  });

  it('returns 400 when any key is not allowed', async () => {
    const res = await update('alice', { postId, updates: { privacyLevel: true, uid: 'bob' } });
    expect(res.status).toBe(400);
    const doc = await db.collection('posts').doc(postId).get();
    expect(doc.data().uid).toBe('alice');
    expect(doc.data().privacyLevel).toBe(false);
  });

  it.each([
    [{ privacyLevel: 'true' }],
    [{ revisionRequested: 1 }],
    [{}]
  ])('returns 400 for invalid values %j', async updates => {
    const res = await update('alice', { postId, updates });
    expect(res.status).toBe(400);
  });
});
