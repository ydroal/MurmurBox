import { describe, it, expect, beforeEach } from 'vitest';
import { api, authCookie, clearFirestore, seedUser, seedPost } from './helpers.js';

beforeEach(async () => {
  await clearFirestore();
  await seedUser('alice');
  await seedUser('bob');
  await seedPost('alice', { privacyLevel: true });
});

describe('GET /api/posts', () => {
  it('no longer exists (it returned private posts)', async () => {
    const res = await api().get('/api/posts').set('Cookie', authCookie('bob'));
    expect(res.status).toBe(404);
  });
});
