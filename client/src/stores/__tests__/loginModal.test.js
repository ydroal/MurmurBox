import { setActivePinia, createPinia } from 'pinia';
import { describe, it, beforeEach, expect } from 'vitest';
import { useLoginModalStore } from '@/stores/loginModal';

describe('LoginModal Store Tests', () => {
  let loginModalStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    loginModalStore = useLoginModalStore();
  });

  it('should initialize with isOpen set to false', () => {
    expect(loginModalStore.isOpen).toBe(false);
  });

  it('should open the modal when openModal is called', () => {
    loginModalStore.openModal();
    expect(loginModalStore.isOpen).toBe(true);
  });

  it('should close the modal when closeModal is called', () => {
    loginModalStore.openModal();
    loginModalStore.closeModal();
    expect(loginModalStore.isOpen).toBe(false);
  });
});
