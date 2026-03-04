import React, { useContext }  from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Header.css';

// Header component with a simple navigation menu and no logo
export default function Header() {
    const {user} = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        // await logout();
        navigate('/');
    };

    return (
        <header className="site-header">
            <nav className="nav-right">
                <ul className="nav-list">
                    {user ? (
                        <>
                            <li><Link to="/addItem">Aggiungi Prodotto</Link></li>
                            <li>
                                <span>Benvenuto/a, {user.username}</span>
                                <button onClick={handleLogout} className="logout-btn">Logout</button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login">login</Link></li>
                            <li><Link to="/singup">singup</Link></li>
                        </>
                    )}
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
