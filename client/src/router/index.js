import { createRouter, createWebHistory } from 'vue-router';
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
      component: AccountView
    },
    {
      path: '/diary',
      name: 'diary',
      component: DiaryView
    },
    {
      path: '/dico',
      name: 'dico',
      component: DicoView
    },
    {
      path: '/my-dico',
      name: 'my-dico',
      component: MyDicoView
    },
    {
      path: '/feed',
      name: 'feed',
      component: FeedView
    },
    {
      path: '/editme',
      name: 'editme',
      component: EditmeView
    }
  ]
});

export default router;
