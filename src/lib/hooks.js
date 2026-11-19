import { useEffect, useRef } from 'react';
import { isTypingTarget } from './utils';

/**
 * Runs `handler` when `key` is pressed, unless the user is typing in a field
 * or a modal dialog is open.
 */
export function useHotkey(key, handler, enabled = true) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e) => {
      if (e.key.toLowerCase() !== key || e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(document.activeElement)) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      e.preventDefault();
      handlerRef.current(e);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, enabled]);
}

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Quotebook` : 'Quotebook · Your book quotes';
  }, [title]);
}
