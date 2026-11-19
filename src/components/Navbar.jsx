import { useEffect, useRef, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { DatabaseBackup, Download, Library, Quote, Upload } from 'lucide-react';
import { useLibrary } from '../store/LibraryContext';
import { useToast } from '../store/ToastContext';

export default function Navbar() {
  const { exportData, importData, books } = useLibrary();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleImport = async (file) => {
    if (!file) return;
    try {
      const result = await importData(file);
      toast(`Imported ${result.books} books and ${result.quotes} quotes`);
    } catch (err) {
      toast(err instanceof SyntaxError ? 'That file is not valid JSON.' : err.message, 'error');
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Quote size={18} fill="currentColor" strokeWidth={0} />
          </span>
          <span className="brand-name">Quotebook</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end className="nav-link">
            <Library size={17} />
            <span>Library</span>
          </NavLink>
          <NavLink to="/quotes" className="nav-link">
            <Quote size={17} />
            <span>All quotes</span>
          </NavLink>
        </nav>

        <div className="menu" ref={menuRef}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Backup and restore"
            title="Backup & restore"
          >
            <DatabaseBackup size={19} />
          </button>
          {menuOpen && (
            <div className="menu-popover" role="menu">
              <p className="menu-caption">Your quotes are saved in this browser. Keep a backup file safe.</p>
              <button
                type="button"
                role="menuitem"
                className="menu-item"
                disabled={books.length === 0}
                onClick={() => {
                  exportData();
                  setMenuOpen(false);
                  toast('Backup downloaded');
                }}
              >
                <Download size={16} /> Export backup
              </button>
              <button
                type="button"
                role="menuitem"
                className="menu-item"
                onClick={() => {
                  fileRef.current?.click();
                  setMenuOpen(false);
                }}
              >
                <Upload size={16} /> Import backup
              </button>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              handleImport(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
      </div>
    </header>
  );
}
