import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['__tests__/**/*.test.js'],
    setupFiles: ['./__tests__/setup.js'],
    // Firestore Emulator を共有するので、ファイルは直列に実行する
    fileParallelism: false
  }
});
