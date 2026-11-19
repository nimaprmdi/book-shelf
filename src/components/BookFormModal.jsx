import { useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, Trash2 } from 'lucide-react';
import Modal from './Modal';
import BookCover from './BookCover';
import { compressImage } from '../lib/utils';
import { useLibrary } from '../store/LibraryContext';
import { useToast } from '../store/ToastContext';

/** Add a new book (no `book` prop) or edit an existing one. */
export default function BookFormModal({ book, onClose, onSaved }) {
  const { addBook, updateBook } = useLibrary();
  const toast = useToast();
  const fileRef = useRef(null);

  const [title, setTitle] = useState(book?.title ?? '');
  const [author, setAuthor] = useState(book?.author ?? '');
  const [cover, setCover] = useState(book?.cover ?? null);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(book);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Please choose an image file.', 'error');
      return;
    }
    setProcessing(true);
    try {
      setCover(await compressImage(file));
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      const saved = isEdit
        ? await updateBook(book.id, { title, author, cover })
        : await addBook({ title, author, cover });
      toast(isEdit ? 'Book updated' : 'Book added to your library');
      onClose();
      onSaved?.(saved);
    } catch (err) {
      toast('Could not save the book: ' + err.message, 'error');
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit book' : 'Add a book'}
      subtitle={isEdit ? undefined : 'Upload a cover and start collecting quotes.'}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body book-form">
          <div
            className={`cover-drop ${dragging ? 'is-dragging' : ''} ${cover ? 'has-cover' : ''}`}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            role="button"
            tabIndex={0}
            aria-label="Upload book cover"
          >
            {processing ? (
              <div className="cover-drop-hint">
                <LoaderCircle size={28} className="spin" />
                <span>Processing…</span>
              </div>
            ) : cover ? (
              <>
                <BookCover book={{ title, author, cover }} className="cover-fill" />
                <div className="cover-drop-overlay">
                  <ImagePlus size={22} />
                  <span>Change cover</span>
                </div>
              </>
            ) : (
              <div className="cover-drop-hint">
                <div className="cover-drop-icon">
                  <ImagePlus size={26} />
                </div>
                <strong>Upload cover</strong>
                <span>Click or drop an image</span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>

          <div className="book-form-fields">
            <div className="field">
              <label htmlFor="book-title">Title</label>
              <input
                id="book-title"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Meditations"
                required
                maxLength={200}
                data-autofocus
              />
            </div>
            <div className="field">
              <label htmlFor="book-author">
                Author <span className="optional">optional</span>
              </label>
              <input
                id="book-author"
                className="input"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Marcus Aurelius"
                maxLength={200}
              />
            </div>
            {cover && (
              <button type="button" className="btn btn-ghost btn-sm remove-cover" onClick={() => setCover(null)}>
                <Trash2 size={15} /> Remove cover
              </button>
            )}
            {!cover && (
              <p className="field-hint">
                No cover? No problem — a stylish one is generated from the title.
              </p>
            )}
          </div>
        </div>

        <footer className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!title.trim() || saving || processing}>
            {isEdit ? 'Save changes' : 'Add book'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
