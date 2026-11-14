import { TagihanUktMahasiswa, HonorariumDosenRecord, AnggaranProdiLab, ItemKomponenUangKuliah } from '../types/index';

// =========================================================================
// RINCIAN RESMI KOMPONEN UANG KULIAH MAHASISWA FAKULTAS TEKNIK UNBARI
// Sumber: Ketetapan Biaya Pendidikan Yayasan Pendidikan Jambi - FT UNBARI
// =========================================================================
export const KOMPONEN_UANG_KULIAH_RESMI: ItemKomponenUangKuliah[] = [
  { no: 1, namaItem: 'SKS', nominal: 1000000, keterangan: 'Biaya beban akademik perkuliahan teori & evaluasi pembelajaran per SKS', kategori: 'Pokok Perkuliahan', isWajib: true },
  { no: 2, namaItem: 'SPP', nominal: 2500000, keterangan: 'Sumbangan Pembinaan Pendidikan semester reguler operasional FT UNBARI', kategori: 'Pokok Perkuliahan', isWajib: true },
  { no: 3, namaItem: 'Aptisi', nominal: 6500, keterangan: 'Iuran Asosiasi Perguruan Tinggi Swasta Indonesia (APTISI) Wilayah X Jambi', kategori: 'Administrasi & Registrasi', isWajib: true },
  { no: 4, namaItem: 'Pembangunan', nominal: 1000000, keterangan: 'Dana pengembangan sarana prasarana gedung & ruang kuliah FT UNBARI', kategori: 'Pengembangan Kampus', isWajib: true },
  { no: 5, namaItem: 'Laboratorium', nominal: 0, keterangan: 'Pemakaian alat & modul praktikum laboratorium teknik (disubsidi dekanat)', kategori: 'Pokok Perkuliahan', isWajib: false },
  { no: 6, namaItem: 'wisuda', nominal: 0, keterangan: 'Biaya pelantikan wisuda sarjana (dibayarkan terpisah pada semester akhir)', kategori: 'Lainnya', isWajib: false },
  { no: 7, namaItem: 'KKN', nominal: 0, keterangan: 'Kuliah Kerja Nyata / Pengabdian Masyarakat Tematik (program semester lanjut)', kategori: 'Lainnya', isWajib: false },
  { no: 8, namaItem: 'Denda SPP', nominal: 0, keterangan: 'Sanksi denda keterlambatan pembayaran / her-registrasi (bebas denda)', kategori: 'Administrasi & Registrasi', isWajib: false },
  { no: 9, namaItem: 'Registrasi', nominal: 165000, keterangan: 'Administrasi her-registrasi semester dan aktivasi KRS Siakad online', kategori: 'Administrasi & Registrasi', isWajib: true },
  { no: 10, namaItem: 'Peng. Mutu Akademik', nominal: 1000000, keterangan: 'Pengembangan penjaminan mutu SPMI dan akreditasi prodi LAM Teknik', kategori: 'Pengembangan Kampus', isWajib: true },
  { no: 11, namaItem: 'Kartu Mahasiswa', nominal: 75000, keterangan: 'KTM Smartcard RFID, kartu akses perpustakaan & presensi digital FT', kategori: 'Kemahasiswaan', isWajib: true },
  { no: 12, namaItem: 'Jaket', nominal: 175000, keterangan: 'Jaket Almamater resmi warna hijau Fakultas Teknik Universitas Batanghari', kategori: 'Kemahasiswaan', isWajib: true },
  { no: 13, namaItem: 'Katalog', nominal: 75000, keterangan: 'Buku pedoman akademik, panduan kurikulum OBE & buku kode etik mahasiswa', kategori: 'Kemahasiswaan', isWajib: true },
  { no: 14, namaItem: 'Asuransi', nominal: 50000, keterangan: 'Premi asuransi keselamatan dan kecelakaan kerja mahasiswa praktek/lapangan', kategori: 'Kemahasiswaan', isWajib: true },
  { no: 15, namaItem: 'PBMP', nominal: 100000, keterangan: 'Pembinaan Bakat Minat dan Penalaran (BEM, DPM, Himpunan Mahasiswa FT)', kategori: 'Kemahasiswaan', isWajib: true },
  { no: 16, namaItem: 'Lain-lain', nominal: 60000, keterangan: 'Biaya administrasi umum, pos, materai dan sistem informasi portal', kategori: 'Lainnya', isWajib: true },
];

