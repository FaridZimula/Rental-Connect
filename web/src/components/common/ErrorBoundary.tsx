import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught React render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fafafa',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#18181b', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>
            Something went wrong
          </h2>
          <p style={{ color: '#71717a', fontSize: 14, marginBottom: 24, maxWidth: 400 }}>
            {this.state.error?.message || 'An unexpected error occurred while rendering this page.'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
            style={{
              background: '#f06023',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '10px 24px',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Go Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
