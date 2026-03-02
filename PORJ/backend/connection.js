import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

dotenv.config()

const con = mysql.createPool({
    host: process.env.MYSQL_DATBASE_HOSTNAME,
    user: process.env.MYSQL_DATBASE_USERNAME,
    password: process.env.MYSQL_DATBASE_PASSWORD,
    database:process.env.MYSQL_DATBASE_DATABASE,
    waitForConnections: true
})

export {con}