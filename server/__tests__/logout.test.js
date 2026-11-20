import { describe, it, expect } from 'vitest';
import { api } from './helpers.js';

describe('POST /api/auth/logout', () => {
  it('clears the jwt cookie with the same options used when it was set', async () => {
    const res = await api().post('/api/auth/logout');
    expect(res.status).toBe(200);
    const cookie = res.headers['set-cookie'].find(c => c.startsWith('jwt='));
    expect(cookie).toMatch(/^jwt=;/);
    expect(cookie).toMatch(/Expires=Thu, 01 Jan 1970/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Strict/);
    expect(cookie).toMatch(/Path=\//);
  });
});
