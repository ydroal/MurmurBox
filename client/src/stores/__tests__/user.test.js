// すべての vi.mock 呼び出しをファイルの先頭に配置
vi.mock('@/axios');

vi.mock('firebase/auth', () => ({
  __esModule: true,
  getAuth: vi.fn(() => ({
    currentUser: { uid: 'user123' },
  })),
  signOut: vi.fn(() => Promise.resolve()), // signOutをPromise.resolveでモック
}));

vi.mock('@/stores/posts', () => {
  const mockPostsStore = {
    resetPostState: vi.fn()
  };
  return {
    usePostsStore: () => mockPostsStore
  };
});

// 必要なモジュールをインポート
import { flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useUserStore } from '@/stores/user';
import axiosInstance from '@/axios';
import { auth, signOut } from '@/firebase';
import { usePostsStore } from '@/stores/posts'; // モックされた usePostsStore をインポート

describe('User Store Tests', () => {
  let userStore;
  let mockPostsStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    userStore = useUserStore();
    vi.spyOn(console, 'error');

    // モックされた posts ストアを取得
    mockPostsStore = usePostsStore();

    // モックをリセット
    vi.clearAllMocks();
  });

  it('should initialize with the correct default state', () => {
    expect(userStore.user).toBe(null);
    expect(userStore.redirectAfterLogin).toBe(null);
    expect(userStore.lastVisitedEditMe).toBe(null);
    expect(userStore.isInitialized).toBe(false);
  });

  // ユーザー情報を取得して状態を更新できるか
  it('should fetch user info from token and update state', async () => {
    const mockUserData = {
      user: {
        id: 'user123',
        name: 'Test User',
        lastVisitedEditMe: '2024-09-30T12:00:00Z'
      }
    };
    axiosInstance.get.mockResolvedValueOnce({ data: mockUserData });

    await userStore.checkUserFromToken();

    expect(axiosInstance.get).toHaveBeenCalledWith('/user/info');
    expect(userStore.user).toEqual(mockUserData.user);
    expect(userStore.lastVisitedEditMe).toEqual(new Date('2024-09-30T12:00:00Z'));
    expect(userStore.isInitialized).toBe(true);
  });
  // ユーザー情報取得に失敗した場合
  it('should handle error during user info fetch', async () => {
    axiosInstance.get.mockRejectedValueOnce(new Error('Network error'));

    await userStore.checkUserFromToken();

    expect(userStore.user).toBe(null);
    expect(userStore.isInitialized).toBe(true);
    expect(console.error).toHaveBeenCalledWith('Failed to fetch user info:', expect.any(Error));
  });

  it('should log out user and reset the state', async () => {
    await userStore.logout();
    await flushPromises();
    expect(signOut).toHaveBeenCalledWith(auth);
    expect(userStore.user).toBe(null);
    expect(mockPostsStore.resetPostState).toHaveBeenCalled();
  });

  it('should update last visited edit me and user state', async () => {
    const mockUserData = {
      user: {
        id: 'user123',
        name: 'Test User',
        lastVisitedEditMe: '2024-10-01T12:00:00Z'
      }
    };
    axiosInstance.put.mockResolvedValueOnce({ data: mockUserData });

    await userStore.updateLastVisitedEditMe();

    expect(axiosInstance.put).toHaveBeenCalledWith('/user/last-visit-editme');
    expect(userStore.lastVisitedEditMe).toEqual(new Date('2024-10-01T12:00:00Z'));
    expect(userStore.user).toEqual(mockUserData.user);
  });
});
