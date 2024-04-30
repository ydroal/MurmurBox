<script setup>
// import axiosInstance from '@/axios';
import { ref, computed, onMounted, watch } from 'vue';
// import { useUserStore } from '@/stores/user';
import UserIcon from '@/assets/icons/icon_user.svg';

// const api = import.meta.env.VITE_APP_API_ENDPOINT;
// const userStore = useUserStore();
// const userId = computed(() => userStore.getUser ? userStore.getUser.id : null);

let userInfo = ref({ username: '', email: '', profile_picture_url: '' });
let initialUserInfo = ref({ username: '', email: '', profile_picture_url: '' });
let editMode = ref(false); // 編集モードを管理するためのref
let selectedFile = ref(null); // 選択された画像ファイルを保持するための変数
let previewImageUrl = ref(null);

onMounted(async () => {
  console.log('userStore.getUser: ', userStore.getUser);
  if (userStore.getUser) {
    console.log('userStore.getUser.id: ', userStore.getUser.id);
  }
  try {
    console.log('userId: ', userId.value);
    const response = await axiosInstance.get(`${api}user/${userId.value}`);
    userInfo.value = response.data[0];
    initialUserInfo.value = { ...response.data[0] }; // ユーザー情報を初期状態として保存。要深いコピー

    if (userInfo.value.profile_picture_url) {
      const s3_bucket_name = import.meta.env.VITE_APP_BUCKET_NAME;
      const s3_region = import.meta.env.VITE_APP_S3_REGION;
      const obj_key = `${import.meta.env.VITE_APP_S3_OBJ_ICONS}/${userInfo.value.profile_picture_url}`;
      userInfo.value.profile_picture_url = `https://${s3_bucket_name}.s3.${s3_region}.amazonaws.com/${obj_key}`;
    }
    console.log('Received full user data: ', response.data);
  } catch (error) {
    userInfo.value = { username: '', email: '', profile_picture_url: '' }; // ユーザー情報が取得できなかった場合にはnullを設定
    initialUserInfo.value = { username: '', email: '', profile_picture_url: '' }; // 初期状態も同様に設定
    console.error(error);
  }
});

// 選択された画像のプレビューを表示
const onFileChange = e => {
  selectedFile.value = e.target.files[0];
  previewImageUrl.value = URL.createObjectURL(selectedFile.value); //オブジェクトURLを作成
};

const cancelEdit = () => {
  editMode.value = false;
  userInfo.value = { ...initialUserInfo.value }; // 初期状態に戻す
  selectedFile.value = null;
  previewImageUrl.value = null;
};

const edit = () => {
  editMode.value = true;
};

const update = async () => {
  editMode.value = false;
  if (userInfo.value.username !== initialUserInfo.value.username) {
    // axiosのPUTは第二引数に渡すデータはオブジェクト形式
    await axiosInstance.put(`${api}user/${userId.value}`, {
      username: userInfo.value.username
    });
  }
  // 選択された画像ファイルがあればサーバーに送信する
  if (selectedFile.value) {
    let updateFileUrl = `${userId.value}-${Date.now()}-${selectedFile.value.name}`;
    console.log(updateFileUrl);
    const formData = new FormData();
    formData.append('icon', selectedFile.value);
    formData.append('profile_picture_url', updateFileUrl);
    const response = await axiosInstance.put(`${api}user/${userId.value}/icon`, formData, {
      headers: {
        // 画像をポストする場合の通信形式は multipart/form-data
        'Content-Type': 'multipart/form-data'
      }
    });
    // レスポンスから新しい画像のURLを取得して、userInfoのデータを更新する
    userInfo.value.profile_picture_url = response.data.updated_profile_picture_url;
  }
  // ユーザー情報の更新後、初期状態を再設定する
  initialUserInfo.value = { ...userInfo.value };
};

// editModeの値が変わったときにファイル選択を有効/無効にする
watch(editMode, newValue => {
  const fileInput = document.getElementById('file-input');
  if (newValue) {
    fileInput.removeAttribute('disabled');
  } else {
    fileInput.setAttribute('disabled', 'disabled');
  }
});
</script>

<template>
  <div class="pt-24 px-5 flex justify-center">
    <div
      class="bg-dark rounded-1 w-[600px] h-[438px] rounded-3xl relative flex flex-col items-center justify-center mt-4"
    >
      <div class="bg-white rounded-full w-28 h-28 absolute -top-14 truncate">
        <input id="file-input" type="file" @change="onFileChange" :disabled="!editMode" class="hidden" />
        <div v-if="editMode && selectedFile">
          <img :src="previewImageUrl || userInfo.profile_picture_url || UserIcon" alt="Preview" class="preview-icon" />
        </div>

        <!-- <label for="file-input"> -->
        <label for="file-input" v-if="!selectedFile || !editMode">
          <img
            :src="userInfo.profile_picture_url || UserIcon"
            alt="UserIcon"
            class="absolute top-1/2 left-1/2 w-7/12 transform -translate-x-1/2 -translate-y-1/2"
          />
        </label>
      </div>

      <h2 class="self-start mt-3 ml-6 mb-1 text-lg font-semibold font-en text-ivory">My account</h2>
      <hr class="w-full border-[0.5px] border-ivory border-solid" />
      <div class="text-ivory mt-10 w-2/3">
        <p class="text-ms font-semibold text-ivory ml-1">User name</p>
        <p class="text-sm font-light text-ivory ml-1">This will be displayed throughout this website</p>
        <input
          class="w-full h-10 rounded-xl bg-ivory mt-1 py-0 px-2.5 text-dark"
          type="text"
          :disabled="!editMode"
          v-if="userInfo"
          v-model="userInfo.username"
        />
      </div>

      <div class="text-ivory mt-3 mb-2 w-2/3">
        <p class="text-ms font-semibold text-ivory ml-1">Email</p>
        <p class="text-sm font-light text-ivory ml-1">Note: Display only. Registered email cannot be changed</p>
        <input
          class="w-full h-10 rounded-xl bg-ivory mt-1 py-0 px-2.5 text-dark"
          type="text"
          disabled
          v-model="userInfo.email"
        />
      </div>
      <div class="flex justify-end space-x-4 w-2/3 mt-3">
        <button
          @click="edit"
          class="bg-orange text-ivory font-en w-16 h-10 rounded-xl hover:bg-orange-700"
          v-if="!editMode"
        >
          Edit
        </button>
        <button
          @click="update"
          class="bg-orange text-ivory font-en w-16 h-10 rounded-xl hover:bg-orange-700"
          v-if="editMode"
        >
          Update
        </button>
        <button
          @click="cancelEdit"
          class="bg-orange text-ivory font-en w-16 h-10 rounded-xl hover:bg-orange-700"
          v-if="editMode"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
