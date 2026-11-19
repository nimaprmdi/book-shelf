// Tiny promise wrapper around IndexedDB.
// IndexedDB (unlike localStorage) comfortably holds cover images.

const DB_NAME = 'quotebook';
const DB_VERSION = 1;

let dbPromise;

function openDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('books')) {
          db.createObjectStore('books', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('quotes')) {
          const quotes = db.createObjectStore('quotes', { keyPath: 'id' });
          quotes.createIndex('bookId', 'bookId');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function done(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function getAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName).objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function put(storeName, value) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).put(value);
  await done(tx);
  return value;
}

export async function remove(storeName, id) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).delete(id);
  await done(tx);
}

/** Deletes a book together with all of its quotes in one transaction. */
export async function removeBookWithQuotes(bookId) {
  const db = await openDB();
  const tx = db.transaction(['books', 'quotes'], 'readwrite');
  tx.objectStore('books').delete(bookId);
  const quoteStore = tx.objectStore('quotes');
  const cursorReq = quoteStore.index('bookId').openKeyCursor(IDBKeyRange.only(bookId));
  cursorReq.onsuccess = () => {
    const cursor = cursorReq.result;
    if (cursor) {
      quoteStore.delete(cursor.primaryKey);
      cursor.continue();
    }
  };
  await done(tx);
}

/** Writes many books and quotes at once (used by backup import). */
export async function bulkPut({ books = [], quotes = [] }) {
  const db = await openDB();
  const tx = db.transaction(['books', 'quotes'], 'readwrite');
  const bookStore = tx.objectStore('books');
  const quoteStore = tx.objectStore('quotes');
  books.forEach((b) => bookStore.put(b));
  quotes.forEach((q) => quoteStore.put(q));
  await done(tx);
}
