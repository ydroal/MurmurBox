<script setup>
// import { useStore } from 'vuex';
// import { ref, computed } from 'vue'
// import { compareAsc, format } from "date-fns";

// const store = useStore();
// const posts = computed(() => store.state.posts);

// const fetchPosts = async () => {
//   try {
//     await store.dispatch('fetchPosts');
//   } catch (error) {
//     console.error('Failed to fetch posts:', error);
//   }
// }

// const timestamp = ref(new Date()) // 仮のTimestamp
// const postDate = computed(() => {
//   const date = timestamp.value; // refから.valueでアクセス
//   return format(date, "yyyy/MM/dd HH:mm");
// });

// onMounted(() => {
//   fetchPosts();
// });
</script>

<template>
  <div class="pt-24 px-5">
    <h2 class="font-jp text-dark text-base font-thin text-center mb-1">みんなの日記</h2>
    <p class="font-jp text-dark text-xs text-center mb-12">コメントや日記の添削をしよう。</p>
    <!-- <div v-for="post in posts" :key="post.id" class="w-full"> -->
    <div class="flex items-center">
      <div class="flex justify-start items-center space-x-1.5 mb-2 pl-1">
        <!-- <img :src="post.userIcon" alt="User Icon" class="w-32 rounded-full" alt="Avatar"> -->
        <img src="@/assets/images/icon_user1.jpeg" class="w-11 h-11 rounded-full object-cover" alt="Avatar" />
        <!-- <span>{{ post.username }}</span> -->
        <span class="text-dark text-sm font-en">Yoko</span>
      </div>
      <span class="text-dark text-sm font-en ml-auto pr-2">2024/04/22 18:28</span>
      <!-- {{ postDate }} -->
    </div>
    <div class="w-full">
      <div class="flex gap-0">
        <!-- JP -->
        <div class="relative w-full">
          <div class="absolute top-3 left-3 flex justify-center items-center w-9 h-9 bg-ivory rounded-full">
            <span class="text-sm font-fr">JP</span>
          </div>
          <div
            class="border-r border-ivory50 flex-1 container mx-auto p-3 pt-14 rounded-l-3xl h-72 leading-6 font-jp bg-dark text-ivory text-sm"
          >
            <!-- {{ post.jpText }} -->
          </div>
        </div>
        <!-- 日本語メモ入力部分 -->
        <div class="relative w-full">
          <div class="absolute top-3 left-3 flex justify-center items-center w-9 h-9 bg-ivory rounded-full">
            <span class="text-sm font-fr">FR</span>
          </div>
          <div
            class="border-r border-ivory50 flex-1 container mx-auto p-3 pt-14 rounded-r-3xl h-72 leading-6 font-jp bg-dark text-ivory text-sm"
          >
            <!-- {{ post.frText }} -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