export const TOTAL_UANG_KULIAH_RESMI = 6206500;
export const TERBILANG_UANG_KULIAH_RESMI = 'Enam Juta Dua Ratus Enam Ribu Lima Ratus Rupiah';

export const INITIAL_TAGIHAN_UKT: TagihanUktMahasiswa[] = [
  // --- MAHASISWA BARU TA 2026/2027 (PAKET LENGKAP RINCIAN RESMI Rp 6.206.500) ---
  {
    id: 'UKT-SPL-000',
    nim: '2600822201001',
    namaMahasiswa: 'Muhammad Al-Fatih Pratama',
    prodiId: 'SIPIL',
    angkatan: 2026,
    semester: 1,
    tahunAkademik: '2026/2027 Ganjil',
    nominalTagihan: 6206500,
    nominalTerbayar: 6206500,
    sisaTunggakan: 0,
    status: 'Lunas',
    tanggalBayarTerakhir: '2026-08-25',
    nomorTransaksiBank: 'BNI-TRX-20269011',
    metodePembayaran: 'Bank BNI',
    bebasKeuanganUjian: true,
    rincianKomponen: KOMPONEN_UANG_KULIAH_RESMI
  },
  {
    id: 'UKT-LKG-000',
    nim: '2600822202001',
    namaMahasiswa: 'Annisa Rahmadani',
    prodiId: 'LINGKUNGAN',
    angkatan: 2026,
    semester: 1,
    tahunAkademik: '2026/2027 Ganjil',
    nominalTagihan: 6206500,
    nominalTerbayar: 3500000,
    sisaTunggakan: 2706500,
    status: 'Cicilan',
    tanggalBayarTerakhir: '2026-08-28',
    nomorTransaksiBank: 'MNDR-20268841',
    metodePembayaran: 'Bank Mandiri',
    bebasKeuanganUjian: false,
    catatanDispensasi: 'Cicilan tahap 1 terbayar Rp 3.500.000. Sisa Rp 2.706.500 dibayarkan sebelum UTS.',
    rincianKomponen: KOMPONEN_UANG_KULIAH_RESMI
  },
  // --- MAHASISWA S1 TEKNIK SIPIL ---
  {
    id: 'UKT-SPL-001',
    nim: '2100822201001',
    namaMahasiswa: 'Ahmad Fauzi',
    prodiId: 'SIPIL',
    angkatan: 2021,
    semester: 8,
    tahunAkademik: '2025/2026 Ganjil',
    nominalTagihan: 3750000,
    nominalTerbayar: 3750000,
    sisaTunggakan: 0,
    status: 'Lunas',
    tanggalBayarTerakhir: '2025-08-15',
    nomorTransaksiBank: 'BNI-TRX-8829104',
    metodePembayaran: 'Bank BNI',
    bebasKeuanganUjian: true,
    rincianKomponen: KOMPONEN_UANG_KULIAH_RESMI
  },
  {
    id: 'UKT-SPL-002',
    nim: '2100822201002',
    namaMahasiswa: 'Budi Santoso',
    prodiId: 'SIPIL',
    angkatan: 2021,
    semester: 8,
    tahunAkademik: '2025/2026 Ganjil',
    nominalTagihan: 3750000,
    nominalTerbayar: 3750000,
    sisaTunggakan: 0,
    status: 'Lunas',
    tanggalBayarTerakhir: '2025-08-18',
    nomorTransaksiBank: 'BNI-TRX-8829109',
    metodePembayaran: 'Bank BNI',
    bebasKeuanganUjian: true
  },
  {
    id: 'UKT-SPL-003',
    nim: '2200822201015',
    namaMahasiswa: 'Citra Dewi Lestari',
    prodiId: 'SIPIL',
    angkatan: 2022,
    semester: 6,
    tahunAkademik: '2025/2026 Ganjil',
    nominalTagihan: 3750000,
    nominalTerbayar: 2000000,
    sisaTunggakan: 1750000,
    status: 'Cicilan',
    tanggalBayarTerakhir: '2025-09-02',
    nomorTransaksiBank: 'MNDR-772109',
    metodePembayaran: 'Bank Mandiri',
    bebasKeuanganUjian: false,
    catatanDispensasi: 'Permohonan cicilan tahap 2 sebelum UTS disetujui WD II.'
  },
  {
    id: 'UKT-SPL-004',
    nim: '2200822201024',
    namaMahasiswa: 'Dimas Prasetyo',
    prodiId: 'SIPIL',
    angkatan: 2022,
    semester: 6,
    tahunAkademik: '2025/2026 Ganjil',
    nominalTagihan: 3750000,
    nominalTerbayar: 0,
    sisaTunggakan: 3750000,
    status: 'Menunggak',
    tanggalBayarTerakhir: undefined,
    bebasKeuanganUjian: false,
    catatanDispensasi: 'Peringatan ke-1 terbit dari Dekanat FT.'
  },
  {
    id: 'UKT-SPL-005',
    nim: '2300822201005',
    namaMahasiswa: 'Eka Nurhaliza',
    prodiId: 'SIPIL',
    angkatan: 2023,
    semester: 4,
    tahunAkademik: '2025/2026 Ganjil',
    nominalTagihan: 3750000,
    nominalTerbayar: 3750000,
    sisaTunggakan: 0,
    status: 'Lunas',
    tanggalBayarTerakhir: '2025-08-12',
    nomorTransaksiBank: 'BNI-TRX-8831002',
    metodePembayaran: 'Bank BNI',
    bebasKeuanganUjian: true
  },
  {
    id: 'UKT-SPL-006',
    nim: '2400822201040',
    namaMahasiswa: 'Faris Gunawan',
    prodiId: 'SIPIL',
    angkatan: 2024,
    semester: 2,
    tahunAkademik: '2025/2026 Ganjil',
    nominalTagihan: 3750000,
    nominalTerbayar: 1500000,
    sisaTunggakan: 2250000,
    status: 'Dispensasi',
    tanggalBayarTerakhir: '2025-08-20',
    nomorTransaksiBank: 'KAS-UNBARI-5541',
    metodePembayaran: 'Kasir Rektorat UNBARI',
    bebasKeuanganUjian: true,
    catatanDispensasi: 'SK Dispensasi Dekan FT No. 114/FT/UNBARI/2025 karena musibah keluarga.'
  },

  // --- MAHASISWA S1 TEKNIK LINGKUNGAN ---
  {
    id: 'UKT-LKG-001',
    nim: '2100822202003',
    namaMahasiswa: 'Nabila Putri Salma',
    prodiId: 'LINGKUNGAN',
    angkatan: 2021,
    semester: 8,
    tahunAkademik: '2025/2026 Ganjil',
    nominalTagihan: 3600000,
    nominalTerbayar: 3600000,
    sisaTunggakan: 0,
    status: 'Lunas',
    tanggalBayarTerakhir: '2025-08-14',
    nomorTransaksiBank: 'BNI-TRX-991024',
    metodePembayaran: 'Bank BNI',
    bebasKeuanganUjian: true
  },
  {
    id: 'UKT-LKG-002',
    nim: '2200822202011',
    namaMahasiswa: 'Rahmat Hidayatullah',
    prodiId: 'LINGKUNGAN',
    angkatan: 2022,
    semester: 6,
    tahunAkademik: '2025/2026 Ganjil',
    nominalTagihan: 3600000,
    nominalTerbayar: 3600000,
    sisaTunggakan: 0,
    status: 'Lunas',
    tanggalBayarTerakhir: '2025-08-16',
    nomorTransaksiBank: 'NGR-TRX-44120',
    metodePembayaran: 'Bank Nagari / BPD',
    bebasKeuanganUjian: true
  },
  {
    id: 'UKT-LKG-003',
    nim: '2300822202008',
    namaMahasiswa: 'Indah Sari Wulandari',
    prodiId: 'LINGKUNGAN',
    angkatan: 2023,
    semester: 4,
    tahunAkademik: '2025/2026 Ganjil',
    nominalTagihan: 3600000,
    nominalTerbayar: 0,
    sisaTunggakan: 3600000,
    status: 'Menunggak',
    bebasKeuanganUjian: false,
    catatanDispensasi: 'Menunggu konfirmasi beasiswa KIP Kuliah susulan.'
  },

  // --- MAHASISWA D3 TEKNIK LISTRIK ---
  {
    id: 'UKT-LST-001',
    nim: '2200822301004',
    namaMahasiswa: 'M. Teguh Pratama',
    prodiId: 'LISTRIK_D3',
    angkatan: 2022,
    semester: 6,
    tahunAkademik: '2025/2026 Ganjil',
    nominalTagihan: 3200000,
    nominalTerbayar: 3200000,
    sisaTunggakan: 0,
    status: 'Lunas',
    tanggalBayarTerakhir: '2025-08-10',
    nomorTransaksiBank: 'BNI-TRX-77621',
    metodePembayaran: 'Bank BNI',
    bebasKeuanganUjian: true
  },
  {
    id: 'UKT-LST-002',
    nim: '2300822301012',
    namaMahasiswa: 'Yoga Septian',
    prodiId: 'LISTRIK_D3',
    angkatan: 2023,
    semester: 4,
    tahunAkademik: '2025/2026 Ganjil',
    nominalTagihan: 3200000,
    nominalTerbayar: 1600000,
    sisaTunggakan: 1600000,
    status: 'Cicilan',
    tanggalBayarTerakhir: '2025-09-01',
    nomorTransaksiBank: 'MNDR-88310',
    metodePembayaran: 'Bank Mandiri',
    bebasKeuanganUjian: false,
    catatanDispensasi: 'Pelunasan sisa tagihan dijadwalkan sebelum Ujian Akhir Semester.'
  }
];

