# Bioskop Keren — Sistem Pemesanan Tiket Online

Aplikasi web pemesanan tiket bioskop yang memungkinkan pengguna memilih film, jadwal tayang, dan kursi secara online.

## Tech Stack

**Frontend**
- React.js

**Backend**
- Node.js + Express.js

**Database**
- MySQL

## Fitur Utama

- Autentikasi pengguna (login/register)
- Daftar film yang sedang tayang lengkap dengan sinopsis & durasi
- Pemilihan jadwal tayang & kursi
- Proses pemesanan tiket hingga konfirmasi
- Riwayat tiket ("Tiket Saya")

## Arsitektur

Frontend (React) berkomunikasi dengan Backend (Express REST API) melalui HTTP request, dengan API menangani autentikasi, logic pemesanan, dan koneksi ke database MySQL.

```
[ Browser ] -> [ React (Frontend) ] -> [ Express REST API (Backend) ] -> [ MySQL ]
```

## Cara Menjalankan

### 1. Setup Database
- Import file `.sql` project ini ke MySQL (phpMyAdmin atau CLI)

### 2. Jalankan Backend
```bash
cd bioskop-app
npm install
node index.js
```

### 3. Jalankan Frontend
```bash
cd frontend-bioskop
npm install
npm start
```

### 4. Akses Aplikasi
Buka `http://localhost:3000` di browser.

## Dibuat oleh

Wahyuni Septianingsih — Mahasiswa Informatika, Universitas Amikom Purwokerto
