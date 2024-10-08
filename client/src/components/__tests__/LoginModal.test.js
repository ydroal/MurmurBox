import { mount, flushPromises } from '@vue/test-utils'; // コンポーネントを仮想DOMにレンダリング
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import axiosInstance from '@/axios.js';
import { useLoginModalStore } from '@/stores/loginModal';
import { useUserStore } from '@/stores/user';
import { usePostsStore } from '@/stores/posts';
import LoginModal from '@/components/LoginModal.vue';

vi.mock('axios', () => ({
  __esModule: true,
  default: {
    post: vi.fn()
  }
}));

vi.mock('@/axios.js', () => {
  const axiosInstance = {
    get: vi.fn(),
    post: vi.fn()
  };

  return {
    __esModule: true,
    default: axiosInstance
  };
});

vi.mock('firebase/auth', () => ({
  __esModule: true,
  getAuth: vi.fn(() => ({
    currentUser: { uid: '123' }
  })),
  GoogleAuthProvider: vi.fn(() => ({
    setCustomParameters: vi.fn()
  })),
  signInWithPopup: vi.fn(() => {
    return Promise.resolve({
      user: {
        getIdToken: vi.fn().mockResolvedValue('dummy-token')
      }
    });
  })
}));

const dummyPosts = [
  {
    aiText: 'aitext',
    frText: 'frtext',
    jpText: 'jptext',
    postId: 'post_id',
    privacyLevel: true,
    revisionRequested: true,
    username: 'Alex',
    profileImageUrl: 'example.com',
    commentCount: 0,
    correctionCount: 0,
    createdAt: 'created_at'
  }
];

describe('LoginModal.vue Tests', () => {
  let wrapper;
  // let auth;

  beforeEach(() => {
    setActivePinia(createPinia());
    // auth = getAuth();
    wrapper = mount(LoginModal);
    vi.spyOn(console, 'error');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering Tests', () => {
    it('should render login button', () => {
      expect(wrapper.text()).toContain('Sign in with Google');
    });
    it('closes the modal when close button is clicked', async () => {
      const loginButton = wrapper.find('button');
      const loginModalStore = useLoginModalStore();
      const spy = vi.spyOn(loginModalStore, 'closeModal');
      await loginButton.trigger('click');
      expect(spy).toHaveBeenCalled();
    });
  });

  // APIリクエストのテスト
  describe('API Interaction Tests', () => {
    // signInWithPopupが呼ばれたか
    it('should call signInWithPopup when Google sign-in button is clicked', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          user: { id: 'user123', name: 'Test User' }
        }
      });

      const loginButton = wrapper.find('.gsi-material-button');
      await loginButton.trigger('click');
      await flushPromises(); // すべての非同期処理が完了するまで待機
      expect(signInWithPopup).toHaveBeenCalled();
      expect(signInWithPopup).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
    });

    // Google IDトークンが返ってくるか
    it('should return a Google ID token', async () => {
      const loginButton = wrapper.find('.gsi-material-button');
      await loginButton.trigger('click');
      expect(signInWithPopup).toHaveBeenCalled();
      const result = await signInWithPopup();
      const token = await result.user.getIdToken();
      expect(token).toBe('dummy-token');
    });

    // 認証失敗時にエラーが表示されるか
    it('should log error when Google authentication fails', async () => {
      signInWithPopup.mockRejectedValueOnce(new Error('Google認証エラー'));
      const loginButton = wrapper.find('.gsi-material-button');
      await loginButton.trigger('click');
      expect(console.error).toHaveBeenCalledWith('Google認証エラー:', expect.any(Error));
    });

    // ポストデータのフェッチテスト
    it('should fetch post data after login', async () => {
      // axios.post のモックを設定
      axios.post.mockResolvedValueOnce({
        data: {
          user: { id: 'user123', name: 'Test User' }
        }
      });
      axiosInstance.get.mockResolvedValueOnce({ data: { posts: dummyPosts } }); // モックの設定（返り値を設定）
      const loginButton = wrapper.find('.gsi-material-button');
      await loginButton.trigger('click');
      await flushPromises();
      expect(axiosInstance.get).toHaveBeenCalledWith('/posts-with-details');
    });

    // ポストデータのフェッチが失敗した場合のテスト
    it('should handle error during post fetch', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          user: { id: 'user123', name: 'Test User' }
        }
      });
      axiosInstance.get.mockRejectedValueOnce(new Error('Network Error')); // リクエストが失敗するようにモック
      const loginButton = wrapper.find('.gsi-material-button');
      await loginButton.trigger('click');
      await flushPromises();
      expect(console.error).toHaveBeenCalledWith('Failed to fetch posts with users:', expect.any(Error));
    });
  });

  // 状態管理テスト
  describe('State Tests', () => {
    //userステートにユーザー情報が保存されるか
    it('should update user store on login', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          user: { id: 'user123', name: 'Test User' }
        }
      });
      const loginButton = wrapper.find('.gsi-material-button');
      await loginButton.trigger('click');
      await flushPromises();
      // ストアが更新されているか確認
      const userStore = useUserStore();
      expect(userStore.user).toBeTruthy();
    });
    //postsステートにユーザー情報が保存されるか
    it('should update posts store after login', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          user: { id: 'user123', name: 'Test User' }
        }
      });
      axiosInstance.get.mockResolvedValueOnce({ data: { posts: dummyPosts } });
      const loginButton = wrapper.find('.gsi-material-button');
      await loginButton.trigger('click');
      await flushPromises();
      const postsStore = usePostsStore();
      // ストアが更新されているか確認
      expect(postsStore.isLoading).toStrictEqual(false);
      expect(postsStore.posts).toEqual(dummyPosts);
    });
  });
});