export const INITIAL_HONOR_DOSEN: HonorariumDosenRecord[] = [
  {
    id: 'HNR-2026-001',
    nidn: '1013069302',
    namaDosen: 'Ir. Rioni Rizki Aldiansyah, ST., MT, IPM, ASEAN Eng.',
    prodiId: 'SIPIL',
    jenisHonor: 'Honor Penguji Sidang TA',
    deskripsi: 'Penguji Sidang Skripsi Periode Oktober 2026 (5 Mahasiswa S1 Sipil)',
    volume: 5,
    satuan: 'Mahasiswa',
    tarifSatuan: 200000,
    totalBruto: 1000000,
    potonganPph21: 50000,
    totalNetto: 950000,
    status: 'Siap Dicairkan',
    periodeBulan: 'Oktober 2026',
    tanggalPencairan: '2026-10-28',
    nomorRekening: '0234-8899-10',
    namaBank: 'Bank BNI Cab. Jambi'
  },
  {
    id: 'HNR-2026-002',
    nidn: '1020088802',
    namaDosen: 'Hadrah, ST., MT',
    prodiId: 'LINGKUNGAN',
    jenisHonor: 'Honor Pembimbing Utama Skripsi',
    deskripsi: 'Bimbingan Skripsi Selesai Ujian Yudisium (4 Mahasiswa S1 Lingkungan)',
    volume: 4,
    satuan: 'Mahasiswa',
    tarifSatuan: 350000,
    totalBruto: 1400000,
    potonganPph21: 70000,
    totalNetto: 1330000,
    status: 'Dalam Proses Bagian Keuangan',
    periodeBulan: 'Oktober 2026',
    nomorRekening: '0189-7721-33',
    namaBank: 'Bank BNI Cab. Jambi'
  },
  {
    id: 'HNR-2026-003',
    nidn: '1006058002',
    namaDosen: 'Ir. Hendi Matalata, ST., MT, IPP',
    prodiId: 'LISTRIK_D3',
    jenisHonor: 'Honor Penguji Sidang TA',
    deskripsi: 'Ketua Penguji Sidang Proyek Akhir D3 Teknik Listrik (6 Mahasiswa)',
    volume: 6,
    satuan: 'Mahasiswa',
    tarifSatuan: 175000,
    totalBruto: 1050000,
    potonganPph21: 52500,
    totalNetto: 997500,
    status: 'Sudah Ditransfer',
    periodeBulan: 'Oktober 2026',
    tanggalPencairan: '2026-10-25',
    nomorRekening: '110-00-142890-1',
    namaBank: 'Bank Mandiri Sipin Jambi'
  },
  {
    id: 'HNR-2026-004',
    nidn: '1010128803',
    namaDosen: 'Ir. Riki Saputra., ST., MT',
    prodiId: 'SIPIL',
    jenisHonor: 'Honor Penguji Seminar Proposal',
    deskripsi: 'Penguji Seminar Proposal Konstruksi & Geoteknik (8 Mahasiswa)',
    volume: 8,
    satuan: 'Mahasiswa',
    tarifSatuan: 100000,
    totalBruto: 800000,
    potonganPph21: 40000,
    totalNetto: 760000,
    status: 'Siap Dicairkan',
    periodeBulan: 'Oktober 2026',
    nomorRekening: '0412-5590-11',
    namaBank: 'Bank BNI Cab. Jambi'
  },
  {
    id: 'HNR-2026-005',
    nidn: '1011066901',
    namaDosen: 'Leily Wustha Johar, ST., MT',
    prodiId: 'LISTRIK_D3',
    jenisHonor: 'Honor Mengajar SKS',
    deskripsi: 'Kelebihan Jam Mengajar Praktikum Mesin Listrik & PLC (4 SKS)',
    volume: 4,
    satuan: 'SKS',
    tarifSatuan: 300000,
    totalBruto: 1200000,
    potonganPph21: 60000,
    totalNetto: 1140000,
    status: 'Sudah Ditransfer',
    periodeBulan: 'September 2026',
    tanggalPencairan: '2026-10-05',
    nomorRekening: '0310-9944-22',
    namaBank: 'Bank BNI Cab. Jambi'
  }
];

