// server/src/index.ts

import express from 'express';
import cors from 'cors';
// Hapus 'import dotenv from 'dotenv';'
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';
import lmsRoutes from './routes/lms';

// Baris dotenv.config() tidak lagi diperlukan di sini

const app = express();
// Port bisa langsung diambil dari process.env karena db.ts sudah memuatnya
const port = process.env.PORT || 3001; 

app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());

// Rute
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lms', lmsRoutes);

app.listen(port, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${port}`);
});