import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import PopupForm from '@/components/PopupForm.vue';

describe('PopupForm.vue Tests', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(PopupForm, {
      props: {
        isVisible: true,
        title: 'Add Comment',
        placeholder: 'コメントを入力してください',
        inputText: 'Test text'
      }
    });
  });

  it('should render when isVisible is true', () => {
    expect(wrapper.isVisible()).toBe(true);
  });

  it('should not render when isVisible is false', async () => {
    await wrapper.setProps({ isVisible: false });
    expect(wrapper.isVisible()).toBe(false);
  });

  it('should display the correct title', () => {
    const title = wrapper.find('h3');
    expect(title.text()).toBe('Add Comment');
  });

  it('should set the correct placeholder', () => {
    const textarea = wrapper.find('textarea');
    expect(textarea.attributes('placeholder')).toBe('コメントを入力してください');
  });

  it('should emit submit event with correct input when Post button is clicked', async () => {
    const textarea = wrapper.find('textarea');
    await textarea.setValue('New input');
    await wrapper.vm.$nextTick();

    const postButton = wrapper.find('button.bg-orange');
    await postButton.trigger('click');
    await wrapper.vm.$nextTick();

    // コンポーネントから発火されたすべてのイベントを取得
    const emitted = wrapper.emitted();

    expect(emitted).toHaveProperty('submit');
    // submitイベントの引数が期待通りか確認
    expect(wrapper.emitted('submit')[0]).toEqual(['New input']);
    expect(wrapper.vm.localInputText).toBe('');
  });

  it('should not emit submit event if input is empty', async () => {
    const textarea = wrapper.find('textarea');
    await textarea.setValue('');
    await wrapper.vm.$nextTick();

    const postButton = wrapper.find('button.bg-orange');
    await postButton.trigger('click');
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted();
    // submitイベントが発火されていないことを確認
    expect(emitted).not.toHaveProperty('submit');
  });

  it('should emit close event when close button is clicked', async () => {
    const closeButton = wrapper.find('button');
    await closeButton.trigger('click');
    const emitted = wrapper.emitted();
    expect(emitted).toHaveProperty('close');
    expect(emitted.close[0]).toEqual([]);
  });
});