export const INITIAL_ANGGARAN_PRODI_LAB: AnggaranProdiLab[] = [
  {
    id: 'ANG-SPL-LAB',
    prodiId: 'SIPIL',
    namaPosAnggaran: 'Bahan Habis Pakai & Kalibrasi Alat Lab Sipil (Bahan Beton & Hidrolika)',
    kategori: 'Praktikum & Laboratorium',
    paguAnggaran: 45000000,
    realisasiTerpakai: 36500000,
    sisaAnggaran: 8500000,
    persentaseSerapan: 81.1,
    penanggungJawab: 'Laboran Sipil & Ir. Suhendra, M.T.'
  },
  {
    id: 'ANG-SPL-OPS',
    prodiId: 'SIPIL',
    namaPosAnggaran: 'Operasional Program Studi & Evaluasi Kurikulum OBE Sipil',
    kategori: 'Operasional Prodi',
    paguAnggaran: 25000000,
    realisasiTerpakai: 18200000,
    sisaAnggaran: 6800000,
    persentaseSerapan: 72.8,
    penanggungJawab: 'Ir. Rioni Rizki Aldiansyah, ST., MT'
  },
  {
    id: 'ANG-LKG-LAB',
    prodiId: 'LINGKUNGAN',
    namaPosAnggaran: 'Reagen Kimia & Spektrofotometer Lab Kualitas Lingkungan & Air Limbah',
    kategori: 'Praktikum & Laboratorium',
    paguAnggaran: 38000000,
    realisasiTerpakai: 29800000,
    sisaAnggaran: 8200000,
    persentaseSerapan: 78.4,
    penanggungJawab: 'Peppy Herawati, S.T., M.T.'
  },
  {
    id: 'ANG-LST-LAB',
    prodiId: 'LISTRIK_D3',
    namaPosAnggaran: 'Komponen Panel PLC & Instalasi Tenaga Bengkel Listrik Vokasi',
    kategori: 'Praktikum & Laboratorium',
    paguAnggaran: 32000000,
    realisasiTerpakai: 27400000,
    sisaAnggaran: 4600000,
    persentaseSerapan: 85.6,
    penanggungJawab: 'Ir. Hendi Matalata, ST., MT'
  },
  {
    id: 'ANG-FT-MHS',
    prodiId: 'UMUM',
    namaPosAnggaran: 'Hibah Pembinaan Prestasi Lomba Mahasiswa & LKTI Dekanat FT',
    kategori: 'Kegiatan Mahasiswa',
    paguAnggaran: 30000000,
    realisasiTerpakai: 21500000,
    sisaAnggaran: 8500000,
    persentaseSerapan: 71.7,
    penanggungJawab: 'Ir. Riki Saputra., ST., MT (Wadek III)'
  }
];

