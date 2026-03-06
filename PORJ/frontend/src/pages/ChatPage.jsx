import './ChatPage.css';

import React, { useMemo, useState } from 'react';
import { Link, redirect, useLoaderData, useNavigate, useRevalidator } from 'react-router-dom';
import PrewiewOwner from '../components/PrewiewOwner';

export default function ChatPage() {
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const { otherUser, chatId, messages, myUserId } = useLoaderData();

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  const cleanMessages = useMemo(() => {
    const arr = Array.isArray(messages) ? messages : [];
    return arr.filter((m) => (m?.testo ?? '').trim() !== '');
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    setErr('');

    const msg = text.trim();
    if (!msg) return;
    if (!chatId) {
      setErr('Chat non valida.');
      return;
    }

    try {
      setSending(true);

      const res = await fetch('http://localhost:3000/user/messages', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg, chatId }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Errore invio (${res.status})`);
      }

      setText('');
      revalidator.revalidate();
    } catch (e2) {
      setErr(String(e2?.message || e2));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chatPage">
      <div className="chatTop">
        <button className="chatBackBtn" type="button" onClick={() => navigate(-1)}>
          Indietro
        </button>

        <div className="chatOther">
          <PrewiewOwner
            user={{
              foto: otherUser?.foto,
              nome: otherUser?.username,
            }}
          />
        </div>

        {otherUser?.username ? (
          <Link className="chatProfileBtn" to={`/user/${otherUser.username}`}>
            Profilo
          </Link>
        ) : (
          <div />
        )}
      </div>

      <div className="chatMessages">
        {cleanMessages.length ? (
          cleanMessages.map((m) => {
            // ✅ QUI è la differenziazione corretta
            const isMine = Number(m.fk_utente) === Number(myUserId);

            return (
              <div key={m.id} className={`chatMsgRow ${isMine ? 'mine' : 'theirs'}`}>
                <div className="chatBubble">
                  <div className="chatMsgAuthor">{isMine ? 'Tu' : otherUser?.username}</div>
                  <div className="chatMsgText">{m.testo}</div>
                  {m.dataInvio ? <div className="chatMsgMeta">{m.dataInvio}</div> : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="chatEmpty">Nessun messaggio ancora. Scrivi il primo 🙂</div>
        )}
      </div>

      {err ? <div className="chatError">{err}</div> : null}

      <form className="chatBar" onSubmit={sendMessage}>
        <input
          className="chatInput"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Scrivi un messaggio..."
        />
        <button className="chatSendBtn" type="submit" disabled={sending}>
          {sending ? '...' : 'Invia'}
        </button>
      </form>
    </div>
  );
}

export async function loader({ params }) {

  const authRes = await fetch('http://localhost:3000/user/checkAuth', { credentials: 'include' });
  const auth = await authRes.json();
  if (!auth?.loggedIn) return redirect('/login');

  const myUsername = auth?.username;
  if (!myUsername) return redirect('/login');

  // ricavo l'id dell'utente loggato vero dal profilo
  const meRes = await fetch(`http://localhost:3000/user/user/${myUsername}`, {
    credentials: 'include',
  });
  if (!meRes.ok) {
    const txt = await meRes.text().catch(() => '');
    throw new Error(`Errore profilo mio (${meRes.status}): ${txt}`);
  }
  const me = await meRes.json();
  const myUserId = me?.id;

  // altro utente
  const otherRes = await fetch(`http://localhost:3000/user/userId/${params.ownerId}`, {
    credentials: 'include',
  });
  if (!otherRes.ok) {
    const txt = await otherRes.text().catch(() => '');
    throw new Error(`Errore user (${otherRes.status}): ${txt}`);
  }
  const otherUser = await otherRes.json();

  // chat + messaggi
  const chatRes = await fetch(`http://localhost:3000/user/chatMessages/${params.ownerId}`, {
    credentials: 'include',
  });
  if (!chatRes.ok) {
    const txt = await chatRes.text().catch(() => '');
    throw new Error(`Errore chat (${chatRes.status}): ${txt}`);
  }
  const chatJson = await chatRes.json();

  return {
    myUserId,
    otherUser,
    chatId: chatJson?.chatId,
    messages: chatJson?.messages ?? [],
  };
}