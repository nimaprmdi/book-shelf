import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleAlert, CircleCheck } from 'lucide-react';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const toast = useCallback((message, type = 'success') => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div className="toast-stack" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              {t.type === 'error' ? <CircleAlert size={18} /> : <CircleCheck size={18} />}
              <span>{t.message}</span>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
