import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '@/views/HomeView.vue';
import axiosInstance from '@/axios.js';

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({
    isLoggedIn: false // 初期値はfalse
  }))
}));

vi.mock('@/stores/loginModal', () => ({
  useLoginModalStore: vi.fn(() => ({
    isOpen: false
  }))
}));

vi.mock('@/axios.js', () => ({
  default: {
    post: vi.fn(() =>
      Promise.resolve({
        data: {
          frText: 'Bonjour!',
          aiText: 'AI created text'
        }
      })
    )
  }
}));

describe('Home.vue Tests', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Home);
  });

  it('should display the correct title before and after posting', async () => {
    const title = wrapper.find('h2');
    expect(title.text()).toBe('日記を書く。');

    // 日記投稿後のタイトルを確認
    wrapper.vm.isPosted = true;
    await wrapper.vm.$nextTick();
    expect(title.text()).toBe('AIの作成した日記と比べてみよう');
  });

  it('should display a tooltip when hovering over the correction checkbox if the user is not logged in', async () => {
    const checkboxLabel = wrapper.find('label[for="user-correction-checkbox"]');
    await checkboxLabel.trigger('mouseover');

    // ツールチップの表示を確認
    const tooltip = wrapper.find('.tooltip');
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.text()).toContain('ユーザー添削にはログインが必要です。');
  });

  it('should post a diary when the post button is clicked', async () => {
    wrapper.vm.jpText = 'こんにちは';
    wrapper.vm.frText = 'Bonjour';
    wrapper.vm.privacyLevel = false;
    wrapper.vm.revisionRequested = false;

    await wrapper.vm.$nextTick();

    const postButton = wrapper.find('button');
    await postButton.trigger('click');

    expect(axiosInstance.post).toHaveBeenCalledWith('/post', {
      jpText: 'こんにちは',
      frText: 'Bonjour',
      privacyLevel: false,
      revisionRequested: false
    });

    expect(wrapper.vm.frText).toBe('Bonjour!');
    expect(wrapper.vm.aiText).toBe('AI created text');
    expect(wrapper.vm.isPosted).toBe(true);
  });
});
