import { hashString } from '../lib/utils';

/** Shows the uploaded cover, or a generated blue "cloth binding" cover. */
export default function BookCover({ book, className = '' }) {
  if (book.cover) {
    return (
      <div className={`cover ${className}`}>
        <img src={book.cover} alt={`Cover of ${book.title}`} loading="lazy" draggable="false" />
      </div>
    );
  }

  const h = hashString(book.title + book.author);
  const hue = 195 + (h % 45); // stays in the cyan → blue range
  const style = {
    '--cover-a': `hsl(${hue} 70% 32%)`,
    '--cover-b': `hsl(${hue + 18} 65% 16%)`,
  };

  return (
    <div className={`cover cover-placeholder ${className}`} style={style} aria-hidden="true">
      <div className="cover-placeholder-inner">
        <span className="cover-rule" />
        <span className="cover-title">{book.title}</span>
        {book.author && <span className="cover-author">{book.author}</span>}
        <span className="cover-rule" />
      </div>
    </div>
  );
}
