<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useUserStore } from '@/stores/user';
import { usePostsStore } from '@/stores/posts';
import { useRouter } from 'vue-router';
import { useLoginModalStore } from '@/stores/loginModal';
import axiosInstance from '@/axios';
import UserIcon from '@/assets/icons/icon_user.png';

const userStore = useUserStore();
const postsStore = usePostsStore();
const loginModalStore = useLoginModalStore();
const router = useRouter();
const diaries = computed(() => postsStore.userPosts);
const selectedDiary = ref(null);
const displayCorrections = ref(false);
const displayComments = ref(false);
const comments = ref([]);
const corrections = ref([]);
const selectedLanguage = ref('jp');
const privacyLevel = ref(null);
const correctionRequest = ref(false);
const currentIndex = computed(() => diaries.value.findIndex(diary => diary.postId === selectedDiary.value.postId));

onMounted(async () => {
  if (userStore.user) {
    await postsStore.fetchMyPosts();
  } else {
    // router.push('/home');
    loginModalStore.openModal();
  }
});

watch(
  selectedDiary,
  newDiary => {
    if (newDiary) {
      privacyLevel.value = newDiary.privacyLevel;
    } else {
      privacyLevel.value = null; // selectedDiary が null の場合は privacyLevel も null に設定
    }
  },
  { immediate: true }
); // コンポーネントがマウントされた時にも実行されるように immediate を true に設定

watch(
  selectedDiary,
  newDiary => {
    if (newDiary) {
      correctionRequest.value = newDiary.revisionRequested;
    } else {
      correctionRequest.value = false;
    }
  },
  { immediate: true }
);

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

const deleteDiary = async postId => {
  try {
    console.log('postId:', postId);
    await axiosInstance.delete(`/delete-post/${postId}`);
    alert('日記は削除されました');
    await postsStore.fetchMyPosts(); // 再フェッチ
  } catch (error) {
    console.error(`Failed to delete post ${postId}:`, error);
  }
};

