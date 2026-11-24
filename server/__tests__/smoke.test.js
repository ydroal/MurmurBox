import { describe, it, expect, beforeEach } from 'vitest';
import { api, authCookie, clearFirestore, seedUser, seedPost } from './helpers.js';

beforeEach(clearFirestore);

describe('smoke', () => {
  it('returns 403 for guests on a protected endpoint', async () => {
    const res = await api().get('/api/my-posts');
    expect(res.status).toBe(403);
  });

  it('lists own posts through the emulator', async () => {
    await seedUser('alice');
    await seedPost('alice');
    const res = await api().get('/api/my-posts').set('Cookie', authCookie('alice'));
    expect(res.status).toBe(200);
    expect(res.body.posts).toHaveLength(1);
  });
});
