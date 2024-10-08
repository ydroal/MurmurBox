import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import Header from '@/components/Header.vue';
import HomeView from '@/views/HomeView.vue';
import LoginButton from '@/components/LoginButton.vue';
import DateBox from '@/components/DateBox.vue';

// ルートを設定
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: { template: HomeView }
    }
  ]
});

describe('Header.vue Tests', () => {
  let wrapper;

  beforeEach(async () => {
    setActivePinia(createPinia());
    wrapper = mount(Header, {
      global: {
        // stubs: ['router-link'],
        plugins: [router] // テスト時にVue Routerをプラグインとして使用
      }
    });
  });

  it('should render the logo', () => {
    const logo = wrapper.find('img');
    expect(logo.exists()).toBe(true);
    expect(logo.attributes('alt')).toBe('MurmurBox Logo');
  });

  it('should render the LoginButton component', () => {
    const loginButton = wrapper.findComponent(LoginButton);
    expect(loginButton.exists()).toBe(true);
  });

  it('should render the DateBox component', () => {
    const dateBox = wrapper.findComponent(DateBox);
    expect(dateBox.exists()).toBe(true);
  });

  it('should have the correct router-link', () => {
    const routerLink = wrapper.findComponent({ name: 'RouterLink' });
    expect(routerLink.exists()).toBe(true);
    // const routerLink = wrapper.find('a');
    expect(routerLink.attributes('href')).toBe('/');
  });
});
