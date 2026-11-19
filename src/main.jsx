import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource-variable/inter';
import '@fontsource-variable/lora';
import '@fontsource-variable/lora/wght-italic.css';
import './styles.css';
import App from './App';
import { LibraryProvider } from './store/LibraryContext';
import { ToastProvider } from './store/ToastContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <LibraryProvider>
          <App />
        </LibraryProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
