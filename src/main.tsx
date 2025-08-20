import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </HelmetProvider>
);
