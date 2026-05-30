import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">
          <img src="/firesite_logo.png" alt="Firesite" />
          <div className="auth-logo-text">Fire<span>site</span></div>
        </div>
        <h1 className="auth-title">Vite-lite POC</h1>
        <p className="auth-sub">
          Build pipeline working. The full app still lives at /app.html.
        </p>
        <a className="auth-btn" href="/app.html" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
          Open the real app
        </a>
        <div className="auth-switch">
          POC scaffold — not the production entry point.
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
