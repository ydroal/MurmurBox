<script setup>
import { ref } from 'vue';

const props = defineProps({
  message: String,
  duration: {
    type: Number,
    default: 3000
  }
});

const visible = ref(false);

// const show = () => {
//   visible.value = true;
//   setTimeout(() => {
//     visible.value = false;
//   }, props.duration);
// };

// // setup() から show メソッドを直接返して、コンポーネント外からアクセス可能にする
// export { show };
</script>

<template>
  <transition name="slide">
    <div v-if="visible" class="snackbar">
      {{ message }}
    </div>
  </transition>
</template>
