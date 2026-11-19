# Quotebook

A personal app for saving the best quotes from the books you read, so you can reread them quickly later.
Built with React + Vite, styled with a dark navy and light-blue theme.

## Run it

```bash
npm install      # first time only
npm run dev      # then open http://localhost:5173
```

Production build: `npm run build`, then `npm run preview`.

## Features

- **Bookshelf**: add books with a title, author and an uploaded cover image. You can click the cover box or drag an image onto it. Books without a cover get a generated one.
- **Book page**: click a book to see its quotes. Add, edit, delete, favorite and copy quotes. Each quote can have a page number and a personal note.
- **Fast entry**: press <kbd>N</kbd> on a book page to add a quote. <kbd>Ctrl</kbd>+<kbd>Enter</kbd> saves it, and *Save & add another* keeps the form open for the next one.
- **All quotes**: search every quote, note, book and author at once, and filter by book or by favorites.
- **Review mode**: a full-screen reader that shows one quote at a time. Use <kbd>←</kbd>/<kbd>→</kbd> to move, <kbd>S</kbd> to shuffle and <kbd>F</kbd> to favorite.
- **Search shortcut**: press <kbd>/</kbd> on any page to jump to the search box.

## Where your data lives

Everything is stored in your browser's **IndexedDB** on this computer. There is no server and no account.
Covers are resized and compressed when you upload them, so they take up little space.

Clearing your browser's site data will erase the library. Use the **backup icon** in the top-right corner to
**Export** a `.json` backup now and then. **Import** merges a backup back in, or moves your library to
another browser or computer.

## Project structure

```
src/
  main.jsx                 app entry (router + providers)
  App.jsx                  layout and routes
  styles.css               all styles (theme colors are CSS variables at the top)
  store/LibraryContext.jsx books & quotes state + actions
  store/ToastContext.jsx   small notifications
  lib/db.js                IndexedDB helpers
  lib/utils.js             image compression, ids, formatting
  lib/hooks.js             keyboard shortcuts, page titles
  components/              BookCard, BookCover, QuoteCard, modals, ReaderMode, ...
  pages/                   LibraryPage, BookPage, AllQuotesPage
```

To change the colors, edit the variables in `:root` at the top of `src/styles.css`.
