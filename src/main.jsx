import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GameProvider } from "./context/gameContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GameProvider timePerQuestion={45}>
      <App />
    </GameProvider>
  </StrictMode>,
)
