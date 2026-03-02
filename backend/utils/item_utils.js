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


