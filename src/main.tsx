import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function bootstrap() {
  // Modo captura (screenshots da landing): semeia dados de demonstração
  if (import.meta.env.MODE === 'capture') {
    try {
      const res = await fetch('/seed.json')
      if (res.ok) localStorage.setItem('graficaLivre', JSON.stringify(await res.json()))
    } catch {
      /* segue sem seed */
    }
    // Screenshots limpos: sem aviso de modo local e sem animação de gráfico
    document.head.insertAdjacentHTML(
      'beforeend',
      '<style>aside .text-amber-400{display:none}</style>',
    )
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
