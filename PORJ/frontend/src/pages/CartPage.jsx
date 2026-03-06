import './CartPage.css';

import React, { useMemo, useState } from 'react';
import { Link, redirect, useLoaderData, useRevalidator } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';

function resolveItemImageUrl(foto) {
  if (!foto) return null;
  if (foto.startsWith('http://') || foto.startsWith('https://')) return foto;
  if (foto.startsWith('/')) return `${BACKEND_BASE}${foto}`;
  if (foto.startsWith('uploads/')) return `${BACKEND_BASE}/${foto}`;
  return `${BACKEND_BASE}/uploads/items/${foto}`;
}

function CartItemCard({ item, onRemove, removing }) {
  const itemId = item?.id ?? item?.itemId ?? item?.fk_oggetto;
  const imgSrc = resolveItemImageUrl(item?.foto);

  return (
    <div className="cart-card">
      <Link className="cart-mainLink" to={itemId != null ? `/infoIteam/${itemId}` : '/'}>
        <div className="cart-imgBox">
          {imgSrc ? (
            <img className="cart-img" src={imgSrc} alt={item?.nome || 'Oggetto'} />
          ) : (
            <div className="cart-imgPlaceholder">Nessuna immagine</div>
          )}
        </div>

        <div className="cart-title">{item?.nome ?? 'Prodotto'}</div>
      </Link>

      <div className="cart-bottom">
        <div className="cart-price">
          {Number.isFinite(Number(item?.prezzo)) ? `${Number(item.prezzo).toFixed(2)} CHF` : '—'}
        </div>

        <button
          type="button"
          className="cart-removeBtn"
          onClick={() => itemId != null && onRemove(itemId)}
          disabled={removing}
        >
          {removing ? '...' : 'Rimuovi'}
        </button>
      </div>
    </div>
  );
}

export default function CartPage() {
  const data = useLoaderData();
  const revalidator = useRevalidator();

  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  const items = Array.isArray(data) ? data : (data?.items ?? data?.result ?? []);

  const total = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number.isFinite(Number(it?.prezzo)) ? Number(it.prezzo) : 0), 0);
  }, [items]);

  const handleRemove = async (itemId) => {
    try {
      setError('');
      setRemovingId(itemId);

      const res = await fetch(`http://localhost:3000/Items/items/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Errore rimozione (${res.status})`);
      }

      revalidator.revalidate(); // ricarica il carrello
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setRemovingId(null);
    }
  };

  const rows = [];
  for (let i = 0; i < items.length; i += 3) {
    rows.push(
      <div key={`r-${i}`} className="cartRow">
        {items.slice(i, i + 3).map((it, idx) => (
          <CartItemCard
            key={`c-${i + idx}`}
            item={it}
            onRemove={handleRemove}
            removing={removingId === (it?.id ?? it?.itemId ?? it?.fk_oggetto)}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <SearchBar />

      <div className="cartTopBar">
        <div className="cartTopTitle">Carrello</div>
        <div className="cartTopTotal">Totale: {total.toFixed(2)} CHF</div>
      </div>

      {error ? <div className="cartError">{error}</div> : null}

      <div id="cartContainerRaws">
        {rows.length > 0 ? rows : <div className="cart-empty">Il carrello è vuoto</div>}
      </div>
    </>
  );
}

export async function loader() {
  const res = await fetch('http://localhost:3000/Items/cart', {
    credentials: 'include',
  });

  if (res.status === 401) {
    return redirect('/login');
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Errore carrello (${res.status}): ${txt}`);
  }

  return res.json();
}