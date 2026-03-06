import './TagSearchPage.css';

import React, { useMemo } from 'react';
import { Link, useLoaderData, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const BACKEND_BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';

function resolveItemImageUrl(foto) {
  if (!foto) return null;
  if (foto.startsWith('http://') || foto.startsWith('https://')) return foto;
  if (foto.startsWith('/')) return `${BACKEND_BASE}${foto}`;
  if (foto.startsWith('uploads/')) return `${BACKEND_BASE}/${foto}`;
  return `${BACKEND_BASE}/uploads/items/${foto}`;
}

function normalizeTag(raw) {
  const t = raw ?? {};
  const id = t.id ?? t.tagId ?? t.fk_tag ?? null;
  const name = t.nome ?? t.name ?? t.tag ?? t.etichetta ?? '';
  return { id, name: String(name) };
}

function normalizeItem(raw) {
  const it = raw ?? {};
  return {
    id: it.id ?? it.itemId ?? it.oggettoId ?? it.fk_oggetto ?? null,
    nome: it.nome ?? it.name ?? it.titolo ?? 'Oggetto',
    prezzo: it.prezzo ?? it.price ?? null,
    foto: it.foto ?? it.image ?? null,
  };
}

async function fetchFirstOk(urls, options) {
  let lastErr = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        lastErr = new Error(`${res.status} ${res.statusText} (${url})`);
        continue;
      }

      // alcuni endpoint ritornano text/json “strani”
      const txt = await res.text();
      if (!txt) return { data: null, url };

      try {
        return { data: JSON.parse(txt), url };
      } catch {
        // se torna già array in stringa non-json, fallisce -> errore
        lastErr = new Error(`Risposta non JSON (${url})`);
      }
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('Nessun endpoint valido');
}

function ItemCard({ item }) {
  const it = normalizeItem(item);
  const imgSrc = resolveItemImageUrl(it.foto);

  return (
    <Link className="ts-link" to={it.id != null ? `/infoIteam/${it.id}` : '/'}>
      <div className="ts-card">
        <div className="ts-imgBox">
          {imgSrc ? (
            <img className="ts-img" src={imgSrc} alt={it.nome} />
          ) : (
            <div className="ts-imgPlaceholder">Nessuna immagine</div>
          )}
        </div>

        <div className="ts-body">
          <div className="ts-title">{it.nome}</div>
          <div className="ts-row">
            <span className="ts-muted">Prezzo</span>
            <span className="ts-strong">
              {Number.isFinite(Number(it.prezzo)) ? `${Number(it.prezzo).toFixed(2)} CHF` : '—'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function TagSearchPage() {
  const navigate = useNavigate();
  const { tags, selectedTag, selectedTagId, items } = useLoaderData();

  const page = Number(new URLSearchParams(window.location.search).get('page') || '1');

  const tagsNorm = useMemo(() => (Array.isArray(tags) ? tags.map(normalizeTag) : []), [tags]);
  const itemsArr = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const onSelect = (tag) => {
  navigate(`/tag?tagId=${encodeURIComponent(tag.id)}&tag=${encodeURIComponent(tag.name)}`);
};

  // griglia a righe da 3
  const rows = [];
  for (let i = 0; i < itemsArr.length; i += 3) {
    rows.push(
      <div key={`r-${i}`} className="ts-rowGrid">
        {itemsArr.slice(i, i + 3).map((it, idx) => (
          <ItemCard key={`i-${i + idx}`} item={it} />
        ))}
      </div>
    );
  }
  function goToPage(newPage) {
    if (newPage < 1) return;

    if (!selectedTagId) {
      navigate(`/tag?page=${newPage}`);
      return;
    }

    navigate(
      `/tag?tagId=${encodeURIComponent(selectedTagId)}&tag=${encodeURIComponent(selectedTag)}&page=${newPage}`
    );
  }

  return (
    <>
      <SearchBar />

      <div className="ts-wrap">
        <div className="ts-head">
          <h2>Ricerca per tag</h2>
          <div className="ts-selected">
            {selectedTag ? (
              <>
                Tag selezionato: <span className="ts-selectedTag">{selectedTag}</span>
              </>
            ) : (
              'Seleziona un tag'
            )}
          </div>
        </div>

        <div className="ts-tags">
          {tagsNorm.length ? (
            tagsNorm.map((t) => {
              const active = selectedTag && t.name.toLowerCase() === selectedTag.toLowerCase();
              return (
                <button
                  key={t.id ?? t.name}
                  type="button"
                  className={`ts-chip ${active ? 'active' : ''}`}
                  onClick={() => onSelect(t)}
                >
                  {t.name}
                </button>
              );
            })
          ) : (
            <div className="ts-emptyTags">Nessun tag disponibile.</div>
          )}
        </div>

        <div className="ts-list">
          {selectedTag ? (
            rows.length ? (
              rows
            ) : (
              <div className="ts-emptyItems">Nessun oggetto per questo tag.</div>
            )
          ) : (
            <div className="ts-hint">Clicca un tag sopra per vedere gli oggetti.</div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '30px 0' }}>
                <button onClick={() => goToPage(page - 1)} disabled={page === 1}>
                    Precedente
                </button>

                <span>Pagina {page}</span>

                <button onClick={() => goToPage(page + 1)}>
                    Successiva
                </button>
            </div>
      </div>
    </>
  );
}

export async function loader({ request }) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') || '1')

  const selectedTagId = (url.searchParams.get('tagId') ?? '').trim();
  const selectedTag = (url.searchParams.get('tag') ?? '').trim();

  const tagCandidates = [
    'http://localhost:3000/search/tags',
  ];

  const { data: tagsData } = await fetchFirstOk(tagCandidates, { credentials: 'include' });
  const tagsRaw = Array.isArray(tagsData) ? tagsData : (tagsData?.tags ?? tagsData?.result ?? []);
  const tags = Array.isArray(tagsRaw) ? tagsRaw : [];

  if (!selectedTagId) {
    return { tags, selectedTag: '', selectedTagId: '', items: [] };
  }

  const itemCandidates = [
    `http://localhost:3000/search/tag/${encodeURIComponent(selectedTagId)}/${page}`,
  ];

  let items = [];
  try {
    const { data: itemsData } = await fetchFirstOk(itemCandidates, { credentials: 'include' });
    const raw = Array.isArray(itemsData) ? itemsData : (itemsData?.items ?? itemsData?.result ?? []);
    items = Array.isArray(raw) ? raw : [];
  } catch {
    items = [];
  }

  return { tags, selectedTag, selectedTagId, items };
}