import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './AuthPages.css';

export default function Singup() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="authContainer">
            <h2>Accedi al tuo account</h2>
            {error && <div className="errorMessage">{error}</div>}

            <form onSubmit={handleSubmit} className="authForm">
                <input type="file" name="prod_img" accept="image/*" className="profile-input" required />
                <div className="formInput">
                    <input type="text" id="username" name="username" placeholder='username' required />
                </div>

                <div className="formInput">
                    <input type="text" id="nome" name="nome" placeholder='nome' required />
                </div>

                <div className="formInput">
                    <input type="text" id="cognome" name="cognome" placeholder='cognome' required />
                </div>

                <div className="formInput">
                    <input type="password" id="password" name="password" placeholder='password' required />
                </div>

                <button type="submit" className="btnSubmit">Singup</button>
            </form>
            <div id="redirectButton">
                Hai già un account? <Link to="/login">Fai il login</Link>
            </div>
        </div>
    );
}
