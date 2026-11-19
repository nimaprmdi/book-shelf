import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Library, Play, Quote, Star } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import QuoteCard from '../components/QuoteCard';
import QuoteFormModal from '../components/QuoteFormModal';
import ReaderMode from '../components/ReaderMode';
import SearchInput from '../components/SearchInput';
import { useLibrary } from '../store/LibraryContext';
import { useToast } from '../store/ToastContext';
import { useDocumentTitle, useHotkey } from '../lib/hooks';
import { normalize, pluralize } from '../lib/utils';

const SORTS = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  book: 'By book',
};

export default function AllQuotesPage() {
  const { books, quotes, deleteQuote } = useLibrary();
  const toast = useToast();
  const searchRef = useRef(null);

  const [query, setQuery] = useState('');
  const [bookFilter, setBookFilter] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const [editingQuote, setEditingQuote] = useState(null);
  const [deletingQuote, setDeletingQuote] = useState(null);
  const [readerOpen, setReaderOpen] = useState(false);

  useDocumentTitle('All quotes');
  useHotkey('/', () => searchRef.current?.focus());

  const bookById = useMemo(() => Object.fromEntries(books.map((b) => [b.id, b])), [books]);
  const sortedBooks = useMemo(() => [...books].sort((a, b) => a.title.localeCompare(b.title)), [books]);

  const visibleQuotes = useMemo(() => {
    const q = normalize(query);
    let list = quotes.filter((x) => bookById[x.bookId]);
    if (bookFilter !== 'all') list = list.filter((x) => x.bookId === bookFilter);
    if (favoritesOnly) list = list.filter((x) => x.favorite);
    if (q) {
      list = list.filter((x) => {
        const book = bookById[x.bookId];
        return (
          normalize(x.text).includes(q) ||
          normalize(x.note).includes(q) ||
          normalize(book.title).includes(q) ||
          normalize(book.author).includes(q)
        );
      });
    }
    const sorters = {
      newest: (a, b) => b.createdAt - a.createdAt,
      oldest: (a, b) => a.createdAt - b.createdAt,
      book: (a, b) =>
        bookById[a.bookId].title.localeCompare(bookById[b.bookId].title) || b.createdAt - a.createdAt,
    };
    return [...list].sort(sorters[sort]);
  }, [quotes, bookById, query, bookFilter, favoritesOnly, sort]);

  const filtersActive = query || bookFilter !== 'all' || favoritesOnly;

  return (
    <div className="container page">
      <header className="page-head">
        <div>
          <span className="eyebrow">
            <Quote size={13} /> Across {pluralize(books.length, 'book')}
          </span>
          <h1>All quotes</h1>
          <p className="page-sub">Search every passage you've saved, or flip through them in review mode.</p>
        </div>
        {visibleQuotes.length > 0 && (
          <button type="button" className="btn btn-primary btn-lg" onClick={() => setReaderOpen(true)}>
            <Play size={17} /> Review {filtersActive ? 'results' : 'all'}
          </button>
        )}
      </header>

      {quotes.length === 0 ? (
        <EmptyState
          icon={Quote}
          title="No quotes saved yet"
          text="Open a book from your library and add your first quote."
          action={
            <Link to="/" className="btn btn-primary">
              <Library size={18} /> Go to library
            </Link>
          }
        />
      ) : (
        <>
          <div className="toolbar toolbar-wide">
            <SearchInput
              ref={searchRef}
              value={query}
              onChange={setQuery}
              placeholder="Search quotes, notes, books, authors"
            />
            <select className="select" value={bookFilter} onChange={(e) => setBookFilter(e.target.value)} aria-label="Filter by book">
              <option value="all">All books</option>
              {sortedBooks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={`toggle ${favoritesOnly ? 'is-on' : ''}`}
              onClick={() => setFavoritesOnly((v) => !v)}
              aria-pressed={favoritesOnly}
            >
              <Star size={15} fill={favoritesOnly ? 'currentColor' : 'none'} /> Favorites
            </button>
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort quotes">
              {Object.entries(SORTS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {filtersActive && <p className="result-note">{pluralize(visibleQuotes.length, 'quote')} found</p>}

          {visibleQuotes.length === 0 ? (
            <EmptyState icon={Quote} title="No matching quotes" text="Try a different search or filter." />
          ) : (
            <div className="quote-list">
              {visibleQuotes.map((quote, i) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  book={bookById[quote.bookId]}
                  query={query}
                  showBook
                  onEdit={setEditingQuote}
                  onDelete={setDeletingQuote}
                  style={{ '--i': Math.min(i, 12) }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {editingQuote && (
        <QuoteFormModal
          book={bookById[editingQuote.bookId]}
          quote={editingQuote}
          onClose={() => setEditingQuote(null)}
        />
      )}
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
      {readerOpen && <ReaderMode quotes={visibleQuotes} onClose={() => setReaderOpen(false)} />}
    </div>
  );
}
