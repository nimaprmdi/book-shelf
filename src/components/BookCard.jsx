import { Link } from 'react-router-dom';
import { Quote } from 'lucide-react';
import BookCover from './BookCover';
import Highlight from './Highlight';

export default function BookCard({ book, count, query, style }) {
  return (
    <Link to={`/books/${book.id}`} className="book-card" style={style}>
      <div className="book-card-cover">
        <BookCover book={book} className="cover-fill" />
        <span className="book-card-spine" aria-hidden="true" />
        <span className="quote-badge" title={`${count} quotes`}>
          <Quote size={12} fill="currentColor" strokeWidth={0} />
          {count}
        </span>
      </div>
      <div className="book-card-meta">
        <h3>
          <Highlight text={book.title} query={query} />
        </h3>
        <p>{book.author ? <Highlight text={book.author} query={query} /> : 'Unknown author'}</p>
      </div>
    </Link>
  );
}
