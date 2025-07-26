import { openDB } from 'idb';
import CryptoJS from 'crypto-js';

export async function getDB(dbName: string, storeName: string) {
  return openDB(dbName, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    },
  });
}

export async function saveState<T>(
  dbName: string,
  storeName: string,
  key: string,
  state: T,
  encryptionKey: string
) {
  const db = await getDB(dbName, storeName);
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(state),
    encryptionKey
  ).toString();
  await db.put(storeName, encrypted, key);
}

export async function loadState<T>(
  dbName: string,
  storeName: string,
  key: string,
  encryptionKey: string
): Promise<T | null> {
  const db = await getDB(dbName, storeName);
  const encrypted = await db.get(storeName, key);
  if (!encrypted) return null;
  const bytes = CryptoJS.AES.decrypt(encrypted, encryptionKey);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted) as T;
}
