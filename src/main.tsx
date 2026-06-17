import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign WebSocket/Vite HMR/Render connection errors in development iframe
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args) => {
    const errorStr = args.map(arg => String(arg && arg.stack ? arg.stack : arg)).join(" ");
    if (errorStr.includes("websocket") || errorStr.includes("WebSocket") || errorStr.includes("vite") || errorStr.includes("HMR")) {
      return; // Suppress
    }
    originalError(...args);
  };

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason?.message || String(event.reason);
    if (reason && (reason.includes("WebSocket") || reason.includes("websocket") || reason.includes("HMR"))) {
      event.preventDefault(); // Suppress scary uncaught screen overlays
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

