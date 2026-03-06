import path from 'path'
import { con } from '../connection.js'
import bcrypt from 'bcryptjs'

export async function createUser(foto, firstName, lastName, username, signupDate, passwordHash, passwordSalt) {
  const user = await con.query(
    `INSERT INTO utente(foto, nome, cognome, username, dataIscrizione, pswd, salt) VALUES ( ?, ?,  ?,  ?,?, ?, ?)`,
    [foto, firstName, lastName, username, signupDate, passwordHash, passwordSalt]
  )
  return user
}

export async function createMessage(text, sentAt, userId, chatId) {
  const response = (await con.query(
    `INSERT INTO messaggio(testo, dataInvio, fk_utente, fk_chat) VALUES ( ?, ?,  ?,  ?)`,
    [text, sentAt, userId, chatId]
  ))
  return response
}

export async function getUserByUsername(username) {
  const [users] = await con.query(`SELECT * FROM utente WHERE username=?`, [username])
  return users[0]
}

export async function getUserById(id) {
  const [users] = await con.query(`SELECT * FROM utente WHERE id=?`, [id])
  return users[0]
}

export async function getChatsByUserId(userId) {
  const [chats] = await con.query(`SELECT * FROM chat WHERE fk_utente1=? OR fk_utente2=?`, [userId, userId])
  return chats
}

export async function getMessagesByChatId(chatId) {
  const [messages] = await con.query(`SELECT * FROM messaggio WHERE fk_chat=?`, [chatId])
  return messages
}

export async function getChatByUserIdAndChatId(userId, chatId) {
  const [chats] = await con.query(
    `SELECT * FROM chat WHERE (fk_utente1=? OR fk_utente2=?) AND id=?`,
    [userId, userId, chatId]
  )
  return chats[0]
}

export async function getChatByUsers(userId1, userId2) {
  const [chats] = await con.query(
    `SELECT * FROM chat WHERE ((fk_utente1=? AND fk_utente2=?) OR (fk_utente1=? AND fk_utente2=?))`,
    [userId1, userId2, userId2, userId1]
  )
  return chats[0]
}


export async function getItemsForSaleByUserId(userId) {
  const [items] = await con.query(`SELECT * FROM oggetto WHERE fk_utente=?`, [userId])
  return items
}

export async function createChat(userId1, userId2) {
  const response = (await con.query(`INSERT INTO chat(fk_utente1, fk_utente2) VALUES ( ?, ?)`, [userId1, userId2]))[0]
  return response
}

export async function checkChatExist(userId1, userId2) {
  const response = (await con.query(`Select* FROM chat WHERE (fk_utente1=? AND fk_utente2=?) OR (fk_utente1=? AND fk_utente2=?)`, [userId1, userId2, userId2, userId1]))[0]
  return response
}

export async function getAuthUserByUsername(username) {
  const [users] = await con.query(`SELECT* FROM utente WHERE username = ?`, [username])
  return users[0]
}

export function isAuthenticated(req, res, next) {
  if (req.session.user == null) {
    res.statusCode = 401
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Utente non autenticato' }))
  } else {
    next()
  }
}

export async function validateUserCredentials(username, password, firstName, lastName, res) {
  if (!username || !password || !firstName || !lastName) {
    res.statusCode = 401
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ error: 'Username o password non inserite' }))
  }

  if (username.split('').includes('/')) {
    res.setHeader('code', 415)
    return res.end({ err: '/ in username is not allowed' })
  }

  const existingUser = await getAuthUserByUsername(username)
  if (existingUser !== undefined) {
    res.statusCode = 401
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ error: 'Username gia presente' }))
  }

  const passwordSalt = bcrypt.genSaltSync(10)
  const passwordHash = bcrypt.hashSync(password, passwordSalt)
  return { username: username, hash: passwordHash, salt: passwordSalt }
}

export async function updateUserById(userId, firstName, lastName, username, passwordHash, passwordSalt) {
  const result = (await con.query(
    `UPDATE utente SET nome=?, cognome=?, username=?, pswd=?, salt=? WHERE id=?`,
    [firstName, lastName, username, passwordHash, passwordSalt, userId]))[0]
  
  return result
}
export async function addValutation(nota, userId){
  const result = (await con.query('UPDATE utente SET affidabilita =? WHERE id=?',[nota, userId]))[0]
  return result
}

export async function validateUserCredentialsForUpdate(userId, username, password, firstName, lastName, res) {
  if (!username || !password || !firstName || !lastName) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Campi mancanti' }));
  }

  if (username.split('').includes('/')) {
    res.statusCode = 415;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: '/ in username is not allowed' }));
  }

  // ✅ username già usato da un ALTRO utente
  const [rows] = await con.query(`SELECT id FROM utente WHERE username=? AND id<>?`, [username, userId]);
  if (rows.length > 0) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Username gia presente' }));
  }

  const passwordSalt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, passwordSalt);

  return { username, hash: passwordHash, salt: passwordSalt };
}

export async function deleteUserAccount(userId) {
  // 1) offerte fatte da questo utente (anche su aste di altri)
  const [offers] = await con.query(`SELECT id FROM offerta WHERE fk_utente=?`, [userId]);
  const offerIds = offers.map((r) => r.id);

  // ✅ stacco le offerte "vincenti" dalle aste, così non c'è più FK che blocca
  if (offerIds.length) {
    await con.query(`UPDATE asta SET fk_offerta=NULL WHERE fk_offerta IN (?)`, [offerIds]);
    await con.query(`DELETE FROM offerta WHERE id IN (?)`, [offerIds]);
  }

  // 2) chat
  const [chats] = await con.query(`SELECT id FROM chat WHERE fk_utente1=? OR fk_utente2=?`, [userId, userId]);
  const chatIds = chats.map((c) => c.id);

  if (chatIds.length) {
    await con.query(`DELETE FROM messaggio WHERE fk_chat IN (?)`, [chatIds]);
    await con.query(`DELETE FROM chat WHERE id IN (?)`, [chatIds]);
  }

  // 3) carrello/preferiti utente
  await con.query(`DELETE FROM carrello WHERE fk_utente=?`, [userId]);
  await con.query(`DELETE FROM preferito WHERE fk_utente=?`, [userId]);

  // 4) oggetti dell'utente + aste collegate
  const [items] = await con.query(`SELECT id FROM oggetto WHERE fk_utente=?`, [userId]);
  const itemIds = items.map((r) => r.id);

  if (itemIds.length) {
    // prima cancello offerte fatte SU aste dei suoi oggetti (per evitare FK offerta->asta)
    const [auctions] = await con.query(`SELECT id FROM asta WHERE fk_oggetto IN (?)`, [itemIds]);
    const auctionIds = auctions.map((a) => a.id);

    if (auctionIds.length) {
      // stacco eventuali fk_offerta (anche se già fatto sopra, qui copre il caso "aste sue")
      await con.query(`UPDATE asta SET fk_offerta=NULL WHERE id IN (?)`, [auctionIds]);
      await con.query(`DELETE FROM offerta WHERE fk_asta IN (?)`, [auctionIds]);
      await con.query(`DELETE FROM asta WHERE id IN (?)`, [auctionIds]);
    }

    await con.query(`DELETE FROM carrello WHERE fk_oggetto IN (?)`, [itemIds]);
    await con.query(`DELETE FROM preferito WHERE fk_oggetto IN (?)`, [itemIds]);
    await con.query(`DELETE FROM oggetto WHERE id IN (?)`, [itemIds]);
  }

  // 5) infine l'utente
  await con.query(`DELETE FROM utente WHERE id=?`, [userId]);
}