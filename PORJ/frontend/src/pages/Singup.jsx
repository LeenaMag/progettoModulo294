import React, { useState, useContext } from 'react';
import {  Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './AuthPages.css';

export default function Singup() {
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitData = new FormData(e.target);
        
        try {
            await fetch('http://127.0.0.1:3000/User/signup', {
                method: 'POST',
                credentials: 'include',
                body: submitData
            });
            navigate('/login');
        } catch (err) {
            console.error("Errore:", err);
            alert("Errore durante l'inserimento!");
        }
    };

    return (
        <div className="authContainer">
            <h2>Accedi al tuo account</h2>
            

            <form onSubmit={handleSubmit} className="authForm">
                <input type="file" name="prod_img" accept="image/*" className="profile-input" required />
                <div className="formInput">
                    <input type="text" id="username" name="username" placeholder='username' required />
                </div>

                <div className="formInput">
                    <input type="text" id="nome" name="firstName" placeholder='nome' required />
                </div>

                <div className="formInput">
                    <input type="text" id="cognome" name="lastName" placeholder='cognome' required />
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
