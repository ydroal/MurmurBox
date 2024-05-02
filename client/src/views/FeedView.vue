<script setup>
// import { useStore } from 'vuex';
import { ref, computed } from 'vue';
// import { compareAsc, format } from "date-fns";

// const store = useStore();
// const posts = computed(() => store.state.posts);

const displayComments = ref(true);
const displayCorrections = ref(false);
const isCommentPopupVisible = ref(true);
const newComment = ref('');

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

const toggleComments = () => {
  displayComments.value = !displayComments.value;
  isCommentPopupVisible.value = !isCommentPopupVisible.value;
};

const submitComment = async () => {
  // コメント送信のロジック
  console.log(newComment.value);
  newComment.value = ''; // テキストエリアをクリア
  isCommentPopupVisible.value = false;
  displayComments.value = true;
};

// const toggleCorrections = () => {
//   displayCorrections.value = !displayCorrections.value;
// };

// onMounted(() => {
//   fetchPosts();
// });
</script>

<template>
  <div class="pt-24 px-5">
    <h2 class="font-jp text-dark text-base font-thin text-center mb-1">みんなの日記</h2>
    <p class="font-jp text-dark text-xs text-center mb-12">コメントや日記の添削をしよう。</p>
    <!-- <div v-for="post in posts" :key="post.id" class="w-full mb-4"> -->
    <div class="flex items-center">
      <div class="flex justify-start items-center space-x-1.5 mb-2 pl-1">
        <!-- <img :src="post.userIcon" alt="User Icon" class="w-11 h-11 rounded-full object-cover" alt="Avatar"> -->
        <img src="@/assets/images/icon_user1.jpeg" class="w-11 h-11 rounded-full object-cover" alt="Avatar" />
        <!-- <span>{{ post.username }}</span> -->
        <span class="text-dark font-bold">Yoko</span>
      </div>
      <span class="text-dark text-sm font-en ml-auto pr-2">2024/04/22 18:28</span>
      <!-- {{ postDate }} -->
    </div>

    <div class="w-full">
      <div class="flex gap-0">
        <!-- 日本語部分 -->
        <div class="relative w-full">
          <div class="absolute top-3 left-3 flex justify-center items-center w-9 h-9 bg-ivory rounded-full">
            <span class="text-sm font-fr">JP</span>
          </div>
          <div
            class="read-more border-r border-ivory50 flex-1 container mx-auto p-3 pt-14 rounded-l-3xl h-72 leading-6 font-jp bg-dark text-ivory text-sm"
          >
            <!-- {{ post.jpText }} -->
            <div id="scrollbar">
              ああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ
            </div>
          </div>
        </div>
        <!-- フランス語部分 -->
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
    <!-- 添削リクエスト -->
    <div class="flex justify-end items-center mt-3 mr-0.5">
      <!-- <div
        :class="{ 'revision-request-true': post.revisionRequested, 'revision-request-false': !post.revisionRequested }"
      ></div> -->
      <div class="revision-request-true"></div>
      <span class="ml-[0.5em] text-sm font-jp text-dark">添削リクエスト</span>
    </div>
    <!-- 通知バッジ群 -->
    <div class="flex justify-end mt-1 mr-4 mb-2">
      <button type="button" class="relative inline-flex items-center p-3" @click="toggleComments">
        <img src="@/assets/icons/icon_comment.svg" alt="My dico" class="w-5 h-5" aria-hidden="true" />
        <div
          class="absolute inline-flex items-center justify-center w-5 h-5 text-[0.6rem] text-dark bg-orange rounded-full top-0 -end-[0.6rem]"
        >
          10
        </div>
      </button>
      <button type="button" class="relative inline-flex items-center p-3" @click="toggleCorrections">
        <img src="@/assets/icons/icon_edited.svg" alt="My dico" class="w-5 h-5" aria-hidden="true" />
        <div
          class="absolute inline-flex items-center justify-center w-5 h-5 text-[0.6rem] text-dark bg-orange rounded-full top-0 -end-[0.6rem]"
        >
          3
        </div>
      </button>
    </div>
    <!-- コメントセクション -->
    <div v-if="displayComments" class="flex flex-col items-center">
      <p class="font-jp text-dark text-sm font-semibold text-center mb-4">コメント</p>
      <!-- コメントリスト表示 -->
      <!-- <div
        v-for="comment in comments"
        :key="comment.id"
        class="flex justify-between w-1/2 py-6 px-4 mb-8 bg-white/35 rounded-3xl"
      > -->
      <!-- <div class="flex items-center space-x-4"> -->
      <!-- ユーザーアイコン -->
      <!-- <img :src="comment.userIcon" class="w-11 h-11 rounded-full object-cover" :alt="comment.username" /> -->
      <!-- コメント内容 -->
      <!-- <div class="flex flex-col space-y-1">
            <span class="font-bold text-dark">{{ comment.username }}</span>
            <span class="text-sm text-dark">{{ comment.text }}</span>
          </div>
        </div>
      </div> -->
      <div class="flex justify-between w-1/2 py-6 px-4 mb-8 bg-white/35 rounded-3xl">
        <div class="flex items-center space-x-4">
          <img
            src="https://flowbite.com/docs/images/people/profile-picture-2.jpg"
            class="w-11 h-11 rounded-full object-cover"
            alt="user icon"
          />
          <div class="flex flex-col space-y-1">
            <span class="font-bold text-dark">Hide</span>
            <span class="text-sm text-dark">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, provident
            </span>
          </div>
        </div>
        <div class="flex-none px-4 py-2 text-stone-600 text-xs md:text-sm">50m ago</div>
      </div>
      <div class="flex justify-between w-1/2 py-6 px-4 mb-8 bg-white/35 rounded-3xl">
        <div class="flex items-center space-x-4">
          <img
            src="https://flowbite.com/docs/images/people/profile-picture-2.jpg"
            class="w-11 h-11 rounded-full object-cover"
            alt="user icon"
          />
          <div class="flex flex-col space-y-1">
            <span class="font-bold text-dark">Issey</span>
            <span class="text-sm text-dark">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Deleniti, providentLorem ipsum dolor sit amet
              consectetur adipisicing elit. Deleniti, provident
            </span>
          </div>
        </div>
        <div class="flex-none px-4 py-2 text-stone-600 text-xs md:text-sm">50m ago</div>
      </div>
    </div>

    <!-- コメントポップアップ -->
    <div v-if="isCommentPopupVisible" class="comment-popup">
      <div
        tabindex="-1"
        :class="{'hidden': !isPopupVisible}"
        class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full"
      >
        <div class="p-4 w-full max-w-lg h-full md:h-auto">
          <div class="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 md:p-8">
            <button
              class="absolute -top-[0.6rem] -right-[0.8rem] w-7 h-7 rounded-full bg-[#313539] text-[#f4f2f0] text-lg font-thin leading-7 text-center border-none cursor-pointer"
              @click="closeModal"
            >
              &#10005;
            </button>
            <div class="mb-4 text-sm font-light text-gray-500 dark:text-gray-400">
              <h3 class="mb-3 text-2xl text-center font-bold text-gray-900 dark:text-white">Add Comment</h3>
              <textarea
                v-model="newComment"
                placeholder="コメントを入力してください"
                maxlength="800"
                class="flex justify-between w-full h-28 py-5 px-4 mb-8 text-sm text-dark border border-dark bg-white/35 rounded-3xl"
              ></textarea>
            </div>
            <div class="flex self-end">
              <button class="ml-auto bg-orange text-ivory font-en w-16 h-10 rounded-xl hover:bg-orange-700">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 2コメ -->
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
        <!-- 日本語部分 -->
        <div class="relative w-full">
          <div class="absolute top-3 left-3 flex justify-center items-center w-9 h-9 bg-ivory rounded-full">
            <span class="text-sm font-fr">JP</span>
          </div>
          <div
            class="read-more border-r border-ivory50 flex-1 container mx-auto p-3 pt-14 rounded-l-3xl h-72 leading-6 font-jp bg-dark text-ivory text-sm"
          >
            <!-- {{ post.jpText }} -->
            <div id="scrollbar">
              ああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ
            </div>
          </div>
        </div>
        <!-- フランス語部分 -->
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
    <!-- 添削リクエスト -->
    <div class="flex justify-end items-center mt-3 mr-0.5">
      <!-- <div
        :class="{ 'revision-request-true': post.revisionRequested, 'revision-request-false': !post.revisionRequested }"
      ></div> -->
      <div class="revision-request-true"></div>
      <span class="ml-[0.5em] text-sm font-jp text-dark">添削リクエスト</span>
    </div>
    <!-- 通知バッジ群 -->
    <div class="flex justify-end mt-1 mr-4">
      <button type="button" class="relative inline-flex items-center p-3">
        <img src="@/assets/icons/icon_comment.svg" alt="My dico" class="w-5 h-5" aria-hidden="true" />
        <span class="sr-only">Notifications</span>
        <div
          class="absolute inline-flex items-center justify-center w-5 h-5 text-[0.6rem] text-dark bg-orange rounded-full top-0 -end-[0.6rem]"
        >
          10
        </div>
      </button>
      <button type="button" class="relative inline-flex items-center p-3">
        <img src="@/assets/icons/icon_edited.svg" alt="My dico" class="w-5 h-5" aria-hidden="true" />
        <span class="sr-only">Notifications</span>
        <div
          class="absolute inline-flex items-center justify-center w-5 h-5 text-[0.6rem] text-dark bg-orange rounded-full top-0 -end-[0.6rem]"
        >
          3
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.revision-request-true {
  width: 17px;
  height: 17px;
  background-color: var(--custom-orange);
  border: none;
  border-radius: 3px;
  position: relative; /* ポジショニングの基点となる */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px; /* チェックマークのサイズを調整 */
}

.revision-request-true::after {
  content: '✓'; /* チェックマーク */
  color: white; /* チェックマークの色 */
  font-weight: bold;
}

.revision-request-false {
  width: 17px;
  height: 17px;
  background-color: transparent;
  border: solid var(--custom-dark);
  border-radius: 3px;
}

/* .read-more {
  position: relative;
} */

/* スクロールバーの設定を適用 */
.read-more > div {
  max-height: 220px;
  overflow: auto; /* スクロールバーを表示 */
}

</style>
