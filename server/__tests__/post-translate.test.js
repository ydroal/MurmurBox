import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRequire } from 'node:module';
import { api, db, authCookie, clearFirestore, seedUser } from './helpers.js';

const require = createRequire(import.meta.url);
const deepl = require('deepl-node');
const clientIp = require('../clientIp');

let translate;
let currentIp;

beforeEach(async () => {
  await clearFirestore();
  await seedUser('alice');
  currentIp = '203.0.113.1';
  translate = vi.spyOn(deepl.Translator.prototype, 'translateText').mockResolvedValue({ text: 'traduit' });
  vi.spyOn(clientIp, 'getClientIp').mockImplementation(() => currentIp);
});

afterEach(() => vi.restoreAllMocks());

const body = (overrides = {}) => ({ jpText: 'こんにちは', frText: 'Bonjour', privacyLevel: false, revisionRequested: false, ...overrides });
const guestPost = payload => api().post('/api/post').send(payload);
const userPost = (uid, payload) => api().post('/api/post').set('Cookie', authCookie(uid)).send(payload);

describe('POST /api/post as a guest', () => {
  it('translates without saving', async () => {
    const res = await guestPost(body());
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ frText: 'Bonjour', aiText: 'traduit' });
    expect((await db.collection('posts').get()).size).toBe(0);
  });

  it('returns 429 on the 6th request from the same IP within an hour', async () => {
    for (let i = 0; i < 5; i++) expect((await guestPost(body())).status).toBe(200);
    const res = await guestPost(body());
    expect(res.status).toBe(429);
    expect(translate).toHaveBeenCalledTimes(5);
  });

  it('does not limit a different IP', async () => {
    for (let i = 0; i < 5; i++) await guestPost(body());
    currentIp = '203.0.113.2';
    expect((await guestPost(body())).status).toBe(200);
  });

  it('returns 429 when all guests together exceed 10,000 characters a day', async () => {
    const text = 'あ'.repeat(2000);
    for (let i = 0; i < 5; i++) {
      currentIp = `203.0.113.${10 + i}`;
      expect((await guestPost(body({ jpText: text }))).status).toBe(200);
    }
    currentIp = '203.0.113.99';
    const res = await guestPost(body({ jpText: 'あ' }));
    expect(res.status).toBe(429);
  });

  it('stores only a hash of the IP', async () => {
    await guestPost(body());
    const ids = (await db.collection('quotas').get()).docs.map(d => d.id);
    expect(ids.some(id => id.startsWith('guest_'))).toBe(true);
    expect(ids.some(id => id.startsWith('ip_') && !id.includes('203.0.113.1'))).toBe(true);
  });

  it('rejects the request when the IP is unknown', async () => {
    currentIp = null;
    const res = await guestPost(body());
    expect(res.status).toBe(403);
    expect(translate).not.toHaveBeenCalled();
  });

  it('ignores a forged X-Forwarded-For header', async () => {
    const real = vi.mocked(clientIp.getClientIp);
    real.mockRestore();
    for (let i = 0; i < 5; i++) await api().post('/api/post').set('X-Forwarded-For', `1.2.3.${i}`).send(body());
    const res = await api().post('/api/post').set('X-Forwarded-For', '9.9.9.9').send(body());
    expect(res.status).toBe(429);
  });
});

describe('POST /api/post input limits', () => {
  it.each([
    ['jpText too long', { jpText: 'あ'.repeat(2001) }],
    ['frText too long', { frText: 'a'.repeat(2001) }],
    ['jpText empty', { jpText: '   ' }],
    ['jpText not a string', { jpText: 123 }],
    ['frText not a string', { frText: {} }]
  ])('returns 400 for a guest: %s', async (_name, override) => {
    expect((await guestPost(body(override))).status).toBe(400);
    expect(translate).not.toHaveBeenCalled();
  });

  it('returns 400 for a logged-in user too', async () => {
    expect((await userPost('alice', body({ jpText: 'あ'.repeat(2001) }))).status).toBe(400);
  });
});

describe('POST /api/post as a logged-in user', () => {
  it('saves the post and is not rate limited', async () => {
    for (let i = 0; i < 7; i++) expect((await userPost('alice', body())).status).toBe(200);
    expect((await db.collection('posts').get()).size).toBe(7);
  });
});
