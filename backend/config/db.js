const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

let db;

// Support both DATABASE_URL (Render) and individual DB_* vars
const connectionString = process.env.DATABASE_URL;
const hasIndividualVars = process.env.DB_HOST && process.env.DB_HOST !== 'localhost';
const isProduction = connectionString || hasIndividualVars || process.env.NODE_ENV === 'production';

if (isProduction) {
    console.log('Connecting to PostgreSQL Database...');

    const poolConfig = connectionString
        ? { connectionString, ssl: { rejectUnauthorized: false } }
        : {
            host:     process.env.DB_HOST,
            port:     parseInt(process.env.DB_PORT) || 5432,
            user:     process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl:      { rejectUnauthorized: false }
          };

    console.log('DB config mode:', connectionString ? 'DATABASE_URL' : 'individual vars');
    db = new Pool(poolConfig);

    // Test the connection immediately
    db.connect((err, client, release) => {
        if (err) {
            console.error('PostgreSQL connection error:', err.message);
        } else {
            console.log('PostgreSQL connected successfully!');
            release();
        }
    });

} else {
    console.log('Connecting to SQLite Database (Local)...');
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.resolve(__dirname, '../database.sqlite');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) console.error('Error opening SQLite database', err.message);
        else console.log('SQLite connected at', dbPath);
    });
}

module.exports = {
    query: (text, params) => {
        if (isProduction) {
            return db.query(text, params);
        } else {
            return new Promise((resolve, reject) => {
                const sqliteText = text.replace(/\$\d+/g, '?');
                if (sqliteText.trim().toUpperCase().startsWith('SELECT') ||
                    sqliteText.trim().toUpperCase().startsWith('PRAGMA')) {
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
    isProduction: () => !!isProduction,
    getDbInstance: () => db
};
