import { defineStore } from 'pinia';
import axiosInstance from '@/axios';
import { auth, signOut } from '@/firebase';
import { usePostsStore } from '@/stores/posts';

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    // ログインユーザー情報を保持
    user: null,
    redirectAfterLogin: null, // ログイン後にユーザーをリダイレクトするURL
    lastVisitedEditMe: null,
    isInitialized: false // 認証状態が初期化されたかどうか
  }),
  getters: {
    isLoggedIn: state => !!state.user, // ログイン状態を表す。!!でBooleanに変換
    getUser: state => state.user
  },
  actions: {
    async checkUserFromToken() {
      const token = localStorage.getItem('jwt');
      if (token) {
        try {
          const res = await axiosInstance.get('/user/info', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          this.user = res.data.user;
          console.log('lastVisitedEditMe:', res.data.user.lastVisitedEditMe);
          this.lastVisitedEditMe = res.data.user.lastVisitedEditMe ? new Date(res.data.user.lastVisitedEditMe) : null;
        } catch (error) {
          console.error('Failed to fetch user info:', error);
          this.user = null;
          localStorage.removeItem('jwt');
        }
      } else {
        this.user = null;
      }
      // 認証状態の初期化完了を設定
      this.isInitialized = true;
    },
    logout() {
      const postsStore = usePostsStore();
      // Firebase Authenticationからログアウトする
      signOut(auth)
        .then(() => {
          // ユーザーステートをnullに設定
          this.user = null;
          // ローカルストレージからJWTを削除
          localStorage.removeItem('jwt');
          localStorage.removeItem('googleIdToken');
          postsStore.resetPostState();
        })
        .catch(error => {
          console.error('ログアウトエラー:', error);
        });
    },
    async updateLastVisitedEditMe() {
      try {
        const res = await axiosInstance.put('/user/last-visit-editme');
        this.user = res.data.user; // レスポンスからユーザー情報を取得
        console.log('lastVisitedEditMe:', res.data.user.lastVisitedEditMe);
        // クライアント側のステートを更新
        this.lastVisitedEditMe = new Date(res.data.user.lastVisitedEditMe);
      } catch (error) {
        console.error('Failed to update last visit edit me info:', error);
      }
    }
  }
});
