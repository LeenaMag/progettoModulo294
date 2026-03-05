/*import './InfoIteamPage.css';

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
        // Prendere utente da sessione 
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
*/

import './InfoIteamPage.css';

import React from 'react';
import SearchBar from "../components/searchBar";
import { useNavigate, useLoaderData } from 'react-router-dom';
import PrewiewOwner from '../components/PrewiewOwner';

export default function InfoIteamPage() {
  const navigate = useNavigate();
  const { item, tag, owner } = useLoaderData();

  return (
    <div className="info-item-container">
      <SearchBar />

      <div className="center">
        <div className="info-title-row">
          <h2>Dettagli Prodotto</h2>
          <button type="button" className="back-btn" onClick={() => navigate(-1)}>
            Indietro
          </button>
        </div>

        <div className="prewiewOwner">
          {/* Mostro l'utente proprietario dell'oggetto */}
          <PrewiewOwner
            user={{
              foto: owner?.foto,
              nome: owner?.username
            }}
          />
        </div>

        <div className="flexed">
          <div className="colL">
            <div className="image-box">
              <img
                src={item?.foto}
                className="item-image"
                alt={item?.nome || 'Prodotto'}
              />
            </div>
          </div>

          <div className="colR">
            <div className="nome">{item?.nome}</div>
            <div className="prezzo">{Number(item?.prezzo).toFixed(2)} CHF</div>

            {/* Il tag mostra il NOME (tag.nome) */}
            <div className="tag">{tag?.nome}</div>

            <div className="descrizione">{item?.descrizione}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function loader({ params, request }) {
  // Supporto sia /infoIteam/:itemId che /infoIteam?itemId=...
  const url = new URL(request.url);
  const itemId = params.itemId || url.searchParams.get('itemId') || url.searchParams.get('id');

  if (!itemId) {
    throw new Error("Manca l'id dell'oggetto (itemId)");
  }

  // 1) Prendo l'oggetto
  const itemRes = await fetch(`http://localhost:3000/Items/items/${itemId}`);
  if (!itemRes.ok) {
    throw new Error("Impossibile caricare l'oggetto");
  }
  const item = await itemRes.json();

  // 2) Con i dati dell'oggetto, prendo tag + proprietario
  const [tagRes, ownerRes] = await Promise.all([
    fetch(`http://localhost:3000/search/tag/${item.fk_tag}`),
    fetch(`http://localhost:3000/user/userId/${item.fk_utente}`, { credentials: 'include' })
  ]);

  if (!tagRes.ok) {
    throw new Error("Impossibile caricare il tag");
  }
  if (!ownerRes.ok) {
    throw new Error("Impossibile caricare l'utente proprietario");
  }

  const [tag, owner] = await Promise.all([tagRes.json(), ownerRes.json()]);
  return { item, tag, owner };
}