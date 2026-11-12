import { vi } from 'vitest';

// Never initialize the real Firebase SDK in tests (no API key needed)
vi.mock('@/firebase', () => ({
  auth: { currentUser: null },
  signOut: vi.fn(() => Promise.resolve())
}));
