import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#F5EEE4', background: '#241832', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#E8437B' }}>⚠️ App Rendering Error Detected:</h2>
          <pre style={{ background: 'rgba(232,67,123,0.15)', border: '1px solid #E8437B', padding: 16, borderRadius: 12, color: '#F5EEE4', overflowX: 'auto' }}>
            {this.state.error?.stack || this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', marginTop: 20, cursor: 'pointer', background: '#F2A93B', border: 'none', borderRadius: 8, fontWeight: 700, color: '#241832' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