// =========================================================================
// DATA TREN REALISASI ANGGARAN PER PROGRAM STUDI FT UNBARI (MULTI-TAHUN)
// =========================================================================
export const TREN_REALISASI_ANGGARAN_PRODI = [
  {
    tahun: '2024/2025',
    labelTahun: 'TA 2024/2025',
    sipilPagu: 65000000,
    sipilRealisasi: 58200000,
    lingkunganPagu: 52000000,
    lingkunganRealisasi: 46500000,
    listrikPagu: 42000000,
    listrikRealisasi: 38800000,
    umumPagu: 35000000,
    umumRealisasi: 29500000,
    totalPagu: 194000000,
    totalRealisasi: 173000000,
    persenTotal: 89.2
  },
  {
    tahun: '2025/2026',
    labelTahun: 'TA 2025/2026',
    sipilPagu: 68000000,
    sipilRealisasi: 62100000,
    lingkunganPagu: 55000000,
    lingkunganRealisasi: 50400000,
    listrikPagu: 45000000,
    listrikRealisasi: 41200000,
    umumPagu: 38000000,
    umumRealisasi: 33100000,
    totalPagu: 206000000,
    totalRealisasi: 186800000,
    persenTotal: 90.7
  },
  {
    tahun: '2026/2027',
    labelTahun: 'TA 2026/2027 (Berjalan)',
    sipilPagu: 70000000,
    sipilRealisasi: 54700000,
    lingkunganPagu: 58000000,
    lingkunganRealisasi: 44800000,
    listrikPagu: 48000000,
    listrikRealisasi: 40400000,
    umumPagu: 45000000,
    umumRealisasi: 32500000,
    totalPagu: 221000000,
    totalRealisasi: 172400000,
    persenTotal: 78.0
  }
];

