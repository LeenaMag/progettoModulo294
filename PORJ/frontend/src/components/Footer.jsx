import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { useTranslation } from 'react-i18next';

export default function Footer() {

    const { t } = useTranslation();

    return (
        <footer className="site-footer">

            <div className="footer-content">

                <nav className="footer-nav">
                    <ul>
                        <li><Link to="/">{t("footer.home")}</Link></li>
                        <li><Link to="/catalogo">{t("footer.catalog")}</Link></li>
                        <li><Link to="/auctions">{t("footer.auctions")}</Link></li>
                        <li><Link to="http://localhost:3000/api-docs/">{t("footer.swagger")}</Link></li>
                    </ul>
                </nav>

                <div className="footer-address">
                    <p>{t("footer.school")}</p>
                    <p>Via alle industrie 27</p>
                    <p>6743 Bodio</p>
                </div>

            </div>

            <div className="footer-bottom">
                <p>
                    &copy; {new Date().getFullYear()} {t("footer.school")} - {t("footer.rights")}
                </p>
            </div>

        </footer>
    );
}