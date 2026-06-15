import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;
const HOST = "0.0.0.0";

// Lazy initialize Gemini client to avoid crashing when key is missing on startup
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Full offline/simulated fallback fallback response text generator
function getFallbackPlanText(entityType: string, entityName: string, requirements: string): string {
  const reqStr = requirements ? `"${requirements}"` : "Standar optimalisasi administrasi harian";
  
  if (entityType.toLowerCase().includes("sekolah")) {
    return `### 🏛️ Blueprint Portal Administrasi Akademik - ${entityName}
*Dirancang khusus oleh Tim Ahli Arielabs18 untuk efisiensi sistem pendidikan.*

#### 1. ⚙️ Rekomendasi Fitur Portal Akademik
*   **Sistem Absensi Karyawan & Guru Real-time:** Sistem pencatatan absensi berbasis RFID/Geofencing yang terintegrasi langsung dengan rekapitulasi slip gaji bulanan.
*   **Arielabs Portal Akademik Siswa (APAS):** Dasbor digital siswa dan orang tua untuk melihat nilai rapor, riwayat SPP, pengumuman sekolah, serta tugas daring dalam satu aplikasi terpadu.
*   **Administrative Document Automation (E-Arsip):** Generator otomatis surat keterangan aktif sekolah, mutasi siswa, dan pencetakan rapor berformat PDF resmi dengan QR Code tanda tangan terverifikasi.

#### 2. ⚡ Manfaat Alur Kerja Otomatis (Workflow Transformation)
*   **Sebelum (Manual):** Orang tua mengantre di kasir untuk membayar SPP; staf tata usaha mencatat pembayaran secara manual pada lembar Excel berisiko duplikasi data.
*   **Sesudah (Otomatis):** Pembayaran SPP terintegrasi dengan Payment Gateway virtual account. Pembayaran langsung memicu status "Lunas" di portal ortu dan mengirim kuitansi otomatis via WhatsApp Notifikasi.

#### 3. 📊 Skema Utama Database Administrasi
*   \`Tabel_Siswa\`: nisn (PK), nama, kelas, id_ortu, status_aktif
*   \`Tabel_Pembayaran\`: id_bayar (PK), nisn, nominal, tanggal_bayar, status (pending/lunas), token_gateway
*   \`Tabel_Presensi\`: id_presensi (PK), nisn, tanggal, waktu_masuk, waktu_keluar, keterangan

#### 4. 🚀 Jadwal Implementasi Arielabs18
*   **Minggu 1:** Analisis kebutuhan & setup cloud server database aman.
*   **Minggu 2-3:** Integrasi portal login guru-siswa dan sistem SMS/WA gateway.
*   **Minggu 4:** Demo operasional, pelatihan staf TU (Tata Usaha), dan Go-Live!`;
  }

  if (entityType.toLowerCase().includes("gereja")) {
    return `### ⛪ Blueprint Arielabs Church Engine (ACE) - ${entityName}
*Dirancang khusus untuk mendukung pelayanan jemaat yang transparan dan efisien.*

#### 1. ⚙️ Rekomendasi Fitur ACE
*   **Sensus & Database Digital Jemaat (SDDJ):** Perekaman data jemaat terstruktur (kk jemaat, wilayah pelayanan, status baptis/sidi) dengan hak akses berjenjang.
*   **Sistem Absensi Kegiatan Pelayanan:** Memantau partisipasi jemaat dan pelayan ibadah secara digital (QR code presensi jemaat) untuk kegiatan ibadah utama, pemuda, sekolah minggu, dsb.
*   **E-Kas & Portal Keuangan Transparan:** Otomasi kompilasi laporan persembahan, persepuluhan, dan kas diakonia yang dapat dipublikasikan real-time di portal atau dicetak instan menjadi rincian mingguan.

#### 2. ⚡ Manfaat Alur Kerja Otomatis (Workflow Transformation)
*   **Sebelum (Manual):** Sekretariat gereja mengetik surat sidi/baptis berulang-ulang dari template Word, mencari surat fisik di dalam lemari berkas tua yang memakan waktu berjam-jam.
*   **Sesudah (Otomatis):** Cukup cari nama jemaat di dasbor admin, pilih jenis dokumen, dan sistem secara otomatis mengisikan detail identitas jemaat ke formulir sertifikat digital resmi yang siap diunduh atau dicetak dalam 5 detik.

#### 3. 📊 Skema Utama Database Pelayanan
*   \`Tabel_Jemaat\`: id_jemaat (PK), nama, tgl_lahir, status_baptis, status_sidi, id_sektor
*   \`Tabel_Kegiatan\`: id_kegiatan (PK), nama_kegiatan, tgl_pelaksanaan, id_pelayan_firman
*   \`Tabel_Keuangan\`: id_transaksi (PK), jenis_kas, nominal, tgl_masuk, keterangan, id_pencatat

#### 4. 🚀 Jadwal Implementasi Arielabs18
*   **Minggu 1:** Imigrasi data jemaat lama dari Excel/fisik ke database cloud relasional.
*   **Minggu 2-3:** Kustomisasi fitur pengelolaan persembahan & modul persuratan gereja.
*   **Minggu 4:** Pengujian sistem (UAT), training majelis gereja/sekretaris, dan peluncuran resmi.`;
  }

  if (entityType.toLowerCase().includes("yayasan") || entityType.toLowerCase().includes("lembaga")) {
    return `### 🏢 Blueprint Sistem Manajemen Yayasan Terpadu - ${entityName}
*Standarisasi alur operasional yayasan sosial & komersial demi akuntabilitas prima.*

#### 1. ⚙️ Rekomendasi Fitur Unggulan
*   **Manajemen Donatur & Sponsor Terpadu:** Sistem pencatatan status donatur, history donasi, serta pengiriman tanda terima donasi PDF otomatis via email/WA.
*   **Sistem Administrasi Inventaris & Logistik:** Otomasi pelacakan aset yayasan, penerimaan bantuan logistik, serta modul inventarisasi stok gudang.
*   **Arielabs Project Tracker (APT):** Panel pemantauan program kerja yayasan, anggaran realisasinya, dan laporan pertanggungjawaban program yang terpadu.

#### 2. ⚡ Manfaat Alur Kerja Otomatis (Workflow Transformation)
*   **Sebelum (Manual):** Pelaporan hasil kegiatan sosial diketik manual, pengumpulan foto dari berbagai handphone panitia dilakukan secara terpisah-pisah lewat WA yang menurunkan resolusi gambar.
*   **Sesudah (Otomatis):** Tim lapangan dapat mengunggah laporan hasil program berupa deskripsi & foto langsung melalui web portal Arielabs di smartphone mereka; data langsung tersusun rapi menjadi draf laporan resmi sistem.

#### 3. 📊 Skema Utama Database Yayasan
*   \`Tabel_Donatur\`: id_donatur (PK), nama, email, no_telp, alamat, status_kategori
*   \`Tabel_Laporan_Kegiatan\`: id_laporan (PK), nama_program, tgl_kegiatan, anggaran_terpakai, dokumentasi_url
*   \`Tabel_Aset_Invertaris\`: id_barang (PK), nama_barang, jumlah, kondisi, sumber_dana

#### 4. 🚀 Jadwal Implementasi Arielabs18
*   **Minggu 1:** Setup server, instalasi framework dasar database relasional.
*   **Minggu 2:** Pembuatan modul administrasi donasi dan pelaporan keuangan.
*   **Minggu 3-4:** Sesi uji coba operasional internal, training pengawas yayasan, dan Go-Live!`;
  }

  if (entityType.toLowerCase().includes("umkm") || entityType.toLowerCase().includes("bisnis")) {
    return `### 🛒 Blueprint Arielabs Business System (ABS) - ${entityName}
*Dibuat untuk melipatgandakan produktivitas usaha kecil-menengah melalui digitalisasi proses.*

#### 1. ⚙️ Rekomendasi Fitur Unggulan
*   **Order & POS Engine Ringkas:** Pencatatan transaksi penjualan harian yang terintegrasi langsung dengan pemotongan stok gudang otomatis.
*   **E-Catalog & Landing Page Dinamis:** Pembuatan katalog produk digital yang responsif dengan tombol checkout pesan WhatsApp langsung ke bagian admin penjualan.
*   **Dasbor Keuangan & Analisa Laba Rugi:** Grafik analitis bulanan untuk memantau pendapatan kotor, pengeluaran operasional, serta keuntungan bersih secara langsung.

#### 2. ⚡ Manfaat Alur Kerja Otomatis (Workflow Transformation)
*   **Sebelum (Manual):** Melakukan stok opname berkala secara manual, sering kali terjadi kecolongan stok barang habis tanpa disadari admin sehingga kehilangan calon customer.
*   **Sesudah (Otomatis):** Setiap kali inventory menyentuh ambang kuantitas batas minimum, sistem otomatis memunculkan tanda waspada (warning) di dasbor admin dan menyusun rancangan PO (Purchase Order) baru siap kirim ke supplier.

#### 3. 📊 Skema Utama Database UMKM
*   \`Tabel_Produk\`: id_produk (PK), nama_produk, harga_jual, harga_beli, stok_minimum, stok_sekarang
*   \`Tabel_Pelanggan\`: id_pelanggan (PK), nama, no_hp, total_pembelian, tgl_terakhir_order
*   \`Tabel_Transaksi_Penjualan\`: id_transaksi (PK), id_pelanggan, id_produk, qty, total_bayar, tanggal

#### 4. 🚀 Jadwal Implementasi Arielabs18
*   **Minggu 1:** Setup e-catalog produk dan integrasi mobile-friendly design.
*   **Minggu 2:** Pembangunan modul backend pencatatan stok dan kas kasir (POS).
*   **Minggu 3:** Pelatihan instan operasional harian, transfer database aman, dan peluncuran produk!`;
  }

  return `### ⚙️ Blueprint Arielabs Administrative Automation - ${entityName} (Tipe: ${entityType})
*Kerangka automasi operasional generik berstandar premium untuk meningkatkan efisiensi organisasi.*

#### 1. ⚙️ Rekomendasi Fitur Portal & Sistem
*   **Database Management System Terpusat:** Sistem penyimpanan data yang teratur, cepat diakses, terenkripsi aman, dan mendukung filter instan.
*   **Generator Surat & Dokumen Mandiri:** Membantu pembuatan dokumen organisasi berbasis parameter masukan secara dinamis dan menghasilkan file siap cetak PDF.
*   **Dasbor Analitik Kegiatan:** Menyajikan infografis, status penyelesaian pekerjaan, riwayat aktivitas, dan notifikasi kelancaran alur kerja.

#### 2. ⚡ Manfaat Alur Kerja Otomatis (Workflow Transformation)
*   **Sebelum (Manual):** Melakukan koordinasi manual lewat WA berulang-ulang, pencatatan tumpang tindih, dan administrasi rentan terhadap kesalahan manusia (human error).
*   **Sesudah (Otomatis):** Seluruh laporan tersimpan dalam sistem cloud terpusat. Setiap kemajuan tugas diperbarui langsung dan draf laporan administratif tersaji secara instan setiap waktu.

#### 3. 📊 Skema Utama Database Dasar
*   \`Tabel_Entitas\`: id_entitas (PK), nama, tipe_kategori, tanggal_pembuatan, status_aktif
*   \`Tabel_Administrasi\`: id_dokumen (PK), id_entitas, jenis_dokumen, isi_data_json, tgl_dibuat
*   \`Tabel_Log_Sistem\`: id_log (PK), aksi, pelaku, tanggal_waktu, status_koneksi

#### 4. 🚀 Jadwal Implementasi Arielabs18
*   **Minggu 1:** Sesi konsultasi mendalam (In-depth discovery session) & pemetaan arsitektur basis data.
*   **Minggu 2-3:** Koding kustomisasi panel dasbor administrasi sistem terpadu.
*   **Minggu 4:** Pengujian performa, training administrator sistem, dan peluncuran sukses!`;
}

