// routes.js などを読み込む前に、テスト用の環境変数を用意する
import { generateKeyPairSync } from 'node:crypto';

const { privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' }
});

process.env.FIREBASE_ADMIN_KEY_JSON = JSON.stringify({
  type: 'service_account',
  project_id: 'demo-murmurbox',
  private_key: privateKey,
  client_email: 'test@demo-murmurbox.iam.gserviceaccount.com'
});
process.env.JWT_SECRET = 'test-secret';
process.env.DEEPL_API_KEY = 'test-key';
process.env.NODE_ENV = 'test';
