import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookX, Pencil, Play, Plus, Quote, Star, Trash2 } from 'lucide-react';
import BookCover from '../components/BookCover';
import BookFormModal from '../components/BookFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import QuoteCard from '../components/QuoteCard';
import QuoteFormModal from '../components/QuoteFormModal';
import ReaderMode from '../components/ReaderMode';
import SearchInput from '../components/SearchInput';
import { useLibrary } from '../store/LibraryContext';
import { useToast } from '../store/ToastContext';
import { useDocumentTitle, useHotkey } from '../lib/hooks';
import { comparePages, formatDate, normalize, pluralize } from '../lib/utils';

const SORTS = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  page: 'By page',
};

export default function BookPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { books, quotes, deleteBook, deleteQuote } = useLibrary();
  const searchRef = useRef(null);

  const [query, setQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState(() => localStorage.getItem('qb-quote-sort') || 'newest');
  const [showAddQuote, setShowAddQuote] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [deletingQuote, setDeletingQuote] = useState(null);
  const [editingBook, setEditingBook] = useState(false);
  const [deletingBook, setDeletingBook] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);

  const book = books.find((b) => b.id === bookId);
  const bookQuotes = useMemo(() => quotes.filter((q) => q.bookId === bookId), [quotes, bookId]);

  useDocumentTitle(book?.title ?? 'Book not found');
  useHotkey('n', () => setShowAddQuote(true), Boolean(book));
  useHotkey('/', () => searchRef.current?.focus(), Boolean(book));

  const visibleQuotes = useMemo(() => {
    const q = normalize(query);
    let list = bookQuotes;
    if (favoritesOnly) list = list.filter((x) => x.favorite);
    if (q) list = list.filter((x) => normalize(x.text).includes(q) || normalize(x.note).includes(q));
    const sorters = {
      newest: (a, b) => b.createdAt - a.createdAt,
      oldest: (a, b) => a.createdAt - b.createdAt,
      page: (a, b) => comparePages(a.page, b.page) || a.createdAt - b.createdAt,
    };
    return [...list].sort(sorters[sort] || sorters.newest);
  }, [bookQuotes, query, favoritesOnly, sort]);

  if (!book) {
    return (
      <div className="container page">
        <EmptyState
          icon={BookX}
          title="Book not found"
          text="It may have been deleted, or the link is wrong."
          action={
            <Link to="/" className="btn btn-primary">
              <ArrowLeft size={18} /> Back to library
            </Link>
          }
        />
      </div>
    );
  }

  const favoritesCount = bookQuotes.filter((q) => q.favorite).length;
  const changeSort = (value) => {
    setSort(value);
    localStorage.setItem('qb-quote-sort', value);
  };

  return (
    <div className="book-page">
      <section className="book-hero">
        {book.cover && <div className="book-hero-backdrop" style={{ backgroundImage: `url(${book.cover})` }} />}
        <div className="container book-hero-inner">
          <div className="book-hero-top">
            <Link to="/" className="back-link">
              <ArrowLeft size={17} /> Library
            </Link>
            <div className="book-hero-tools">
              <button
                type="button"
                className="icon-btn icon-btn-lg"
                onClick={() => setEditingBook(true)}
                aria-label="Edit book"
                title="Edit book"
              >
                <Pencil size={17} />
              </button>
              <button
                type="button"
                className="icon-btn icon-btn-lg icon-btn-danger"
                onClick={() => setDeletingBook(true)}
                aria-label="Delete book"
                title="Delete book"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>

          <div className="book-hero-main">
            <div className="book-hero-cover">
              <BookCover book={book} className="cover-fill" />
            </div>

            <div className="book-hero-info">
              <span className="eyebrow">
                <Quote size={13} /> {pluralize(bookQuotes.length, 'quote')}
              </span>
              <h1>{book.title}</h1>
              <p className="book-hero-author">{book.author ? `by ${book.author}` : 'Unknown author'}</p>
              <p className="book-hero-meta">
                <span>
                  <Star size={14} /> {pluralize(favoritesCount, 'favorite')}
                </span>
                <span>Added {formatDate(book.createdAt)}</span>
              </p>

              <div className="book-hero-actions">
                <button type="button" className="btn btn-primary btn-lg" onClick={() => setShowAddQuote(true)}>
                  <Plus size={19} /> Add quote
                </button>
                {bookQuotes.length > 0 && (
                  <button type="button" className="btn btn-secondary btn-lg" onClick={() => setReaderOpen(true)}>
                    <Play size={17} /> Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2>
            Quotes <span className="count-pill">{bookQuotes.length}</span>
          </h2>
          {bookQuotes.length > 0 && (
            <div className="toolbar">
              <SearchInput ref={searchRef} value={query} onChange={setQuery} placeholder="Search quotes and notes" />
              <button
                type="button"
                className={`toggle ${favoritesOnly ? 'is-on' : ''}`}
                onClick={() => setFavoritesOnly((v) => !v)}
                aria-pressed={favoritesOnly}
              >
                <Star size={15} fill={favoritesOnly ? 'currentColor' : 'none'} /> Favorites
              </button>
              <select className="select" value={sort} onChange={(e) => changeSort(e.target.value)} aria-label="Sort quotes">
                {Object.entries(SORTS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {bookQuotes.length === 0 ? (
          <EmptyState
            icon={Quote}
            title="No quotes yet"
            text={
              <>
                Found a line worth keeping? Save it here. Tip: press <kbd>N</kbd> anywhere on this page.
              </>
            }
            action={
              <button type="button" className="btn btn-primary" onClick={() => setShowAddQuote(true)}>
                <Plus size={18} /> Add the first quote
              </button>
            }
          />
        ) : visibleQuotes.length === 0 ? (
          <EmptyState
            icon={Quote}
            title="No matching quotes"
            text={favoritesOnly && !query ? 'No favorites in this book yet — tap the star on a quote.' : `Nothing found for “${query}”.`}
          />
        ) : (
          <div className="quote-list">
            {visibleQuotes.map((quote, i) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                book={book}
                query={query}
                onEdit={setEditingQuote}
                onDelete={setDeletingQuote}
                style={{ '--i': Math.min(i, 12) }}
              />
            ))}
          </div>
        )}
      </section>

      <button
        type="button"
        className="fab"
        onClick={() => setShowAddQuote(true)}
        aria-label="Add quote"
        title="Add quote (N)"
      >
        <Plus size={24} />
      </button>

      {showAddQuote && <QuoteFormModal book={book} onClose={() => setShowAddQuote(false)} />}
      {editingQuote && <QuoteFormModal book={book} quote={editingQuote} onClose={() => setEditingQuote(null)} />}
      {deletingQuote && (
        <ConfirmDialog
          title="Delete this quote?"
          message="This quote will be permanently removed."
          onClose={() => setDeletingQuote(null)}
          onConfirm={async () => {
            await deleteQuote(deletingQuote.id);
            toast('Quote deleted');
          }}
        />
      )}
      {editingBook && <BookFormModal book={book} onClose={() => setEditingBook(false)} />}
      {deletingBook && (
        <ConfirmDialog
          title={`Delete “${book.title}”?`}
          message={
            bookQuotes.length
              ? `The book and its ${pluralize(bookQuotes.length, 'quote')} will be permanently removed.`
              : 'The book will be permanently removed.'
          }
          confirmLabel="Delete book"
          onClose={() => setDeletingBook(false)}
          onConfirm={async () => {
            await deleteBook(book.id);
            toast('Book deleted');
            navigate('/');
          }}
        />
      )}
      {readerOpen && <ReaderMode quotes={visibleQuotes} onClose={() => setReaderOpen(false)} />}
    </div>
  );
}
