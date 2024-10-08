vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: { uid: '123' } })),
  onAuthStateChanged: vi.fn((auth, callback) => {
    const user = { uid: '123' };
    callback(user);
  })
}));

vi.mock('@/axios.js', () => ({
  default: {
    get: vi.fn(() =>
      Promise.resolve({
        data: {
          user: {
            uid: '123',
            username: 'TestUser',
            email: 'test@example.com',
            lastVisitedEditMe: '2024-09-30T12:00:00Z'
          }
        }
      })
    )
  }
}));

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/account', component: { template: '<div>Account</div>' } },
    { path: '/diary', component: { template: '<div>Diary</div>' } },
    { path: '/dico', component: { template: '<div>Dico</div>' } },
    { path: '/feed', component: { template: '<div>Feed</div>' } },
    { path: '/editme', component: { template: '<div>EditMe</div>' } }
  ]
});

import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onAuthStateChanged } from 'firebase/auth';
import { setActivePinia, createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
import axiosInstance from '@/axios.js';
import App from '@/App.vue';
import Header from '@/components/Header.vue';
import FooterTab from '@/components/FooterTab.vue';

describe('App.vue Tests', () => {
  let wrapper;
  let userStore;
  let pinia;

  beforeEach(() => {
    // モジュールのキャッシュをクリア
    vi.resetModules();

    pinia = createPinia();
    setActivePinia(pinia);

    userStore = useUserStore();

    wrapper = mount(App, {
      global: {
        plugins: [router, pinia]
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render Header and FooterTab components', () => {
    expect(wrapper.findComponent(Header).exists()).toBe(true);
    expect(wrapper.findComponent(FooterTab).exists()).toBe(true);
  });

  it('should call onAuthStateChanged on mount', () => {
    expect(onAuthStateChanged).toHaveBeenCalled();
  });

  it('should check user token when a user is authenticated', async () => {
    // コンポーネントをアンマウント
    wrapper.unmount();

    vi.clearAllMocks();

    userStore.checkUserFromToken = vi.fn().mockImplementation(async () => {
      userStore.user = {
        uid: '123',
        username: 'TestUser',
        email: 'test@example.com',
        lastVisitedEditMe: '2024-09-30T12:00:00Z'
      };
    });

    onAuthStateChanged.mockImplementation((auth, callback) => {
      const user = { uid: '123' };
      callback(user);
    });

    // コンポーネントを再マウント
    wrapper = mount(App, {
      global: {
        plugins: [router, pinia]
      }
    });

    await flushPromises();

    expect(userStore.checkUserFromToken).toHaveBeenCalled();
    expect(userStore.user).toEqual({
      uid: '123',
      username: 'TestUser',
      email: 'test@example.com',
      lastVisitedEditMe: '2024-09-30T12:00:00Z',
    });
  });

  it('should set user to null when no user is found', async () => {
    // 再度マウント
    wrapper.unmount();

    onAuthStateChanged.mockImplementation((auth, callback) => callback(null));

    wrapper = mount(App, {
      global: {
        plugins: [router, pinia]
      }
    });

    userStore = useUserStore();
    await flushPromises();

    expect(userStore.user).toBeNull();
  });
});
