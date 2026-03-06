// backend/utils/auction_utils.js
import {con} from '../connection.js';

const STR_TO_DATE_FMT = '%Y.%m.%d %H:%i';
const DATE_FORMAT_FMT = '%Y.%m.%d %H:%i';

function toDateExpr(colName) {
  return `STR_TO_DATE(${colName}, '${STR_TO_DATE_FMT}')`;
}

export async function insertNotification(userId, titolo, testo, tipo) {
  await con.query(
    `INSERT INTO notifica (fk_utente, titolo, testo, tipo) VALUES (?, ?, ?, ?)`,
    [userId, titolo, testo, tipo]
  );
}

export async function getAuctionOwnerId(auctionId) {
  const [rows] = await con.query(
    `
    SELECT o.fk_utente AS ownerId
    FROM asta a
    JOIN oggetto o ON o.id = a.fk_oggetto
    WHERE a.id = ?
    LIMIT 1
    `,
    [auctionId]
  );
  return rows[0]?.ownerId ?? null;
}

// ✅ Anti-sniping: se offerta negli ultimi 60 min -> +30 min su dataF (stringa)
export async function extendAuctionIfSniping(auctionId) {
  const [rows] = await con.query(
    `
    SELECT 
      id,
      TIMESTAMPDIFF(MINUTE, NOW(), ${toDateExpr('dataF')}) AS minutesLeft
    FROM asta
    WHERE id=? AND aperta=true
    LIMIT 1
    `,
    [auctionId]
  );

  const a = rows[0];
  if (!a) return { extended: false };

  if (a.minutesLeft != null && a.minutesLeft >= 0 && a.minutesLeft <= 60) {
    await con.query(
      `
      UPDATE asta
      SET dataF = DATE_FORMAT(DATE_ADD(${toDateExpr('dataF')}, INTERVAL 30 MINUTE), '${DATE_FORMAT_FMT}')
      WHERE id=?
      `,
      [auctionId]
    );
    return { extended: true, addedMinutes: 30 };
  }

  return { extended: false };
}

// ✅ Chiude asta + notifica owner + partecipanti (vinto/perso)
export async function closeAuctionAndNotify(auctionId, reason = 'AUTO') {
  const [rows] = await con.query(
    `
    SELECT 
      a.id, a.aperta, a.fk_offerta, a.fk_oggetto, a.dataF,
      o.nome AS itemNome,
      o.fk_utente AS ownerId
    FROM asta a
    JOIN oggetto o ON o.id = a.fk_oggetto
    WHERE a.id=?
    LIMIT 1
    `,
    [auctionId]
  );

  const auction = rows[0];
  if (!auction) return { ok: false, error: 'Asta non trovata' };
  if (!auction.aperta) return { ok: true, alreadyClosed: true };

  // chiudo
  await con.query(`UPDATE asta SET aperta=false WHERE id=?`, [auctionId]);

  // partecipanti = utenti che hanno fatto almeno 1 offerta
  const [participantsRows] = await con.query(
    `SELECT DISTINCT fk_utente AS userId FROM offerta WHERE fk_asta=?`,
    [auctionId]
  );
  const participants = participantsRows.map((r) => r.userId);

  // vincitore (se fk_offerta esiste)
  let winnerUserId = null;
  if (auction.fk_offerta) {
    const [w] = await con.query(
      `SELECT fk_utente AS userId FROM offerta WHERE id=? LIMIT 1`,
      [auction.fk_offerta]
    );
    winnerUserId = w?.[0]?.userId ?? null;
  }

  const title = `Asta chiusa: ${auction.itemNome ?? 'Oggetto'}`;

  // owner
  if (winnerUserId) {
    await insertNotification(
      auction.ownerId,
      title,
      `Asta chiusa (${reason}). Oggetto venduto: ${auction.itemNome}.`,
      'AUCTION_OWNER_SOLD'
    );
  } else {
    await insertNotification(
      auction.ownerId,
      title,
      `Asta chiusa (${reason}) senza offerte.`,
      'AUCTION_OWNER_NO_OFFERS'
    );
  }

  // partecipanti
  for (const uid of participants) {
    if (winnerUserId && uid === winnerUserId) {
      await insertNotification(uid, title, `Hai VINTO l’asta per: ${auction.itemNome}.`, 'AUCTION_WIN');
    } else {
      await insertNotification(uid, title, `Hai PERSO l’asta per: ${auction.itemNome}.`, 'AUCTION_LOSE');
    }
  }

  return {
    ok: true,
    closed: true,
    reason,
    winnerUserId,
    participantsCount: participants.length,
  };
}

// ✅ Job: chiude automaticamente tutte le aste scadute (dataF stringa)
export async function closeExpiredAuctionsJob() {
  const [expired] = await con.query(
    `
    SELECT id
    FROM asta
    WHERE aperta=true AND ${toDateExpr('dataF')} <= NOW()
    `
  );

  for (const a of expired) {
    await closeAuctionAndNotify(a.id, 'AUTO');
  }

  return { closed: expired.length };
}