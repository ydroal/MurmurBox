<script setup>
import { ref, onMounted, computed } from 'vue';
import { usePostsStore } from '@/stores/posts';
import { useUserStore } from '@/stores/user';
import { useLoginModalStore } from '@/stores/loginModal';
import axiosInstance from '@/axios';
import PopupForm from '@/components/PopupForm.vue';
import UserIcon from '@/assets/icons/icon_user.png';

const userStore = useUserStore();
const postsStore = usePostsStore();
const loginModalStore = useLoginModalStore();
const posts = computed(() => postsStore.allPosts);
const displayComments = ref(false);
const displayCorrections = ref(false);
const comments = ref([]);
const corrections = ref([]);
const isPopupVisible = ref(false);
const currentMode = ref(null); // 'comment' または 'correction'
const currentInputText = ref('');
const selectedPostId = ref(null);

onMounted(async () => {
  if (userStore.isLoggedIn) {
    await postsStore.fetchPostsWithDetail();
  } else {
    loginModalStore.openModal();
  }
});

const formatDate = dateStr => {
  const date = new Date(dateStr);

  // 各部分のゼロ埋め
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  // カスタムフォーマットの組み立て
  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

const timeSince = date => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) {
    return date.toLocaleDateString();
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months ago';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + 'd';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + 'h';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + 'm';
  }
  return Math.floor(seconds) + ' seconds ago';
};

const fetchCommentsForPost = async postId => {
  try {
    const res = await axiosInstance.get(`/comments/${postId}`);
    console.log('コメント:', res.data.comments);
    comments.value = res.data.comments;
  } catch (error) {
    console.error(`Failed to fetch comments ${postId}:`, error);
    comments.value = [];
  }
};

const fetchCorrectionsForPost = async postId => {
  try {
    console.log('添削をフェッチするよ');
    const res = await axiosInstance.get(`/corrections/${postId}`);
    console.log('添削:', res.data.corrections);
    corrections.value = res.data.corrections;
  } catch (error) {
    console.error(`Failed to fetch corrections ${postId}:`, error);
    corrections.value = [];
  }
};

// Updateしたポストだけを取得
const updateSpecificPostDetails = async postId => {
  try {
    const res = await axiosInstance.get(`/post-details/${postId}`);
    const updatedPostDetails = res.data;

    const index = postsStore.allPosts.findIndex(post => post.postId === postId);
    if (index !== -1) {
      postsStore.allPosts[index] = updatedPostDetails;
    }
  } catch (error) {
    console.error(`Failed to update post details for ${postId}:`, error);
  }
};

// 追加されたコメントのポストIDを引数として受け取り、そのポストだけを再フェッチ
// const updateSpecificPost = async (postId, updates) => {
//   try {
//     const res = await axiosInstance.put('/update-post-details', { postId, updates });
//     const updatedPost = res.data.updatedPost;

//     const index = postsStore.allPosts.findIndex(post => post.postId === postId);
//     if (index !== -1) {
//       postsStore.allPosts[index] = updatedPost;
//     }
//   } catch (error) {
//     console.error(`Failed to fetch ${postId}:`, error);
//   }
// };

const togglePopup = async (postId, mode, count) => {
  console.log(`postId:`, postId);
  console.log(`selectedPostId:`, selectedPostId.value);
  if (selectedPostId.value === postId && currentMode.value === mode) {
    console.log('Closing popup for the same post and mode.');
    if (mode === 'comment') {
      isPopupVisible.value = !displayComments.value;
      displayComments.value = !displayComments.value;
    } else {
      isPopupVisible.value = !displayCorrections.value;
      displayCorrections.value = !displayCorrections.value;
    }
  } else {
    console.log('Opening popup for a new post or mode.');
    currentMode.value = mode;
    selectedPostId.value = postId;
    isPopupVisible.value = true;
    if (mode === 'comment') {
      displayComments.value = true;
      displayCorrections.value = false;
      if (count > 0) {
        await fetchCommentsForPost(postId);
      }
    } else {
      displayCorrections.value = true;
      displayComments.value = false;
      if (count > 0) {
        await fetchCorrectionsForPost(postId);
      }
    }
  }
};

const sendComment = async (postId, content) => {
  try {
    await axiosInstance.post('/comments', { postId, content });
    await updateSpecificPostDetails(postId);
  } catch (error) {
    console.error('Error sending comment:', error);
  }
};

const sendCorrection = async (postId, content) => {
  try {
    await axiosInstance.post('/corrections', { postId, content });
    await updateSpecificPostDetails(postId);
  } catch (error) {
    console.error('Error sending correction:', error);
  }
};

const handleSubmit = async text => {
  if (currentMode.value === 'comment') {
    await sendComment(selectedPostId.value, text);
    // コメントリストを更新
    fetchCommentsForPost(selectedPostId.value);
    displayComments.value = true; // コメント表示を維持
  } else {
    await sendCorrection(selectedPostId.value, text);
    // 添削リストを更新
    fetchCorrectionsForPost(selectedPostId.value);
    displayCorrections.value = true; // 添削表示を維持
  }
  isPopupVisible.value = false; // ポップアップを閉じる
};

const closePopup = () => {
  isPopupVisible.value = false;
};
</script>

