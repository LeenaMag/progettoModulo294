import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-content">
                <nav className="footer-nav">
                    <ul>
                        <li><Link to="/">Homepage</Link></li>
                        <li><Link to="/catalogo">Catalogo</Link></li>
                        <li><Link to="/aste">Aste</Link></li>
                    </ul>
                </nav>

                <div className="footer-address">
                    <p>Centro Professionale AMETI</p>
                    <p>Via della Stazione 3</p>
                    <p>6743 Bodio</p>
                </div>

            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Centro Professionale AMETI. Tutti i diritti riservati.</p>
            </div>
        </footer>
    );
}
