import { create } from 'zustand';
import { saveState, loadState } from './persistence';
import type { AuthPayload, ImpersonationState, User } from '@/types/admin';

const STORE_NAME = 'user';
const KEY = 'userState';
const DB_NAME = import.meta.env.VITE_INDEXED_DB_NAME;
const ENC_KEY = import.meta.env.VITE_CRYPTO_SECRET || 'local-dev-secret';

interface UserState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  sessionChecked: boolean;
  impersonation: ImpersonationState | null;
  setUser: (user: User | null) => void;
  setSession: (payload: {
    user: User | null;
    accessToken?: string | null;
    refreshToken?: string | null;
  }) => void;
  setAccessToken: (accessToken: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setSessionChecked: (value: boolean) => void;
  beginImpersonation: (payload: AuthPayload, returnPath: string) => void;
  endImpersonation: (payload: AuthPayload) => string | null;
  restoreOriginalSession: () => string | null;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  sessionChecked: false,
  impersonation: null,
  setUser: (user) => {
    set((state) => {
      const newState = { ...state, user };
      saveState(DB_NAME, STORE_NAME, KEY, newState, ENC_KEY);
      return { user };
    });
  },
  setSession: ({ user, accessToken, refreshToken }) => {
    set((state) => {
      const nextState = {
        ...state,
        user,
        accessToken: accessToken ?? state.accessToken,
        refreshToken: refreshToken ?? state.refreshToken,
      };
      saveState(DB_NAME, STORE_NAME, KEY, nextState, ENC_KEY);
      return nextState;
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
  setSessionChecked: (sessionChecked) => {
    set((state) => {
      const newState = { ...state, sessionChecked };
      saveState(DB_NAME, STORE_NAME, KEY, newState, ENC_KEY);
      return { sessionChecked };
    });
  },
  beginImpersonation: (payload, returnPath) => {
    set((state) => {
      if (!state.user || !state.accessToken || !state.refreshToken) {
        return state;
      }

      const nextState = {
        ...state,
        user: payload.user,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        impersonation: {
          originalSession: {
            user: state.user,
            accessToken: state.accessToken,
            refreshToken: state.refreshToken,
          },
          returnPath,
        },
      };
      saveState(DB_NAME, STORE_NAME, KEY, nextState, ENC_KEY);
      return nextState;
    });
  },
  endImpersonation: (payload) => {
    let returnPath: string | null = null;
    set((state) => {
      returnPath = state.impersonation?.returnPath ?? null;
      const nextState = {
        ...state,
        user: payload.user,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        sessionChecked: true,
        impersonation: null,
      };
      saveState(DB_NAME, STORE_NAME, KEY, nextState, ENC_KEY);
      return nextState;
    });
    return returnPath;
  },
  restoreOriginalSession: () => {
    let returnPath: string | null = null;
    set((state) => {
      const originalSession = state.impersonation?.originalSession;
      returnPath = state.impersonation?.returnPath ?? null;

      if (!originalSession) {
        return state;
      }

      const nextState = {
        ...state,
        user: originalSession.user,
        accessToken: originalSession.accessToken,
        refreshToken: originalSession.refreshToken,
        sessionChecked: true,
        impersonation: null,
      };
      saveState(DB_NAME, STORE_NAME, KEY, nextState, ENC_KEY);
      return nextState;
    });
    return returnPath;
  },
  logout: () => {
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      sessionChecked: true,
      impersonation: null,
    });
    saveState(
      DB_NAME,
      STORE_NAME,
      KEY,
      {
        user: null,
        accessToken: null,
        refreshToken: null,
        sessionChecked: true,
        impersonation: null,
      },
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
      sessionChecked: saved.sessionChecked ?? false,
      impersonation: saved.impersonation ?? null,
    });
  }
}
