import { describe, it, expect, beforeEach } from 'vitest';
import { api, db, authCookie, clearFirestore, seedUser, seedPost } from './helpers.js';

let privatePostId;
let publicPostId;

beforeEach(async () => {
  await clearFirestore();
  await seedUser('alice');
  await seedUser('bob');
  privatePostId = await seedPost('alice', { privacyLevel: true });
  publicPostId = await seedPost('alice', { privacyLevel: false });
  for (const postId of [privatePostId, publicPostId]) {
    const now = new Date();
    await db.collection('comments').add({ postId, uid: 'alice', username: 'a', content: 'c', createdAt: now, updatedAt: now });
    await db.collection('corrections').add({ postId, uid: 'alice', username: 'a', content: 'c', createdAt: now, updatedAt: now });
  }
});

const get = (path, uid) => {
  const req = api().get(path);
  return uid ? req.set('Cookie', authCookie(uid)) : req;
};

describe.each([
  ['/api/post-details'],
  ['/api/comments'],
  ['/api/corrections']
])('GET %s/:postId', base => {
  it('returns 403 for guests', async () => {
    expect((await get(`${base}/${publicPostId}`)).status).toBe(403);
  });

  it('returns 404 for a private post when the viewer is not the owner', async () => {
    expect((await get(`${base}/${privatePostId}`, 'bob')).status).toBe(404);
  });

  it('returns the private post to its owner', async () => {
    expect((await get(`${base}/${privatePostId}`, 'alice')).status).toBe(200);
  });

  it('returns a public post to other users', async () => {
    expect((await get(`${base}/${publicPostId}`, 'bob')).status).toBe(200);
  });

  it('returns 404 for a post that does not exist', async () => {
    expect((await get(`${base}/nope`, 'bob')).status).toBe(404);
  });
});

describe('GET /api/post-details/:postId', () => {
  it('returns createdAt as an ISO string', async () => {
    const res = await get(`/api/post-details/${publicPostId}`, 'bob');
    expect(new Date(res.body.createdAt).toISOString()).toBe(res.body.createdAt);
  });
});
