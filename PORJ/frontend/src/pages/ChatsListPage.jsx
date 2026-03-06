import './ChatsListPage.css';

import React, { useMemo } from 'react';
import { Link, redirect, useLoaderData } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';

function resolveUserImageUrl(foto) {
  if (!foto) return null;
  if (foto.startsWith('http://') || foto.startsWith('https://')) return foto;
  if (foto.startsWith('/')) return `${BACKEND_BASE}${foto}`;
  if (foto.startsWith('uploads/')) return `${BACKEND_BASE}/${foto}`;
  return `${BACKEND_BASE}/uploads/users/${foto}`;
}

function normalizeChatRow(raw) {
  const c = raw ?? {};

  const chatId = c.chatId ?? c.idChat ?? c.id ?? c.fk_chat ?? null;

  const otherUserId =
    c.otherUserId ?? c.otherId ?? c.fk_other ?? c.userIdOther ?? c.idOtherUser ?? null;

  const otherUsername =
    c.otherUsername ?? c.other_name ?? c.usernameOther ?? c.nomeAltro ?? c.username ?? null;

  const otherFoto = c.otherFoto ?? c.other_photo ?? c.fotoOther ?? c.foto_altro ?? c.foto ?? null;

  const lastMessage =
    c.lastMessage ?? c.last_message ?? c.ultimoMessaggio ?? c.testo ?? c.message ?? '';

  const lastAt = c.lastAt ?? c.last_at ?? c.data ?? c.createdAt ?? c.time ?? null;

  return {
    chatId,
    otherUserId: otherUserId != null ? Number(otherUserId) : null,
    otherUsername: otherUsername ?? 'Utente',
    otherFoto,
    lastMessage: (lastMessage ?? '').toString(),
    lastAt,
  };
}

function ChatRow({ row }) {
  const img = resolveUserImageUrl(row.otherFoto);

  return (
    <Link className="ch-link" to={row.otherUserId != null ? `/chat/${row.otherUserId}` : '/'}>
      <div className="ch-row">
        <div className="ch-avatarBox">
          {img ? (
            <img className="ch-avatar" src={img} alt={row.otherUsername} />
          ) : (
            <div className="ch-avatarPlaceholder">👤</div>
          )}
        </div>

        <div className="ch-main">
          <div className="ch-topLine">
            <div className="ch-username">{row.otherUsername}</div>
            <div className="ch-time">{row.lastAt ?? ''}</div>
          </div>

          <div className="ch-preview">
            {row.lastMessage?.trim() ? row.lastMessage : (
              <span className="ch-muted">Nessun messaggio</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ChatsListPage() {
  const data = useLoaderData();

  const rows = useMemo(() => {
    const arr = Array.isArray(data) ? data : (data?.chats ?? data?.result ?? []);
    return arr.map(normalizeChatRow);
  }, [data]);

  return (
    <>
      <SearchBar />

      <div className="ch-wrap">
        <div className="ch-head">
          <h2>Le mie chat</h2>
          <div className="ch-sub">{rows.length} conversazioni</div>
        </div>

        <div className="ch-list">
          {rows.length ? (
            rows.map((r, i) => <ChatRow key={r.chatId ?? `${r.otherUserId}-${i}`} row={r} />)
          ) : (
            <div className="ch-empty">Non hai ancora chat.</div>
          )}
        </div>
      </div>
    </>
  );
}

export async function loader() {
  const res = await fetch('http://localhost:3000/user/chats', {
    credentials: 'include',
  });

  if (res.status === 401) return redirect('/login');

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Errore chats (${res.status}): ${txt}`);
  }

  return res.json();
}