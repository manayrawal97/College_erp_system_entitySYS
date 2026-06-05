const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const initDb = async () => {
    let connection;
    try {
        // 1. First connection without database to ensure it exists
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD || "",
            multipleStatements: true
        });

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        // Execute the schema SQL (which includes CREATE DATABASE and USE)
        await connection.query(schema);
        
        console.log('✅ Database & Tables verified/created successfully');
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        throw error; // Rethrow to handle in server.js
    } finally {
        if (connection) await connection.end();
    }
};

module.exports = initDb;
