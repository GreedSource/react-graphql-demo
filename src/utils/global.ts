import { openDB, deleteDB } from 'idb';
import { useUserStore } from '@/stores/user.store';

export const logoutAll = async () => {
  const DB_NAME = import.meta.env.VITE_INDEXED_DB_NAME;

  // Intenta abrir la DB para cerrar cualquier conexión
  try {
    const db = await openDB(DB_NAME, 1);
    db.close(); // muy importante: cierra antes de eliminar
  } catch (error) {
    console.warn('No se pudo abrir la DB para cerrar:', error);
  }

  // Ahora elimina la DB
  try {
    await deleteDB(DB_NAME, {
      blocked() {
        console.warn('Eliminación bloqueada: aún hay conexiones abiertas');
      },
    });
    console.log(`✅ IndexedDB "${DB_NAME}" eliminada`);
  } catch (error) {
    console.error(`❌ Error al eliminar IndexedDB "${DB_NAME}"`, error);
  }

  // Limpia Zustand también
  useUserStore.setState({
    user: null,
    accessToken: null,
    refreshToken: null,
  });
};
