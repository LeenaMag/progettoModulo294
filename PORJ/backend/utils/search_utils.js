import path from 'path'
import { con } from '../connection.js'

export async function findItemsByTagId(tagId) {
  const [items] = await con.query(`SELECT * FROM oggetto WHERE fk_tag=?`, tagId)
  return items
}

export async function findItemsByName(name) {
  const [items] = await con.query(`SELECT * FROM oggetto WHERE nome LIKE ?`, name)
  return items
}

export async function getAllTags() {
  const [tags] = await con.query(`SELECT * FROM tag`)
  return tags
}
