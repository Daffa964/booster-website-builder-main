// server/src/seed-admin.ts

import pool from './config/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const createAdmin = async () => {
  console.log('Memulai proses pembuatan admin...');

  const admin = {
    id: uuidv4(),
    name: 'Admin B.I Booster',
    email: 'admin@bibooster.com',
    password: 'bibooster2024',
    phone: '081234567890',
    status: 'active',
    accessTier: 'enterprise',
    package_access: 'enterprise',
    is_verified: true,
    has_paid: true,
  };

  try {
    // 1. Enkripsi password
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    console.log('Password berhasil dienkripsi...');

    // 2. Cek apakah admin sudah ada
    const [existingAdmin]: any[] = await pool.execute('SELECT id FROM User WHERE email = ?', [admin.email]);

    if (existingAdmin.length > 0) {
      console.log('✅ Akun admin sudah ada di database. Tidak ada yang perlu dilakukan.');
      return;
    }

    // 3. Masukkan data admin ke database
    await pool.execute(
      'INSERT INTO User (id, name, email, password, phone, status, accessTier, package_access, is_verified, has_paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        admin.id,
        admin.name,
        admin.email,
        hashedPassword, // Gunakan password yang sudah dienkripsi
        admin.phone,
        admin.status,
        admin.accessTier,
        admin.package_access,
        admin.is_verified,
        admin.has_paid
      ]
    );

    console.log('✅ Akun admin berhasil dibuat!');
    console.log('Anda sekarang bisa login menggunakan:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ${admin.password}`);

  } catch (error) {
    console.error('❌ Terjadi kesalahan saat membuat admin:', error);
  } finally {
    // Tutup koneksi database agar skrip bisa berhenti
    await pool.end();
  }
};

// Jalankan fungsi
createAdmin();