import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import Snackbar from '@/components/Snackbar.vue';

describe('Snackbar.vue Tests', () => {
  it('should display the snackbar with the correct message when visible', async () => {
    const wrapper = mount(Snackbar, {
      props: {
        message: 'Test message',
        isVisible: true
      }
    });

    expect(wrapper.text()).toContain('Test message');

    const snackbar = wrapper.find('.snackbar');
    expect(snackbar.exists()).toBe(true);
  });

  // Snackbarが非表示のとき、表示されないかを確認
  it('should not display the snackbar when isVisible is false', async () => {
    const wrapper = mount(Snackbar, {
      props: {
        message: 'Test message',
        isVisible: false
      }
    });

    const snackbar = wrapper.find('.snackbar');
    expect(snackbar.exists()).toBe(false);
  });

  // Snackbarが再度表示される際にメッセージが更新されるか確認
  it('should update the message when props change', async () => {
    const wrapper = mount(Snackbar, {
      props: {
        message: 'First message',
        isVisible: true
      }
    });

    expect(wrapper.text()).toContain('First message');

    // 新しいメッセージを設定
    await wrapper.setProps({ message: 'Updated message' });

    // 新しいメッセージが表示されているか確認
    expect(wrapper.text()).toContain('Updated message');
  });
});
