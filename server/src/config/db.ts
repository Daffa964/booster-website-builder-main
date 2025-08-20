// server/src/config/db.ts

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Perbaikan: Memuat file .env dari direktori root server
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
    .then(connection => {
        console.log('✅ Berhasil terhubung ke database MySQL!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Gagal terhubung ke database:', err.message);
    });


export default pool;