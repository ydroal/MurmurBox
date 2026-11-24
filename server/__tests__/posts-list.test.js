import { describe, it, expect, beforeEach } from 'vitest';
import { api, db, authCookie, clearFirestore, seedUser, seedPost } from './helpers.js';

beforeEach(async () => {
  await clearFirestore();
  await seedUser('alice');
});

describe('GET /api/posts-with-details', () => {
  it('returns 200 with an empty array when there are no public posts', async () => {
    const res = await api().get('/api/posts-with-details').set('Cookie', authCookie('alice'));
    expect(res.status).toBe(200);
    expect(res.body.posts).toEqual([]);
  });

  it('does not list private posts', async () => {
    await seedPost('alice', { privacyLevel: true });
    const res = await api().get('/api/posts-with-details').set('Cookie', authCookie('alice'));
    expect(res.body.posts).toEqual([]);
  });

  it('still returns posts whose author no longer exists', async () => {
    await seedPost('alice');
    await seedPost('ghost');
    const res = await api().get('/api/posts-with-details').set('Cookie', authCookie('alice'));
    expect(res.status).toBe(200);
    expect(res.body.posts).toHaveLength(2);
    const ghost = res.body.posts.find(p => p.uid === 'ghost');
    expect(ghost.username).toBe('退会したユーザー');
    expect(ghost.profileImageUrl).toBe('');
  });
});

describe('GET /api/post-details/:postId', () => {
  it('returns the post even when the author no longer exists', async () => {
    const postId = await seedPost('ghost');
    const res = await api().get(`/api/post-details/${postId}`).set('Cookie', authCookie('alice'));
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('退会したユーザー');
  });
});

describe('DELETE /api/delete-post/:postId', () => {
  const del = (uid, postId) => api().delete(`/api/delete-post/${postId}`).set('Cookie', authCookie(uid));

  it('deletes the post together with its comments and corrections', async () => {
    const postId = await seedPost('alice');
    const other = await seedPost('alice');
    const now = new Date();
    for (const [col, id] of [['comments', postId], ['corrections', postId], ['comments', other]]) {
      await db.collection(col).add({ postId: id, uid: 'alice', content: 'c', createdAt: now, updatedAt: now });
    }
    const res = await del('alice', postId);
    expect(res.status).toBe(200);
    expect((await db.collection('posts').doc(postId).get()).exists).toBe(false);
    expect((await db.collection('comments').where('postId', '==', postId).get()).size).toBe(0);
    expect((await db.collection('corrections').where('postId', '==', postId).get()).size).toBe(0);
    // 他の投稿のコメントは残る
    expect((await db.collection('comments').where('postId', '==', other).get()).size).toBe(1);
  });

  it('returns 403 for a non-owner and keeps everything', async () => {
    const postId = await seedPost('alice');
    await seedUser('bob');
    expect((await del('bob', postId)).status).toBe(403);
    expect((await db.collection('posts').doc(postId).get()).exists).toBe(true);
  });
});
