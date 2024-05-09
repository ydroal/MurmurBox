import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { useUserStore } from './stores/user';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);

app.mount('#app').then(() => {
  // アプリケーションがマウントされた後にユーザーストアのチェックアクションを呼び出す
  const userStore = useUserStore();
  userStore.checkUserFromToken();
});
