import { defineStore } from 'pinia';

// モーダルの開閉状態を管理
export const useLoginModalStore = defineStore({
  id: 'loginModal',
  state: () => ({
    isOpen: false
  }),
  actions: {
    openModal() {
      this.isOpen = true;
      console.log('Modal Opened:', this.isOpen); // ここでログを出力
    },
    closeModal() {
      this.$patch({ isOpen: false });
    }
  }
});
// 返り値は、isOpenというboolean型のstate、openModalとcloseModalという2つのactionsを含むオブジェクト
