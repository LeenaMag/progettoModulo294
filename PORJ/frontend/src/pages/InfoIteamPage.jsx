import './InfoIteamPage.css';

import SearchBar from "../components/SearchBar";
import { useNavigate, useLoaderData, Link } from 'react-router-dom';
import PrewiewOwner from '../components/PrewiewOwner';
import React, { useState } from 'react';


export default function InfoIteamPage() {
  const navigate = useNavigate();
  const { item, tag, owner } = useLoaderData();
  const [cartLoading, setCartLoading] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionErr, setActionErr] = useState('');

  const addToCart = async () => {
  try {
    setActionErr('');
    setActionMsg('');
    setCartLoading(true);

    const res = await fetch(`http://localhost:3000/Items/items/cart/${item.id}`, {
      method: 'POST',
      credentials: 'include',
    });

    const txt = await res.text().catch(() => '');

    if (res.status === 401) {
      setActionErr('Devi effettuare il login per aggiungere al carrello.');
      return;
    }

    if (!res.ok) {
      let msg = txt;
      try {
        const j = JSON.parse(txt);
        msg = j?.error ?? msg;
      } catch {}
      throw new Error(msg || `Errore (${res.status})`);
    }

    setActionMsg('Oggetto aggiunto al carrello.');
  } catch (err) {
    setActionErr(String(err?.message || err));
  } finally {
    setCartLoading(false);
  }
};

const addToFavorites = async () => {
  try {
    setActionErr('');
    setActionMsg('');
    setFavLoading(true);

    const res = await fetch(`http://localhost:3000/Items/items/favorites/${item.id}`, {
      method: 'POST',
      credentials: 'include',
    });

    const txt = await res.text().catch(() => '');

    if (res.status === 401) {
      setActionErr('Devi effettuare il login per aggiungere ai preferiti.');
      return;
    }

    if (!res.ok) {
      let msg = txt;
      try {
        const j = JSON.parse(txt);
        msg = j?.error ?? msg;
      } catch {}
      throw new Error(msg || `Errore (${res.status})`);
    }

    setActionMsg('Oggetto aggiunto ai preferiti.');
  } catch (err) {
    setActionErr(String(err?.message || err));
  } finally {
    setFavLoading(false);
  }
};

  return (
    <div className="info-item-container">
      <SearchBar />

      <div className="center">
        <div className="info-title-row">
          <div className="info-title-row">
            <h2>Dettagli Prodotto</h2>

            <div className="top-actions">
                <button type="button" className="top-action-btn"><Link to={`/chat/${owner?.id}`}>Chat</Link>
                
                </button>

                <button
                type="button"
                className="back-btn"
                onClick={() => navigate(-1)}
                >
                Indietro
                </button>
            </div>
            </div>
        </div>

        <div className="prewiewOwner">
          {/* Mostra l'utente proprietario dell'oggetto */}
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
          <div className="infoItemActions">
            <button
              type="button"
              className="infoItemBtn"
              onClick={addToCart}
              disabled={cartLoading}
            >
              {cartLoading ? 'Aggiungo...' : 'Aggiungi al carrello'}
            </button>

            <button
              type="button"
              className="infoItemBtn secondary"
              onClick={addToFavorites}
              disabled={favLoading}
            >
              {favLoading ? 'Aggiungo...' : 'Aggiungi ai preferiti'}
            </button>
            <button
              type="button"
              className="infoItemBtn secondary"
            >
            <Link className="infoItemBtn secondary" to={`/item/edit/${item.id}`}>
               Modifica / Elimina
            </Link>
          </button>
          </div>

          {actionMsg ? <div className="infoItemOk">{actionMsg}</div> : null}
          {actionErr ? <div className="infoItemError">{actionErr}</div> : null}
        </div>
      </div>
    </div>
  );
}

export async function loader({ params, request }) {

  const url = new URL(request.url);
  const itemId = params.itemId || url.searchParams.get('itemId') || url.searchParams.get('id');

  if (!itemId) {
    throw new Error("Manca l'id dell'oggetto (itemId)");
  }


  const itemRes = await fetch(`http://localhost:3000/Items/itemsId/${itemId}`);
  if (!itemRes.ok) {
    throw new Error("Impossibile caricare l'oggetto");
  }
  const item = await itemRes.json();


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

  const [tagJson, owner] = await Promise.all([tagRes.json(), ownerRes.json()]);

  const tag = Array.isArray(tagJson) ? (tagJson[0] ?? null) : tagJson;

  return { item, tag, owner };
}