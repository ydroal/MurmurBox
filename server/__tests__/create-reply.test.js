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
});

describe.each([
  { path: '/api/comments', collection: 'comments', field: 'comments', idKey: 'commentId' },
  { path: '/api/corrections', collection: 'corrections', field: 'revisions', idKey: 'correctionId' }
])('POST $path', ({ path, collection, field, idKey }) => {
  const post = (uid, body) => {
    const req = api().post(path);
    return (uid ? req.set('Cookie', authCookie(uid)) : req).send(body);
  };
  const count = async () => (await db.collection(collection).get()).size;

  it('creates the document and links it to the post in one step', async () => {
    const res = await post('bob', { postId: publicPostId, content: '  hello  ' });
    expect(res.status).toBe(201);
    expect(res.body.content).toBe('hello');
    expect(res.body[idKey]).toBeTruthy();
    const postDoc = await db.collection('posts').doc(publicPostId).get();
    expect(postDoc.data()[field]).toEqual([res.body[idKey]]);
    expect(await count()).toBe(1);
  });

  it('lets the owner write on their own private post', async () => {
    const res = await post('alice', { postId: privatePostId, content: 'note' });
    expect(res.status).toBe(201);
  });

  it('returns 403 for guests (not 500)', async () => {
    const res = await post(null, { postId: publicPostId, content: 'x' });
    expect(res.status).toBe(403);
  });

  it('returns 404 for a private post when not the owner', async () => {
    const res = await post('bob', { postId: privatePostId, content: 'x' });
    expect(res.status).toBe(404);
    expect(await count()).toBe(0);
  });

  it('returns 404 for a post that does not exist', async () => {
    const res = await post('bob', { postId: 'nope', content: 'x' });
    expect(res.status).toBe(404);
    expect(await count()).toBe(0);
  });

  it.each([[''], ['   '], [null], [123], ['a'.repeat(2001)]])('returns 400 for invalid content %j', async content => {
    const res = await post('bob', { postId: publicPostId, content });
    expect(res.status).toBe(400);
    expect(await count()).toBe(0);
  });

  it('accepts content of exactly 2000 characters', async () => {
    const res = await post('bob', { postId: publicPostId, content: 'a'.repeat(2000) });
    expect(res.status).toBe(201);
  });
});
