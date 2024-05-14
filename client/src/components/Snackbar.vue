<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  message: String,
  isVisible: Boolean
});

const visible = ref(props.isVisible);

watch(
  () => props.isVisible,
  newVal => {
    visible.value = newVal;
    if (newVal) {
      setTimeout(() => {
        visible.value = false; // 一定時間後に自動で閉じる
      }, 3000);
    }
  }
);
</script>

<template>
  <transition name="slide">
    <div v-if="visible" class="snackbar">
      {{ message }}
    </div>
  </transition>
</template>

<style scoped>
.snackbar {
  width: 100%;
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--custom-orange);
  color: var(--custom-ivory);
  font-weight: 600;
  text-align: center;
  padding: 10px 20px;
  border-radius: 5px;
  animation: slide-in-out 3s;
}
</style>