const app = express();
app.use(express.json());

// Normalize Vercel URLs to prevent routing mismatch
app.use((req, res, next) => {
  const originalUrl = req.url;
  if (req.url.startsWith("/api/index.ts")) {
    req.url = req.url.slice("/api/index.ts".length);
  } else if (req.url.startsWith("/api/index")) {
    req.url = req.url.slice("/api/index".length);
  }
  // Ensure appropriate prefix if it was chopped off
  if (
    req.url.startsWith("/chat") || 
    req.url.startsWith("/generate-plan") || 
    req.url.startsWith("/admin") || 
    req.url.startsWith("/health")
  ) {
    req.url = "/api" + req.url;
  }
  if (!req.url.startsWith("/")) {
    req.url = "/" + req.url;
  }
  console.log(`[Arielabs18 Route Monitor] ${req.method} ${originalUrl} -> ${req.url}`);
  next();
});

  // Simple File Database to persist profile data (simulating a SQL Relational Table structure)
  const PROFILE_FILE = path.join(process.cwd(), "profile_db.json");
  const getProfileData = () => {
    try {
      if (fs.existsSync(PROFILE_FILE)) {
        const data = JSON.parse(fs.readFileSync(PROFILE_FILE, "utf-8"));
        let updated = false;
        if (data && (data.name === "Arie Kurniawan FL" || !data.name)) {
          data.name = "Harry Ledoh";
          data.title = "PORTAL ENGINE DESIGNER & FOUNDER ARIELABS18";
          updated = true;
        }
        if (data && (data.bio && data.bio.includes("Software Engineer"))) {
          data.bio = "Saya adalah seseorang yang concern dalam pengembangan Simple Software dan Simple Admin System. Saya fokus dalam pengembangan pelayanan digital, berusaha membantu semua pihak dengan menghadirkan inovasi otomasi administrasi modern untuk berbagai keperluan/kegiatan dengan cepat, praktis dan tanpa ribet.";
          updated = true;
        }
        if (updated) {
          fs.writeFileSync(PROFILE_FILE, JSON.stringify(data, null, 2), "utf-8");
        }
        return data;
      }
    } catch (e) {
      console.error("Error reading profile_db.json", e);
    }
    return {
      name: "Harry Ledoh",
      title: "PORTAL ENGINE DESIGNER & FOUNDER ARIELABS18",
      bio: "Saya adalah seseorang yang concern dalam pengembangan Simple Software dan Simple Admin System. Saya fokus dalam pengembangan pelayanan digital, berusaha membantu semua pihak dengan menghadirkan inovasi otomasi administrasi modern untuk berbagai keperluan/kegiatan dengan cepat, praktis dan tanpa ribet.",
    };
  };

  const saveProfileData = (data: any) => {
    try {
      fs.writeFileSync(PROFILE_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing profile_db.json", e);
    }
  };

  // Secure Server-side Admin Database mapping (Representing the requested PHP/MySQL target structure)
  const ADMIN_DB = {
    username: "admin",
    password: "arielabs18password", // Secure Admin Access
  };

  // API: Get current profile details (from file database)
  app.get("/api/admin/profile", (req, res) => {
    res.json(getProfileData());
  });

  // API: Process Admin Login verification
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_DB.username && password === ADMIN_DB.password) {
      res.json({ 
        success: true, 
        token: "session_token_arielabs18_secure_g18", 
        message: "Login Berhasil! Sesi admin lokal diaktifkan." 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        error: "Konfirmasi Gagal! Kombinasi Username atau Password salah." 
      });
    }
  });

  // API: Secure profile details modifier
  app.post("/api/admin/update-profile", (req, res) => {
    const { token, name, title, bio } = req.body;
    if (token !== "session_token_arielabs18_secure_g18") {
      return res.status(403).json({ 
        success: false, 
        error: "Sesi Kedaluwarsa atau Batil! Hubungi admin untuk akses relasional." 
      });
    }
    if (!name || !title || !bio) {
      return res.status(400).json({ success: false, error: "Seluruh kolom data wajib diisi." });
    }
    const newData = { name, title, bio };
    saveProfileData(newData);
    res.json({ success: true, message: "Informasi diri berhasil diperbarui secara permanen!" });
  });

  // API endpoint: Status
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", time: new Date().toISOString() });
  });

  // API endpoint: Generate System Plan
  app.post("/api/generate-plan", async (req, res) => {
    try {
      const { entityType, entityName, requirements } = req.body;
      if (!entityType || !entityName) {
        return res.status(400).json({ error: "entityType and entityName are required" });
      }

      // Check key existence safely
      const keyExists = 
        process.env.GEMINI_API_KEY && 
        process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" && 
        process.env.GEMINI_API_KEY.trim() !== "";

      if (!keyExists) {
        // Return highly polished static Indonesia fallback blueprint instantly
        const simulatedText = getFallbackPlanText(entityType, entityName, requirements);
        return res.json({
          success: true,
          mode: "simulated",
          planText: simulatedText,
        });
      }

      const client = getGeminiClient();
      const prompt = `Anda adalah seorang konsultan andal, pakar portal web terpadu, dan sistem automasi administrasi bisnis di Arielabs18 (arielabs18.my.id).
Berikan analisis, rekomendasi fitur, manfaat alur kerja otomatis, dan struktur database dasar untuk:
Nama Lembaga: ${entityName}
Tipe Lembaga: ${entityType}
Kebutuhan Khusus: ${requirements || "Peningkatan efisiensi kerja dan digitalisasi data administrasi umum"}

Tulis rancangan Anda sepenuhnya dalam Bahasa Indonesia dengan format markdown terstruktur yang elegan dan rapi.
Gunakan poin-poin yang jelas, gunakan emoji representatif gratis untuk setiap ikon judul, gunakan gaya penulisan profesional yang optimis dan ramah.
Sertakan 4 bab bahasan utama berikut secara berurutan:
1. Rekomendasi Fitur Portal (Min 3 fitur beserta penjelasan rinci kegunaan fungsionalnya).
2. Transformasi Alur Kerja (Workflow Before vs After).
3. Struktur Database Dasar yang Direkomendasikan (Tabel utama dan kolom deskriptif singkat).
4. Estimasi Waktu & Tahapan Pemasangan Sistem oleh Arielabs18.
Hindari pengulangan instruksi ini dan berikan langsung hasil rancangan dari Arielabs18.`;

                  // 1. Menggunakan Axios dengan alamat gerbang URL resmi 21st di depan
      const axios = require('axios');
      const agentResponse = await axios.post("21st_sk_10ffaba3d7d0f29425f97d97e5faa2dd0c1dc0c34991b13fd8f8f91447ea1535", {
        agent: "agent", 
        tool: "rancangBlueprint",
        arguments: {
          sektorLembaga: entityType,
          namaLembaga: entityName,
          kebutuhanKhusus: requirements || "Standar"
        }
      }, {
        headers: {
          "Content-Type": "application/json",
          // Robot kurir (process.env) otomatis menjemput kuncinya di brankas Vercel Anda
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_KEY_21ST || process.env.API_KEY_21ST}`
        }
      });

      // 2. Mengambil data hasil kalkulasi dari Axios
      const data = agentResponse.data;

      if (agentResponse.status === 200 && data.output) {
        // 2. Mengirimkan hasil cetak biru kembali ke layar visual web Anda
        res.json({
          success: true,
          mode: "ai",
          planText: data.output, 
        });
      } else {
        throw new Error(data.error || "Gagal mendapatkan respon dari Agen 21st.");
      }

    } catch (error: any) {
      console.error("Gemini API error during generation:", error);
      // Fail gracefully with simulated text
      try {
        const fallbackText = getFallbackPlanText(req.body.entityType, req.body.entityName, req.body.requirements);
        res.json({
          success: true,
          mode: "fallback",
          planText: fallbackText,
          warning: "Koneksi AI terhambat, menyajikan blueprint template cerdas."
        });
      } catch (innerError) {
        res.status(500).json({
          success: false,
          error: error.message || "Gagal memproses rancangan sistem",
        });
      }
    }
  });

  // API endpoint: Live 1x24h Chatbot Assistant (AI Support Desk)
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Kolom 'messages' wajib diisi sebagai array." });
      }

      // 1. Check if Gemini API key exists
      const keyExists = 
        process.env.GEMINI_API_KEY && 
        process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY" && 
        process.env.GEMINI_API_KEY.trim() !== "";

      const lastUserMessage = messages[messages.length - 1]?.content || "";
      const textLower = lastUserMessage.toLowerCase();

      // Smart rule-based matching fallback if key is missing or as immediate responder
      const getOfflineReply = () => {
        if (textLower.includes("biaya") || textLower.includes("harga") || textLower.includes("tarif") || textLower.includes("anggaran") || textLower.includes("budget") || textLower.includes("rupiah") || textLower.includes("rp.")) {
          return `### 💰 Estimasi Rencana Anggaran (Budget) Pengembangan Sistem
          
Kami menyediakan 4 kategori penawaran fleksibel yang dapat disesuaikan dengan skala instansi Anda:
1. **Rp 150.000 - Rp 500.000 (Sistem Dasar)** — Sangat praktis untuk prototype atau sistem administrasi satu fungsi esensial.
2. **Rp 500.000 - Rp 1.000.000 (Rekomendasi Optimal)** — Sangat populer untuk sekolah tingkat menengah, gereja lokal, atau UMKM dengan modul administrasi utama terintegrasi.
3. **Rp 1.000.000 - Rp 2.500.000 (Fitur Lengkap)** — Menyediakan fungsionalitas komprehensif, multi-level hak akses, dan backup harian otomatis yang terenkripsi aman.
4. **Diatas Rp 2.500.000 (Skala Lembaga Besar)** — Arsitektur terdistribusi kustom untuk organisasi, yayasan besar, atau instansi dengan integrasi sistem yang erat.

*Untuk merancang spesifikasi sistem Anda secara presisi dan mendapatkan kalkulasi yang pas, silakan manfaat halaman **Sewa Framework** di menu atas kami untuk mengirimkan rancangan blueprint Anda. Pilihan lainnya, silakan hubungi WhatsApp utama kami bila ingin berdiskusi langsung.*`;
        }

        if (textLower.includes("detail") || textLower.includes("bagaimana") || textLower.includes("cara kerja") || textLower.includes("alur") || textLower.includes("bisa buat") || textLower.includes("buatkan") || textLower.includes("rancangan") || textLower.includes("integrasi") || textLower.includes("fitur") || textLower.includes("database")) {
          return `### 🛠️ Perancangan Sistem & Alur Kerja Kustom

Kami sangat mementingkan presisi dan keselarasan alur kerja digital instansi Anda. Solusi terbaik untuk mendesain fitur ini adalah dengan **merancang blueprint sistem** secara spesifik dan terstruktur.

**Langkah Mudah Memulai:**
*   Silakan masuk ke halaman **Sewa Framework** (bisa diakses di menu navigasi utama atas).
*   Di sana, Anda dapat menginput spesifikasi database, alur menu, hak akses, dan fungsionalitas yang Anda butuhkan.
*   Tim kami akan langsung meninjau rancangan blueprint tersebut untuk memberikan estimasi pengerjaan yang paling efisien.

*Bila Anda membutuhkan asistensi instan atau memiliki pertanyaan yang ingin dikoordinasikan langsung sebelum mengisi blueprint, Anda dapat langsung beralih ke WhatsApp Utama kami.*`;
        }

        if (textLower.includes("layanan") || textLower.includes("buat") || textLower.includes("bisa") || textLower.includes("jasa") || textLower.includes("aplikasi") || textLower.includes("web") || textLower.includes("fitur")) {
          return `### ⚙️ Layanan Otomasi & Portal Administrasi Kustom

Kami berfokus memangkas birokrasi, menghemat pengarsipan fisik, serta menyempurnakan alur pelaporan harian melalui 5 pilar layanan utama:
1.  **Administrasi Gereja Terintegrasi** — Sensus jemaat, laporan e-kas transparan, dan pengelolaan warta digital.
2.  **Sistem Administrasi Sekolah Terpadu** — Rekapitulasi kehadiran, laporan harian konsol piket guru-siswa, manajemen kelulusan, dan slip gaji digital.
3.  **Administrasi Yayasan Sosial** — Manajemen donatur, logistik bantuan, tracking project kemanusiaan.
4.  **Digitalisasi & Otomasi UMKM** — Sistem kasir digital (POS), e-catalog penjualan checkout WhatsApp, laporan pembukuan praktis.
5.  **Pengarsipan Berkas Digital Terproteksi** — Menghilangkan tumpukan kertas fisik, menghemat biaya operasional, dan proteksi backup cloud harian.

*Untuk spesifikasi detail per modul, kami sarankan Anda mengirimkan kebutuhan melalui halaman **Sewa Framework / Form Order** di menu atas agar kami dapat merancang blueprint yang paling kompatibel.*`;
        }

        if (textLower.includes("nomor") || textLower.includes("wa") || textLower.includes("whatsapp") || textLower.includes("hubungi") || textLower.includes("kontak") || textLower.includes("telp")) {
          return `### 📞 Kontak Resmi Arielabs18

Anda dapat terhubung langsung dengan tim pengembang kami untuk koordinasi instant:
*   **WhatsApp Utama (Official):** [+62 821 4414 0837](https://wa.me/6282144140837) (Tersedia untuk diskusi langsung)
*   **Email Resmi:** [hello@arielabs18.my.id](mailto:hello@arielabs18.my.id)
*   **Instagram:** [@ariekurniawanfl](https://instagram.com/ariekurniawanfl)

*Silakan gunakan tombol **Hubungi WhatsApp Admin** di bagian atas obrolan ini jika Anda ingin langsung berinteraksi cepat tanpa perlu menyimpan nomor manual.*`;
        }

        if (textLower.includes("alamat") || textLower.includes("kantor") || textLower.includes("lokasi") || textLower.includes("kupang") || textLower.includes("naikoten")) {
          return `### 📍 Alamat & Area Kantor Kami

Kami berbasis secara fisik di Kota Kupang, NTT:
*   **Alamat Kantor:** Jl. Kebun Raja, Kel. Naikoten 1, Kec. Kota Raja, Kota Kupang, Provinsi Nusa Tenggara Timur (NTT).
*   **Cakupan Layanan:** Melayani digitalisasi administrasi gereja, sekolah, yayasan, dan UMKM di seluruh wilayah Indonesia dengan sistem backup cloud yang aman dan andal.`;
        }

        if (textLower.includes("halo") || textLower.includes("pagi") || textLower.includes("siang") || textLower.includes("sore") || textLower.includes("malam") || textLower.includes("hi") || textLower.includes("hello") || textLower.includes("hallo") || textLower.includes("test") || textLower.includes("ping")) {
          return `Halo! Selamat datang di desk diskusi Arielabs18. ✨

Ada yang bisa kami bantu hari ini? Kami siap membantu mengotomasi administrasi instansi Anda agar berjalan lebih cepat, efisien, dan hemat biaya kertas.

**Topik informasi yang sering didiskusikan:**
*   💰 Berapa **estimasi biaya** pembuatan aplikasi atau portal?
*   🛠️ Tanya mengenai **rancangan fitur/spesifikasi administrasi** kustom.
*   📦 Apa saja pilihan **fokus layanan otomatisasi** kami?
*   📍 Di mana **alamat kantor** atau cara berkomunikasi langsung dengan kami?

*Jika rancangan Anda cukup spesifik atau detail, kami sarankan untuk langsung mengisi halaman **Sewa Framework** agar kami dapat menganalisa rancangan blueprint Anda secara matang. Untuk diskusi cepat, Anda juga bisa langsung chat WhatsApp utama kami.*`;
        }

        return null;
      };

      const offlineReply = getOfflineReply();

      // If key is not configured, or we matched a direct offline keyword, we can return the offline response immediately!
      // This ensures extreme relevance for system queries and lightning-fast loading.
      if (!keyExists || offlineReply) {
        return res.json({
          success: true,
          mode: offlineReply ? "custom_rule" : "simulated",
          reply: offlineReply || `Halo! Terima kasih atas pesan Anda di Arielabs18. Kami mendukung berbagai kebutuhan administrasi gereja, sistem sekolah, administrasi yayasan, digitalisasi UMKM, dan pengarsipan digital terintegrasi.

Silakan mengisi rancangan spesifikasi kebutuhan Anda di halaman **Sewa Framework/Form Order** di menu atas, atau hubungi WhatsApp resmi kami di [+62 821 4414 0837](https://wa.me/6282144140837) untuk berdiskusi bersama tim kami.`
        });
      }

      // Convert client message blocks into GoogleGenAI standard structure { role, parts: [{ text }] }
      // Roles in GoogleGenAI are 'user' and 'model'
      const formattedContents = messages.map((msg: any) => ({
        role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      const client = getGeminiClient();
      const systemInstruction = `Anda adalah Owner/Tim Pengembang Utama dari Arielabs18, yang membalas pesan kustomer secara profesional, ramah, dan solutif di website resmi www.arielabs18.my.id.

PANDUAN UTAMA (CRITICAL GUIDELINES):
1. JANGAN PERNAH menyatakan atau mengindikasikan bahwa Anda adalah AI, robot, bot, virtual assistant, asisten cerdas, asisten AI, atau mesin simulasi. Bertindaklah dan responlah seolah Anda adalah pemilik/pengembang portal langsung yang sedang melayani kustomer di chat. Gunakan kata ganti pertama seperti "saya" atau "kami".
2. JANGAN PERNAH menyebutkan nama orang spesifik (seperti Harry Ledoh, Harry Kurniawan, dll). Sebut saja diri Anda sebagai "Owner Arielabs18" atau "Tim Pengembang Arielabs18".
3. JANGAN menyebutkan nama institusi luar secara spesifik (seperti SMKN 4 Kupang, GMIT Getsemani Mere, Diaspora Bina Karya) kecuali jika kustomer berinisiatif menanyakannya secara eksplisit. Jelaskan porto/kapabilitas secara umum bahwa kami berpengalaman luas merancang portal administrasi sekolah, sistem sensus pelayanan gereja, database pendaftaran yayasan, & kasir/checkout UMKM kustom.
4. JIKA PERTANYAAN KUSTOMER CUKUP DETAIL (misal menanyakan alur database, cara kerja fungsi rumit, pembuatan spesifikasi menu tertentu, integrasi teknis, atau meminta rancangan kustom):
   Pandulah mereka dengan sangat ramah untuk menggunakan fitur **Rancangan Blueprint** di halaman **Sewa Framework** di website kami agar mereka bisa menuliskan struktur menu, hak akses, dan budget yang pas, dan kami dapat me-review rancangannya secara presisi.
5. JIKA MEREKA INGIN BERKOMUNIKASI/BERTRANSAKSI LANGSUNG SECARA PERTUKARAN CEPAT INDIVIDU:
   Barulah sebagai opsi terakhir arahkan mereka untuk mengklik tombol WhatsApp Utama kami (+62 821 4414 0837) agar dapat berdiskusi cepat. Jangan sebut kata "manusia", melainkan "WhatsApp Admin" atau "WhatsApp Utama".

Profil Singkat Jasa Kami (Gunakan secara umum):
- Kami berfokus pada efisiensi administrasi harian, memangkas birokrasi, menghemat pengarsipan fisik, dan menyempurnakan alur pelaporan administrasi harian.
- Estimasi anggaran fleksibel:
  * Rp 150.000 - Rp 500.000 (Sistem Dasar satu fungsi)
  * Rp 500.000 - Rp 1.000.000 (Optimal untuk sekolah menengah/gereja lokal/UMKM)
  * Rp 1.000.000 - Rp 2.500.000 (Fitur lengkap, multi-level hak akses, backup cloud aman)
  * Di atas Rp 2.500.000 (Skala instansi besar terdistribusi)

Panduan Menjawab:
- Jawab dengan bahasa Indonesia yang santun, beralur logis, ramah, dan bersahabat.
- Gunakan format markdown yang rapi (bolding, kustom bullet point, headers, emoji yang wajar).
- Jaga agar jawaban tidak terlalu berbelit-belit, langsung menawarkan solusi praktis (blueprint sewa atau WhatsApp utama jika ingin ngobrol cepat).`;

            // Server Vercel bertindak sebagai jembatan aman untuk menghubungi Agen 21st Anda di cloud
      const agentResponse = await fetch("21st_sk_10ffaba3d7d0f29425f97d97e5faa2dd0c1dc0c34991b13fd8f8f91447ea1535", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_KEY_21ST || process.env.API_KEY_21ST}`
        },
        body: JSON.stringify({
          agent: "agent", // Memanggil Agen kustom Anda di cloud 21st.dev
          message: lastUserMessage
        })
      });

      const data = await agentResponse.json();

      if (agentResponse.ok && data.output) {
        // Mengirimkan kembali jawaban cerdas dari Agen 21st ke gelembung chat visual Anda
        res.json({
          success: true,
          mode: "ai",
          reply: data.output, 
        });
      } else {
        throw new Error(data.error || "Gagal mendapatkan balasan dari Agen 21st.");
      }

    } catch (error: any) {
      console.error("Gemini API error during support chat:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Gagal memproses percakapan AI",
      });
    }
  });

async function startServer() {
  // Serve static assets or use Vite development middleware
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production files from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Arielabs18 Server] Running securely on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
