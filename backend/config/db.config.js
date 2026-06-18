const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "entitysys",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 50,
    multipleStatements: true
});
// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,

//     ssl: {
//         rejectUnauthorized: false
//     }
// });

// Removed auto-running testConnection to allow dbInit to create the database first.
module.exports = pool;