// =========================================================================
// DATA PROYEKSI KEBUTUHAN DANA OPERASIONAL LABORATORIUM FT UNBARI
// Digunakan untuk perencanaan anggaran tahunan & alert deteksi defisit plafon
// =========================================================================
export const INITIAL_PROYEKSI_KEBUTUHAN_LAB = [
  {
    id: 'PRY-LAB-SPL-01',
    labId: 'LAB-STRUKTUR',
    namaLab: 'Lab Uji Bahan Struktur & Beton (SPL-101)',
    prodiId: 'SIPIL' as const,
    kepalaLab: 'Laboran Sipil & Ir. Suhendra, M.T.',
    sisaPlafonTersedia: 4500000,
    proyeksiKebutuhan: 5600000,
    rincianKebutuhan: {
      bahanHabisPakai: 2800000,
      kalibrasiPemeliharaan: 1800000,
      k3DanPenggantianAlat: 500000,
      lisensiSoftware: 500000
    },
    catatanKebutuhan: 'Lonjakan pengujian kuat tekan beton silinder praktikum 6 kelas dan 14 pengujian skripsi mahasiswa.',
    prioritas: 'Tinggi' as const
  },
  {
    id: 'PRY-LAB-SPL-02',
    labId: 'LAB-MEKTAN',
    namaLab: 'Lab Mekanika Tanah & Hidrolika (SPL-102/103)',
    prodiId: 'SIPIL' as const,
    kepalaLab: 'Dr. Ahmad Fauzi, S.T., M.T.',
    sisaPlafonTersedia: 4000000,
    proyeksiKebutuhan: 4200000,
    rincianKebutuhan: {
      bahanHabisPakai: 1700000,
      kalibrasiPemeliharaan: 1500000,
      k3DanPenggantianAlat: 400000,
      lisensiSoftware: 600000
    },
    catatanKebutuhan: 'Pengadaan sampel tanah lempung Sungai Batanghari & kalibrasi proving ring geser langsung.',
    prioritas: 'Tinggi' as const
  },
  {
    id: 'PRY-LAB-LKG-01',
    labId: 'LAB-KUALITAS-AIR',
    namaLab: 'Lab Kualitas Air & Kimia Lingkungan (LKG-201)',
    prodiId: 'LINGKUNGAN' as const,
    kepalaLab: 'Peppy Herawati, S.T., M.T.',
    sisaPlafonTersedia: 4800000,
    proyeksiKebutuhan: 5100000,
    rincianKebutuhan: {
      bahanHabisPakai: 2600000,
      kalibrasiPemeliharaan: 1400000,
      k3DanPenggantianAlat: 600000,
      lisensiSoftware: 500000
    },
    catatanKebutuhan: 'Reagen spektrofotometer COD/BOD, buffer asam pH, dan penggantian elektroda DO meter.',
    prioritas: 'Tinggi' as const
  },
  {
    id: 'PRY-LAB-LKG-02',
    labId: 'LAB-PENGOLAHAN-LIMBAH',
    namaLab: 'Studio AMDAL & Pengolahan Limbah PKS (LKG-101/301)',
    prodiId: 'LINGKUNGAN' as const,
    kepalaLab: 'Hadrah, ST., MT',
    sisaPlafonTersedia: 3400000,
    proyeksiKebutuhan: 3500000,
    rincianKebutuhan: {
      bahanHabisPakai: 1200000,
      kalibrasiPemeliharaan: 800000,
      k3DanPenggantianAlat: 500000,
      lisensiSoftware: 1000000
    },
    catatanKebutuhan: 'Penyusunan peta studio AMDAL terpadu, perpanjangan lisensi WaterCAD dan aerator lab.',
    prioritas: 'Sedang' as const
  },
  {
    id: 'PRY-LAB-LST-01',
    labId: 'WS-INSTALASI-LISTRIK',
    namaLab: 'Bengkel Instalasi Tenaga Listrik & Mesin (LST-102)',
    prodiId: 'LISTRIK_D3' as const,
    kepalaLab: 'Ir. Hendi Matalata, ST., MT',
    sisaPlafonTersedia: 2600000,
    proyeksiKebutuhan: 2900000,
    rincianKebutuhan: {
      bahanHabisPakai: 1600000,
      kalibrasiPemeliharaan: 700000,
      k3DanPenggantianAlat: 400000,
      lisensiSoftware: 200000
    },
    catatanKebutuhan: 'Kabel NYA/NYM instalasi gedung, pemutus daya MCB 3 fasa, dan kalibrasi Megger tester.',
    prioritas: 'Tinggi' as const
  },
  {
    id: 'PRY-LAB-LST-02',
    labId: 'LAB-PLC-OTOMASI',
    namaLab: 'Lab Otomasi Industri & PLC (LST-201)',
    prodiId: 'LISTRIK_D3' as const,
    kepalaLab: 'Leily Wustha Johar, ST., MT',
    sisaPlafonTersedia: 2000000,
    proyeksiKebutuhan: 2300000,
    rincianKebutuhan: {
      bahanHabisPakai: 800000,
      kalibrasiPemeliharaan: 600000,
      k3DanPenggantianAlat: 300000,
      lisensiSoftware: 600000
    },
    catatanKebutuhan: 'Uji sertifikasi kompetensi kejuruan PLC mahasiswa D3 dan modul trainer Omron.',
    prioritas: 'Tinggi' as const
  }
];

