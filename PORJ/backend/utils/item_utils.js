import path from 'path'
import { con } from '../connection.js'

export async function getAllItems() {
  const [items] = await con.query(`SELECT* FROM oggetto ORDER BY dataCreazione DESC`)
  return items
}

export async function getItemById(itemId) {
  const [items] = await con.query(`SELECT* FROM oggetto WHERE id = ?`, [itemId])
  return items[0]
}

export async function createItem(photo, name, price, description, createdAt, userId, tagId) {
  const createdItem = (await con.query(
    `INSERT INTO oggetto (foto, nome, prezzo, descrizione, dataCreazione, fk_utente, fk_tag) VALUES (?,?,?,?,?,?,?)`,
    [photo, name, price, description, createdAt, userId, tagId])
  )[0]
  return createdItem
}

export async function deleteItemById(itemId) {
  const response = (await con.query(`DELETE FROM oggetto WHERE id = ?`, itemId))[0]
  return response
}

export async function addItemToFavorites(userId, itemId) {
  const response = (await con.query(`INSERT INTO preferito (fk_utente, fk_oggetto) VALUES (?,?)`, [userId, itemId]))[0]
  return response
}

export async function removeItemFromFavorites(userId, itemId) {
  const response = (await con.query(`DELETE FROM preferito WHERE fk_utente = ? AND fk_oggetto = ?`, [userId, itemId]))[0]
  return response
}

export async function addItemToCart(userId, itemId) {
  const response = (await con.query(`INSERT INTO carrello (fk_utente, fk_oggetto) VALUES (?,?)`, [userId, itemId]))[0]
  return response
}

export async function removeItemFromCart(userId, itemId) {
  const response = (await con.query(`DELETE FROM carrello WHERE fk_utente = ? AND fk_oggetto = ?`, [userId, itemId]))[0]
  return response
}


export async function getCartItemsByUserId(userId) {
  const [items] = await con.query(
    `SELECT * FROM oggetto WHERE id IN (
      SELECT fk_oggetto FROM carrello WHERE fk_utente=?
    )`,
    [userId]
  )
  return items
}

export async function getFavoriteItemsByUserId(userId) {
  const [items] = await con.query(
    `SELECT * FROM oggetto WHERE id IN (
      SELECT fk_oggetto FROM preferito WHERE fk_utente=?
    )`,
    [userId]
  )
  return items
}

export async function isItemInFavorites(userId, itemId) {
  const favorites = (await con.query(
    `SELECT* FROM preferito WHERE fk_utente=? AND fk_oggetto =?`,
    [userId, itemId]
  ))[0]
  return favorites
}


export async function isItemInCart(userId, itemId) {
  const [result] = await con.query(
    `DELETE FROM carrello WHERE fk_utente=? AND fk_oggetto=?`,
    [userId, itemId]
  )
  return result
}

export async function updateItemById(itemId, price, photo, description, name, tagId) {
  const [result] = await con.query(
    `UPDATE oggetto SET prezzo=?, foto=?, descrizione=?, nome=?, fk_tag=? WHERE id=?`,
    [price, photo, description, name, tagId, itemId]
  )
  return result
}

export async function newAuction(itemId, dataI, minPrice, time, userID){
  const [result] = await con.query(
    `INSERT INTO asta (fk_oggetto, dataI, dataF, minPrezzo)
    VALUES  ?, ?, ?, ?`[itemId, dataI, time, minPrice]
  )

  return result
}


export async function newOffer(userId, auctionId, price){
  const [result] = await con.query(
  `INSERT INTO offerta (fk_utente, fk_asta, valore) VALUES (?, ?, ?)`[userId, auctionId, price])
  return result
}

export async function getOffers(){
  const [result] = await con.query(
  `SELECT* FROM offerta`)
  return result
}

export async function infoAuction(auctionId){
  const [result] = await con.query(`SELECT* FROM asta WHERE id = ?`[auctionId])
  return result
}

export async function infoOffer(offerId){
  const [result] = await con.query(`SELECT* FROM offerta WHERE id = ?`[offerId])
  return result
}

export async function addTimeAuction(auctionId, time){
  const [result] = await con.query(
    `UPDATE asta SET dataF = ? WHERE id = ?`[time, auctionId]
  )
  return result
}

export async function findOffer(userID, auctionId, price){
  const [result] = await con.query(
    `SELECT* FROM offerta WHERE fk_utente =? AND fk_asta = ? AND valore = ?`[userID, auctionId, price]
  )
  return result
}

export async function changeWinningOffer(idOfferta, auctionId){
  const [result] = await con.query(
    `UPDATE asta SET fk_offerta = ? WHERE id = ?`[idOfferta, auctionId]
  )
  return result
}

export async function setNewTime(auctionId, newTime){
  const [result] = await con.query(
    `UPDATE asta SET dataF= ? WHERE id = ?`[newTime, auctionId]
  )
  return result
}

export async function setStatus(auctionId){
  const [result] = await con.query(
    `UPDATE asta SET aperta = false WHERE id = ?`[auctionId]
  )
  return result
}


export async function checkExpiredAuctions() {
  const now = new Date();
  const offers = await getOffers();

  for (const row of offers) {
    const input = row.dataF;
    const [datePart, timePart] = input.split(" ");
    const [year, month, day] = datePart.split(".").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    const inputDate = new Date(year, month - 1, day, hour, minute);

    if (inputDate <= now) {
      await setStatus(row.id);
    }
  }
}

