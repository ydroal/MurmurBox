<script setup>
import DateBox from './DateBox.vue';
import LoginButton from './LoginButton.vue';
</script>

<template>
  <header class="h-32 flex justify-between px-4 py-5 md:px-16 fixed top-0 left-0 right-0 z-30">
    <router-link to="/">
      <img src="@/assets/logo.svg" alt="MurmurBox Logo" class="logo" />
    </router-link>
    <!-- ログインボタンとカレンダーを囲むコンテナ -->
    <div class="flex items-start">
      <LoginButton />
      <DateBox />
    </div>
  </header>
</template>

<style scoped>
header {
  background-image: url('@/assets/images/background.png');
  background-repeat: repeat;
  background-attachment: fixed;
}
.logo {
  width: 93%;
}
</style>
