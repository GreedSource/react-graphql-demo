import { create } from 'zustand';
import { saveState, loadState } from './persistence';

const STORE_NAME = 'user';
const KEY = 'userState';
const DB_NAME = import.meta.env.VITE_INDEXED_DB_NAME;
const ENC_KEY = import.meta.env.VITE_CRYPTO_SECRET; // ideal: poner en env var

interface User {
  id: number;
  email: string;
  name: string;
  lastname: string;
  isAdmin: boolean;
}

interface UserState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (accessToken: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  setUser: (user) => {
    set((state) => {
      const newState = { ...state, user };
      saveState(DB_NAME, STORE_NAME, KEY, newState, ENC_KEY);
      return { user };
    });
  },
  setAccessToken: (accessToken) => {
    set((state) => {
      const newState = { ...state, accessToken };
      saveState(DB_NAME, STORE_NAME, KEY, newState, ENC_KEY);
      return { accessToken };
    });
  },
  setRefreshToken: (refreshToken) => {
    set((state) => {
      const newState = { ...state, refreshToken };
      saveState(DB_NAME, STORE_NAME, KEY, newState, ENC_KEY);
      return { refreshToken };
    });
  },
  logout: () => {
    set({ user: null, accessToken: null, refreshToken: null });
    saveState(
      DB_NAME,
      STORE_NAME,
      KEY,
      { user: null, accessToken: null, refreshToken: null },
      ENC_KEY
    );
  },
}));

export async function initializeUserStore() {
  const saved = await loadState<Partial<UserState>>(
    DB_NAME,
    STORE_NAME,
    KEY,
    ENC_KEY
  );
  if (saved) {
    useUserStore.setState({
      user: saved.user ?? null,
      accessToken: saved.accessToken ?? null,
      refreshToken: saved.refreshToken ?? null,
    });
  }
}
