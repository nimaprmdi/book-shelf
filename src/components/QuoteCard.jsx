import { Link } from 'react-router-dom';
import { Copy, Pencil, Star, Trash2 } from 'lucide-react';
import Highlight from './Highlight';
import BookCover from './BookCover';
import { formatDate } from '../lib/utils';
import { useLibrary } from '../store/LibraryContext';
import { useToast } from '../store/ToastContext';

export default function QuoteCard({ quote, book, query, showBook = false, onEdit, onDelete, style }) {
  const { toggleFavorite } = useLibrary();
  const toast = useToast();

  const copy = async () => {
    const source = [book?.title, book?.author].filter(Boolean).join(', ');
    const text = `“${quote.text}”${source ? `\n— ${source}` : ''}${quote.page ? `, p. ${quote.page}` : ''}`;
    try {
      await navigator.clipboard.writeText(text);
      toast('Copied to clipboard');
    } catch {
      toast('Copy failed — your browser blocked clipboard access', 'error');
    }
  };

  return (
    <article className={`quote-card ${quote.favorite ? 'is-favorite' : ''}`} style={style}>
      <span className="quote-mark" aria-hidden="true">
        “
      </span>

      <blockquote className="quote-text">
        <Highlight text={quote.text} query={query} />
      </blockquote>

      {quote.note && (
        <p className="quote-note">
          <Highlight text={quote.note} query={query} />
        </p>
      )}

      <footer className="quote-footer">
        <div className="quote-meta">
          {showBook && book && (
            <Link to={`/books/${book.id}`} className="quote-book">
              <BookCover book={book} className="cover-thumb" />
              <span>
                <strong>{book.title}</strong>
                {book.author && <small>{book.author}</small>}
              </span>
            </Link>
          )}
          {quote.page && <span className="chip">p. {quote.page}</span>}
          <span className="quote-date">{formatDate(quote.createdAt)}</span>
        </div>

        <div className="quote-actions">
          <button
            type="button"
            className={`icon-btn ${quote.favorite ? 'is-active' : ''}`}
            onClick={() => toggleFavorite(quote.id)}
            aria-label={quote.favorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={quote.favorite}
            title={quote.favorite ? 'Unfavorite' : 'Favorite'}
          >
            <Star size={17} fill={quote.favorite ? 'currentColor' : 'none'} />
          </button>
          <button type="button" className="icon-btn" onClick={copy} aria-label="Copy quote" title="Copy">
            <Copy size={17} />
          </button>
          {onEdit && (
            <button type="button" className="icon-btn" onClick={() => onEdit(quote)} aria-label="Edit quote" title="Edit">
              <Pencil size={17} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="icon-btn icon-btn-danger"
              onClick={() => onDelete(quote)}
              aria-label="Delete quote"
              title="Delete"
            >
              <Trash2 size={17} />
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}