export interface PlafonProgressBarMeta {
  ratioPercent: number;
  barColorClass: string;
  gradientClass: string;
  textColorClass: string;
  badgeColorClass: string;
  statusLabel: string;
  isMelampaui: boolean;
  isMendekati: boolean;
  pulse: boolean;
}

/**
 * Menghitung status dan gradasi warna progress bar (hijau ke kuning/oranye ke merah)
 * saat proyeksi kebutuhan lab mendekati atau melampaui batas plafon anggaran semester berjalan.
 */
export const getPlafonProgressBarMeta = (proyeksi: number, plafon: number): PlafonProgressBarMeta => {
  const ratio = plafon > 0 ? (proyeksi / plafon) * 100 : (proyeksi > 0 ? 100 : 0);
  const isMelampaui = ratio >= 100;
  const isMendekati = ratio >= 80 && ratio < 100;

  if (ratio >= 100) {
    return {
      ratioPercent: ratio,
      barColorClass: 'bg-red-600',
      gradientClass: 'from-rose-500 via-red-600 to-rose-700',
      textColorClass: 'text-red-600',
      badgeColorClass: 'bg-red-100 text-red-800 border-red-200',
      statusLabel: 'Melampaui Plafon (Defisit)',
      isMelampaui: true,
      isMendekati: false,
      pulse: true
    };
  } else if (ratio >= 90) {
    return {
      ratioPercent: ratio,
      barColorClass: 'bg-orange-500',
      gradientClass: 'from-orange-500 to-red-500',
      textColorClass: 'text-orange-600',
      badgeColorClass: 'bg-orange-100 text-orange-800 border-orange-200',
      statusLabel: 'Kritis Mendekati Plafon (>90%)',
      isMelampaui: false,
      isMendekati: true,
      pulse: false
    };
  } else if (ratio >= 80) {
    return {
      ratioPercent: ratio,
      barColorClass: 'bg-amber-500',
      gradientClass: 'from-amber-400 to-amber-500',
      textColorClass: 'text-amber-600',
      badgeColorClass: 'bg-amber-100 text-amber-800 border-amber-200',
      statusLabel: 'Mendekati Plafon (Siaga)',
      isMelampaui: false,
      isMendekati: true,
      pulse: false
    };
  } else if (ratio >= 60) {
    return {
      ratioPercent: ratio,
      barColorClass: 'bg-emerald-500',
      gradientClass: 'from-emerald-400 to-emerald-500',
      textColorClass: 'text-emerald-700',
      badgeColorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      statusLabel: 'Normal (Terkendali)',
      isMelampaui: false,
      isMendekati: false,
      pulse: false
    };
  } else {
    return {
      ratioPercent: ratio,
      barColorClass: 'bg-teal-500',
      gradientClass: 'from-teal-400 to-emerald-500',
      textColorClass: 'text-teal-700',
      badgeColorClass: 'bg-teal-100 text-teal-800 border-teal-200',
      statusLabel: 'Sangat Aman (<60%)',
      isMelampaui: false,
      isMendekati: false,
      pulse: false
    };
  }
};


