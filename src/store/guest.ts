import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const ANON_KEY = 'aqrobazar.anonId';

interface GuestState {
  anonId: string | null;
  hydrate(): Promise<string>;
}

function generateId() {
  return `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useGuestStore = create<GuestState>((set, get) => ({
  anonId: null,
  async hydrate() {
    const existing = get().anonId;
    if (existing) return existing;
    let id = await AsyncStorage.getItem(ANON_KEY);
    if (!id) {
      id = generateId();
      await AsyncStorage.setItem(ANON_KEY, id);
    }
    set({ anonId: id });
    return id;
  },
}));
