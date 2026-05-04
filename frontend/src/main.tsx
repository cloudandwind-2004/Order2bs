import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 600,
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(255, 143, 171, 0.18)',
        },
        success: {
          iconTheme: { primary: '#06D6A0', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#EF476F', secondary: '#fff' },
        },
      }}
    />
  </React.StrictMode>
);
