import { AuditSidakKehadiran } from '../types/index';

export const INITIAL_AUDIT_SIDAK: AuditSidakKehadiran[] = [
  {
    id: 'SDK-2026-001',
    nomorBeritaAcara: 'BA-SIDAK/FT-UNBARI/2026/X/014',
    tanggal: '2026-10-27',
    jam: '08:45 WIB',
    hari: 'Senin',
    prodiId: 'SIPIL',
    jadwalId: 'JAD-SPL-01',
    kodeMK: 'TS-203',
    namaMK: 'Mekanika Rekayasa III (Analisis Struktur Statis Tak Tentu)',
    kelas: '3-SP-A',
    ruanganNama: 'Ruang Kuliah Teori Gedung E (E-201)',
    dosenNama: 'Ir. Rioni Rizki Aldiansyah, ST., MT, IPM, ASEAN Eng.',
    dosenNidn: '1023058401',
    auditorNama: 'Ir. Suhendra, M.T.',
    auditorJabatan: 'Ketua Gugus Kendali Mutu (GKM) FT UNBARI',
    totalMahasiswaKelas: 18,
    jumlahHadir: 15,
    jumlahIzin: 1,
    jumlahSakit: 0,
    jumlahAlpa: 2,
    persentaseKehadiranSidak: 83.3,
    statusKesesuaianDosen: 'Tepat Waktu',
    catatanAudit: 'Dosen hadir tepat waktu dan perkuliahan berjalan interaktif membahas metode matriks kekakuan. 2 mahasiswa tidak hadir tanpa keterangan (Alpa) dan diproses sanksi presensi.',
    rekomendasiTindakLanjut: 'Penerbitan Surat Peringatan (SP) untuk mahasiswa dengan kehadiran kumulatif < 75% agar memenuhi kualifikasi kepesertaan UAS Gasal 2026/2027.',
    detailPresensi: [
      {
        nim: '211011551032',
        nama: 'Rizky Alamsyah Pratama',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 97,
        kehadiranAkhirPersen: 97,
        catatan: 'Hadir aktif berdiskusi'
      },
      {
        nim: '221011551054',
        nama: 'Annisa Farah Diba',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 96,
        kehadiranAkhirPersen: 96,
        catatan: 'Hadir di baris depan'
      },
      {
        nim: '231011551078',
        nama: 'Gilang Ramadhan',
        statusPresensi: 'Alpa',
        kehadiranAwalPersen: 65,
        kehadiranAkhirPersen: 60,
        catatan: 'Tidak hadir tanpa kabar (Alpa terjaring sidak)',
        isPeringatanDiterbitkan: true
      },
      {
        nim: '191011551009',
        nama: 'Bayu Danang Nugroho',
        statusPresensi: 'Alpa',
        kehadiranAwalPersen: 68,
        kehadiranAkhirPersen: 63,
        catatan: 'Alpa. Presensi di bawah 65%, terancam tidak lulus mata kuliah',
        isPeringatanDiterbitkan: true
      },
      {
        nim: '221011551012',
        nama: 'Muhammad Fauzan',
        statusPresensi: 'Izin',
        kehadiranAwalPersen: 85,
        kehadiranAkhirPersen: 85,
        catatan: 'Izin dispensasi kepanitiaan lomba rancang jembatan'
      },
      {
        nim: '231011551005',
        nama: 'Ahmad Syahputra',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 90,
        kehadiranAkhirPersen: 90
      },
      {
        nim: '231011551006',
        nama: 'Budi Santoso',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 92,
        kehadiranAkhirPersen: 92
      },
      {
        nim: '231011551011',
        nama: 'Cindy Claudia',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 88,
        kehadiranAkhirPersen: 88
      },
      {
        nim: '231011551015',
        nama: 'Dodi Pratama',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 80,
        kehadiranAkhirPersen: 80
      },
      {
        nim: '231011551020',
        nama: 'Eka Nurcahya',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 95,
        kehadiranAkhirPersen: 95
      },
      {
        nim: '231011551022',
        nama: 'Fajar Maulana',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 88,
        kehadiranAkhirPersen: 88
      },
      {
        nim: '231011551025',
        nama: 'Gita Permatasari',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 94,
        kehadiranAkhirPersen: 94
      },
      {
        nim: '231011551028',
        nama: 'Hari Setiawan',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 86,
        kehadiranAkhirPersen: 86
      },
      {
        nim: '231011551030',
        nama: 'Indah Puspita',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 92,
        kehadiranAkhirPersen: 92
      },
      {
        nim: '231011551033',
        nama: 'Joko Prabowo',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 85,
        kehadiranAkhirPersen: 85
      },
      {
        nim: '231011551035',
        nama: 'Kiki Amalia',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 90,
        kehadiranAkhirPersen: 90
      },
      {
        nim: '231011551040',
        nama: 'Lukman Hakim',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 91,
        kehadiranAkhirPersen: 91
      },
      {
        nim: '231011551042',
        nama: 'Mega Utami',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 89,
        kehadiranAkhirPersen: 89
      }
    ],
    peringatanGeneratedIds: ['WRN-SPL-02']
  },
  {
    id: 'SDK-2026-002',
    nomorBeritaAcara: 'BA-SIDAK/FT-UNBARI/2026/X/018',
    tanggal: '2026-10-28',
    jam: '10:15 WIB',
    hari: 'Selasa',
    prodiId: 'LINGKUNGAN',
    jadwalId: 'JAD-LKG-02',
    kodeMK: 'TL-3101',
    namaMK: 'Rekayasa Penyediaan Air Minum (RPAM)',
    kelas: '3-LK-A',
    ruanganNama: 'Studio Perencanaan & AMDAL (D-301)',
    dosenNama: 'Peppy Herawati, S.T., M.T.',
    dosenNidn: '1014028301',
    auditorNama: 'Ir. Marhadi, ST., MT',
    auditorJabatan: 'Ketua Program Studi S-1 Teknik Lingkungan',
    totalMahasiswaKelas: 12,
    jumlahHadir: 11,
    jumlahIzin: 0,
    jumlahSakit: 0,
    jumlahAlpa: 1,
    persentaseKehadiranSidak: 91.7,
    statusKesesuaianDosen: 'Tepat Waktu',
    catatanAudit: 'Perkuliahan menghitung dimensi intake sungai Batanghari berjalan kondusif. Satu mahasiswa tidak hadir (M. Ilham Fauzan) tanpa surat izin.',
    rekomendasiTindakLanjut: 'Peringatan presensi rendah dikirim ke Dosen PA dan orang tua mahasiswa.',
    detailPresensi: [
      {
        nim: '211021551018',
        nama: 'Dewi Sekar Arum',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 98,
        kehadiranAkhirPersen: 98
      },
      {
        nim: '221021551041',
        nama: 'Farhan Maulana',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 94,
        kehadiranAkhirPersen: 94
      },
      {
        nim: '191021551005',
        nama: 'Muhammad Ilham Fauzan',
        statusPresensi: 'Alpa',
        kehadiranAwalPersen: 64,
        kehadiranAkhirPersen: 59,
        catatan: 'Terjaring Alpa Sidak. Presensi turun ke 59% (kritis DO)',
        isPeringatanDiterbitkan: true
      },
      {
        nim: '221021551062',
        nama: 'Sarah Nabilah',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 92,
        kehadiranAkhirPersen: 92
      },
      {
        nim: '2300825201001',
        nama: 'WIKE OLAVIA',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 91,
        kehadiranAkhirPersen: 91
      },
      {
        nim: '2300825201002',
        nama: 'PUTRI AMALIA',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 95,
        kehadiranAkhirPersen: 95
      },
      {
        nim: '2300825201003',
        nama: 'BARIQ NABIL PERMANA',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 89,
        kehadiranAkhirPersen: 89
      },
      {
        nim: '2300825201005',
        nama: 'ARIMBI HESTANTI',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 93,
        kehadiranAkhirPersen: 93
      },
      {
        nim: '2300825201008',
        nama: 'PUTRI INAYAH',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 90,
        kehadiranAkhirPersen: 90
      },
      {
        nim: '2300825201010',
        nama: 'OEL TARADEPA',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 88,
        kehadiranAkhirPersen: 88
      },
      {
        nim: '2300825201012',
        nama: 'RIDO AGUS SAPUTRA',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 90,
        kehadiranAkhirPersen: 90
      },
      {
        nim: '2300825201015',
        nama: 'NYIMAS SUCI AFRIANI',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 94,
        kehadiranAkhirPersen: 94
      }
    ],
    peringatanGeneratedIds: ['WRN-LKG-01']
  },
  {
    id: 'SDK-2026-003',
    nomorBeritaAcara: 'BA-SIDAK/FT-UNBARI/2026/X/021',
    tanggal: '2026-10-29',
    jam: '14:00 WIB',
    hari: 'Senin',
    prodiId: 'LISTRIK_D3',
    jadwalId: 'JAD-LST-04',
    kodeMK: 'TEL-3204',
    namaMK: 'Sistem Proteksi Gardu Induk 150 kV Jambi',
    kelas: '3-EL-5B',
    ruanganNama: 'Ruang Teori Kelistrikan Vokasi UNBARI',
    dosenNama: 'Fadli Eka Yandra, ST., MT',
    dosenNidn: '1004077102',
    auditorNama: 'Ir. Hendi Matalata, ST., MT, IPP',
    auditorJabatan: 'Ketua Program Studi D-3 Teknik Listrik',
    totalMahasiswaKelas: 12,
    jumlahHadir: 10,
    jumlahIzin: 1,
    jumlahSakit: 0,
    jumlahAlpa: 1,
    persentaseKehadiranSidak: 83.3,
    statusKesesuaianDosen: 'Tepat Waktu',
    catatanAudit: 'Perkuliahan koordinasi OCR & GFR berjalan sangat baik dengan modul simulator relay. 1 mahasiswa Alpa (Hendri Kurniawan) yang telah berstatus semester 7.',
    rekomendasiTindakLanjut: 'Diberikan peringatan evaluasi studi dan pemanggilan khusus ke ruang Kaprodi D3 Listrik.',
    detailPresensi: [
      {
        nim: '230031551015',
        nama: 'Aditya Bagas Wicaksono',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 99,
        kehadiranAkhirPersen: 99
      },
      {
        nim: '240031551029',
        nama: 'Rian Prasetyo',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 95,
        kehadiranAkhirPersen: 95
      },
      {
        nim: '220031551004',
        nama: 'Hendri Kurniawan',
        statusPresensi: 'Alpa',
        kehadiranAwalPersen: 65,
        kehadiranAkhirPersen: 60,
        catatan: 'Alpa saat sidak. Kehadiran 60% (syarat minimal UAS 75%)',
        isPeringatanDiterbitkan: true
      },
      {
        nim: '230031551038',
        nama: 'Danu Setiawan',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 91,
        kehadiranAkhirPersen: 91
      },
      {
        nim: '2400820403002',
        nama: 'INDAH PRIHARTINI QHOFSHOH',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 93,
        kehadiranAkhirPersen: 93
      },
      {
        nim: '2400820403004',
        nama: 'RIRIN MEGAWATI',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 92,
        kehadiranAkhirPersen: 92
      },
      {
        nim: '2400820403007',
        nama: 'ARDI KUSUMA SYAFULLA',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 88,
        kehadiranAkhirPersen: 88
      },
      {
        nim: '2400820403008',
        nama: 'ADITYA NURWAN PRASETYA',
        statusPresensi: 'Izin',
        kehadiranAwalPersen: 86,
        kehadiranAkhirPersen: 86,
        catatan: 'Izin urusan kedinasan'
      },
      {
        nim: '2400820403011',
        nama: 'FERDI DWI BUSTIAN',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 90,
        kehadiranAkhirPersen: 90
      },
      {
        nim: '2400820403012',
        nama: 'M. ALFA REZI',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 89,
        kehadiranAkhirPersen: 89
      },
      {
        nim: '2600820403001',
        nama: 'ADIANSA. S',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 94,
        kehadiranAkhirPersen: 94
      },
      {
        nim: '2600820403002',
        nama: 'MUHAMMAD AZIS HARYANTO',
        statusPresensi: 'Hadir',
        kehadiranAwalPersen: 96,
        kehadiranAkhirPersen: 96
      }
    ],
    peringatanGeneratedIds: ['WRN-LST-01']
  }
];
