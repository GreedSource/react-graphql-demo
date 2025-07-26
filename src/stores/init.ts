// src/stores/init.ts
import { initializeUserStore } from './user.store';
// importa los demás aquí
// import { initializeOtherStore } from './other.store';

export async function initializeStores() {
  await Promise.all([
    initializeUserStore(),
    // initializeOtherStore(),
    // ...
  ]);
}
