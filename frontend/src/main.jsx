import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/Toast';
import { useToast } from './context/ToastContext';

function AppWithToast() {
  const { toasts, removeToast } = useToast();
  return (
    <>
      <App />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <AppWithToast />
    </ToastProvider>
  </React.StrictMode>
);
