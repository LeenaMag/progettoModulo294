import './EditItemPage.css';

import React, { useEffect, useState } from 'react';
import { Link, redirect, useLoaderData, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';

function resolveItemImageUrl(foto) {
  if (!foto) return null;
  if (foto.startsWith('http://') || foto.startsWith('https://')) return foto;
  if (foto.startsWith('/')) return `${BACKEND_BASE}${foto}`;
  if (foto.startsWith('uploads/')) return `${BACKEND_BASE}/${foto}`;
  return `${BACKEND_BASE}/uploads/items/${foto}`;
}

export default function EditItemPage() {
  const navigate = useNavigate();
  const { item, me } = useLoaderData();

  const [nome, setNome] = useState(item?.nome ?? '');
  const [descrizione, setDescrizione] = useState(item?.descrizione ?? '');
  const [prezzo, setPrezzo] = useState(item?.prezzo ?? '');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [okMsg, setOkMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    setNome(item?.nome ?? '');
    setDescrizione(item?.descrizione ?? '');
    setPrezzo(item?.prezzo ?? '');
  }, [item]);

  const imgSrc = resolveItemImageUrl(item?.foto);

  const saveChanges = async (e) => {
    e.preventDefault();
    setErrMsg('');
    setOkMsg('');

    const priceNum = Number(prezzo);
    if (!nome.trim()) {
      setErrMsg('Inserisci un nome.');
      return;
    }
    if (!descrizione.trim()) {
      setErrMsg('Inserisci una descrizione.');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setErrMsg('Inserisci un prezzo valido.');
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`http://localhost:3000/Items/items/${item.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          descrizione: descrizione.trim(),
          prezzo: priceNum,
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

      setOkMsg('Oggetto aggiornato.');
    } catch (err) {
      setErrMsg(String(err?.message || err));
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async () => {
    setErrMsg('');
    setOkMsg('');

    const ok = window.confirm('Vuoi davvero eliminare questo oggetto?');
    if (!ok) return;

    try {
      setDeleting(true);

      const res = await fetch(`http://localhost:3000/Items/items/${item.id}`, {
        method: 'DELETE',
        credentials: 'include',
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

      navigate('/');
    } catch (err) {
      setErrMsg(String(err?.message || err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <SearchBar />

      <div className="editItemWrap">
        <div className="editItemHead">
          <h2>Gestisci oggetto</h2>

          <div className="editItemHeadActions">
            <Link className="editItemBtn ghost" to={`/infoIteam/${item.id}`}>
              Vai al dettaglio
            </Link>
            <button className="editItemBtn ghost" type="button" onClick={() => navigate(-1)}>
              Indietro
            </button>
          </div>
        </div>

        <div className="editItemCard">
          <div className="editItemPreview">
            <div className="editItemImageBox">
              {imgSrc ? (
                <img className="editItemImage" src={imgSrc} alt={item?.nome ?? 'Oggetto'} />
              ) : (
                <div className="editItemImagePlaceholder">Nessuna immagine</div>
              )}
            </div>

            <div className="editItemOwner">
              Proprietario: <strong>{me?.username ?? 'Tu'}</strong>
            </div>
          </div>

          <form className="editItemForm" onSubmit={saveChanges}>
            <label className="editItemField">
              <span>Nome</span>
              <input value={nome} onChange={(e) => setNome(e.target.value)} />
            </label>

            <label className="editItemField">
              <span>Prezzo</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={prezzo}
                onChange={(e) => setPrezzo(e.target.value)}
              />
            </label>

            <label className="editItemField full">
              <span>Descrizione</span>
              <textarea
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                rows={8}
              />
            </label>

            {okMsg ? <div className="editItemOk">{okMsg}</div> : null}
            {errMsg ? <div className="editItemError">{errMsg}</div> : null}

            <div className="editItemActions">
              <button className="editItemBtn primary" type="submit" disabled={saving}>
                {saving ? 'Salvo...' : 'Salva modifiche'}
              </button>

              <button
                className="editItemBtn danger"
                type="button"
                onClick={deleteItem}
                disabled={deleting}
              >
                {deleting ? 'Elimino...' : 'Elimina oggetto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export async function loader({ params }) {
  const authRes = await fetch('http://localhost:3000/user/checkAuth', {
    credentials: 'include',
  });
  const auth = await authRes.json();

  if (!auth?.loggedIn) return redirect('/login');

  const meRes = await fetch(`http://localhost:3000/user/user/${auth.username}`, {
    credentials: 'include',
  });
  if (!meRes.ok) {
    const txt = await meRes.text().catch(() => '');
    throw new Error(`Errore profilo (${meRes.status}): ${txt}`);
  }
  const me = await meRes.json();

  const itemRes = await fetch(`http://localhost:3000/Items/itemsId/${params.itemId}`, {
    credentials: 'include',
  });
  if (!itemRes.ok) {
    const txt = await itemRes.text().catch(() => '');
    throw new Error(`Errore oggetto (${itemRes.status}): ${txt}`);
  }
  const item = await itemRes.json();

  if (Number(item?.fk_utente) !== Number(me?.id)) {
    throw new Error('Non sei il proprietario di questo oggetto.');
  }

  return { item, me };
}