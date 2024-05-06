import { defineStore } from 'pinia';
import axiosInstance from '@/axios';
import { auth, signOut } from '@/firebase';

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    // ログインユーザー情報を保持
    user: null,
    redirectAfterLogin: null // ログイン後にユーザーをリダイレクトするURL
  }),
  getters: {
    isLoggedIn: state => !!state.user, // ログイン状態を表す。!!でBooleanに変換
    getUser: state => state.user
  },
  actions: {
    isJwtTokenExists() {
      return !!localStorage.getItem('jwt');
    },
    async fetchUser() {
      if (this.isJwtTokenExists()) {
        try {
          const res = await axiosInstance.get('/auth/user'); // URI後で確認
          this.user = res.data;
          console.log('Received user data: ', res.data);
        } catch (error) {
          this.user = null; // ユーザー情報が取得できなかった場合にはnullを設定
          console.error(error);
        }
      } else {
        console.log('JWTトークンが存在しないため、fetchUserは実行されません');
      }
    },
    logout() {
      // Firebase Authenticationからログアウトする
      signOut(auth)
        .then(() => {
          // ユーザーステートをnullに設定
          this.user = null;
          // ローカルストレージからJWTを削除
          localStorage.removeItem('jwt');
        })
        .catch(error => {
          console.error('ログアウトエラー:', error);
        });
    }
  }
});
