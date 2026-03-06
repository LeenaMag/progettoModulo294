import './CreateAuctionPage.css';

import React, { useMemo, useState } from 'react';
import { Link, redirect, useLoaderData, useNavigate, useRevalidator } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';

function resolveItemImageUrl(foto) {
  if (!foto) return null;
  if (foto.startsWith('http://') || foto.startsWith('https://')) return foto;
  if (foto.startsWith('/')) return `${BACKEND_BASE}${foto}`;
  if (foto.startsWith('uploads/')) return `${BACKEND_BASE}/${foto}`;
  return `${BACKEND_BASE}/uploads/items/${foto}`;
}

// converte "YYYY-MM-DDTHH:MM" (input datetime-local) -> "YYYY.MM.DD HH:MM"
function toBackendDate(datetimeLocal) {
  if (!datetimeLocal) return null;
  const [datePart, timePart] = datetimeLocal.split('T');
  if (!datePart || !timePart) return null;
  const [y, m, d] = datePart.split('-');
  const [hh, mm] = timePart.split(':');
  if (!y || !m || !d || !hh || !mm) return null;
  return `${y}.${m}.${d} ${hh}:${mm}`;
}

function nowBackendDate() {
  const d = new Date();
  const y = String(d.getFullYear());
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${hh}:${mm}`;
}

function plusHoursLocalInput(h = 24) {
  const d = new Date(Date.now() + h * 3600 * 1000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

function ItemPickCard({ item, selected, onSelect }) {
  const imgSrc = resolveItemImageUrl(item?.foto);
  return (
    <button
      type="button"
      className={`ca-itemCard ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(item.id)}
    >
      <div className="ca-imgBox">
        {imgSrc ? (
          <img className="ca-img" src={imgSrc} alt={item?.nome || 'Oggetto'} />
        ) : (
          <div className="ca-imgPlaceholder">Nessuna immagine</div>
        )}
      </div>

      <div className="ca-itemBody">
        <div className="ca-itemTitle">{item?.nome ?? 'Oggetto'}</div>
        <div className="ca-itemRow">
          <span className="ca-muted">Prezzo</span>
          <span className="ca-strong">
            {Number.isFinite(Number(item?.prezzo)) ? `${Number(item.prezzo).toFixed(2)} CHF` : '—'}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function CreateAuctionPage() {
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const { profile } = useLoaderData();
  const items = Array.isArray(profile?.itemsForSale) ? profile.itemsForSale : [];

  const [selectedItemId, setSelectedItemId] = useState(items?.[0]?.id ?? null);
  const [minPrice, setMinPrice] = useState('');
  const [endLocal, setEndLocal] = useState(() => plusHoursLocalInput(24));

  const [errMsg, setErrMsg] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedItemId) ?? null,
    [items, selectedItemId]
  );

  const createAuction = async (e) => {
    e.preventDefault();
    setErrMsg('');
    setOkMsg('');

    if (!selectedItemId) {
      setErrMsg('Seleziona un oggetto.');
      return;
    }

    const mp = Number(minPrice);
    if (!Number.isFinite(mp) || mp <= 0) {
      setErrMsg('Inserisci un prezzo minimo valido.');
      return;
    }

    const dataF = toBackendDate(endLocal);
    if (!dataF) {
      setErrMsg('Inserisci una data fine valida.');
      return;
    }

    try {
      setSaving(true);

      const res = await fetch('http://localhost:3000/Items/items/auction/createAuction', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItemId,
          dataI: nowBackendDate(),
          minPrice: mp,
          dataF,
        }),
      });

      const txt = await res.text().catch(() => '');
      if (!res.ok) {
        let msg = txt;
        try {
          const j = JSON.parse(txt);
          msg = j?.error ?? msg;
        } catch {}
        throw new Error(msg || `Errore (${res.status})`);
      }

      setOkMsg('Asta creata!');
      setMinPrice('');
      revalidator.revalidate();

      setTimeout(() => navigate('/auctions'), 250);
    } catch (err) {
      setErrMsg(String(err?.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SearchBar />

      <div className="ca-wrap">
        <div className="ca-head">
          <h2>Crea asta</h2>
          <div className="ca-headActions">
            <Link className="ca-btn" to="/aste">
              Lista aste
            </Link>
            <button className="ca-btn" type="button" onClick={() => navigate(-1)}>
              Indietro
            </button>
          </div>
        </div>

        <div className="ca-section">
          <div className="ca-sectionTitle">1) Scegli un oggetto</div>

          {items.length ? (
            <div className="ca-grid">
              {items.map((it) => (
                <ItemPickCard
                  key={it.id}
                  item={it}
                  selected={it.id === selectedItemId}
                  onSelect={setSelectedItemId}
                />
              ))}
            </div>
          ) : (
            <div className="ca-empty">
              Non hai oggetti da mettere all’asta. <Link to="/addItem">Aggiungi un oggetto</Link>
            </div>
          )}
        </div>

        <div className="ca-section">
          <div className="ca-sectionTitle">2) Imposta i dettagli</div>

          <form className="ca-form" onSubmit={createAuction}>
            <div className="ca-formGrid">
              <label className="ca-field">
                <span>Oggetto selezionato</span>
                <input value={selectedItem?.nome ?? ''} readOnly />
              </label>

              <label className="ca-field">
                <span>Prezzo minimo (CHF)</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Es. 25.00"
                  disabled={!items.length}
                />
              </label>

              <label className="ca-field full">
                <span>Data fine asta</span>
                <input
                  type="datetime-local"
                  value={endLocal}
                  onChange={(e) => setEndLocal(e.target.value)}
                  disabled={!items.length}
                />
              </label>
            </div>

            {errMsg ? <div className="ca-error">{errMsg}</div> : null}
            {okMsg ? <div className="ca-ok">{okMsg}</div> : null}

            <div className="ca-actions">
              <button className="ca-submit" type="submit" disabled={!items.length || saving}>
                {saving ? 'Creo...' : 'Crea asta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export async function loader() {

  const authRes = await fetch('http://localhost:3000/user/checkAuth', { credentials: 'include' });
  const auth = await authRes.json();
  if (!auth?.loggedIn) return redirect('/login');

  // profilo completo + itemsForSale
  const profRes = await fetch(`http://localhost:3000/user/user/${auth.username}`, {
    credentials: 'include',
  });

  if (!profRes.ok) {
    const txt = await profRes.text().catch(() => '');
    throw new Error(`Errore profilo (${profRes.status}): ${txt}`);
  }

  const profile = await profRes.json();
  return { profile };
}