const fetchCommentsForPost = async postId => {
  try {
    console.log('フェッチ関数呼ばれた');
    console.log('postId:', postId);
    const res = await axiosInstance.get(`/comments/${postId}`);
    comments.value = res.data.comments;
    console.log('コメント:', comments.value);
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

const showDiaryContent = diary => {
  selectedDiary.value = diary; // 選択された日記をrefにストア
};

const showCorrections = async (postId, count) => {
  displayComments.value = false;
  displayCorrections.value = !displayCorrections.value;
  if (count > 0) {
    await fetchCorrectionsForPost(postId);
  }
};

const showComments = async (postId, count) => {
  displayCorrections.value = false;
  displayComments.value = !displayComments.value;
  if (count > 0) {
    await fetchCommentsForPost(postId);
  }
};

const updatePrivacyLevel = async () => {
  try {
    const updates = { privacyLevel: privacyLevel.value };
    const res = await axiosInstance.put('/update-post-details', {
      postId: selectedDiary.value.postId,
      updates: updates
    });
    console.log('Post updated successfully:', res.data);

    const updatedPrivacyLevel = res.data.privacyLevel;
    const myPostsIndex = postsStore.userPosts.findIndex(post => post.postId === selectedDiary.value.postId);
    console.log('myPostsIndex:', myPostsIndex);
    if (myPostsIndex !== -1) {
      postsStore.userPosts[myPostsIndex].privacyLevel = updatedPrivacyLevel;
    }
    const allPostsIndex = postsStore.allPosts.findIndex(post => post.postId === selectedDiary.value.postId);
    console.log('allPostsIndex:', allPostsIndex);
    if (allPostsIndex !== -1) {
      postsStore.allPosts[allPostsIndex].privacyLevel = updatedPrivacyLevel;
    }
  } catch (error) {
    console.error('Error updating post details:', error);
  }
};

const updateCorrectionRequest = async () => {
  try {
    const updates = { revisionRequested: correctionRequest.value };
    const res = await axiosInstance.put('/update-post-details', {
      postId: selectedDiary.value.postId,
      updates: updates
    });
    console.log('Correction request updated successfully:', res.data);

    const updatedRevisionRequested = res.data.revisionRequested;
    const myPostsIndex = postsStore.userPosts.findIndex(post => post.postId === selectedDiary.value.postId);
    console.log('myPostsIndex:', myPostsIndex);
    if (myPostsIndex !== -1) {
      postsStore.userPosts[myPostsIndex].revisionRequested = updatedRevisionRequested;
    }
    const allPostsIndex = postsStore.allPosts.findIndex(post => post.postId === selectedDiary.value.postId);
    console.log('allPostsIndex:', allPostsIndex);
    if (allPostsIndex !== -1) {
      postsStore.allPosts[allPostsIndex].revisionRequested = updatedRevisionRequested;
    }
  } catch (error) {
    console.error('Failed to update correction request:', error);
  }
};

const showNextDiary = () => {
  const nextIndex = currentIndex.value - 1;
  if (nextIndex >= 0 && nextIndex < diaries.value.length) {
    selectedDiary.value = diaries.value[nextIndex];
  } else {
    console.log('新しい日記はありません');
  }
};

const showPreviousDiary = () => {
  const previousIndex = currentIndex.value + 1;
  if (previousIndex < diaries.value.length) {
    selectedDiary.value = diaries.value[previousIndex];
  } else {
    console.log('古い日記はありません');
  }
};
</script>

<template>
  <div class="container">
    <div class="pt-24 px-5">
      <h2 class="font-jp text-dark text-base font-light text-center mb-8">私の日記</h2>
    </div>
    <div class="flex flex-col items-center justify-center py-8 px-4">
      <!---カレンダー --->
      <!-- <div class="md:p-8 p-5 mb-14 dark:bg-gray-800 bg-white rounded-t">
          <div class="px-4 flex items-center justify-between">
            <span tabindex="0" class="focus:outline-none text-base font-bold dark:text-gray-100 text-gray-800">
              October 2020
            </span>
            <div class="flex items-center">
              <button
                aria-label="calendar backward"
                class="focus:text-gray-400 hover:text-gray-400 text-gray-800 dark:text-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon icon-tabler icon-tabler-chevron-left"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <polyline points="15 6 9 12 15 18" />
                </svg>
              </button>
              <button
                aria-label="calendar forward"
                class="focus:text-gray-400 hover:text-gray-400 ml-3 text-gray-800 dark:text-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon icon-tabler icon-tabler-chevron-right"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </button>
            </div>
          </div>
          <div class="flex items-center justify-between pt-12 overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr>
                  <th>
                    <div class="w-full flex justify-center">
                      <p class="text-base font-medium text-center text-gray-800 dark:text-gray-100">Mo</p>
                    </div>
                  </th>
                  <th>
                    <div class="w-full flex justify-center">
                      <p class="text-base font-medium text-center text-gray-800 dark:text-gray-100">Tu</p>
                    </div>
                  </th>
                  <th>
                    <div class="w-full flex justify-center">
                      <p class="text-base font-medium text-center text-gray-800 dark:text-gray-100">We</p>
                    </div>
                  </th>
                  <th>
                    <div class="w-full flex justify-center">
                      <p class="text-base font-medium text-center text-gray-800 dark:text-gray-100">Th</p>
                    </div>
                  </th>
                  <th>
                    <div class="w-full flex justify-center">
                      <p class="text-base font-medium text-center text-gray-800 dark:text-gray-100">Fr</p>
                    </div>
                  </th>
                  <th>
                    <div class="w-full flex justify-center">
                      <p class="text-base font-medium text-center text-gray-800 dark:text-gray-100">Sa</p>
                    </div>
                  </th>
                  <th>
                    <div class="w-full flex justify-center">
                      <p class="text-base font-medium text-center text-gray-800 dark:text-gray-100">Su</p>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="pt-6">
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center"></div>
                  </td>
                  <td class="pt-6">
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center"></div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center"></div>
                  </td>
                  <td class="pt-6">
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">1</p>
                    </div>
                  </td>
                  <td class="pt-6">
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">2</p>
                    </div>
                  </td>
                  <td class="pt-6">
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100">3</p>
                    </div>
                  </td>
                  <td class="pt-6">
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100">4</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">5</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">6</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">7</p>
                    </div>
                  </td>
                  <td>
                    <div class="w-full h-full">
                      <div class="flex items-center justify-center w-full rounded-full cursor-pointer">
                        <a
                          role="link"
                          tabindex="0"
                          class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 focus:bg-indigo-500 hover:bg-indigo-500 text-base w-8 h-8 flex items-center justify-center font-medium text-white bg-indigo-700 rounded-full"
                        >
                          8
                        </a>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">9</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100">10</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100">11</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">12</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">13</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">14</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">15</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">16</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100">17</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100">18</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">19</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">20</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">21</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">22</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">23</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100">24</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100">25</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">26</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">27</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">28</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">29</p>
                    </div>
                  </td>
                  <td>
                    <div class="px-2 py-2 cursor-pointer flex w-full justify-center">
                      <p class="text-base text-gray-500 dark:text-gray-100 font-medium">30</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div> -->
      <!---日記リスト --->
      <div class="flex justify-around w-1/2 pb-3 text-center text-sm font-jp text-dark border-b border-dark">
        <div class="flex-none w-2/5">日付</div>
        <div class="flex-none w-1/5">コメント</div>
        <div class="flex-none w-1/5">添削</div>
        <div class="flex-none w-1/5">削除</div>
      </div>
      <div
        v-for="diary in diaries"
        :key="diary.id"
        class="flex justify-around w-1/2 pt-2 pb-0.5 text-center text-xs font-jp text-dark border-b border-dark"
      >
        <div class="flex-none w-2/5">
          <a href="#" @click.prevent="showDiaryContent(diary)">
            <span class="expansion inline-block text-orange">{{ formatDate(diary.createdAt) }}</span>
          </a>
        </div>
        <div class="flex-none w-1/5">{{ diary.commentCount }}</div>
        <div class="flex-none w-1/5">{{ diary.correctionCount }}</div>
        <div class="flex-none w-1/5">
          <button type="button" @click="deleteDiary(diary.postId)">
            <img src="@/assets/icons/icon_trash.svg" alt="trash" class="expansion w-5 h-5" />
          </button>
        </div>
      </div>
      <!-- 日記の内容表示部分 -->
      <div v-if="selectedDiary" class="w-full mt-12 mb-4">
        <div class="flex items-center">
          <span class="text-dark text-sm font-en ml-auto mb-2 pr-2">{{ formatDate(selectedDiary.createdAt) }}</span>
        </div>
        <div class="w-full">
          <div class="flex gap-0">
            <!-- 日本語部分 -->
            <div class="relative w-full">
              <div class="absolute top-3 left-3 flex justify-center items-center w-9 h-9 bg-ivory rounded-full">
                <span class="text-sm font-fr">{{ selectedLanguage === 'jp' ? 'JP' : 'AI' }}</span>
              </div>
              <div
                class="read-more border-r border-ivory50 flex-1 container mx-auto p-3 pt-14 rounded-l-3xl h-72 leading-6 font-jp bg-dark text-ivory text-sm"
              >
                <div id="scrollbar">
                  {{ selectedLanguage === 'jp' ? selectedDiary.jpText : selectedDiary.aiText }}
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
                <div id="scrollbar">
                  {{ selectedDiary.frText }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- コメント＆添削 -->
        <div v-if="!selectedDiary.privacyLevel" class="flex justify-end items-center mt-3 mr-2">
          <span
            @click="showCorrections(selectedDiary.postId, selectedDiary.correctionCount)"
            class="ml-[0.5em] text-sm font-jp text-orange hover:text-orange-700 expansion"
          >
            添削 ({{ selectedDiary.correctionCount }})
          </span>
          <span
            @click="showComments(selectedDiary.postId, selectedDiary.commentCount)"
            class="ml-4 text-sm font-jp text-orange hover:text-orange-700 expansion"
          >
            コメント ({{ selectedDiary.commentCount }})
          </span>
        </div>
        <!-- 添削セクション -->
        <div v-if="displayCorrections" class="flex flex-col items-center">
          <p class="font-jp text-dark text-sm font-semibold text-center mb-4">添削</p>
          <!-- 添削リスト表示 -->
          <div
            v-for="correction in corrections"
            :key="correction.correctionId"
            class="flex justify-between w-1/2 py-6 px-4 mb-8 bg-white/50 rounded-3xl"
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
        <!-- コメントセクション -->
        <div v-if="displayComments" class="flex flex-col items-center">
          <p class="font-jp text-dark text-sm font-semibold text-center mb-4">コメント</p>
          <!-- コメントリスト表示 -->
          <div
            v-for="comment in comments"
            :key="comment.commentId"
            class="flex justify-between w-1/2 py-6 px-4 mb-8 bg-white/50 rounded-3xl"
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
        <!-- 変更ボタン類 -->
        <div class="flex flex-col justify-center items-center mt-5">
          <!-- テキスト表示切り替え -->
          <div class="flex justify-start w-[40%] mb-4">
            <p class="font-jp text-dark text-sm font-semibold text-left flex-none w-[60%] pt-1">テキスト表示切り替え</p>
            <p class="flex-none w-[40%]">
              <span class="segmented">
                <label>
                  <input type="radio" name="text-display" value="jp" checked v-model="selectedLanguage" />
                  <span class="label">JP / FR</span>
                </label>
                <label>
                  <input type="radio" name="text-display" value="ai" v-model="selectedLanguage" />
                  <span class="label">AI / FR</span>
                </label>
              </span>
            </p>
          </div>
          <!-- 公開範囲変更 -->
          <div class="flex justify-start w-[40%] mb-4">
            <div class="flex flex-col -mt-[0.2rem] flex-none w-[60%]">
              <p class="font-jp text-dark text-sm font-semibold mb-0.5">公開範囲</p>
              <fieldset class="checkbox flex items-start">
                <label for="privacy-checkbox" class="ml-0 text-sm font-jp text-dark">
                  <input id="privacy-checkbox" type="checkbox" v-model="privacyLevel" />
                  Private
                </label>
              </fieldset>
            </div>
            <button
              @click="updatePrivacyLevel"
              class="bg-orange text-ivory font-en text-sm w-16 h-[30px] rounded-xl hover:bg-orange-700"
            >
              Update
            </button>
          </div>
          <!-- 添削リクエスト変更 -->
          <div class="flex justify-start w-[40%] mb-5">
            <div class="flex flex-col -mt-[0.2rem] flex-none w-[60%]">
              <p class="font-jp text-dark text-sm font-semibold mb-0.5">添削リクエスト</p>
              <fieldset class="checkbox flex items-start">
                <label for="correction-checkbox" class="ml-0 text-sm font-jp text-dark">
                  <input id="correction-checkbox" type="checkbox" v-model="correctionRequest" />
                  ユーザー添削
                </label>
              </fieldset>
            </div>
            <button
              @click="updateCorrectionRequest"
              class="bg-orange text-ivory font-en text-sm w-16 h-[30px] rounded-xl hover:bg-orange-700"
            >
              Update
            </button>
          </div>
        </div>
        <!-- 前の日記、次の日記 -->
        <div class="flex justify-center items-center my-4 w-full px-12">
          <a href="#" v-if="currentIndex > 0" class="text-sm font-jp text-dark expansion" @click="showNextDiary">
            &lt; &nbsp;&nbsp;前の日記
          </a>
          <span class="mx-4 text-sm font-jp text-dark">｜</span>
          <a
            href="#"
            v-if="currentIndex < diaries.length - 1"
            class="text-sm font-jp text-dark expansion"
            @click="showPreviousDiary"
          >
            次の日記&nbsp;&nbsp; &gt;
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
.expansion {
  transition: transform 0.2s;
}
.expansion:hover {
  transform: scale(1.08);
}
.segmented input[type='radio'] {
  display: none;
}
.segmented .label {
  /* 右端以外の枠線 */
  border: 1px var(--custom-orange);
  border-style: solid none solid solid;

  /* 隙間を詰める */
  float: left;
  background-color: transparent;
  /* ラベルテキスト */
  color: var(--custom-orange);
  text-align: center;
  font-size: 14px;
  font-weight: 600;

  cursor: pointer;
  padding: 6px;
  width: 80px;
  height: 30px;
  line-height: 15px;
}
/* 先頭のもの */
.segmented :first-child .label {
  /* 左上、左下の角を丸める */
  border-radius: 10px 0 0 10px;
}
/* 末尾のもの */
.segmented :last-child .label {
  /* 右端の枠線 */
  border-right-style: solid;

  /* 右上、右下の角を丸める */
  border-radius: 0 10px 10px 0;
}

.segmented input:checked + .label {
  /* 文字色を変える */
  color: var(--custom-ivory);

  /* 背景色を変える */
  background-color: var(--custom-orange);
  border-color: var(--custom-orange);
}

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
</style>
