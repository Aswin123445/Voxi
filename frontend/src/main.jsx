import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AudioStreamProvider } from "./context/AudioStreamContext.jsx"
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AudioStreamProvider>
      <App />
    </AudioStreamProvider>
  </StrictMode>,
)
