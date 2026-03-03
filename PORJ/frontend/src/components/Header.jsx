import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

// Header component with a simple navigation menu and no logo
export default function Header() {
    return (
        <header className="site-header">
            <nav className="nav-right">
                <ul className="nav-list">
                    <li><Link to="/">login</Link></li>
                    <li><Link to="/catalogo">singup</Link></li>
                </ul>
            </nav>
            <nav className="header-nav">
                <ul className="nav-list">
                    <li><Link to="/">preferiti</Link></li>
                    <li><Link to="/catalogo">carrello</Link></li>
                    <li><Link to="/aste">chat</Link></li>
                    <li><Link to="/addItem">impostazioni</Link></li>
                </ul>
            </nav>
        </header>
    );
}
