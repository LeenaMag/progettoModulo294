import React, { useContext }  from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext} from '../context/AuthContext';
import './Header.css';
import { useTranslation } from 'react-i18next';

export default function Header() {

    const { t, i18n } = useTranslation();
    const {user, logout} = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'it' ? 'en' : 'it';
        i18n.changeLanguage(newLang);
    };

    return (
        <header className="site-header">

            <nav className="nav-right">
                <ul className="nav-list">
                    {user ? (
                        <>
                            <li><Link to="/addItem">{t("header.addProduct")}</Link></li>

                            <li>
                                <span>{t("header.welcome")}, {user.username}</span>
                                <button onClick={handleLogout} className="logout-btn">
                                    {t("header.logout")}
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login">{t("header.login")}</Link></li>
                            <li><Link to="/singup">{t("header.signup")}</Link></li>
                        </>
                    )}
                </ul>
            </nav>

            <nav className="header-nav">
                <ul className="nav-list">

                    <li><Link to="/aste/crea">{t("header.newAuction")}</Link></li>
                    <li><Link to="/tag">{t("header.tags")}</Link></li>
                    <li><Link to="/notifiche">{t("header.notification")}</Link></li>
                    <li><Link to="/preferiti">{t("header.favorites")}</Link></li>
                    <li><Link to="/catalogo">{t("header.cart")}</Link></li>
                    <li><Link to="/chats">{t("header.chat")}</Link></li>
                    <li><Link to="/impostazioni">{t("header.settings")}</Link></li>

                </ul>
            </nav>

            <button onClick={toggleLanguage} className="lang-btn">
                {i18n.language === 'it' ? 'IT' : 'EN'}
            </button>

        </header>
    );
}