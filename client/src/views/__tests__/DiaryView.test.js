import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';
import DiaryView from '@/views/DiaryView.vue';

const mockFetchMyPosts = vi.fn(() => Promise.resolve());
const mockPostsStore = {
  myPosts: [
    {
      postId: 1,
      username: 'Test User',
      profileImageUrl: null,
      createdAt: '2023-01-01T00:00:00Z',
      jpText: 'こんにちは',
      frText: 'Bonjour',
      commentCount: 2,
      correctionCount: 1,
      revisionRequested: true,
      privacyLevel: false
    }
  ],
  fetchMyPosts: mockFetchMyPosts,
  get revisionRequestedPosts() {
    return this.posts.filter(post => post.revisionRequested === true);
  },
  get userPosts() {
    return this.myPosts;
  }
};

vi.mock('@/stores/posts', () => ({
  usePostsStore: vi.fn(() => mockPostsStore)
}));

const mockUserStore = {
  user: {
    username: 'Test User',
    uid: '123'
  }
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
                username: 'commentuser',
                content: 'Great diary!',
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
                username: 'correctuser',
                content: 'Correction!',
                profileImageUrl: null,
                createdAt: '2023-01-01T02:00:00Z'
              }
            ]
          }
        });
      }
      return Promise.reject(new Error('Not Found'));
    }),
    delete: vi.fn(() => Promise.resolve())
  }
}));

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/diary', component: { template: '<div>Diary</div>' } }
  ]
});

window.alert = vi.fn();

const mountComponent = () => {
  return mount(DiaryView, {
    global: {
      plugins: [router],
      mocks: {
        usePostsStore: () => mockPostsStore,
        useUserStore: () => mockUserStore,
        useLoginModalStore: () => mockLoginModalStore
      }
    }
  });
};

describe('DiaryView.vue Tests', () => {
  let wrapper;

  beforeEach(async () => {
    vi.clearAllMocks();

    wrapper = mountComponent();
    wrapper.vm.selectedDiary = mockPostsStore.myPosts[0];

    await flushPromises();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should open login modal if user is not logged in', async () => {
    mockUserStore.user = null;

    wrapper.unmount();
    wrapper = mountComponent();

    await flushPromises();

    expect(mockLoginModalStore.openModal).toHaveBeenCalled();
  });

  it('should display all diaries', async () => {
    await flushPromises();
    const diaries = wrapper.findAll('[data-testid="diaries"]');
    console.log(diaries);
    expect(diaries.length).toBe(1);
    expect(diaries[0].find('[data-testid="diary-date"]').text()).toContain('2023/01/01 00:00');
  });

  it('should fetch and display comments when the comments link is clicked', async () => {
    const commentsLink = wrapper.find('[data-testid="comments-link"]');
    expect(commentsLink.exists()).toBe(true);
    await commentsLink.trigger('click');

    await flushPromises();

    const comments = wrapper.findAll('[data-testid="comment-item"]');
    expect(comments.length).toBe(1);
    expect(comments[0].find('[data-testid="commenter"]').text()).toBe('commentuser');
    expect(comments[0].find('.text-sm.text-dark').text()).toBe('Great diary!');
  });

  it('should fetch and display corrections when the corrections link is clicked', async () => {
    const correctionsLink = wrapper.find('[data-testid="corrections-link"]');
    expect(correctionsLink.exists()).toBe(true);
    await correctionsLink.trigger('click');

    await flushPromises();

    const corrections = wrapper.findAll('[data-testid="correction-item"]');
    expect(corrections.length).toBe(1);
    expect(corrections[0].find('[data-testid="corrector"]').text()).toBe('correctuser');
    expect(corrections[0].find('.text-sm.text-dark').text()).toBe('Correction!');
  });

  it('should delete diary when delete button is clicked', async () => {
    const deleteButton = wrapper.find('[data-testid="delete-button"]');
    expect(deleteButton.exists()).toBe(true);
    await deleteButton.trigger('click');

    await flushPromises();

    expect(mockFetchMyPosts).toHaveBeenCalled();
  });
});
