import './InfoIteamPage.css';

import React, { useContext } from 'react';
import SearchBar from "../components/searchBar";
import { useNavigate, useLoaderData, Link } from 'react-router-dom';
import './AddIteamPage.css';
import PrewiewOwner from '../components/PrewiewOwner';
import { AuthContext } from '../context/AuthContext';


export default function InfoIteamPage() {
    const navigate = useNavigate();
    const { item, tag, user } = useLoaderData();


    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitData = new FormData(e.target);
        /* Prendere utente da sessione */
        submitData.append('prod_creatore', 1);

        try {
            await fetch('http://localhost:3000/Items/items/:itemId', {
                method: 'GET',
                credentials: 'include',
                body: submitData
            });
            navigate('/');
        } catch (err) {
            console.error("Errore:", err);
            alert("Errore durante il caricamento della pagina!");
        }
    };

    return (
        <div className="add-item-container">
            <SearchBar />
            
            <div className='center'>
                <h2>Aggiungi Prodotto</h2>
                <div className='prewiewOwner'>
                    <PrewiewOwner user ={{
                        foto: user.foto ,
                        nome: user.username 
                    }}/>
                </div>
                
                
                
                <div className='flexed'>
                    <div className='colL'>
                        <img src={item.foto} cclassName="file-input" />
                        
                    </div>
                    <div className='colR'>
                        <div className='nome'>{item.nome}</div>
                        
                        <div className='prezzo'>{item.prezzo}</div>
                        
                        <div className='tag'>{tags.nome}</div>

                        <div className='descrizione'>{item.descrizione}</div>
                        
                    </div>
                    </div>
            
            </div>           
        </div>
    );
}

export async function loader({ params }) {
  const [res1, res2, res3] = await Promise.all([
    fetch(`http://localhost:3000/Items/items/${params.item}`),
    fetch(`http://localhost:3000/search/tag/${params.tag}`),
    fetch(`http://localhost:3000/user/user/${params.user}`, {
      credentials: "include",
    }),
  ]);

  if (!res1.ok) {
    throw new Error("Impossibile caricare l'oggetto");
  }
  if (!res2.ok) {
    throw new Error("Impossibile caricare il tag");
  }
  if (!res3.ok) {
    throw new Error("Impossibile caricare l'utente");
  }

  const [item, tag, user] = await Promise.all([res1.json(), res2.json(), res3.json()]);

  return { item, tag, user };
}