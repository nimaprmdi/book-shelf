import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, BookPlus, Play, Quote, Shuffle, Star } from 'lucide-react';
import BookCard from '../components/BookCard';
import BookCover from '../components/BookCover';
import BookFormModal from '../components/BookFormModal';
import EmptyState from '../components/EmptyState';
import ReaderMode from '../components/ReaderMode';
import SearchInput from '../components/SearchInput';
import { useLibrary } from '../store/LibraryContext';
import { useDocumentTitle, useHotkey } from '../lib/hooks';
import { normalize, pluralize } from '../lib/utils';

const SORTS = {
  recent: 'Recently active',
  added: 'Recently added',
  title: 'Title A–Z',
  quotes: 'Most quotes',
};

export default function LibraryPage() {
  const { books, quotes, quoteCountByBook, lastActivityByBook } = useLibrary();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(() => localStorage.getItem('qb-book-sort') || 'recent');
  const [showAdd, setShowAdd] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);
  const [seed, setSeed] = useState(() => Math.random());

  useDocumentTitle('Library');
  useHotkey('/', () => searchRef.current?.focus());
  useHotkey('b', () => setShowAdd(true));

  const changeSort = (value) => {
    setSort(value);
    localStorage.setItem('qb-book-sort', value);
  };

  const visibleBooks = useMemo(() => {
    const q = normalize(query);
    const list = q
      ? books.filter((b) => normalize(b.title).includes(q) || normalize(b.author).includes(q))
      : [...books];
    const sorters = {
      recent: (a, b) => (lastActivityByBook[b.id] || 0) - (lastActivityByBook[a.id] || 0),
      added: (a, b) => b.createdAt - a.createdAt,
      title: (a, b) => a.title.localeCompare(b.title),
      quotes: (a, b) => (quoteCountByBook[b.id] || 0) - (quoteCountByBook[a.id] || 0),
    };
    return list.sort(sorters[sort] || sorters.recent);
  }, [books, query, sort, quoteCountByBook, lastActivityByBook]);

  const favoritesCount = quotes.filter((q) => q.favorite).length;
  const spotlight = quotes.length ? quotes[Math.floor(seed * quotes.length)] : null;
  const spotlightBook = spotlight ? books.find((b) => b.id === spotlight.bookId) : null;

  const shuffleSpotlight = () => {
    if (quotes.length < 2) return;
    const current = Math.floor(seed * quotes.length);
    let nextSeed = Math.random();
    while (Math.floor(nextSeed * quotes.length) === current) nextSeed = Math.random();
    setSeed(nextSeed);
  };

  return (
    <div className="container page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <BookOpen size={14} /> Your reading companion
          </span>
          <h1>
            Every line worth <span className="gradient-text">remembering</span>.
          </h1>
          <p className="hero-sub">
            Collect the passages that moved you, book by book, and revisit them in seconds.
          </p>

          <div className="stats">
            <div className="stat">
              <strong>{books.length}</strong>
              <span>{books.length === 1 ? 'Book' : 'Books'}</span>
            </div>
            <div className="stat">
              <strong>{quotes.length}</strong>
              <span>{quotes.length === 1 ? 'Quote' : 'Quotes'}</span>
            </div>
            <div className="stat">
              <strong>{favoritesCount}</strong>
              <span>{favoritesCount === 1 ? 'Favorite' : 'Favorites'}</span>
            </div>
          </div>

          <div className="hero-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => setShowAdd(true)}>
              <BookPlus size={19} /> Add a book
            </button>
            {quotes.length > 0 && (
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => setReaderOpen(true)}>
                <Play size={17} /> Review all quotes
              </button>
            )}
          </div>
        </div>

        {spotlight && spotlightBook ? (
          <aside className="spotlight" key={spotlight.id}>
            <div className="spotlight-head">
              <span className="eyebrow eyebrow-soft">
                <Star size={13} /> From your shelf
              </span>
              <button
                type="button"
                className="icon-btn"
                onClick={shuffleSpotlight}
                disabled={quotes.length < 2}
                aria-label="Show another quote"
                title="Another quote"
              >
                <Shuffle size={17} />
              </button>
            </div>
            <blockquote className={spotlight.text.length > 260 ? 'is-long' : ''}>{spotlight.text}</blockquote>
            <Link to={`/books/${spotlightBook.id}`} className="spotlight-source">
              <BookCover book={spotlightBook} className="cover-thumb" />
              <span>
                <strong>{spotlightBook.title}</strong>
                <small>
                  {[spotlightBook.author, spotlight.page && `p. ${spotlight.page}`].filter(Boolean).join(' · ') ||
                    'Open book'}
                </small>
              </span>
            </Link>
          </aside>
        ) : (
          <aside className="spotlight spotlight-welcome">
            <span className="eyebrow eyebrow-soft">How it works</span>
            <ol className="steps">
              <li>
                <span>1</span>
                <div>
                  <strong>Add a book</strong>
                  <p>Give it a title and upload its cover.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Save quotes as you read</strong>
                  <p>Add the page number and a note if you like.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Revisit them fast</strong>
                  <p>Search everything or flip through in review mode.</p>
                </div>
              </li>
            </ol>
          </aside>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h2>
            Bookshelf <span className="count-pill">{books.length}</span>
          </h2>
          {books.length > 0 && (
            <div className="toolbar">
              <SearchInput ref={searchRef} value={query} onChange={setQuery} placeholder="Search books or authors" />
              <select className="select" value={sort} onChange={(e) => changeSort(e.target.value)} aria-label="Sort books">
                {Object.entries(SORTS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {books.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Your shelf is empty"
            text="Add the book you're reading right now and save your first quote."
            action={
              <button type="button" className="btn btn-primary" onClick={() => setShowAdd(true)}>
                <BookPlus size={18} /> Add your first book
              </button>
            }
          />
        ) : visibleBooks.length === 0 ? (
          <EmptyState icon={Quote} title="No matching books" text={`Nothing found for “${query}”.`} />
        ) : (
          <>
            <div className="book-grid">
              {visibleBooks.map((book, i) => (
                <BookCard
                  key={book.id}
                  book={book}
                  count={quoteCountByBook[book.id] || 0}
                  query={query}
                  style={{ '--i': Math.min(i, 14) }}
                />
              ))}
              {!query && (
                <button type="button" className="book-card book-card-add" onClick={() => setShowAdd(true)}>
                  <div className="book-card-cover">
                    <BookPlus size={28} strokeWidth={1.5} />
                    <span>Add book</span>
                  </div>
                </button>
              )}
            </div>
            {query && (
              <p className="result-note">
                {pluralize(visibleBooks.length, 'book')} match “{query}”
              </p>
            )}
          </>
        )}
      </section>

      {showAdd && (
        <BookFormModal onClose={() => setShowAdd(false)} onSaved={(book) => navigate(`/books/${book.id}`)} />
      )}
      {readerOpen && <ReaderMode quotes={quotes} onClose={() => setReaderOpen(false)} />}
    </div>
  );
}
