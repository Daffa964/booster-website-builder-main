# B.I Booster - Website Instan untuk UMKM

B.I Booster adalah platform lengkap yang menyediakan solusi website instan bagi para pelaku UMKM. Proyek ini memungkinkan pengguna untuk memilih dari berbagai template website profesional, melakukan pemesanan, dan mendapatkan akses ke platform edukasi (LMS) untuk mendukung pengembangan bisnis mereka.

## Fitur Utama

  * **Katalog Template**: Pengguna dapat melihat berbagai kategori template yang dirancang khusus untuk kebutuhan bisnis UMKM seperti Laundry, Makanan, Kerajinan, Fashion, dan lainnya.
  * **Sistem Pemesanan**: Proses pemesanan yang mudah dengan pemilihan paket dan pembayaran melalui QRIS.
  * **Platform Edukasi (LMS)**: Pengguna yang sudah melakukan pemesanan mendapatkan akses ke materi pembelajaran eksklusif di dashboard mereka.
  * **Admin Panel**: Halaman admin untuk verifikasi pembayaran dan manajemen konten LMS (modul, bab, dan materi).
  * **Otentikasi Pengguna**: Sistem registrasi dan login untuk pengguna dan admin.

-----

## Teknologi yang Digunakan

Proyek ini dibangun menggunakan arsitektur monorepo dengan frontend dan backend yang terpisah.

**Frontend:**

  * **Framework**: React (dengan Vite)
  * **Bahasa**: TypeScript
  * **UI Library**: shadcn-ui, Radix UI
  * **Styling**: Tailwind CSS
  * **Routing**: React Router DOM

**Backend:**

  * **Framework**: Express.js
  * **Bahasa**: TypeScript
  * **Database**: MySQL
  * **Otentikasi**: bcryptjs untuk hashing password

-----

## Instalasi dan Setup

### Prasyarat

  * Node.js (v18 atau lebih tinggi)
  * NPM / Bun
  * MySQL Server

### 1\. Setup Backend

1.  **Masuk ke direktori server:**

    ```sh
    cd server
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    ```

3.  **Setup Database:**

      * Buat database baru di MySQL dengan nama `booster_db`.
      * Salin file `.env.example` menjadi `.env` dan sesuaikan konfigurasi database Anda (DB\_HOST, DB\_USER, DB\_PASSWORD, DB\_NAME).

4.  **Seed Admin User:**
    Jalankan skrip ini untuk membuat akun admin default.

    ```sh
    npm run dev-seed
    ```

    (Anda perlu menambahkan skrip `"dev-seed": "ts-node-dev src/seed-admin.ts"` di `server/package.json`)

    Akun admin default:

      * **Email**: `admin@bibooster.com`
      * **Password**: `bibooster2024`

5.  **Jalankan server backend:**

    ```sh
    npm run dev
    ```

    Server akan berjalan di `http://localhost:3001`.

### 2\. Setup Frontend

1.  **Kembali ke direktori utama, lalu install dependencies:**
    ```sh
    npm install
    ```
2.  **Jalankan server frontend:**
    ```sh
    npm run dev
    ```
    Aplikasi akan berjalan di `http://localhost:8080`.