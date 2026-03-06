import React from 'react';
import { redirect, useLoaderData } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

export default function NotificationsPage() {
  const notifs = useLoaderData();

  return (
    <>
      <SearchBar />
      <div style={{ width: 'min(900px, 92vw)', margin: '20px auto', padding: 16 }}>
        <h2>Notifiche</h2>

        {notifs.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifs.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: 12,
                  border: '1px solid rgba(255,255,255,.12)',
                  borderRadius: 12,
                }}
              >
                <div style={{ fontWeight: 900 }}>{n.titolo}</div>
                <div style={{ opacity: 0.85, marginTop: 6 }}>{n.testo}</div>
                <div style={{ opacity: 0.65, marginTop: 8, fontSize: 12 }}>
                  {n.tipo}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>Nessuna notifica.</div>
        )}
      </div>
    </>
  );
}

export async function loader() {
  const authRes = await fetch('http://localhost:3000/user/checkAuth', {
    credentials: 'include'
  });

  if (!authRes.ok) {
    return redirect('/login');
  }

  const auth = await authRes.json();

  if (!auth?.loggedIn) {
    return redirect('/login');
  }

  const res = await fetch('http://localhost:3000/Items/notifications', {
    credentials: 'include'
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Errore notifiche: ${txt}`);
  }

  return await res.json();
}