# GhiFi Digital — Website TokoKu POS & Akunia

Website portal satu halaman untuk dua aplikasi:

- **TokoKu POS**: tombol langsung membuka halaman aplikasi di Google Play.
- **Akunia**: tombol langsung membuka website Akunia.

Website punya dua halaman (Beranda dan Kontak) yang berpindah dengan efek geser halus. Ada juga menu **Pengaturan** yang dilindungi kata sandi admin, untuk mengganti nomor telepon, email administrator, dan link aplikasi.

## Struktur folder

```
ghifi-digital-website/
├── index.html        # Struktur halaman (HTML)
├── css/
│   └── style.css     # Tampilan: warna, tata letak, animasi
├── js/
│   ├── config.js     # Pengaturan bawaan (nama, kontak, link, sandi admin)
│   └── main.js       # Logika: slide, tombol aplikasi, menu pengaturan
├── images/
│   ├── akunia.jpg    # Tangkapan layar Akunia
│   └── tokokupos.jpg # Tangkapan layar TokoKu POS
├── package.json      # Skrip untuk menjalankan server lokal
├── .gitignore
└── README.md
```

## Cara menjalankan

**Cara cepat:** buka `index.html` langsung di browser (klik dua kali).

**Dengan server lokal** (butuh [Node.js](https://nodejs.org)):

```bash
npm install
npm start
```

Lalu buka http://localhost:3000 di browser.

## Mengubah isi website

| Yang ingin diubah | File | Bagian |
|---|---|---|
| Nama brand di footer, nomor telepon, email | `js/config.js` | `brand`, `phone`, `email` |
| Link Google Play TokoKu POS | `js/config.js` | `playUrl` |
| Link website Akunia | `js/config.js` | `akuniaUrl` |
| Kata sandi awal menu Pengaturan | `js/config.js` | `adminPass` (awal: `admin2026`) |
| Nama brand di navbar atas | `index.html` | `<span id="brandName">` |
| Warna tema | `css/style.css` | variabel di `:root` |
| Gambar aplikasi | `images/` | ganti file dengan nama yang sama |

## Catatan penting

- Perubahan lewat menu **Pengaturan** (ikon roda gigi) hanya tersimpan di browser yang dipakai saat mengubah (localStorage). Agar semua pengunjung melihat perubahan yang sama, ubah nilainya di `js/config.js` lalu unggah ulang.
- Kata sandi admin diperiksa di sisi browser. Ini cukup untuk mencegah perubahan tidak sengaja, tapi bukan pengaman tingkat server.

## Publikasi (hosting)

Folder ini adalah website statis, jadi bisa langsung diunggah ke hosting statis mana pun, misalnya GitHub Pages, Netlify, Vercel, atau cPanel (unggah isi folder ke `public_html`). Tidak perlu `npm install` di server hosting.
