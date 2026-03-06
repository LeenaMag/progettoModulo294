import './AuctionListPage.css';

import React from 'react';
import { Link, useLoaderData } from 'react-router-dom';

import SearchBar from '../components/SearchBar'; // <- se sei in src/pages usa: ../components/SearchBar

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
  if (!end) return null;

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

// ✅ Normalizzazione per risposta "ricca"
// Atteso dal backend: a.* + itemId,itemNome,itemFoto,currentPrice
function normalizeAuctionRich(raw) {
  const a = raw ?? {};

  return {
    auctionId: a.id ?? a.auctionId,
    itemId: a.itemId ?? a.fk_oggetto ?? a.item_id,
    nome: a.itemNome ?? a.nome ?? a.title ?? 'Asta',
    foto: a.itemFoto ?? a.foto ?? null,

    minPrezzo: a.minPrezzo ?? a.minPrice ?? null,
    currentPrice: a.currentPrice ?? null,

    aperta: a.aperta ?? a.open ?? null,
    dataI: a.dataI ?? a.startDate ?? null,
    dataF: a.dataF ?? a.endDate ?? null,
  };
}
const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';

function resolveItemImageUrl(foto) {
  if (!foto) return null;

  // già URL completo
  if (foto.startsWith('http://') || foto.startsWith('https://')) return foto;

  // path assoluto tipo /uploads/items/xxx
  if (foto.startsWith('/')) return `${BACKEND_BASE}${foto}`;

  // path relativo tipo uploads/items/xxx
  if (foto.startsWith('uploads/')) return `${BACKEND_BASE}/${foto}`;

  // solo filename (hash)
  return `${BACKEND_BASE}/uploads/items/${foto}`;
}
function AuctionCard({ auction }) {
  const a = normalizeAuctionRich(auction);
  const timeLeft = formatTimeLeft(a.dataF);

  const price = a.currentPrice ?? a.minPrezzo;
  const priceLabel = a.currentPrice != null ? 'Offerta attuale' : 'Prezzo minimo';

  const to =
    a.auctionId != null
      ? `/auction/${a.auctionId}`
      : a.itemId != null
        ? `/infoIteam/${a.itemId}`
        : '/';

  const isOpen = a.aperta == null ? null : Boolean(a.aperta);


  return (
    <Link className="auction-link" to={to} aria-label={`Apri asta: ${a.nome}`}>
      <div className="auction-card">
        <div className="auction-imgBox">
          {a.foto ? (
            <img src={a.foto} className="auction-img" alt={a.nome} />
          ) : (
            <div className="auction-imgPlaceholder">Nessuna immagine</div>
          )}

          {isOpen != null && (
            <div className={`auction-badge ${isOpen ? 'open' : 'closed'}`}>
              {isOpen ? 'APERTA' : 'CHIUSA'}
            </div>
          )}
        </div>

        <div className="auction-body">
          <div className="auction-title">{a.nome}</div>

          <div className="auction-meta">
            <div className="auction-metaRow">
              <span className="auction-metaLabel">{priceLabel}</span>
              <span className="auction-metaValue">
                {price != null && Number.isFinite(Number(price))
                  ? `${Number(price).toFixed(2)} CHF`
                  : '—'}
              </span>
            </div>

            <div className="auction-metaRow">
              <span className="auction-metaLabel">Scadenza</span>
              <span className="auction-metaValue">{a.dataF || '—'}</span>
            </div>

            {timeLeft && (
              <div className="auction-timeLeft" title="Tempo rimanente">
                ⏳ {timeLeft}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function AuctionListPage() {
  const auctionsData = useLoaderData();
  const auctions = Array.isArray(auctionsData)
    ? auctionsData
    : (auctionsData?.auctions ?? auctionsData?.result ?? []);

  const rows = [];
  for (let i = 0; i < auctions.length; i += 3) {
    rows.push(
      <div key={`r-${i}`} className="auctionRow">
        {auctions.slice(i, i + 3).map((a, idx) => (
          <AuctionCard key={`a-${i + idx}`} auction={a} />
        ))}
      </div>
    );
  }

  return (
    <>
      <SearchBar />
      <div id="auctionContainerRaws">
        {rows.length > 0 ? rows : <div className="auction-empty">Nessuna asta trovata</div>}
      </div>
    </>
  );
}

// ✅ Loader "pulita": chiama SOLO l'endpoint ricco
export async function loader({ request, params }) {
  const url = new URL(request.url);
  const q = (params?.ricerca ?? url.searchParams.get('q') ?? '').trim().toLowerCase();

  const res = await fetch('http://localhost:3000/Items/items/auction/open', {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Errore fetch aste: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const auctions = Array.isArray(data) ? data : (data?.auctions ?? data?.result ?? []);

  if (!q) return auctions;

  // filtro sul nome oggetto (itemNome)
  return auctions.filter((a) => {
    const name = (a?.itemNome ?? a?.nome ?? '').toString().toLowerCase();
    return name.includes(q);
  });
}