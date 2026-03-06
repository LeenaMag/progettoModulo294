import './UserProfilePage.css';

import React, { useContext, useMemo, useState } from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { AuthContext } from '../context/AuthContext';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';

function resolveImg(url, folderFallback) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${BACKEND_BASE}${url}`;
  if (url.startsWith('uploads/')) return `${BACKEND_BASE}/${url}`;
  return `${BACKEND_BASE}/${folderFallback}/${url}`;
}

function ItemCard({ item }) {
  const imgSrc = resolveImg(item?.foto, 'uploads/items');
  return (
    <Link className="up-link" to={`/infoIteam/${item.id}`}>
      <div className="up-card">
        <div className="up-imgBox">
          {imgSrc ? (
            <img className="up-img" src={imgSrc} alt={item?.nome || 'Oggetto'} />
          ) : (
            <div className="up-imgPlaceholder">Nessuna immagine</div>
          )}
        </div>

        <div className="up-body">
          <div className="up-title">{item?.nome ?? 'Oggetto'}</div>
          <div className="up-row">
            <span className="up-muted">Prezzo</span>
            <span className="up-strong">
              {Number.isFinite(Number(item?.prezzo)) ? `${Number(item.prezzo).toFixed(2)} CHF` : '—'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function AuctionCard({ auction }) {

  const imgSrc = resolveImg(auction?.itemFoto, 'uploads/items');
  const price = auction?.currentPrice ?? auction?.minPrezzo;
  const priceLabel = auction?.currentPrice != null ? 'Offerta in testa' : 'Prezzo minimo';

  return (
    <Link className="up-link" to={`/auction/${auction.id}`}>
      <div className="up-card">
        <div className="up-imgBox">
          {imgSrc ? (
            <img className="up-img" src={imgSrc} alt={auction?.itemNome || 'Asta'} />
          ) : (
            <div className="up-imgPlaceholder">Nessuna immagine</div>
          )}

          {auction?.aperta != null && (
            <div className={`up-badge ${auction.aperta ? 'open' : 'closed'}`}>
              {auction.aperta ? 'APERTA' : 'CHIUSA'}
            </div>
          )}
        </div>

        <div className="up-body">
          <div className="up-title">{auction?.itemNome ?? 'Asta'}</div>

          <div className="up-row">
            <span className="up-muted">{priceLabel}</span>
            <span className="up-strong">
              {Number.isFinite(Number(price)) ? `${Number(price).toFixed(2)} CHF` : '—'}
            </span>
          </div>

          <div className="up-row">
            <span className="up-muted">Scadenza</span>
            <span className="up-strong">{auction?.dataF ?? '—'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function UserProfilePage() {
  const { user: authUser } = useContext(AuthContext);
  const { profile, auctions } = useLoaderData();

  const [tab, setTab] = useState('items'); 

  const isMe = useMemo(() => {
    return authUser?.username && profile?.username
      ? authUser.username === profile.username
      : false;
  }, [authUser?.username, profile?.username]);

  const avatarSrc = resolveImg(profile?.foto, 'uploads/users');

  const items = Array.isArray(profile?.itemsForSale) ? profile.itemsForSale : [];
  const aucs = Array.isArray(auctions) ? auctions : [];

  const rowsFrom = (arr, render, perRow = 3) => {
    const rows = [];
    for (let i = 0; i < arr.length; i += perRow) {
      rows.push(
        <div key={`r-${i}`} className="up-rowGrid">
          {arr.slice(i, i + perRow).map(render)}
        </div>
      );
    }
    return rows;
  };

  return (
    <>
      <SearchBar />

      <div className="up-wrap">
        <div className="up-head">
          <div className="up-userBox">
            <div className="up-avatarBox">
              {avatarSrc ? (
                <img className="up-avatar" src={avatarSrc} alt="Foto profilo" />
              ) : (
                <div className="up-avatarPlaceholder">Nessuna foto</div>
              )}
            </div>

            <div className="up-userInfo">
              <div className="up-username">@{profile?.username}</div>
              <div className="up-name">
                {profile?.name} {profile?.surname}
              </div>

              <div className="up-actions">
                {!isMe && profile?.id ? (
                  <Link className="up-btn" to={`/chat/${profile.id}`}>
                    Chat
                  </Link>
                ) : null}

                {isMe ? (
                  <Link className="up-btn" to="/impostazioni">
                    Impostazioni
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          <div className="up-tabs">
            <button
              className={`up-tab ${tab === 'items' ? 'active' : ''}`}
              onClick={() => setTab('items')}
              type="button"
            >
              Oggetti ({items.length})
            </button>

            <button
              className={`up-tab ${tab === 'auctions' ? 'active' : ''}`}
              onClick={() => setTab('auctions')}
              type="button"
            >
              Aste ({aucs.length})
            </button>
          </div>
        </div>

        {tab === 'items' ? (
          <div className="up-list">
            {items.length ? rowsFrom(items, (it) => <ItemCard key={it.id} item={it} />) : (
              <div className="up-empty">Nessun oggetto in vendita.</div>
            )}
          </div>
        ) : (
          <div className="up-list">
            {aucs.length ? rowsFrom(aucs, (a) => <AuctionCard key={a.id} auction={a} />) : (
              <div className="up-empty">Nessuna asta trovata.</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export async function loader({ params }) {

  const profRes = await fetch(`http://localhost:3000/user/user/${params.username}`, {
    credentials: 'include',
  });

  if (!profRes.ok) {
    const txt = await profRes.text().catch(() => '');
    throw new Error(`Errore profilo (${profRes.status}): ${txt}`);
  }

  const profile = await profRes.json();


  let auctions = [];
  try {
    const aucRes = await fetch(`http://localhost:3000/Items/items/auction/user/${profile.id}`, {
      credentials: 'include',
    });
    if (aucRes.ok) auctions = await aucRes.json();
  } catch {
    auctions = [];
  }

  return { profile, auctions };
}