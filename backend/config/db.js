const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

let db;
const isProduction = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL;

if (isProduction) {
    console.log('Connecting to PostgreSQL Database (Production)...');
    db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Required by Render for PostgreSQL connections
    });
} else {
    console.log('Connecting to SQLite Database (Local)...');
    const dbPath = path.resolve(__dirname, '../database.sqlite');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) console.error('Error opening SQLite database', err.message);
    });
}

module.exports = {
    query: (text, params) => {
        if (isProduction) {
            // PostgreSQL query execution
            return db.query(text, params);
        } else {
            // SQLite query execution
            return new Promise((resolve, reject) => {
                const sqliteText = text.replace(/\$\d+/g, '?');
                if (sqliteText.trim().toUpperCase().startsWith('SELECT') || sqliteText.trim().toUpperCase().startsWith('PRAGMA')) {
                    db.all(sqliteText, params, (err, rows) => {
                        if (err) reject(err);
                        else resolve({ rows });
                    });
                } else {
                    db.run(sqliteText, params, function(err) {
                        if (err) reject(err);
                        else resolve({ rows: [], changes: this.changes, lastID: this.lastID });
                    });
                }
            });
        }
    },
    getDbInstance: () => db
};
