<script setup>
import { ref } from 'vue';

const emit = defineEmits(['submit', 'close']);
const props = defineProps({
  isVisible: Boolean,
  title: String,
  placeholder: String,
  inputText: String
});

// ローカルステートとしてinputTextをコピー
const localInputText = ref(props.inputText);

const submit = () => {
  if (localInputText.value.trim() !== '') {
    emit('submit', localInputText.value); // 送信イベントを親に通知
    localInputText.value = '';
  }
};

const closePopup = () => {
  emit('close'); // 親コンポーネントに閉じる通知を送る
};
</script>

<template>
  <div v-if="isVisible">
    <div
      tabindex="-1"
      :class="{ hidden: !isVisible }"
      class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-1/3 md:inset-0 h-modal md:h-full"
    >
      <div class="p-4 w-full max-w-lg h-full md:h-auto">
        <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 md:p-8">
          <button
            class="absolute -top-[0.6rem] -right-[0.8rem] w-7 h-7 rounded-full bg-[#313539] text-[#f4f2f0] text-lg font-thin leading-7 text-center border-none cursor-pointer"
            @click="closePopup"
          >
            &#10005;
          </button>
          <div class="mb-4 text-sm font-light text-gray-500 dark:text-gray-400">
            <h3 class="mb-3 text-2xl text-center font-bold text-gray-900 dark:text-white">{{ title }}</h3>
            <textarea
              v-model="localInputText"
              :placeholder="placeholder"
              maxlength="800"
              class="flex justify-between w-full h-28 py-5 px-4 mb-8 text-sm text-dark border border-dark bg-white/35 rounded-3xl"
            ></textarea>
          </div>
          <div class="flex self-end">
            <button
              @click="submit"
              class="ml-auto bg-orange text-ivory font-en w-16 h-10 rounded-xl hover:bg-orange-700"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
