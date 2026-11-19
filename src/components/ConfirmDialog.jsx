import { useState } from 'react';
import Modal from './Modal';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
}) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose} size="sm">
      <div className="modal-body">
        <p className="confirm-message">{message}</p>
      </div>
      <footer className="modal-footer">
        <button type="button" className="btn btn-ghost" onClick={onClose} data-autofocus>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleConfirm}
          disabled={busy}
        >
          {busy ? 'Deleting…' : confirmLabel}
        </button>
      </footer>
    </Modal>
  );
}
