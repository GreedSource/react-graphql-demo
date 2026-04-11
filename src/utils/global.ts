import { deleteDB } from 'idb';
import { useUserStore } from '@/stores/user.store';

export const logoutAll = async () => {
  const DB_NAME = import.meta.env.VITE_INDEXED_DB_NAME;

  // Try to delete the DB — if it doesn't exist, the catch handles it silently.
  // This avoids the expensive open+close+delete cycle on first visit.
  try {
    await deleteDB(DB_NAME, {
      blocked() {
        // Force-close any remaining connections and retry
        void deleteDB(DB_NAME);
      },
    });
  } catch {
    // Non-critical; DB may not exist or is already deleted.
  }

  // Limpia Zustand también
  useUserStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
    sessionChecked: true,
  });
};
