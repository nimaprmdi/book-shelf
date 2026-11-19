import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Shuffle, Star, X } from 'lucide-react';
import BookCover from './BookCover';
import { useLibrary } from '../store/LibraryContext';

function shuffled(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Full-screen, distraction-free way to flip through quotes quickly.
 * Keys: ← / → (or Space) to move, S to shuffle, F to favorite, Esc to close.
 */
export default function ReaderMode({ quotes: initialQuotes, onClose }) {
  const { books, quotes: liveQuotes, toggleFavorite } = useLibrary();
  const [order, setOrder] = useState(() => initialQuotes.map((q) => q.id));
  const [index, setIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);

  const bookById = useMemo(() => Object.fromEntries(books.map((b) => [b.id, b])), [books]);
  const quoteById = useMemo(() => Object.fromEntries(liveQuotes.map((q) => [q.id, q])), [liveQuotes]);

  const ids = order.filter((id) => quoteById[id]);
  const total = ids.length;
  const safeIndex = Math.min(index, Math.max(0, total - 1));
  const quote = quoteById[ids[safeIndex]];
  const book = quote ? bookById[quote.bookId] : null;

  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const toggleShuffle = () => {
    setOrder(isShuffled ? initialQuotes.map((q) => q.id) : shuffled(initialQuotes.map((q) => q.id)));
    setIsShuffled((s) => !s);
    setIndex(0);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') prev();
      else if (e.key.toLowerCase() === 's') toggleShuffle();
      else if (e.key.toLowerCase() === 'f' && quote) toggleFavorite(quote.id);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  });

  if (!quote) return null;

  const progress = ((safeIndex + 1) / total) * 100;
  const longQuote = quote.text.length > 320;

  return createPortal(
    <div className="reader" role="dialog" aria-modal="true" aria-label="Reading mode">
      {book?.cover && <div className="reader-backdrop" style={{ backgroundImage: `url(${book.cover})` }} />}

      <div className="reader-progress">
        <span style={{ width: `${progress}%` }} />
      </div>

      <header className="reader-top">
        <span className="reader-count">
          {safeIndex + 1} <span>/ {total}</span>
        </span>
        <div className="reader-top-actions">
          <button
            type="button"
            className={`icon-btn ${isShuffled ? 'is-active' : ''}`}
            onClick={toggleShuffle}
            title="Shuffle (S)"
            aria-label="Shuffle"
            aria-pressed={isShuffled}
          >
            <Shuffle size={19} />
          </button>
          <button
            type="button"
            className={`icon-btn ${quote.favorite ? 'is-active' : ''}`}
            onClick={() => toggleFavorite(quote.id)}
            title="Favorite (F)"
            aria-label="Favorite"
            aria-pressed={quote.favorite}
          >
            <Star size={19} fill={quote.favorite ? 'currentColor' : 'none'} />
          </button>
          <button type="button" className="icon-btn" onClick={onClose} title="Close (Esc)" aria-label="Close">
            <X size={20} />
          </button>
        </div>
      </header>

      <main className="reader-stage">
        <button type="button" className="reader-nav reader-nav-prev" onClick={prev} aria-label="Previous quote">
          <ChevronLeft size={28} />
        </button>

        <figure key={quote.id} className="reader-quote">
          <span className="reader-mark" aria-hidden="true">
            “
          </span>
          <blockquote className={longQuote ? 'is-long' : ''}>{quote.text}</blockquote>
          {quote.note && <p className="reader-note">{quote.note}</p>}
          {book && (
            <figcaption>
              <BookCover book={book} className="cover-thumb" />
              <span>
                <strong>{book.title}</strong>
                <small>
                  {[book.author, quote.page && `p. ${quote.page}`].filter(Boolean).join(' · ')}
                </small>
              </span>
            </figcaption>
          )}
        </figure>

        <button type="button" className="reader-nav reader-nav-next" onClick={next} aria-label="Next quote">
          <ChevronRight size={28} />
        </button>
      </main>

      <footer className="reader-help">
        <span><kbd>←</kbd><kbd>→</kbd> navigate</span>
        <span><kbd>S</kbd> shuffle</span>
        <span><kbd>F</kbd> favorite</span>
        <span><kbd>Esc</kbd> close</span>
      </footer>
    </div>,
    document.body
  );
}
