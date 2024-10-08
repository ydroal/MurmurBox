import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import axiosInstance from '@/axios';
import AccountView from '@/views/AccountView.vue';

// URL.createObjectURLのモック
global.URL.createObjectURL = vi.fn(() => 'mocked-url');

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(() => Promise.resolve('https://example.com/profile_images/123_1728037600897.jpg'))
}));

vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({
    user: {
      username: 'Test User',
      email: 'test@example.com',
      uid: '123',
      profileImageUrl: 'https://example.com/profile_images/123_1728036874150.jpg'
    }
  }))
}));

vi.mock('@/axios.js', () => {
  const axiosInstance = {
    put: vi.fn(() =>
      Promise.resolve({
        status: 200,
        data: { user: { username: 'testuser', profileImageUrl: 'http://example.com/new-image.jpg' } }
      })
    ),
  };

  return {
    __esModule: true, // ESモジュールのデフォルトエクスポートを使用することを指定
    default: axiosInstance // axiosInstanceをデフォルトエクスポート
  };
});

describe('AccountView.vue Tests', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(AccountView);
  });

  it('should display correct user information', () => {
    const usernameInput = wrapper.find('[data-testid="username-input"]');
    expect(usernameInput.element.value).toBe('Test User');

    const emailInput = wrapper.find('[data-testid="email-input"]');
    expect(emailInput.element.value).toBe('test@example.com');
  });

  it('should enter edit mode when edit button is clicked', async () => {
    await wrapper.find('[data-testid="edit-button"]').trigger('click');

    expect(wrapper.vm.editMode).toBe(true);
  });

  it('should upload an image and update user info', async () => {
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
  
    // Editボタンをクリックして編集モードに切り替え
    await wrapper.find('[data-testid="edit-button"]').trigger('click');
  
    // Vueが再描画するまで待機
    await wrapper.vm.$nextTick();
  
    // 編集モードが true であることを確認
    expect(wrapper.vm.editMode).toBe(true);
  
    // input[type="file"] が存在するか確認
    const input = wrapper.find('input[type="file"]');
    expect(input.exists()).toBe(true);
  
    // ファイルの設定とイベントのトリガー
    Object.defineProperty(input.element, 'files', {
      value: [file],
    });
    await input.trigger('change');
  
    // Vueがファイル選択に基づいて再描画するまで待機
    await wrapper.vm.$nextTick();
  
    // Updateボタンをクリックしてアップロードをトリガー
    const updateButton = wrapper.find('[data-testid="update-button"]');
    expect(updateButton.exists()).toBe(true);
    await updateButton.trigger('click');
  
    // Vueが再描画するまで待機
    await wrapper.vm.$nextTick();
  
    // アップロードおよび更新の確認
    expect(uploadBytes).toHaveBeenCalled(); // Ensure the image is uploaded
    expect(axiosInstance.put).toHaveBeenCalled(); // Ensure the data is sent
  });
  
});
