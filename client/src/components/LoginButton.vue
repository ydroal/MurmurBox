<script setup>
import { ref } from 'vue';

const isLoggedIn = ref(false);

function toggleLogin() {
  isLoggedIn.value = !isLoggedIn.value;

  // ユーザーがログイン状態によって処理を変える
  if (isLoggedIn.value) {
    // ログイン処理
  } else {
    // ログアウト処理
  }
}
</script>

<template>
  <div>
    <button
      class="mr-5 mt-0.5 w-[3.8rem] h-[1.4rem] outline outline-1 outline-dark outline-offset-[3px] bg-dark font-en text-sm leading-5 rounded-xl text-ivory hover:bg-dark50"
      @click="toggleLogin"
    >
      {{ isLoggedIn ? 'Log out' : 'Log in' }}
    </button>
  </div>
</template>
