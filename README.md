# WhatsApp Scheduler Pro

Sistem penjadwalan pesan WhatsApp otomatis dengan interface web yang mudah digunakan.

## 🚀 Quick Start

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Setup Environment Variables
Copy `.env.example` ke `.env.local` dan sesuaikan:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXTAUTH_SECRET=your-super-secret-jwt-key-here-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Admin Configuration (PENTING!)
NEXT_PUBLIC_ADMIN_PHONE=+6281234567890

# Environment
NODE_ENV=development
\`\`\`

### 3. Setup Database
Jalankan script SQL di Supabase:
\`\`\`sql
-- Jalankan scripts/clean-database-setup.sql
\`\`\`

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

### 5. Setup Admin Pertama
- Buka http://localhost:3000
- Sistem akan otomatis mendeteksi database kosong
- Buat admin pertama melalui interface
- Login dengan credentials yang dibuat

## 🔧 Features

- ✅ Login & Registration System
- ✅ WhatsApp Integration
- ✅ Message Scheduling
- ✅ Admin Dashboard
- ✅ User Management
- ✅ Responsive Design

## 🛠️ Teknologi

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **UI Components**: shadcn/ui + Radix UI
- **Authentication**: Custom auth dengan bcrypt
- **WhatsApp Integration**: whatsapp-web.js (ready)

## 📋 Prasyarat

- Node.js 18+
- npm atau pnpm
- Akun Supabase (gratis)
- Google Chrome (untuk WhatsApp Web)

## 👥 Cara Penggunaan

### Untuk Admin

1. **Login**: Gunakan nomor admin yang dikonfigurasi
2. **Kelola User**: Approve/reject pendaftaran user baru via WhatsApp
3. **Monitor Sistem**: Lihat status WhatsApp dan statistik
4. **Atur Sistem**: Konfigurasi limits dan pesan template
5. **Logs & Reports**: Download laporan TXT dan CSV

### Untuk User

1. **Daftar**: Kirim pesan ke admin via WhatsApp
2. **Login**: Gunakan nomor dan password yang diterima
3. **Upload Kontak**: Upload file Excel dengan format:
   - Kolom A: Nama
   - Kolom B: Nomor WhatsApp (+628xxxxxxxxx)
4. **Jadwalkan Pesan**: Pilih tanggal, waktu, dan tulis pesan
5. **Monitor**: Lihat status pengiriman di dashboard

## 📁 Struktur Project

\`\`\`
├── app/                    # Next.js App Router
├── components/             # React Components
│   ├── auth/              # Authentication components
│   ├── admin/             # Admin-only components
│   ├── user/              # User dashboard
│   ├── scheduler/         # Message scheduling
│   ├── logs/              # Log viewer
│   └── ui/                # UI components (shadcn)
├── lib/                   # Utilities
│   └── supabase.ts        # Database client
├── scripts/               # Database scripts
└── public/                # Static assets
\`\`\`

## 🔧 Konfigurasi Admin

### Nomor Admin Utama
Nomor admin diatur melalui environment variable `NEXT_PUBLIC_ADMIN_PHONE` untuk keamanan:

\`\`\`env
NEXT_PUBLIC_ADMIN_PHONE=+6281234567890
\`\`\`

**Keunggulan:**
- ✅ Tidak bisa diubah dari UI (lebih secure)
- ✅ Konsisten di seluruh aplikasi
- ✅ Mudah diatur untuk production/development
- ✅ Tidak tersimpan di database (lebih aman)

### Cara Mengubah Nomor Admin
1. Edit file `.env.local` (development) atau environment variables (production)
2. Restart aplikasi
3. Nomor admin akan otomatis terupdate di seluruh sistem

## 🔒 Keamanan

### Environment Variables
\`\`\`env
# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Admin (TIDAK BISA DIUBAH DARI UI)
NEXT_PUBLIC_ADMIN_PHONE=+6281234567890

# Security
NEXTAUTH_SECRET=your-super-secret-key-change-in-production
\`\`\`

### Best Practices
1. **Ganti NEXTAUTH_SECRET** dengan key yang kuat di production
2. **Set ADMIN_PHONE** sesuai nomor WhatsApp admin yang aktif
3. **Backup database** secara berkala
4. **Monitor logs** untuk aktivitas mencurigakan
5. **Update dependencies** secara berkala

## 🚀 Deployment

### Vercel (Recommended)
1. Push code ke GitHub
2. Connect repository ke Vercel
3. Set environment variables di Vercel dashboard:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=xxx
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
   SUPABASE_SERVICE_ROLE_KEY=xxx
   NEXT_PUBLIC_ADMIN_PHONE=+6281234567890
   NEXTAUTH_SECRET=xxx
   NEXTAUTH_URL=https://your-domain.vercel.app
   \`\`\`
4. Deploy

### Manual Server
1. Build aplikasi: `npm run build`
2. Set environment variables
3. Start: `npm start`

## 📞 Support & Testing

### Testing Flow
1. **Setup Database** - Jalankan clean SQL script
2. **Create Admin** - Buat admin pertama via interface
3. **Test Registration** - Coba daftar user baru via WhatsApp
4. **Test Approval** - Login admin, approve user baru
5. **Test Scheduling** - Buat jadwal pesan dengan upload Excel
6. **Test WhatsApp** - Connect WhatsApp Web dan test pengiriman

### Format File Excel
| A (Nama)    | B (Nomor WhatsApp) |
|-------------|-------------------|
| John Doe    | +6281234567890    |
| Jane Smith  | +6281234567891    |

### Troubleshooting
- **Database Error**: Pastikan Supabase credentials benar
- **Admin Phone Error**: Cek NEXT_PUBLIC_ADMIN_PHONE di .env
- **WhatsApp Error**: Pastikan Chrome/Chromium terinstall
- **File Upload Error**: Cek format Excel dan ukuran file

---

**WhatsApp Scheduler Pro** - Solusi lengkap untuk penjadwalan pesan WhatsApp massal dengan keamanan tingkat enterprise! 🚀

**Admin Phone**: Diatur via environment variable untuk keamanan maksimal! 🔒
