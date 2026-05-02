import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Me-render komponen App utama ke dalam DOM
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
