<script setup>
import { RouterLink, RouterView } from 'vue-router';
import Header from './components/Header.vue';
import FooterTab from './components/FooterTab.vue';
</script>

<template>
  <Header />
  <RouterView />
  <FooterTab />
</template>

<style scoped></style>
