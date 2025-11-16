import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Configure canvas for react-pdf to avoid willReadFrequently warning
if (typeof window !== 'undefined') {
  const originalGetContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function(contextType, contextAttributes) {
    if (contextType === '2d') {
      return originalGetContext.call(this, contextType, { 
        willReadFrequently: true, 
        ...contextAttributes 
      })
    }
    return originalGetContext.call(this, contextType, contextAttributes)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)