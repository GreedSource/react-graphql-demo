import { initializeUserStore } from './user.store';

/**
 * Initializes all persisted Zustand stores before the application renders.
 * Each initializer resolves independently; a failure in one store does not
 * prevent others from loading. Add new store initializers to the array below.
 */
export async function initializeStores() {
  const results = await Promise.allSettled([
    initializeUserStore(),
  ]);

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.warn(`Store initializer at index ${index} failed:`, result.reason);
    }
  });
}
