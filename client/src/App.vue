<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import Header from './components/Header.vue';
import FooterTab from './components/FooterTab.vue';

const userStore = useUserStore();
onMounted(() => {
  userStore.checkUserFromToken();
});
</script>

<template>
  <Header />
  <RouterView />
  <FooterTab />
</template>

<style scoped></style>
