import { useEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowLeft, CircleAlert, Compass } from 'lucide-react';
import Navbar from './components/Navbar';
import EmptyState from './components/EmptyState';
import LibraryPage from './pages/LibraryPage';
import BookPage from './pages/BookPage';
import AllQuotesPage from './pages/AllQuotesPage';
import { useLibrary } from './store/LibraryContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="container page">
      <EmptyState
        icon={Compass}
        title="Page not found"
        text="This page wandered off the shelf."
        action={
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={18} /> Back to library
          </Link>
        }
      />
    </div>
  );
}

export default function App() {
  const { loading, error } = useLibrary();

  return (
    <div className="app">
      <ScrollToTop />
      <Navbar />
      <main className="main">
        {loading ? (
          <div className="loader">
            <span />
          </div>
        ) : error ? (
          <div className="container page">
            <EmptyState
              icon={CircleAlert}
              title="Couldn't open your library"
              text={`Your browser blocked local storage (${error.message}). Private/incognito windows can cause this.`}
            />
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<LibraryPage />} />
            <Route path="/books/:bookId" element={<BookPage />} />
            <Route path="/quotes" element={<AllQuotesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </main>
      <footer className="site-footer">
        <div className="container">
          Saved privately in this browser · <span>Quotebook</span>
        </div>
      </footer>
    </div>
  );
}
