import { mount } from '@vue/test-utils';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import DateBox from '@/components/DateBox.vue';

// モックの日付 (2024年10月1日 火曜日)
const mockDate = new Date(2024, 9, 1); // 月は0から始まるため、9は10月

describe('DateBox.vue Tests', () => {
  let wrapper;

  beforeEach(() => {
    // Date をモックする
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    wrapper = mount(DateBox);
  });

  afterEach(() => {
    vi.useRealTimers(); // テスト終了後に元のタイマーに戻す
  });

  it('should render the component correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should format the date correctly', () => {
    const formattedDate = wrapper.find('strong'); // 日付が表示されるstrongタグを検索
    expect(formattedDate.exists()).toBe(true); // strongタグが存在するか
    expect(formattedDate.text()).toBe('10.1'); // フランス式の日付フォーマット "日.月" 形式
  });

  it('should format the weekday correctly', () => {
    const formattedWeekday = wrapper.find('span'); // 曜日が表示されるspanタグを検索
    expect(formattedWeekday.exists()).toBe(true); // spanタグが存在するか
    expect(formattedWeekday.text()).toBe('/ mar'); // フランス語の短縮形式の曜日
  });

  // コンポーネントのマウント時に onMountedフックが呼び出され、日付と曜日が正しくセットされるか
  it('should update formattedDate and formattedWeekday on mounted', () => {
    expect(wrapper.vm.formattedDate).toBe('10.1');
    expect(wrapper.vm.formattedWeekday).toBe('/ mar');
  });
});