<template>
  <div class="pt-24 px-5">
    <h2 class="font-jp text-dark text-base font-light text-center mb-1">みんなの日記</h2>
    <p class="font-jp text-dark text-xs text-center mb-12">コメントや日記の添削をしよう。</p>

    <!-- 日記の表示 -->
    <div v-for="post in posts" :key="post.id" class="w-full mb-4">
      <div class="flex items-center">
        <div class="flex justify-start items-center space-x-1.5 mb-2 pl-1">
          <img :src="post.profileImageUrl || UserIcon" alt="User Icon" class="w-11 h-11 rounded-full object-cover" />
          <span class="text-dark font-bold">{{ post.username }}</span>
        </div>
        <span class="text-dark text-sm font-en ml-auto pr-2">{{ formatDate(post.createdAt) }}</span>
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
              data-testid="jp_post"
            >
              <div id="scrollbar">
                {{ post.jpText }}
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
              data-testid="fr_post"
            >
              <div id="scrollbar">
                {{ post.frText }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 添削リクエスト -->
      <div class="flex justify-end items-center mt-3 mr-0.5">
        <div
          :class="{
            'revision-request-true': post.revisionRequested,
            'revision-request-false': !post.revisionRequested
          }"
        ></div>
        <!-- <div class="revision-request-true"></div> -->
        <span class="ml-[0.5em] text-sm font-jp text-dark">添削リクエスト</span>
      </div>

      <!-- 通知バッジ群 -->
      <div class="flex justify-end mt-1 mr-4 mb-2">
        <button
          type="button"
          class="relative inline-flex items-center p-3"
          @click="togglePopup(post.postId, 'comment', post.commentCount)"
          data-testid="comment-button"
        >
          <img src="@/assets/icons/icon_comment.svg" alt="My dico" class="w-5 h-5" aria-hidden="true" />
          <div
            v-if="post.commentCount > 0"
            class="absolute inline-flex items-center justify-center w-5 h-5 text-[0.6rem] text-dark bg-orange rounded-full top-0 -end-[0.6rem]"
          >
            {{ post.commentCount }}
          </div>
        </button>
        <button
          type="button"
          class="relative inline-flex items-center p-3"
          @click="togglePopup(post.postId, 'correction', post.correctionCount)"
          data-testid="correction-button"
        >
          <img src="@/assets/icons/icon_edited.svg" alt="My dico" class="w-5 h-5" aria-hidden="true" />
          <div
            v-if="post.correctionCount > 0"
            class="absolute inline-flex items-center justify-center w-5 h-5 text-[0.6rem] text-dark bg-orange rounded-full top-0 -end-[0.6rem]"
          >
            {{ post.correctionCount }}
          </div>
        </button>
      </div>

      <!-- コメントセクション -->
      <div v-if="displayComments && selectedPostId === post.postId" class="flex flex-col items-center">
        <p class="font-jp text-dark text-sm font-semibold text-center mb-4">コメント</p>
        <!-- コメントリスト表示 -->
        // eslint-disable-next-line prettier/prettier
        <div
          v-for="comment in comments"
          :key="comment.commentId"
          class="flex justify-between w-1/2 py-6 px-4 mb-8 bg-white/50 rounded-3xl"
          data-testid="comment-item"
        >
          <div class="flex items-center space-x-4">
            <!-- ユーザーアイコン -->
            <img
              :src="comment.profileImageUrl || UserIcon"
              class="w-11 h-11 rounded-full object-cover"
              :alt="comment.username"
            />
            <!-- コメント内容 -->
            <div class="flex flex-col space-y-1">
              <span class="font-bold text-dark">{{ comment.username }}</span>
              <span class="text-sm text-dark">{{ comment.content }}</span>
            </div>
          </div>
          <div class="flex-none px-4 py-2 text-stone-600 text-xs md:text-sm">
            {{ timeSince(new Date(comment.createdAt)) }}
          </div>
        </div>
      </div>

      <!-- 添削セクション -->
      <div v-if="displayCorrections && selectedPostId === post.postId" class="flex flex-col items-center">
        <p class="font-jp text-dark text-sm font-semibold text-center mb-4">添削</p>
        <!-- 添削リスト表示 -->
        <div
          v-for="correction in corrections"
          :key="correction.correctionId"
          class="flex justify-between w-1/2 py-6 px-4 mb-8 bg-white/50 rounded-3xl"
          data-testid="correction-item"
        >
          <div class="flex items-center space-x-4">
            <!-- ユーザーアイコン -->
            <img
              :src="correction.profileImageUrl || UserIcon"
              class="w-11 h-11 rounded-full object-cover"
              :alt="correction.username"
            />
            <!-- 添削内容 -->
            <div class="flex flex-col space-y-1">
              <span class="font-bold text-dark">{{ correction.username }}</span>
              <span class="text-sm text-dark">{{ correction.content }}</span>
            </div>
          </div>
          <div class="flex-none px-4 py-2 text-stone-600 text-xs md:text-sm">
            {{ timeSince(new Date(correction.createdAt)) }}
          </div>
        </div>
      </div>

      <!-- ポップアップ -->
      <div v-if="isPopupVisible && selectedPostId === post.postId">
        <PopupForm
          :isVisible="isPopupVisible"
          :title="currentMode === 'comment' ? 'Add Comment' : 'Add Correction'"
          :placeholder="currentMode === 'comment' ? 'コメントを入力してください' : '添削を入力してください'"
          :inputText="currentInputText"
          @close="closePopup"
          @submit="handleSubmit"
        />
      </div>
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

.container {
  max-height: calc(100vh - (100px));
  /* height: calc(100vh - (100px)); */
  overflow-y: auto;
  /*スクロールバー非表示（IE・Edge）*/
  -ms-overflow-style: none;
  /*スクロールバー非表示（Firefox）*/
  scrollbar-width: none;
}
/*スクロールバー非表示（Chrome・Safari）*/
.container::-webkit-scrollbar {
  display: none;
}
</style>
