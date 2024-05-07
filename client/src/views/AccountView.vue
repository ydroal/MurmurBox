<script setup>
import axiosInstance from '@/axios';
import { ref, onMounted, watch } from 'vue';
import { useUserStore } from '@/stores/user';
import UserIcon from '@/assets/icons/icon_user.png';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const userStore = useUserStore();

let userInfo = ref({ username: '', email: '', profileImageUrl: '' });
let initialUserInfo = ref({ username: '', email: '', profileImageUrl: '' });
let editMode = ref(false); // 編集モードを管理するためのref
let selectedFile = ref(null); // 選択された画像ファイルを保持するための変数
let previewImageUrl = ref(null);

onMounted(() => {
  if (userStore.user) {
    userInfo.value = { ...userStore.user };
    initialUserInfo.value = { ...userStore.user };
  }
});

// 選択された画像のプレビューを表示
const onFileChange = event => {
  selectedFile.value = event.target.files[0];
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
  const updates = {};
  if (userInfo.value.username !== initialUserInfo.value.username) {
    updates.username = userInfo.value.username;
  }
  if (selectedFile.value) {
    const storage = getStorage();
    const fileName = `${userStore.user.uid}_${Date.now()}`;
    const fileRef = storageRef(storage, `profile_images/${userStore.user.uid}/${fileName}`);
    try {
      await uploadBytes(fileRef, selectedFile.value);
      const newProfileUrl = await getDownloadURL(fileRef);
      updates.profileImageUrl = newProfileUrl;
      userInfo.value.profileImageUrl = newProfileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload image. Please try again.');
      return; // 画像のアップロードに失敗した場合はここで処理を中断
    }
  }
  if (Object.keys(updates).length > 0) {
    try {
      const res = await axiosInstance.put('/user/update', updates);
      if (res.status === 200) {
        userStore.user = res.data.user;
        initialUserInfo.value = { ...userInfo.value };
        editMode.value = false; // 編集モードを解除
      } else {
        console.error('Failed to update user data');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating profile. Please check your connection and try again.');
    }
  }
  editMode.value = false;
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
  <div class="pt-36 px-5 flex justify-center">
    <div
      class="bg-dark rounded-1 w-[600px] h-[400px] rounded-3xl relative flex flex-col items-center justify-center mt-4"
    >
      <div class="bg-white rounded-full w-28 h-28 absolute -top-14 truncate">
        <input id="file-input" type="file" @change="onFileChange" :disabled="!editMode" class="hidden" />
        <div v-if="editMode && selectedFile">
          <img :src="previewImageUrl || userInfo.profileImageUrl || UserIcon" alt="Preview" class="object-contain" />
        </div>

        <!-- <label for="file-input"> -->
        <label for="file-input" v-if="!selectedFile || !editMode">
          <img :src="userInfo.profileImageUrl || UserIcon" alt="UserIcon" class="object-contain" />
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
