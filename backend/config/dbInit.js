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
        
        // Add new columns to notices table if they don't exist
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = '${process.env.DB_NAME || "entitysys"}' AND TABLE_NAME = 'notices'
        `);
        const columnNames = columns.map(c => c.COLUMN_NAME);
        if (!columnNames.includes('target_dept')) {
            await connection.query("ALTER TABLE notices ADD COLUMN target_dept VARCHAR(50) NULL AFTER target_course_id");
            console.log('➕ Added column target_dept to notices table');
        }
        if (!columnNames.includes('target_semester')) {
            await connection.query("ALTER TABLE notices ADD COLUMN target_semester INT NULL AFTER target_dept");
            console.log('➕ Added column target_semester to notices table');
        }
        if (!columnNames.includes('file_url')) {
            await connection.query("ALTER TABLE notices ADD COLUMN file_url VARCHAR(500) NULL AFTER target_semester");
            console.log('➕ Added column file_url to notices table');
        }
        if (!columnNames.includes('is_pinned')) {
            await connection.query("ALTER TABLE notices ADD COLUMN is_pinned BOOLEAN DEFAULT FALSE AFTER file_url");
            console.log('➕ Added column is_pinned to notices table');
        }

        console.log('✅ Database & Tables verified/created successfully');
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        throw error; // Rethrow to handle in server.js
    } finally {
        if (connection) await connection.end();
    }
};

module.exports = initDb;
