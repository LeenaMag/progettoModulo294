import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <div className="notFoundContainer">
      <div className="notFoundBox">
        <h1>404</h1>
        <h2>Pagina non trovata</h2>
        <p>La pagina che hai richiesto non esiste.</p>

        <Link to="/" className="notFoundHomeLink">
          Torna alla home
        </Link>
      </div>
    </div>
  )
}