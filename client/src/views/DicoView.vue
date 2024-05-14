<script setup>
import { ref } from 'vue';
import axiosInstance from '@/axios';
import Snackbar from '@/components/Snackbar.vue';

const jpWord = ref('');
const frWord = ref('');
const snackbarVisible = ref(false);
const snackbarMessage = ref('');

const addDico = async () => {
  try {
    const res = await axiosInstance.post('/dico', {
      term: frWord.value,
      definition: jpWord.value
    });
    console.log('Dico data added:', res.data);
    frWord.value = '';
    jpWord.value = '';
    snackbarMessage.value = '辞書が登録されました';
    snackbarVisible.value = true;
    setTimeout(() => (snackbarVisible.value = false), 3000); // 3秒後にスナックバーを非表示にする
  } catch (error) {
    console.error('Error adding Dico data:', error);
    snackbarMessage.value = '辞書の登録に失敗しました';
    snackbarVisible.value = true;
    setTimeout(() => (snackbarVisible.value = false), 3000); // 3秒後にスナックバーを非表示にする
  }
};
</script>

<template>
  <div class="pt-24 px-5">
    <h2 class="font-jp text-dark text-base font-thin text-center mb-1">辞書登録</h2>
    <p class="font-jp text-dark text-xs text-center mb-10">覚えておきたい単語やフレーズを辞書に追加しよう。</p>
    <div class="w-full">
      <div class="flex gap-0">
        <!-- フランス単語入力部分 -->
        <div class="relative w-full">
          <div class="absolute top-3 left-3 flex justify-center items-center w-9 h-9 bg-ivory rounded-full font-light">
            <span class="text-sm font-fr">FR</span>
          </div>
          <textarea
            v-model="frWord"
            maxlength="500"
            class="border-r border-ivory50 flex-1 container mx-auto p-3 pt-14 rounded-l-3xl h-44 leading-6 font-fr bg-dark text-ivory text-sm placeholder-ivory resize-none"
            placeholder="ex）amour"
          ></textarea>
        </div>
        <!-- 日本語メモ入力部分 -->
        <div class="relative w-full">
          <div class="absolute top-3 left-3 flex justify-center items-center w-9 h-9 bg-ivory rounded-full">
            <span class="text-sm font-fr">JP</span>
          </div>
          <textarea
            v-model="jpWord"
            maxlength="300"
            type="text"
            pattern="^[a-zA-Z0-9]+$"
            class="flex-1 container mx-auto p-3 pt-14 rounded-r-3xl h-44 font-jp font-light leading-6 bg-dark text-ivory text-sm placeholder-ivory resize-none"
            placeholder="愛、恋愛、好み、愛着"
          ></textarea>
        </div>
      </div>

      <div class="w-full relative">
        <button
          @click="addDico"
          class="absolute left-1/2 top-0 transform -translate-x-1/2 bg-orange text-ivory font-en w-16 h-10 rounded-xl hover:bg-orange-700"
        >
          Add
        </button>
        <Snackbar :isVisible="snackbarVisible" :message="snackbarMessage" />
        <div class="flex justify-end mt-3">
          <router-link to="/my-dico">
            <div class="flex flex-col justify-center items-center w-[60px] h-[60px] bg-dark rounded-[15px]">
              <img src="@/assets/icons/icon_dico.svg" alt="My dico" class="icon-container" />
              <span class="text-xs text-ivory mt-1">My Dico</span>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.icon-container:hover {
  transform: scale(1.05);
}
</style>
