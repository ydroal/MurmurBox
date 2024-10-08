import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import { useLoginModalStore } from '@/stores/loginModal';
import { useUserStore } from '@/stores/user';
import LoginButton from '@/components/LoginButton.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: '<div>Home</div>' } }]
});

describe('LoginButton.vue Tests', () => {
  let wrapper;
  let loginModalStore;
  let userStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    loginModalStore = useLoginModalStore();
    userStore = useUserStore();
    vi.spyOn(loginModalStore, 'openModal');
    vi.spyOn(userStore, 'logout');
    wrapper = mount(LoginButton, {
      global: {
        plugins: [router]
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the component correctly', () => {
    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe('Log in');
  });

  it('should open login modal when user is not logged in and button is clicked', async () => {
    const button = wrapper.find('button');
    await button.trigger('click');
    expect(loginModalStore.openModal).toHaveBeenCalled();
  });

  it('should display "Log out" when user is logged in', async () => {
    userStore.$patch({ user: { id: 1, name: 'Test User' } });
    await flushPromises();
    const button = wrapper.find('button');
    expect(wrapper.vm.isUserLoggedIn).toBe(true);
    expect(button.text()).toBe('Log out');
  });

  it('should log out and navigate to home page when "Log out" is clicked', async () => {
    userStore.$patch({ user: { id: 1, name: 'Test User' } });
    await flushPromises();
    const button = wrapper.find('button');
    await button.trigger('click');
    expect(userStore.logout).toHaveBeenCalled();
    expect(router.currentRoute.value.path).toBe('/');
  });

  it('should display "Log in" when user is logged out', async () => {
    userStore.$patch({ isLoggedIn: false });
    await flushPromises();
    const button = wrapper.find('button');
    expect(button.text()).toBe('Log in');
  });
});
