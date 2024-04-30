<script setup>
import { ref } from 'vue';
import axiosInstance from '@/axios';

const jpText = ref('');
const frText = ref('');
const aiText = ref('');
const isPosted = ref(false); // Post前後でUI切り替え

const validateJpInput = () => {
  // 日本語の文字範囲を含む正規表現
  const jpPattern = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF\u3400-\u4DBF]/;

  if (!jpPattern.test(jpText.value)) {
    alert('日本語で書いてね。');
  }
};

// Postボタンのクリックアクション
const postDiary = async () => {
  try {
    const res = await axiosInstance.post(
      '/api/diary', // APIに翻訳依頼を投げる。バックエンドでDBへの保存を行う
      {
        jpText: jpText.value,
        frText: frText.value
      },
      {
        headers: {
          Authorization: `Bearer ${yourAuthToken}`
        }
      }
    );
    console.log('Diary data posted:', res.data);
    // レスポンスから直接テキストデータを更新
    frText.value = res.data.frText;
    aiText.value = res.data.aiText;
    isPosted.value = true;
  } catch (error) {
    console.error('Error posting diary data:', error);
  }
};
</script>

<template>
  <div class="pt-24 px-5">
    <h2 class="font-jp text-dark text-base font-thin text-center" :class="{ 'mb-16': !isPosted, 'mb-1': isPosted }">
      {{ isPosted ? 'AIの作成した日記と比べてみよう' : '日記を書く。' }}
    </h2>
    <p class="font-jp text-dark text-xs text-center mb-12" v-if="isPosted">
      気になるフレーズや単語は辞書登録できるよ。
    </p>
    <div class="w-full">
      <div class="flex gap-0">
        <!-- 日本語入力部分 -->
        <div class="relative w-full" v-if="!isPosted">
          <div class="absolute top-3 left-3 flex justify-center items-center w-9 h-9 bg-ivory rounded-full">
            <span class="text-sm font-fr">JP</span>
          </div>
          <textarea
            v-model="jpText"
            maxlength="500"
            class="border-r border-ivory50 flex-1 container mx-auto p-3 pt-14 rounded-l-3xl h-72 leading-6 font-jp bg-dark text-ivory text-sm placeholder-ivory resize-none"
            placeholder="日本語で日記を書いてみよう。"
            @blur="validateJpInput"
          ></textarea>
        </div>
        <!-- 日本語入力部分 post後 -->
        <div class="relative w-full" v-else>
          <div class="absolute top-3 left-3 flex justify-center items-center w-9 h-9 bg-ivory rounded-full">
            <span class="text-sm font-fr">You</span>
          </div>
          <div
            class="border-r border-ivory50 flex-1 container mx-auto p-3 pt-14 rounded-l-3xl h-72 leading-6 font-jp bg-dark text-ivory text-sm"
          >
            {{ frText }}
          </div>
        </div>

        <!-- フランス語入力部分 -->
        <div class="relative w-full" v-if="!isPosted">
          <div class="absolute top-3 left-3 flex justify-center items-center w-9 h-9 bg-ivory rounded-full">
            <span class="text-sm font-fr">FR</span>
          </div>
          <textarea
            maxlength="1500"
            type="text"
            pattern="^[a-zA-Z0-9]+$"
            class="flex-1 container mx-auto p-3 pt-14 rounded-r-3xl h-72 font-fr font-light bg-dark text-ivory placeholder-ivory resize-none"
            placeholder="Essayez d'écrire un journal en français."
          ></textarea>
        </div>

        <!-- フランス語入力部分 post後 -->
        <div class="relative w-full" v-else>
          <div class="absolute top-3 left-3 flex justify-center items-center w-9 h-9 bg-ivory rounded-full">
            <span class="text-sm font-fr">Ai</span>
          </div>
          <div
            class="border-r border-ivory50 flex-1 container mx-auto p-3 pt-14 rounded-r-3xl h-72 leading-6 font-jp bg-dark text-ivory text-sm"
          >
            {{ aiText }}
          </div>
        </div>
      </div>
    </div>
    <!-- 日記入力欄下のチェックボタン -->
    <div class="w-full relative" v-if="!isPosted">
      <button
        class="absolute left-1/2 top-0 transform -translate-x-1/2 bg-orange text-ivory font-en w-16 h-10 rounded-xl hover:bg-orange-700"
      >
        Post
      </button>
      <div class="flex justify-end mt-3 space-x-4">
        <div flex flex-col>
          <p class="font-jp text-dark text-sm font-semibold mb-0.5">公開範囲</p>
          <div class="flex items-center">
            <input id="default-checkbox" type="checkbox" value="" />
            <label for="default-checkbox" class="ms-2 text-sm font-en text-dark">Private</label>
          </div>
        </div>
        <div flex flex-col>
          <p class="font-jp text-dark text-sm font-semibold mb-0.5">添削リクエスト</p>
          <div class="flex items-center mb-0.5">
            <input id="default-checkbox" type="checkbox" value="" checked disabled />
            <label for="default-checkbox" class="ms-2 text-sm font-jp text-dark">自動添削（固定）</label>
          </div>
          <div class="flex items-center">
            <input id="default-checkbox" type="checkbox" value="" />
            <label for="default-checkbox" class="ms-2 text-sm font-jp text-dark">ユーザー添削</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type='checkbox'] {
  padding-left: 1.4rem;
  vertical-align: middle;
  position: relative;
}

input[type='checkbox']::before,
input[type='checkbox']::after {
  content: '';
  display: block;
  position: absolute;
}

input[type='checkbox']::before {
  background-color: transparent;
  border-radius: 5px;
  border: 1px solid var(--custom-dark);
  width: 16px;
  height: 16px;
  transform: translateY(-50%);
  top: 50%;
  left: 5px;
}

input[type='checkbox']::after {
  border-bottom: 3px solid var(--custom-dark);
  border-left: 3px solid var(--custom-dark); /*チェックの太さ*/
  opacity: 0; /*チェック前は非表示*/
  height: 6px; /*チェックの高さ*/
  width: 11px; /*チェックの横幅*/
  transform: rotate(-45deg);
  top: -4px; /*チェック時の位置調整*/
  left: 8px; /*チェック時の位置調整*/
}

input[type='checkbox']:checked::after {
  opacity: 1; /*チェック後表示*/
}
</style>
