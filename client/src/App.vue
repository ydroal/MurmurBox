<script setup>
import { RouterView } from 'vue-router';
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import Header from './components/Header.vue';
import FooterTab from './components/FooterTab.vue';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const userStore = useUserStore();

onMounted(() => {
  console.log('onMounted called');
  onAuthStateChanged(auth, async user => {
    if (user) {
      console.log('ユーザーが認識されました:', user);
      // ログイン状態の復元
      await userStore.checkUserFromToken(); // ユーザートークンの確認を待機
    } else {
      // ログアウト時の処理
      userStore.user = null;
      // トークンはHttpOnly Cookiesで保持するため不要 localStorage.removeItem('jwt');
    }
  });
});
</script>

<template>
  <Header />
  <RouterView />
  <FooterTab />
</template>

<style scoped></style>
