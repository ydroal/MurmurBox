<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useLoginModalStore } from '@/stores/loginModal';
import { useUserStore } from '@/stores/user';

const loginModalStore = useLoginModalStore();
const userStore = useUserStore();

const isUserLoggedIn = computed(() => userStore.isLoggedIn);
const router = useRouter();

const login = () => {
  loginModalStore.openModal(); // openModalアクションを呼び出してログインモーダルを表示
};

const logout = () => {
  userStore.logout();
  router.push('/');
};
</script>

<template>
  <div>
    <button
      class="mr-5 mt-0.5 w-[3.8rem] h-[1.4rem] outline outline-1 outline-dark outline-offset-[3px] bg-dark font-en text-sm leading-5 rounded-xl text-ivory hover:bg-dark50"
      @click="isUserLoggedIn ? logout() : login()"
    >
      {{ isUserLoggedIn ? 'Log out' : 'Log in' }}
    </button>
  </div>
</template>
