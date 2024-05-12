import { defineStore } from 'pinia';
import axiosInstance from '@/axios';

export const usePostsStore = defineStore({
  id: 'posts',
  state: () => ({
    posts: [],
    myPosts: [],
    isLoading: false,
    error: null
  }),
  getters: {
    allPosts: state => state.posts,
    revisionRequestedPosts: state => state.posts.filter(post => post.revisionRequested === true)
  },
  actions: {
    async fetchPostsWithDetail() {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await axiosInstance.get('/posts-with-details');
        this.posts = res.data.posts;
      } catch (error) {
        console.error('Failed to fetch posts with users:', error);
        this.error = 'Failed to load posts.';
      } finally {
        this.isLoading = false;
      }
    },
    async fetchMyPosts() {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await axiosInstance.get('/my-posts');
        this.myPosts = res.data.posts;
      } catch (error) {
        console.error('Failed to fetch my diary:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
});
