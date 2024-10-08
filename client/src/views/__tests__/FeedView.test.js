import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FeedView from '@/views/FeedView.vue';

const mockFetchPostsWithDetail = vi.fn();
const mockPostsStore = {
  allPosts: [
    {
      postId: 1,
      username: 'Test User',
      profileImageUrl: null,
      createdAt: '2023-01-01T00:00:00Z',
      jpText: 'こんにちは',
      frText: 'Bonjour',
      commentCount: 2,
      correctionCount: 1,
      revisionRequested: true
    }
  ],
  fetchPostsWithDetail: mockFetchPostsWithDetail
};

vi.mock('@/stores/posts', () => ({
  usePostsStore: vi.fn(() => mockPostsStore)
}));

const mockUserStore = {
  isLoggedIn: true
};

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => mockUserStore)
}));

const mockLoginModalStore = {
  openModal: vi.fn()
};

vi.mock('@/stores/loginModal', () => ({
  useLoginModalStore: vi.fn(() => mockLoginModalStore)
}));

vi.mock('@/axios.js', () => ({
  default: {
    get: vi.fn(url => {
      if (url.includes('/comments/')) {
        return Promise.resolve({
          data: {
            comments: [
              {
                commentId: 1,
                username: 'testuser',
                content: 'Nice post!',
                profileImageUrl: null,
                createdAt: '2023-01-01T01:00:00Z'
              }
            ]
          }
        });
      } else if (url.includes('/corrections/')) {
        return Promise.resolve({
          data: {
            corrections: [
              {
                correctionId: 1,
                username: 'Corrector 1',
                content: 'Correction suggestion',
                profileImageUrl: null,
                createdAt: '2023-01-01T02:00:00Z'
              }
            ]
          }
        });
      }
      return Promise.reject(new Error('Not Found'));
    }),
    post: vi.fn(() => Promise.resolve())
  }
}));

//コンポーネントをマウントするヘルパー関数
const mountComponent = () => {
  return mount(FeedView);
};

describe('FeedView.vue Tests', () => {
  let wrapper;

  beforeEach(() => {
    vi.clearAllMocks();

    // リセットmockPostsStoreの状態
    mockPostsStore.allPosts = [
      {
        postId: 1,
        username: 'Test User',
        profileImageUrl: null,
        createdAt: '2023-01-01T00:00:00Z',
        jpText: 'こんにちは',
        frText: 'Bonjour',
        commentCount: 2,
        correctionCount: 1,
        revisionRequested: true
      }
    ];

    // ユーザーがログインしている状態にリセット
    mockUserStore.isLoggedIn = true;

    // loginModalStore のモックをクリア
    mockLoginModalStore.openModal.mockClear();

    // コンポーネントをマウント
    wrapper = mountComponent();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display all posts', () => {
    const posts = wrapper.findAll('.w-full.mb-4');
    expect(posts.length).toBe(1);
    expect(posts[0].find('.font-bold').text()).toBe('Test User');

    const jpTextElement = posts[0].find('[data-testid="jp_post"]');
    expect(jpTextElement.exists()).toBe(true);
    expect(jpTextElement.text()).toContain('こんにちは');

    const frTextElement = posts[0].find('[data-testid="fr_post"]');
    expect(frTextElement.exists()).toBe(true);
    expect(frTextElement.text()).toContain('Bonjour');
  });

  it('should display the login modal if the user is not logged in', async () => {
    // ユーザーをログインしていない状態に設定
    mockUserStore.isLoggedIn = false;

    console.log('User logged in:', mockUserStore.isLoggedIn);

    // コンポーネントを再マウントして onMounted を再実行
    wrapper.unmount();
    wrapper = mountComponent();

    await flushPromises();

    expect(mockLoginModalStore.openModal).toHaveBeenCalled();
  });

  it('should fetch and display comments when the comment button is clicked', async () => {
    const commentButton = wrapper.find('[data-testid="comment-button"]');
    expect(commentButton.exists()).toBe(true);
    await commentButton.trigger('click');

    await flushPromises();

    const comments = wrapper.findAll('[data-testid="comment-item"]');
    expect(comments.length).toBe(1);
    expect(comments[0].find('.font-bold').text()).toBe('testuser');
    expect(comments[0].find('.text-sm.text-dark').text()).toBe('Nice post!');
  });

  it('should fetch and display corrections when the correction button is clicked', async () => {
    const correctionButton = wrapper.find('[data-testid="correction-button"]');
    expect(correctionButton.exists()).toBe(true);
    await correctionButton.trigger('click');

    await flushPromises();

    const corrections = wrapper.findAll('[data-testid="correction-item"]');
    expect(corrections.length).toBe(1);
    expect(corrections[0].find('.font-bold').text()).toBe('Corrector 1');
    expect(corrections[0].find('.text-sm.text-dark').text()).toBe('Correction suggestion');
  });
});
