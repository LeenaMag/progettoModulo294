import './FavoritesPage.css';

import React, { useState } from 'react';
import { Link, redirect, useLoaderData, useRevalidator } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';

function resolveItemImageUrl(foto) {
  if (!foto) return null;
  if (foto.startsWith('http://') || foto.startsWith('https://')) return foto;
  if (foto.startsWith('/')) return `${BACKEND_BASE}${foto}`;
  if (foto.startsWith('uploads/')) return `${BACKEND_BASE}/${foto}`;
  return `${BACKEND_BASE}/uploads/items/${foto}`; // caso "solo filename"
}

function FavoriteItemCard({ item, onRemove, removing }) {
  const itemId = item?.id;
  const imgSrc = resolveItemImageUrl(item?.foto);

  return (
    <div className="fav-card">
      <Link className="fav-mainLink" to={itemId != null ? `/infoIteam/${itemId}` : '/'}>
        <div className="fav-imgBox">
          {imgSrc ? (
            <img
              className="fav-img"
              src={imgSrc}
              alt={item?.nome || 'Oggetto'}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="fav-imgPlaceholder">Nessuna immagine</div>
          )}
        </div>

        <div className="fav-title">{item?.nome ?? 'Prodotto'}</div>
      </Link>

      <div className="fav-bottom">
        <div className="fav-price">
          {Number.isFinite(Number(item?.prezzo)) ? `${Number(item.prezzo).toFixed(2)} CHF` : '—'}
        </div>

        <button
          type="button"
          className="fav-removeBtn"
          onClick={() => itemId != null && onRemove(itemId)}
          disabled={removing}
        >
          {removing ? '...' : 'Rimuovi'}
        </button>
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  const data = useLoaderData();
  const revalidator = useRevalidator();

  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  const items = Array.isArray(data) ? data : (data?.items ?? data?.result ?? []);
  const count = items.length;

  const handleRemove = async (itemId) => {
    try {
      setError('');
      setRemovingId(itemId);

      const res = await fetch(`http://localhost:3000/Items/items/favorites/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Errore rimozione (${res.status})`);
      }

      revalidator.revalidate();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setRemovingId(null);
    }
  };


  const rows = [];
  for (let i = 0; i < items.length; i += 3) {
    rows.push(
      <div key={`r-${i}`} className="favRow">
        {items.slice(i, i + 3).map((it, idx) => (
          <FavoriteItemCard
            key={`f-${i + idx}`}
            item={it}
            onRemove={handleRemove}
            removing={removingId === it?.id}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <SearchBar />

      <div className="favTopBar">
        <div className="favTopTitle">Preferiti</div>
        <div className="favTopCount">{count} elementi</div>
      </div>

      {error ? <div className="favError">{error}</div> : null}

      <div id="favContainerRaws">
        {rows.length > 0 ? rows : <div className="fav-empty">Nessun preferito</div>}
      </div>
    </>
  );
}

export async function loader() {
  const res = await fetch('http://localhost:3000/Items/favorites', {
    credentials: 'include',
  });

  if (res.status === 401) return redirect('/login');

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Errore preferiti (${res.status}): ${txt}`);
  }

  return res.json();
}