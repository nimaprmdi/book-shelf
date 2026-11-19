import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as db from '../lib/db';
import { uid } from '../lib/utils';

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs let the stable callbacks below read the latest state.
  const booksRef = useRef(books);
  const quotesRef = useRef(quotes);
  booksRef.current = books;
  quotesRef.current = quotes;

  useEffect(() => {
    Promise.all([db.getAll('books'), db.getAll('quotes')])
      .then(([b, q]) => {
        setBooks(b);
        setQuotes(q);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));

    // Ask the browser not to evict our data when disk space runs low.
    navigator.storage?.persist?.().catch(() => {});
  }, []);

  /* ---------- Books ---------- */

  const addBook = useCallback(async ({ title, author, cover }) => {
    const now = Date.now();
    const book = {
      id: uid(),
      title: title.trim(),
      author: (author || '').trim(),
      cover: cover || null,
      createdAt: now,
      updatedAt: now,
    };
    await db.put('books', book);
    setBooks((prev) => [...prev, book]);
    return book;
  }, []);

  const updateBook = useCallback(async (id, changes) => {
    const current = booksRef.current.find((b) => b.id === id);
    if (!current) return null;
    const book = {
      ...current,
      ...changes,
      title: (changes.title ?? current.title).trim(),
      author: (changes.author ?? current.author).trim(),
      updatedAt: Date.now(),
    };
    await db.put('books', book);
    setBooks((prev) => prev.map((b) => (b.id === id ? book : b)));
    return book;
  }, []);

  const deleteBook = useCallback(async (id) => {
    await db.removeBookWithQuotes(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
    setQuotes((prev) => prev.filter((q) => q.bookId !== id));
  }, []);

  /* ---------- Quotes ---------- */

  const addQuote = useCallback(async (bookId, { text, page, note }) => {
    const now = Date.now();
    const quote = {
      id: uid(),
      bookId,
      text: text.trim(),
      page: (page || '').trim(),
      note: (note || '').trim(),
      favorite: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.put('quotes', quote);
    setQuotes((prev) => [...prev, quote]);
    return quote;
  }, []);

  const updateQuote = useCallback(async (id, changes) => {
    const current = quotesRef.current.find((q) => q.id === id);
    if (!current) return null;
    const quote = { ...current, ...changes, updatedAt: Date.now() };
    if (typeof changes.text === 'string') quote.text = changes.text.trim();
    if (typeof changes.page === 'string') quote.page = changes.page.trim();
    if (typeof changes.note === 'string') quote.note = changes.note.trim();
    await db.put('quotes', quote);
    setQuotes((prev) => prev.map((q) => (q.id === id ? quote : q)));
    return quote;
  }, []);

  const toggleFavorite = useCallback(
    (id) => {
      const current = quotesRef.current.find((q) => q.id === id);
      if (current) return updateQuote(id, { favorite: !current.favorite });
    },
    [updateQuote]
  );

  const deleteQuote = useCallback(async (id) => {
    await db.remove('quotes', id);
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  }, []);

  /* ---------- Backup ---------- */

  const exportData = useCallback(() => {
    const payload = {
      app: 'quotebook',
      version: 1,
      exportedAt: new Date().toISOString(),
      books: booksRef.current,
      quotes: quotesRef.current,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotebook-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  /** Merges a backup into the library. Items with the same id are overwritten. */
  const importData = useCallback(async (file) => {
    const data = JSON.parse(await file.text());
    if (!data || !Array.isArray(data.books) || !Array.isArray(data.quotes)) {
      throw new Error('This file is not a Quotebook backup.');
    }
    const validBooks = data.books.filter((b) => b && b.id && typeof b.title === 'string');
    const bookIds = new Set([...booksRef.current.map((b) => b.id), ...validBooks.map((b) => b.id)]);
    const validQuotes = data.quotes.filter(
      (q) => q && q.id && typeof q.text === 'string' && bookIds.has(q.bookId)
    );

    await db.bulkPut({ books: validBooks, quotes: validQuotes });

    const merge = (prev, incoming) => {
      const map = new Map(prev.map((x) => [x.id, x]));
      incoming.forEach((x) => map.set(x.id, x));
      return [...map.values()];
    };
    setBooks((prev) => merge(prev, validBooks));
    setQuotes((prev) => merge(prev, validQuotes));
    return { books: validBooks.length, quotes: validQuotes.length };
  }, []);

  /* ---------- Derived data ---------- */

  const quoteCountByBook = useMemo(() => {
    const counts = {};
    quotes.forEach((q) => {
      counts[q.bookId] = (counts[q.bookId] || 0) + 1;
    });
    return counts;
  }, [quotes]);

  const lastActivityByBook = useMemo(() => {
    const last = {};
    books.forEach((b) => (last[b.id] = b.updatedAt || b.createdAt));
    quotes.forEach((q) => {
      if (!last[q.bookId] || q.createdAt > last[q.bookId]) last[q.bookId] = q.createdAt;
    });
    return last;
  }, [books, quotes]);

  const value = useMemo(
    () => ({
      books,
      quotes,
      loading,
      error,
      quoteCountByBook,
      lastActivityByBook,
      addBook,
      updateBook,
      deleteBook,
      addQuote,
      updateQuote,
      toggleFavorite,
      deleteQuote,
      exportData,
      importData,
    }),
    [
      books,
      quotes,
      loading,
      error,
      quoteCountByBook,
      lastActivityByBook,
      addBook,
      updateBook,
      deleteBook,
      addQuote,
      updateQuote,
      toggleFavorite,
      deleteQuote,
      exportData,
      importData,
    ]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside <LibraryProvider>');
  return ctx;
}
