# Bioskop Keren - Sistem Pemesanan Tiket Bioskop Online

Aplikasi pemesanan tiket bioskop berbasis web. User bisa pilih film, pilih jadwal tayang, pilih kursi, lalu bayar dengan cara upload bukti transfer manual yang nanti diverifikasi sama admin.

Ada dua jenis akun di sistem ini: **customer** (yang pesan tiket) dan **admin** (yang kelola film, jadwal, dan verifikasi pembayaran).

## Tech Stack

- **Frontend**: React.js (React Router DOM v7, Axios)
- **Backend**: Node.js + Express.js, REST API biasa
- **Database**: MySQL/MariaDB
- **Styling**: inline CSS di dalam `App.js` sendiri, belum pakai library CSS terpisah
- **Autentikasi**: login/register sederhana, cek email + password langsung ke tabel `users`, role disimpan di kolom `role` (`admin`/`customer`)
- **E-tiket**: QR code di-generate lewat API `api.qrserver.com`

Semua ditulis pakai JavaScript — backend pakai ES Modules, frontend pakai JSX.

### Struktur folder

```
pemesanan-tiket-bioskop/
├── backend-app/          → Express API, semua endpoint ada di index.js
├── frontend-bioskop/     → React app (Create React App), semua halaman ada di src/App.js
├── bioskop_keren.sql     → dump database (struktur tabel + data awal)
└── README.md
```

Alurnya: React (localhost:3000) manggil Express API (localhost:3001), Express yang ngobrol ke MySQL (localhost:3308).

## Soal Role

Role customer/admin ditentukan dari kolom `role` di tabel `users`. Pas login, data user (termasuk role) dikirim ke frontend dan disimpan di localStorage, dipakai buat nentuin menu dan halaman mana yang boleh diakses.

Penting: **di aplikasi ini tidak ada cara untuk bikin akun admin lewat form register** — endpoint `/api/register` selalu bikin akun dengan role `customer` (cek di `index.js`). Akun admin sudah ada dari awal karena diseed langsung di `bioskop_keren.sql`. Jadi kalau mau login sebagai admin, pakai akun yang sudah disediakan di bawah ini, bukan daftar baru.

**Akun admin:**
- Email: `admin@bioskop.com`
- Password: `password123`

**Akun customer contoh:**
- Email: `wahyuniseptianingsih07@gmail.com`
- Password: `password123`

(atau daftar sendiri lewat halaman register, nanti otomatis jadi customer)

## Tampilan & Fitur - Customer

**1. Beranda**

Daftar film yang lagi tayang, bisa dilihat tanpa login.

![Beranda](screenshots/customer/customer_01_beranda.png)

**2. Login**

![Login](screenshots/customer/customer_02_login.png)

**3. Register**

Bikin akun baru, otomatis dapat role customer.

![Register](screenshots/customer/customer_03_register.png)

**4. Beranda setelah login**

Navbar berubah, muncul nama user, tombol "Tiket Saya", dan Logout.

![Beranda setelah login](screenshots/customer/customer_04_beranda-setelah-login.png)

**5. Detail film + pilih jadwal**

Sinopsis, durasi, dan pilihan jam tayang per studio.

![Detail film](screenshots/customer/customer_05_detail-film.png)

**6. Pilih kursi**

Klik kursi yang mau dipesan, kursi terpilih berubah warna pink.

![Pilih kursi](screenshots/customer/customer_06_pilih-kursi.png)

**7. Pembayaran**

Pilih metode bayar (GoPay/OVO/Dana/Bank Transfer), upload bukti transfer.

![Pembayaran](screenshots/customer/customer_07_pembayaran.png)

**8. Riwayat tiket saya**

Semua pesanan kelihatan di sini, statusnya ada dua: "Menunggu Verifikasi" (masih pending, admin belum konfirmasi) atau "Lunas / Siap Digunakan" (udah diverifikasi admin).

![Tiket saya](screenshots/customer/customer_08_tiket-saya.png)

**9. E-tiket**

Muncul setelah status pembayaran verified, ada QR code-nya.

![E-tiket](screenshots/customer/customer_09_e-tiket.png)

## Tampilan & Fitur - Admin

**1. Login admin**

Beda sama customer, navbar-nya nampilin tombol "Halaman Admin".

![Login admin](screenshots/admin/admin_01_login-berhasil.png)

**2. Dashboard admin**

Ini halaman utama admin. Ada tabel verifikasi pembayaran (yang masih pending), daftar film, dan daftar jadwal.

![Dashboard admin](screenshots/admin/admin_02_dashboard.png)

**3. Tambah film**

Form isi judul, durasi, url poster, sama sinopsis. Form yang sama dipakai juga buat edit film.

![Tambah film](screenshots/admin/admin_03_tambah-film.png)

**4. Tambah jadwal tayang**

Pilih film, atur jam tayang, harga tiket, dan nama studio.

![Tambah jadwal](screenshots/admin/admin_04_tambah-jadwal.png)

## Ringkasan fitur

Customer:
- Register & login
- Lihat daftar film & detail film
- Pilih jadwal dan kursi
- Pesan tiket + upload bukti bayar
- Lihat riwayat pesanan & status pembayaran
- Lihat e-tiket dengan QR code

Admin:
- Login (akun sudah ada dari awal, bukan daftar sendiri)
- Verifikasi pembayaran yang masuk
- Tambah & edit film
- Tambah & hapus jadwal tayang

## Cara Jalanin

**1. Setup database**

```bash
mysql -u root -p bioskop_keren < bioskop_keren.sql
```

Cek dulu koneksi database di `backend-app/index.js` (host, user, password, port) — defaultnya port `3308`, sesuaikan sama setup MySQL kamu kalau beda.

**2. Backend**

```bash
cd backend-app
npm install
node index.js
```

Jalan di `http://localhost:3001`

**3. Frontend**

```bash
cd frontend-bioskop
npm install
npm start
```

Jalan di `http://localhost:3000`

**4. Login**

Pakai akun admin atau customer yang sudah disebutkan di atas.

## Beberapa hal yang masih perlu diperbaiki

Ini disclosure jujur aja biar transparan, bukan bug tapi hal yang belum sempat digarap:

- Password masih disimpan plain text di database, belum di-hash. Untuk tugas kuliah masih oke, tapi kalau mau dikembangin lebih jauh sebaiknya pakai bcrypt.
- Backend belum ngecek kursi yang bentrok kalau ada dua orang pesan kursi sama di waktu bersamaan — validasi kursi kepake saat ini cuma di state frontend.
- Endpoint admin (tambah/edit film, hapus jadwal, verifikasi pembayaran) belum ada middleware cek role di backend, jadi proteksinya masih di level frontend doang.

## Dibuat oleh

Wahyuni Septianingsih - Mahasiswa Informatika, Universitas Amikom Purwokerto
