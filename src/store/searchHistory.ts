import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const KEY = 'aqrobazar.searchHistory';
const MAX = 10;

export interface SearchEntry {
  query: string;
  categoryId: string | null;
  categoryName: string;
}

interface State {
  entries: SearchEntry[];
  hydrated: boolean;
  hydrate(): Promise<void>;
  add(entry: SearchEntry): Promise<void>;
  remove(query: string): Promise<void>;
  clear(): Promise<void>;
}

const persist = (entries: SearchEntry[]) =>
  AsyncStorage.setItem(KEY, JSON.stringify(entries)).catch(() => undefined);

export const useSearchHistory = create<State>((set, get) => ({
  entries: [],
  hydrated: false,

  async hydrate() {
    if (get().hydrated) return;
    try {
      const raw = await AsyncStorage.getItem(KEY);
      set({ entries: raw ? (JSON.parse(raw) as SearchEntry[]) : [], hydrated: true });
    } catch {
      set({ entries: [], hydrated: true });
    }
  },

  async add(entry) {
    const query = entry.query.trim();
    if (!query) return;
    const rest = get().entries.filter((e) => e.query.toLowerCase() !== query.toLowerCase());
    const entries = [{ ...entry, query }, ...rest].slice(0, MAX);
    set({ entries });
    await persist(entries);
  },

  async remove(query) {
    const entries = get().entries.filter((e) => e.query !== query);
    set({ entries });
    await persist(entries);
  },

  async clear() {
    set({ entries: [] });
    await persist([]);
  },
}));
