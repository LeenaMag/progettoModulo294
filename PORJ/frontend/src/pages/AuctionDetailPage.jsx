import './AuctionDetailPage.css';

import React, { useContext, useMemo, useState } from 'react';
import { Link, useLoaderData, useNavigate, useRevalidator } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import PrewiewOwner from '../components/PrewiewOwner';
import { AuthContext } from '../context/AuthContext';

function parseAuctionDate(input) {
  if (!input || typeof input !== 'string') return null;
  const [datePart, timePartRaw] = input.split(' ');
  if (!datePart || !timePartRaw) return null;

  const sep = datePart.includes('.') ? '.' : '-';
  const [y, m, d] = datePart.split(sep).map(Number);
  const [hh, mm, ss] = timePartRaw.trim().split(':').map(Number);

  if (![y, m, d, hh, mm].every((n) => Number.isFinite(n))) return null;
  return new Date(y, m - 1, d, hh, mm, Number.isFinite(ss) ? ss : 0);
}

function formatTimeLeft(endStr) {
  const end = parseAuctionDate(endStr);
  if (!end) return '—';

  const diffMs = end.getTime() - Date.now();
  if (diffMs <= 0) return 'Scaduta';

  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);

  if (days > 0) return `${days}g ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function AuctionDetailPage() {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const { user } = useContext(AuthContext);

  const { auction, offers } = useLoaderData();

  const myId = user?.userId ?? user?.id;
    const isOwner = myId != null && auction?.ownerId === myId;


  const [price, setPrice] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [okMsg, setOkMsg] = useState('');

  const timeLeft = useMemo(() => formatTimeLeft(auction?.dataF), [auction?.dataF]);

  const currentTop = auction?.currentPrice != null ? Number(auction.currentPrice) : null;
  const minPrice = auction?.minPrezzo != null ? Number(auction.minPrezzo) : null;

  // prezzo “da mostrare”: offerta in testa se esiste, altrimenti prezzo minimo
  const displayPrice = currentTop != null ? currentTop : minPrice;

  // minimo consigliato per l'input (backend richiede: >= minPrezzo e > offerta attuale)
  const suggestedMin =
    currentTop != null ? Math.max(minPrice ?? 0, currentTop + 0.01) : (minPrice ?? 0);

  const isOpen = Boolean(auction?.aperta);

  const submitOffer = async (e) => {
    e.preventDefault();
    setErrMsg('');
    setOkMsg('');

    if (!user) {
      setErrMsg('Devi fare login per fare un’offerta.');
      return;
    }
    if (!isOpen) {
      setErrMsg('Asta chiusa.');
      return;
    }

    const p = Number(price);
    if (!Number.isFinite(p) || p <= 0) {
      setErrMsg('Inserisci un valore valido.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/Items/items/auction/newOffer', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId: auction.id, price: p }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Errore ${res.status}`);
      }

      setPrice('');
      setOkMsg('Offerta inserita!');
      revalidator.revalidate(); // ricarica loader (aggiorna offerta in testa + lista)
    } catch (err) {
      setErrMsg(String(err?.message || err));
    }
  };

  return (
    <>
      <SearchBar />

      <div className="auctionDetail-center">
        <div className="auctionDetail-titleRow">
          <h2>Dettaglio Asta</h2>

          <div className="auctionDetail-actions">
            <button type="button" className="auctionDetail-btn" onClick={() => navigate(-1)}>
              Indietro
            </button>
          </div>
        </div>

        {isOwner && isOpen ? (
        <button
            type="button"
            className="auctionDetail-btn"
            onClick={async () => {
            const ok = window.confirm('Vuoi chiudere l’asta ora?');
            if (!ok) return;

            const res = await fetch(
                `http://localhost:3000/Items/items/auction/${auction.id}/close`,
                { method: 'PATCH', credentials: 'include' }
            );

            if (!res.ok) {
                const txt = await res.text().catch(() => '');
                alert(txt || 'Errore chiusura');
                return;
            }

            // ricarica loader
            revalidator.revalidate();
            }}
        >
            Chiudi asta
        </button>
        ) : null}

        {/* venditore */}
        <div className="auctionDetail-ownerRow">
          <PrewiewOwner
            user={{
              foto: auction?.ownerFoto,
              nome: auction?.ownerUsername,
            }}
          />
          {auction?.ownerId ? (
            <Link className="auctionDetail-chatLink" to={`/chat/${auction.ownerId}`}>
              Apri chat
            </Link>
          ) : null}
        </div>

        <div className="auctionDetail-grid">
          <div className="auctionDetail-left">
            <div className="auctionDetail-imageBox">
              {auction?.itemFoto ? (
                <img className="auctionDetail-image" src={auction.itemFoto} alt={auction.itemNome} />
              ) : (
                <div className="auctionDetail-imagePlaceholder">Nessuna immagine</div>
              )}
            </div>
          </div>

          <div className="auctionDetail-right">
            <div className="auctionDetail-name">{auction?.itemNome || 'Asta'}</div>

            <div className="auctionDetail-pillRow">
              <span className={`auctionDetail-pill ${isOpen ? 'open' : 'closed'}`}>
                {isOpen ? 'APERTA' : 'CHIUSA'}
              </span>
              <span className="auctionDetail-pill neutral">⏳ {timeLeft}</span>
              <span className="auctionDetail-pill neutral">Fine: {auction?.dataF || '—'}</span>
            </div>

            <div className="auctionDetail-priceBox">
              <div className="auctionDetail-priceLabel">
                {currentTop != null ? 'Offerta in testa' : 'Prezzo minimo'}
              </div>
              <div className="auctionDetail-priceValue">
                {displayPrice != null && Number.isFinite(displayPrice)
                  ? `${displayPrice.toFixed(2)} CHF`
                  : '—'}
              </div>

              {auction?.winnerUsername && currentTop != null && (
                <div className="auctionDetail-winner">In testa: {auction.winnerUsername}</div>
              )}
            </div>

            {auction?.itemDescrizione && (
              <div className="auctionDetail-desc">{auction.itemDescrizione}</div>
            )}

            <div className="auctionDetail-bidBox">
              <div className="auctionDetail-bidTitle">Fai un’offerta</div>

              {!user ? (
                <div className="auctionDetail-warning">
                  Devi essere loggato. <Link to="/login">Vai al login</Link>
                </div>
              ) : null}

              {!isOpen ? <div className="auctionDetail-warning">Asta chiusa.</div> : null}

              <form onSubmit={submitOffer} className="auctionDetail-bidForm">
                <input
                  type="number"
                  step="0.01"
                  min={suggestedMin}
                  className="auctionDetail-input"
                  placeholder={`Min. ${suggestedMin.toFixed(2)} CHF`}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={!user || !isOpen}
                />
                <button className="auctionDetail-submit" type="submit" disabled={!user || !isOpen}>
                  Invia offerta
                </button>
              </form>

              {errMsg ? <div className="auctionDetail-error">{errMsg}</div> : null}
              {okMsg ? <div className="auctionDetail-ok">{okMsg}</div> : null}
            </div>

            <div className="auctionDetail-offersBox">
              <div className="auctionDetail-offersTitle">Ultime offerte</div>

              {offers?.length ? (
                <div className="auctionDetail-offersList">
                  {offers.map((o, idx) => (
                    <div key={o.id} className={`auctionDetail-offerRow ${idx === 0 ? 'top' : ''}`}>
                      <div className="auctionDetail-offerLeft">
                        <span className="auctionDetail-offerUser">{o.username}</span>
                        {idx === 0 ? <span className="auctionDetail-topTag">TOP</span> : null}
                      </div>
                      <div className="auctionDetail-offerValue">
                        {Number(o.valore).toFixed(2)} CHF
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="auctionDetail-empty">Ancora nessuna offerta.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function loader({ params }) {
  const res = await fetch(
    `http://localhost:3000/Items/items/auction/detail/${params.auctionId}`,
    { credentials: 'include' }
  );

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Impossibile caricare asta (${res.status}): ${txt}`);
  }

  const data = await res.json();
  return {
    auction: data.auction,
    offers: data.offers ?? [],
  };
}