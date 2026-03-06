import './UserSettingsPage.css';

import React, { useEffect, useState } from 'react';
import { Link, redirect, useLoaderData, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';

function resolveUserImageUrl(foto) {
  if (!foto) return null;
  if (foto.startsWith('http://') || foto.startsWith('https://')) return foto;
  if (foto.startsWith('/')) return `${BACKEND_BASE}${foto}`;
  if (foto.startsWith('uploads/')) return `${BACKEND_BASE}/${foto}`;
  return `${BACKEND_BASE}/uploads/users/${foto}`;
}

export default function UserSettingsPage() {
  const navigate = useNavigate();
  const { profile } = useLoaderData();

  const [firstName, setFirstName] = useState(profile?.name ?? '');
  const [lastName, setLastName] = useState(profile?.surname ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [password, setPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [errMsg, setErrMsg] = useState('');
  const [okMsg, setOkMsg] = useState('');

  useEffect(() => {
    setFirstName(profile?.name ?? '');
    setLastName(profile?.surname ?? '');
    setUsername(profile?.username ?? '');
  }, [profile]);

  const fotoSrc = resolveUserImageUrl(profile?.foto);

  const onSave = async (e) => {
    e.preventDefault();
    setErrMsg('');
    setOkMsg('');

    if (!firstName || !lastName || !username || !password) {
      setErrMsg('Compila tutti i campi (password richiesta per salvare).');
      return;
    }

    try {
      setSaving(true);

      const res = await fetch('http://localhost:3000/user/modify', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          username,
          password,
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

      setPassword('');
      setOkMsg('Profilo aggiornato!');
    } catch (err) {
      setErrMsg(String(err?.message || err));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setErrMsg('');
    setOkMsg('');

    const ok = window.confirm(
      'Sei sicuro? Verranno cancellati account, oggetti, aste, chat e preferiti/carrello (se presenti).'
    );
    if (!ok) return;

    try {
      setDeleting(true);

      const res = await fetch('http://localhost:3000/user/delete', {
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

      navigate('/login');
    } catch (err) {
      setErrMsg(String(err?.message || err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <SearchBar />

      <div className="settingsWrap">
        <div className="settingsHead">
          <h2>Impostazioni account</h2>
          <button className="settingsBackBtn" type="button" onClick={() => navigate(-1)}>
            Indietro
          </button>
        </div>

        <div className="settingsProfileRow">
          <div className="settingsAvatarBox">
            {fotoSrc ? (
              <img className="settingsAvatar" src={fotoSrc} alt="Foto profilo" />
            ) : (
              <div className="settingsAvatarPlaceholder">Nessuna foto</div>
            )}
          </div>

          <div className="settingsProfileInfo">
            <div className="settingsBig">{profile?.username}</div>
            <div className="settingsSmall">
              {profile?.name} {profile?.surname}
            </div>
            <div className="settingsSmall">
              <Link to={`/user/${profile?.username}`}>Vai al profilo</Link>
            </div>
          </div>
        </div>

        <form className="settingsForm" onSubmit={onSave}>
          <div className="settingsGrid">
            <label className="settingsField">
              <span>Nome</span>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </label>

            <label className="settingsField">
              <span>Cognome</span>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </label>

            <label className="settingsField full">
              <span>Username</span>
              <input value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>

            <label className="settingsField full">
              <span>Password (obbligatoria per salvare)</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Inserisci una password"
              />
            </label>
          </div>

          {errMsg ? <div className="settingsError">{errMsg}</div> : null}
          {okMsg ? <div className="settingsOk">{okMsg}</div> : null}

          <div className="settingsActions">
            <button className="settingsSaveBtn" type="submit" disabled={saving}>
              {saving ? 'Salvo...' : 'Salva modifiche'}
            </button>

            <button
              className="settingsDeleteBtn"
              type="button"
              onClick={onDelete}
              disabled={deleting}
              title="Cancellazione account"
            >
              {deleting ? 'Elimino...' : 'Cancella account'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export async function loader() {

  const authRes = await fetch('http://localhost:3000/user/checkAuth', { credentials: 'include' });
  const auth = await authRes.json();

  if (!auth?.loggedIn) return redirect('/login');


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