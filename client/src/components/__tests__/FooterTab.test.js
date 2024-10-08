import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia, setActivePinia } from 'pinia';
import { usePostsStore } from '@/stores/posts';
import FooterTab from '@/components/FooterTab.vue';

// モック用ルート設定
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/account', component: { template: '<div>Account</div>' } },
    { path: '/dico', component: { template: '<div>Dico</div>' } }
  ]
});

describe('FooterTab.vue Tests', () => {
  let wrapper;
  let postsStore;

  beforeEach(async () => {
    setActivePinia(createPinia());
    postsStore = usePostsStore();
    postsStore.newRevisionCount = 5; // モックデータ設定
    wrapper = mount(FooterTab, {
      global: {
        plugins: [router]
      }
    });
  });

  it('should render the correct number of tabs', () => {
    const tabs = wrapper.findAll('.tab');
    expect(tabs.length).toBe(6);
  });

  it('should render the notification badge when new revisions are present', () => {
    const badge = wrapper.find('.bg-orange');
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe('5');
  });

  it('should navigate to the correct routes', async () => {
    const accountLink = wrapper.find('a[href="/account"]');
    expect(accountLink.exists()).toBe(true);
  });

  it('should add the active class when the current route is the active route', async () => {
    await router.push('/dico');
    await router.isReady();
    const dicoLink = wrapper.find('a[href="/dico"]');
    expect(dicoLink.classes()).toContain('active');
  });
});
