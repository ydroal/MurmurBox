import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useLoginModalStore } from '@/stores/loginModal';
import HomeView from '../views/HomeView.vue';
import AccountView from '../views/AccountView.vue';
import DiaryView from '../views/DiaryView.vue';
import DicoView from '../views/DicoView.vue';
import FeedView from '../views/FeedView.vue';
import EditmeView from '../views/EditmeView.vue';
import MyDicoView from '../views/MyDicoView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/account',
      name: 'account',
      component: AccountView,
      meta: { requiresAuth: true }
    },
    {
      path: '/diary',
      name: 'diary',
      component: DiaryView,
      meta: { requiresAuth: true }
    },
    {
      path: '/dico',
      name: 'dico',
      component: DicoView,
      meta: { requiresAuth: true }
    },
    {
      path: '/my-dico',
      name: 'my-dico',
      component: MyDicoView,
      meta: { requiresAuth: true }
    },
    {
      path: '/feed',
      name: 'feed',
      component: FeedView,
      meta: { requiresAuth: true }
    },
    {
      path: '/editme',
      name: 'editme',
      component: EditmeView,
      meta: { requiresAuth: true }
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const loginModalStore = useLoginModalStore();

  // 認証状態が初期化されるまで待機
  if (!userStore.isInitialized) {
    await userStore.checkUserFromToken();
  }

  // 現在のルート（to）がmeta.requiresAuthを持っているかを確認
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!userStore.isLoggedIn) {
      loginModalStore.openModal();
      next(false);
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
