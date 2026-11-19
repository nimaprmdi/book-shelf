import { useRef, useState } from 'react';
import Modal from './Modal';
import { useLibrary } from '../store/LibraryContext';
import { useToast } from '../store/ToastContext';

/** Add a quote to `book`, or edit `quote` when it is passed. */
export default function QuoteFormModal({ book, quote, onClose }) {
  const { addQuote, updateQuote } = useLibrary();
  const toast = useToast();
  const textRef = useRef(null);

  const [text, setText] = useState(quote?.text ?? '');
  const [page, setPage] = useState(quote?.page ?? '');
  const [note, setNote] = useState(quote?.note ?? '');
  const [saving, setSaving] = useState(false);
  const [addedCount, setAddedCount] = useState(0);

  const isEdit = Boolean(quote);
  const canSave = text.trim().length > 0 && !saving;

  const save = async (keepOpen) => {
    if (!canSave) return;
    setSaving(true);
    try {
      if (isEdit) {
        await updateQuote(quote.id, { text, page, note });
        toast('Quote updated');
        onClose();
        return;
      }
      await addQuote(book.id, { text, page, note });
      if (keepOpen) {
        // Ready for the next quote; keep the page number since it's often close by.
        setText('');
        setNote('');
        setAddedCount((n) => n + 1);
        setSaving(false);
        textRef.current?.focus();
      } else {
        toast('Quote saved');
        onClose();
      }
    } catch (err) {
      toast('Could not save the quote: ' + err.message, 'error');
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit quote' : 'New quote'}
      subtitle={
        <>
          from <em>{book.title}</em>
          {addedCount > 0 && <span className="added-pill">{addedCount} added</span>}
        </>
      }
      onClose={onClose}
      size="lg"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(false);
        }}
      >
        <div className="modal-body">
          <div className="field">
            <label htmlFor="quote-text">Quote</label>
            <textarea
              id="quote-text"
              ref={textRef}
              className="input quote-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  save(!isEdit && e.shiftKey);
                }
              }}
              placeholder="“The impediment to action advances action. What stands in the way becomes the way.”"
              rows={6}
              required
              data-autofocus
            />
          </div>

          <div className="form-row">
            <div className="field field-page">
              <label htmlFor="quote-page">
                Page <span className="optional">optional</span>
              </label>
              <input
                id="quote-page"
                className="input"
                value={page}
                onChange={(e) => setPage(e.target.value)}
                placeholder="e.g. 42"
                maxLength={20}
              />
            </div>
            <div className="field field-grow">
              <label htmlFor="quote-note">
                Your note <span className="optional">optional</span>
              </label>
              <input
                id="quote-note"
                className="input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Why this line matters to you"
                maxLength={500}
              />
            </div>
          </div>
        </div>

        <footer className="modal-footer">
          <span className="kbd-hint">
            <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to save
          </span>
          <div className="modal-footer-actions">
            {!isEdit && (
              <button type="button" className="btn btn-ghost" onClick={() => save(true)} disabled={!canSave}>
                Save &amp; add another
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={!canSave}>
              {isEdit ? 'Save changes' : 'Save quote'}
            </button>
          </div>
        </footer>
      </form>
    </Modal>
  );
}
