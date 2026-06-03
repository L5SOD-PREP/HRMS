import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex align-items-center justify-content-center" style={{height:'100vh',background:'#f8fafc'}}>
          <div className="text-center p-4">
            <h5 style={{fontWeight:600}}>Something went wrong</h5>
            <p className="text-muted small mb-3">An unexpected error occurred.</p>
            <button className="btn" style={{background:'#3b82f6',color:'#fff',borderRadius:'0.5rem'}} onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
