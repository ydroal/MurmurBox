import { flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { usePostsStore } from '@/stores/posts';
import axiosInstance from '@/axios';

vi.mock('@/axios');

// UserStoreのモック設定
const mockUserStore = {
  user: { id: 'user123', name: 'Test User' },
  lastVisitedEditMe: '2024-09-30T12:00:00Z'
};
vi.mock('@/stores/user', () => ({
  useUserStore: () => mockUserStore // mockUserStoreを返す
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

describe('Posts Store Tests', () => {
  let postsStore;

  beforeEach(() => {
    setActivePinia(createPinia());

    postsStore = usePostsStore();
    console.log('Mock UserStore lastVisitedEditMe:', mockUserStore.lastVisitedEditMe);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with the correct default state', () => {
    expect(postsStore.posts).toEqual([]);
    expect(postsStore.myPosts).toEqual([]);
    expect(postsStore.isLoading).toBe(false);
    expect(postsStore.error).toBe(null);
    expect(postsStore.newRevisionCount).toBe(0);
  });

  it('should fetch posts with details and update posts state', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { posts: dummyPosts } });

    await postsStore.fetchPostsWithDetail();
    await flushPromises();
    console.log('axiosInstance.get.mock.calls:', axiosInstance.get.mock.calls);
    expect(axiosInstance.get).toHaveBeenCalledWith('/posts-with-details');

    expect(postsStore.isLoading).toBe(false);
    expect(postsStore.posts).toEqual(dummyPosts);
    expect(postsStore.error).toBe(null);
  });

  it('should handle error when fetching posts with details fails', async () => {
    axiosInstance.get.mockRejectedValueOnce(new Error('Network error'));

    await postsStore.fetchPostsWithDetail();

    expect(postsStore.isLoading).toBe(false);
    expect(postsStore.error).toBe('Failed to load posts.');
  });

  it('should fetch my posts and update myPosts state', async () => {
    axiosInstance.get.mockResolvedValueOnce({ data: { posts: dummyPosts } });

    await postsStore.fetchMyPosts();

    expect(postsStore.isLoading).toBe(false);
    expect(postsStore.myPosts).toEqual(dummyPosts);
    expect(postsStore.error).toBe(null);
  });

  it("should update revision count based on user's last visit", () => {
    const mockPosts = [
      { postId: 'post_id1', username: 'Alex', createdAt: '2024-10-01T12:00:00Z', revisionRequested: true },
      { postId: 'post_id2', username: 'Bob', createdAt: '2024-10-02T12:00:00Z', revisionRequested: false }
    ];
    postsStore.posts = mockPosts;
    postsStore.updateRevisionCount();

    expect(postsStore.newRevisionCount).toBe(1);
  });

  it('should reset post state correctly', () => {
    postsStore.posts = dummyPosts;
    postsStore.isLoading = true;
    postsStore.resetPostState();

    expect(postsStore.posts).toEqual([]);
    expect(postsStore.isLoading).toBe(false);
  });
});
