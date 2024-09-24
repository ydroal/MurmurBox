<script setup>
// import { auth } from '@/firebase';
// import { onAuthStateChanged } from 'firebase/auth';
import { ref, computed, onMounted } from 'vue';
import axiosInstance from '@/axios';
import { useLoginModalStore } from '@/stores/loginModal';
import LoginModal from '@/components/LoginModal.vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const isUserLoggedIn = computed(() => userStore.isLoggedIn);

// onAuthStateChanged(auth, async user => {
//   console.log('onAuthStateChanged triggered');
// });
onMounted(async () => {
  console.log('リロード後にhome表示されたよ');
});

const loginModalStore = useLoginModalStore();

const jpText = ref('');
const frText = ref('');
const aiText = ref('');
const isPosted = ref(false); // Post前後でUI切り替え
const privacyLevel = ref(false); // 公開範囲の初期値はpublic
const revisionRequested = ref(false); // 添削リクエストの初期値
const showTooltip = ref(false);

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
    const res = await axiosInstance.post('/post', {
      jpText: jpText.value,
      frText: frText.value,
      privacyLevel: privacyLevel.value,
      revisionRequested: revisionRequested.value
    });
    console.log('Diary data posted:', res.data);
    frText.value = res.data.frText;
    aiText.value = res.data.aiText;
    isPosted.value = true;
  } catch (error) {
    console.error('Error posting diary data:', error);
  }
};

const handleMouseOver = () => {
  if (!isUserLoggedIn.value) {
    showTooltip.value = true;
  }
};

const handleMouseLeave = () => {
  showTooltip.value = false;
};
</script>

<template>
  <div class="pt-24 px-5">
    <h2 class="font-jp text-dark text-base font-light text-center" :class="{ 'mb-16': !isPosted, 'mb-1': isPosted }">
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
            v-model="frText"
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
        @click="postDiary"
        class="absolute left-1/2 top-0 transform -translate-x-1/2 bg-orange text-ivory font-en w-16 h-10 rounded-xl hover:bg-orange-700"
      >
        Post
      </button>
      <div class="flex justify-end mt-3 mr-0.5 space-x-6">
        <div class="flex flex-col -mt-[0.2rem]">
          <p class="font-jp text-dark text-sm font-semibold mb-0.5">公開範囲</p>
          <fieldset class="checkbox flex flex-col items-start">
            <label for="privacy-checkbox" class="ml-0 text-sm font-jp text-dark">
              <input id="privacy-checkbox" type="checkbox" value="" v-model="privacyLevel" />
              Private
            </label>
          </fieldset>
        </div>
        <div class="flex flex-col -mt-[0.2rem]">
          <p class="font-jp text-dark text-sm font-semibold mb-0.5">添削リクエスト</p>
          <fieldset class="checkbox flex flex-col items-start">
            <label for="auto-correction-checkbox" class="ml-0 mb-0.5 text-sm font-jp text-dark">
              <input id="auto-correction-checkbox" type="checkbox" value="" checked disabled />
              自動添削（固定）
            </label>
            <label
              for="user-correction-checkbox"
              class="ml-0 text-sm font-jp text-dark"
              @mouseover="handleMouseOver"
              @mouseleave="handleMouseLeave"
            >
              <input
                id="user-correction-checkbox"
                type="checkbox"
                value=""
                v-model="revisionRequested"
                :disabled="!isUserLoggedIn"
              />
              ユーザー添削
            </label>
            <!-- ツールチップ -->
            <div v-show="showTooltip" class="absolute bottom-8 right-1 text-left">
              <span class="tooltip text-white text-xs font-semibold text-left">
                ユーザー添削にはログインが必要です。
                <br />
                ログインして他ユーザーのフィードバックをもらいましょう！
              </span>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  </div>
  <LoginModal v-if="loginModalStore.isOpen" />
</template>

<style scoped>
.checkbox {
  border: none;
}

.checkbox label {
  display: flex;
  align-items: center;
  gap: 0 0.5em;
  position: relative;
  /* margin-bottom: 0.5em; */
  cursor: pointer;
}

.checkbox label::before,
.checkbox label:has(:checked)::after {
  content: '';
}

.checkbox label::before {
  width: 17px;
  height: 17px;
  border-radius: 3px;
  background-color: transparent;
  border: solid var(--custom-dark);
}

.checkbox label:has(:checked)::before {
  background-color: #deaa5a;
  border: none;
}

.checkbox label:has(:checked)::after {
  position: absolute;
  top: 6px;
  left: 6px;
  transform: rotate(45deg);
  width: 4px;
  height: 8px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
}

.checkbox input {
  display: none;
}

.tooltip {
  color: var(--custom-dark) !important;
  text-align: left !important;
  border-radius: 6px;
  text-align: center;
  background: #fff;
  border: 1px solid var(--custom-dark);
  padding: 8px 6px;
  display: inline-block;
  position: relative; /* 基準値とする */
  white-space: nowrap;
}

.tooltip::after {
  content: ''; /* 疑似要素に必須 */
  position: absolute; /* 相対位置に指定 */
  bottom: 0; /* 下から0pxの位置に指定。 */
  left: 63.5%; /* 左から50%の位置に指定 */
  width: 10px; /* 四角形の横幅を指定 */
  height: 10px; /* 四角形の高さを指定 */
  background: #fff; /* 背景色を指定 */
  border-right: 1px solid var(--custom-dark); /* 右側にborder */
  border-bottom: 1px solid var(--custom-dark); /* 下側にborder */
  transform: translate(-50%, 55%) rotate(45deg); /* 表示位置を左方向に半分戻し、下方向に移動。かつ45度時計回りに回転 */
  transform-origin: center center; /* 回転の基準位置を中心に指定 */
}
</style>
