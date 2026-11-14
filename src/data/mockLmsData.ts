import { LmsKelasKuliah } from '../types';

export const initialLmsKelasList: LmsKelasKuliah[] = [
  {
    id: 'lms-ts-301',
    prodiId: 'SIPIL',
    kodeMK: 'TS-301',
    namaMK: 'Rekayasa Struktur Beton Bertulang II',
    sks: 3,
    semester: 5,
    tahunAkademik: '2025/2026 Ganjil',
    kelas: 'Kelas A',
    hari: 'Senin',
    jamMulai: '08:00',
    jamSelesai: '10:30',
    ruanganNama: 'Ruang Kuliah R.302 (Lantai 3 FT)',
    dosenNidn: '0012047801',
    dosenNama: 'Dr. Ir. H. Fakhrurrazi, M.T.',
    dosenEmail: 'fakhrurrazi@universitasbatanghari.ac.id',
    deskripsiMK: 'Mata kuliah inti Teknik Sipil yang membahas analisis dan perancangan komponen struktur beton bertulang (balok lentur murni, geser dan torsi, kolom langsing biaksial, pelat dua arah, dan fondasi telapak) sesuai SNI 2847:2019.',
    silabusRpsUrl: 'https://universitasbatanghari.ac.id/ft/rps/TS-301-Beton-II.pdf',
    googleClassroomCode: 'unbari-sipil-301a',
    googleClassroomId: 'c-662910481',
    googleMeetLink: 'https://meet.google.com/ftu-tsbb-kmb',
    totalPertemuanTarget: 16,
    pertemuanSelesaiCount: 10,
    pesertaCount: 28,
    pertemuanList: [
      {
        id: 'p-1',
        pertemuanKe: 1,
        tanggal: '2025-09-08',
        topik: 'Kontrak Perkuliahan, RPS & Filosofi Desain SNI 2847:2019',
        subTopik: 'Metode ASD vs LRFD, kuat nominal, kuat perlu, dan faktor reduksi kekuatan phi',
        cpmkTarget: 'CPMK-1 (CPL IABEE Kriteria 3.a - Kemampuan Menerapkan Prinsip Rekayasa)',
        metode: 'Tatap Muka',
        status: 'Selesai',
        materiList: [
          { id: 'm-1-1', judul: 'Slide RPS & Kontrak Kuliah Beton Bertulang II', tipe: 'PPTX', fileSize: '4.2 MB' },
          { id: 'm-1-2', judul: 'Ringkasan SNI 2847:2019 Persyaratan Beton Struktural', tipe: 'PDF', fileSize: '12.5 MB' }
        ],
        kehadiranHadir: 28,
        kehadiranSakit: 0,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 28,
        catatanDosen: 'Seluruh mahasiswa hadir, pengantar konsep batas ultimit dan kemampuan layan tersampaikan.'
      },
      {
        id: 'p-2',
        pertemuanKe: 2,
        tanggal: '2025-09-15',
        topik: 'Analisis Lentur Balok Tulangan Tunggal & Ganda',
        subTopik: 'Diagram regangan regangan ekuivalen Whitney, balok over-reinforced vs under-reinforced',
        cpmkTarget: 'CPMK-1, CPMK-2 (CPL IABEE 3.a & 3.b)',
        metode: 'Tatap Muka',
        status: 'Selesai',
        materiList: [
          { id: 'm-2-1', judul: 'Modul Teori Lentur Balok Bertulang Ganda', tipe: 'PDF', fileSize: '3.1 MB' },
          { id: 'm-2-2', judul: 'Lembar Spreadsheet Excel Kalkulasi Mn Balok', tipe: 'Link', fileUrl: 'https://docs.google.com/spreadsheets/d/beton-mn-sheet' }
        ],
        kehadiranHadir: 27,
        kehadiranSakit: 1,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 28,
        catatanDosen: 'Latihan soal balok T dan balok tulangan ganda berjalan aktif di papan tulis.'
      },
      {
        id: 'p-3',
        pertemuanKe: 3,
        tanggal: '2025-09-22',
        topik: 'Desain Kuat Geser Balok dan Sengkang Vertikal',
        subTopik: 'Mekanisme retak diagonal geser, kontribusi kuat geser beton (Vc) dan baja sengkang (Vs)',
        cpmkTarget: 'CPMK-2 (CPL IABEE 3.b - Desain Komponen Rekayasa Struktur)',
        metode: 'Tatap Muka',
        status: 'Selesai',
        materiList: [
          { id: 'm-3-1', judul: 'Slide Mekanisme Keruntuhan Geser & Desain Begel', tipe: 'PPTX', fileSize: '5.8 MB' }
        ],
        kehadiranHadir: 26,
        kehadiranSakit: 0,
        kehadiranIzin: 2,
        kehadiranAlpa: 0,
        totalMahasiswa: 28,
        catatanDosen: 'Mahasiswa mengerjakan penentuan jarak sengkang maksimum sesuai pasal SNI.'
      },
      {
        id: 'p-4',
        pertemuanKe: 4,
        tanggal: '2025-09-29',
        topik: 'Kombinasi Geser & Torsi pada Balok Tepi (Spandrel)',
        subTopik: 'Torsi kompatibilitas vs torsi kesetimbangan, model analogi rangka batang ruang',
        cpmkTarget: 'CPMK-2 (CPL IABEE 3.b)',
        metode: 'Hybrid',
        status: 'Selesai',
        materiList: [
          { id: 'm-4-1', judul: 'Modul Analisis Torsi Kompatibilitas SNI 2847', tipe: 'PDF', fileSize: '2.9 MB' },
          { id: 'm-4-2', judul: 'Rekaman Sesi Google Meet - Torsi Spandrel', tipe: 'Video', fileSize: '145 MB' }
        ],
        kehadiranHadir: 27,
        kehadiranSakit: 0,
        kehadiranIzin: 0,
        kehadiranAlpa: 1,
        totalMahasiswa: 28
      },
      {
        id: 'p-5',
        pertemuanKe: 5,
        tanggal: '2025-10-06',
        topik: 'Perancangan Pelat Satu Arah & Dua Arah (Metode Desain Langsung)',
        subTopik: 'Pembagian jalur kolom dan jalur tengah, momen desain statis Mo dan distribusi momen',
        cpmkTarget: 'CPMK-3 (CPL IABEE 3.c - Analisis Sistem Rekayasa Sipil)',
        metode: 'Tatap Muka',
        status: 'Selesai',
        materiList: [
          { id: 'm-5-1', judul: 'Slide Metode Desain Langsung (DDM) Pelat Dua Arah', tipe: 'PPTX', fileSize: '6.4 MB' }
        ],
        kehadiranHadir: 28,
        kehadiranSakit: 0,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 28
      },
      {
        id: 'p-6',
        pertemuanKe: 6,
        tanggal: '2025-10-13',
        topik: 'Metode Rangka Ekivalen (EFM) untuk Pelat Tanpa Balok',
        subTopik: 'Flat slab, drop panel, dan periksa geser pons (two-way shear critical perimeter)',
        cpmkTarget: 'CPMK-3 (CPL IABEE 3.c)',
        metode: 'Tatap Muka',
        status: 'Selesai',
        materiList: [
          { id: 'm-6-1', judul: 'Diktat Geser Pons & Drop Panel Konstruksi Gedung', tipe: 'PDF', fileSize: '4.8 MB' }
        ],
        kehadiranHadir: 26,
        kehadiranSakit: 1,
        kehadiranIzin: 1,
        kehadiranAlpa: 0,
        totalMahasiswa: 28
      },
      {
        id: 'p-7',
        pertemuanKe: 7,
        tanggal: '2025-10-20',
        topik: 'Review Persiapan UTS & Studi Kasus Gedung Bertingkat 5 Lantai',
        subTopik: 'Integrasi pembebanan gravitasi, lendutan layan, dan drift lateral antar lantai',
        cpmkTarget: 'CPMK-1, CPMK-2, CPMK-3',
        metode: 'Tatap Muka',
        status: 'Selesai',
        materiList: [
          { id: 'm-7-1', judul: 'Kompilasi Soal Latihan UTS Beton Bertulang II', tipe: 'PDF', fileSize: '1.9 MB' }
        ],
        kehadiranHadir: 28,
        kehadiranSakit: 0,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 28
      },
      {
        id: 'p-8',
        pertemuanKe: 8,
        tanggal: '2025-10-27',
        topik: 'Ujian Tengah Semester (UTS) Tertulis & Analisis Kasus',
        subTopik: 'Evaluasi CPMK-1, CPMK-2, dan CPMK-3 (Open SNI 2847:2019)',
        cpmkTarget: 'CPMK-1 s.d CPMK-3 (Evaluasi Capaian Pembelajaran)',
        metode: 'Tatap Muka',
        status: 'Selesai',
        materiList: [
          { id: 'm-8-1', judul: 'Naskah Soal UTS Rekayasa Struktur Beton Bertulang II', tipe: 'PDF', fileSize: '1.1 MB' }
        ],
        kehadiranHadir: 28,
        kehadiranSakit: 0,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 28,
        catatanDosen: 'UTS terlaksana dengan tertib dan diawasi 2 pengawas ruang.'
      },
      {
        id: 'p-9',
        pertemuanKe: 9,
        tanggal: '2025-11-03',
        topik: 'Analisis & Desain Kolom Pendek Aksial-Lentur',
        subTopik: 'Diagram Interaksi P-M, kondisi seimbang (balanced failure), eksentrisitas minimum',
        cpmkTarget: 'CPMK-4 (CPL IABEE 3.d - Desain Komponen Tekan Kolom)',
        metode: 'Tatap Muka',
        status: 'Selesai',
        materiList: [
          { id: 'm-9-1', judul: 'Slide Pembuatan Diagram Interaksi P-M Kolom Persegi & Bulat', tipe: 'PPTX', fileSize: '7.1 MB' }
        ],
        kehadiranHadir: 27,
        kehadiranSakit: 0,
        kehadiranIzin: 1,
        kehadiranAlpa: 0,
        totalMahasiswa: 28
      },
      {
        id: 'p-10',
        pertemuanKe: 10,
        tanggal: '2025-11-10',
        topik: 'Pengaruh Kelangsingan Kolom (Slenderness Effects) & Magnifikasi Momen',
        subTopik: 'Sway frame vs non-sway frame, perhitungan jari-jari girasi r, kekakuan EI ekuivalen',
        cpmkTarget: 'CPMK-4 (CPL IABEE 3.d)',
        metode: 'Tatap Muka',
        status: 'Selesai',
        materiList: [
          { id: 'm-10-1', judul: 'Modul Perhitungan Magnifikasi Momen Mc Kolom Langsing', tipe: 'PDF', fileSize: '3.6 MB' }
        ],
        kehadiranHadir: 28,
        kehadiranSakit: 0,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 28
      },
      {
        id: 'p-11',
        pertemuanKe: 11,
        tanggal: '2025-11-17',
        topik: 'Desain Kolom dengan Beban Lentur Biaksial (Metode Bresler)',
        subTopik: 'Resiprokal Bresler dan metode kontur beban PCA untuk kolom sudut gedung',
        cpmkTarget: 'CPMK-4',
        metode: 'Tatap Muka',
        status: 'Terjadwal',
        materiList: [
          { id: 'm-11-1', judul: 'Draf Materi Kolom Biaksial Metode Beban Resiprokal Bresler', tipe: 'PDF', fileSize: '2.5 MB' }
        ],
        kehadiranHadir: 0,
        kehadiranSakit: 0,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 28
      },
      {
        id: 'p-12',
        pertemuanKe: 12,
        tanggal: '2025-11-24',
        topik: 'Perancangan Fondasi Telapak Dangkal (Isolated Footing)',
        subTopik: 'Tegangan kontak tanah izin, tebal kritis geser satu arah dan dua arah pons',
        cpmkTarget: 'CPMK-5 (CPL IABEE 3.e - Desain Sub-struktur Fondasi)',
        metode: 'Tatap Muka',
        status: 'Terjadwal',
        materiList: [],
        kehadiranHadir: 0,
        kehadiranSakit: 0,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 28
      },
      {
        id: 'p-13',
        pertemuanKe: 13,
        tanggal: '2025-12-01',
        topik: 'Perancangan Fondasi Gabungan (Combined Footing) & Raft Foundation',
        subTopik: 'Titik berat beban resultan dan distribusi momen lentur memanjang',
        cpmkTarget: 'CPMK-5',
        metode: 'Tatap Muka',
        status: 'Terjadwal',
        materiList: [],
        kehadiranHadir: 0,
        kehadiranSakit: 0,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 28
      },
      {
        id: 'p-14',
        pertemuanKe: 14,
        tanggal: '2025-12-08',
        topik: 'Detailing Penulangan Tahan Gempa (SRPMK) Sesuai Bab 18 SNI 2847',
        subTopik: 'Strong column weak beam, detailing joint balok-kolom, spasi sengkang ikat confinement',
        cpmkTarget: 'CPMK-6 (CPL IABEE 3.f - Mitigasi Bahaya Gempa & Keberlanjutan)',
        metode: 'Tatap Muka',
        status: 'Terjadwal',
        materiList: [],
        kehadiranHadir: 0,
        kehadiranSakit: 0,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 28
      },
      {
        id: 'p-15',
        pertemuanKe: 15,
        tanggal: '2025-12-15',
        topik: 'Ekspose & Asistensi Akhir Proyek Desain Gedung 5 Lantai',
        subTopik: 'Pemeriksaan kelengkapan gambar kerja DED dan laporan rekayasa mandiri',
        cpmkTarget: 'CPMK-1 s.d CPMK-6',
        metode: 'Tatap Muka',
        status: 'Terjadwal',
        materiList: [],
        kehadiranHadir: 0,
        kehadiranSakit: 0,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 28
      },
      {
        id: 'p-16',
        pertemuanKe: 16,
        tanggal: '2025-12-22',
        topik: 'Ujian Akhir Semester (UAS) & Ujian Komprehensif Desain',
        subTopik: 'Evaluasi komprehensif seluruh capaian pembelajaran mata kuliah',
        cpmkTarget: 'CPMK-1 s.d CPMK-6 (Kelulusan Mata Kuliah)',
        metode: 'Tatap Muka',
        status: 'Terjadwal',
        materiList: [],
        kehadiranHadir: 0,
        kehadiranSakit: 0,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 28
      }
    ],
    tugasList: [
      {
        id: 't-1',
        judul: 'Tugas 1: Analisis Lentur & Kapasitas Momen Balok T Sesuai SNI 2847:2019',
        tipe: 'Tugas Mandiri',
        pertemuanKe: 2,
        cpmk: 'CPMK-1 (Kuat Nominal Mn)',
        bobotPersen: 10,
        deadline: '2025-09-22 23:59 WIB',
        deskripsi: 'Hitung momen nominal Mn balok T interior bentang 8 meter dengan beban mati qD dan beban hidup qL yang ditentukan sesuai digit terakhir NIM mahasiswa.',
        pengumpulanList: [
          { id: 'sub-1', mahasiswaNim: '210101001', mahasiswaNama: 'Budi Santoso', tanggalKumpul: '2025-09-21 14:30', status: 'Sudah Mengumpulkan', nilai: 88, feedback: 'Analisis garis netral sangat tepat. Diagram regangan rapi.' },
          { id: 'sub-2', mahasiswaNim: '210101002', mahasiswaNama: 'Siti Rahmawati', tanggalKumpul: '2025-09-22 20:15', status: 'Sudah Mengumpulkan', nilai: 92, feedback: 'Sempurna, penentuan tebal sayap efektif tepat.' },
          { id: 'sub-3', mahasiswaNim: '210101003', mahasiswaNama: 'Ahmad Ridwan', tanggalKumpul: '2025-09-22 23:50', status: 'Sudah Mengumpulkan', nilai: 80, feedback: 'Periksa kembali perhitungan batas regangan tarik netral.' },
          { id: 'sub-4', mahasiswaNim: '210101004', mahasiswaNama: 'Dina Lestari', tanggalKumpul: '2025-09-21 09:00', status: 'Sudah Mengumpulkan', nilai: 85, feedback: 'Langkah perhitungan sistematis.' }
        ]
      },
      {
        id: 't-2',
        judul: 'Tugas 2: Desain Begel Geser dan Sengkang Torsi Balok Tepi Spandrel',
        tipe: 'Tugas Mandiri',
        pertemuanKe: 4,
        cpmk: 'CPMK-2 (Kuat Geser & Torsi)',
        bobotPersen: 10,
        deadline: '2025-10-06 23:59 WIB',
        deskripsi: 'Rancang spasi sengkang geser tertutup dan tulangan longitudinal tambahan untuk menahan torsi ultimit Tu = 45 kNm dan Vu = 120 kN.',
        pengumpulanList: [
          { id: 'sub-2-1', mahasiswaNim: '210101001', mahasiswaNama: 'Budi Santoso', tanggalKumpul: '2025-10-05 19:00', status: 'Sudah Mengumpulkan', nilai: 85 },
          { id: 'sub-2-2', mahasiswaNim: '210101002', mahasiswaNama: 'Siti Rahmawati', tanggalKumpul: '2025-10-06 11:20', status: 'Sudah Mengumpulkan', nilai: 90 },
          { id: 'sub-2-3', mahasiswaNim: '210101003', mahasiswaNama: 'Ahmad Ridwan', tanggalKumpul: '2025-10-06 22:40', status: 'Sudah Mengumpulkan', nilai: 78 }
        ]
      },
      {
        id: 't-3',
        judul: 'Kuis Online 1: Konsep Batas Ultimit, Geser & Pelat Dua Arah',
        tipe: 'Quiz Online',
        pertemuanKe: 6,
        cpmk: 'CPMK-1 & CPMK-2',
        bobotPersen: 10,
        deadline: '2025-10-18 21:00 WIB',
        deskripsi: 'Kuis daring melalui Google Forms & LMS terdiri dari 20 soal pilihan ganda analisis dan 2 soal essay singkat perancangan.',
        pengumpulanList: [
          { id: 'sub-3-1', mahasiswaNim: '210101001', mahasiswaNama: 'Budi Santoso', tanggalKumpul: '2025-10-18 20:45', status: 'Sudah Mengumpulkan', nilai: 84 },
          { id: 'sub-3-2', mahasiswaNim: '210101002', mahasiswaNama: 'Siti Rahmawati', tanggalKumpul: '2025-10-18 20:30', status: 'Sudah Mengumpulkan', nilai: 95 }
        ]
      },
      {
        id: 't-4',
        judul: 'Proyek Capstone Rekayasa: Perancangan Portal Gedung Tahan Gempa 5 Lantai',
        tipe: 'Proyek Rekayasa / Capstone',
        pertemuanKe: 15,
        cpmk: 'CPMK-1 s.d CPMK-6 (CPL IABEE Komprehensif)',
        bobotPersen: 25,
        deadline: '2025-12-15 17:00 WIB',
        deskripsi: 'Tugas besar kelompok (2-3 mahasiswa): Merancang struktur lengkap balok, kolom, pelat, dan fondasi dengan program bantu analisis struktur dan gambar DED AutoCAD.',
        pengumpulanList: [
          { id: 'sub-4-1', mahasiswaNim: '210101001', mahasiswaNama: 'Budi Santoso', tanggalKumpul: '2025-11-05 10:00', status: 'Sudah Mengumpulkan', nilai: 89, feedback: 'Draf bab 1-3 sangat baik, lanjutkan detail tulangan sambungan balok-kolom.' }
        ]
      }
    ],
    nilaiList: [
      {
        mahasiswaNim: '210101001',
        mahasiswaNama: 'Budi Santoso',
        angkatan: 2021,
        tugas: 86.5,
        kuis: 84,
        praktikum: 90,
        uts: 83,
        uas: 85,
        nilaiAkhir: 85.3,
        hurufMutu: 'A',
        angkaMutu: 4.0,
        statusKelulusan: 'Lulus',
        kehadiranPersen: 100
      },
      {
        mahasiswaNim: '210101002',
        mahasiswaNama: 'Siti Rahmawati',
        angkatan: 2021,
        tugas: 91.0,
        kuis: 95,
        praktikum: 92,
        uts: 88,
        uas: 90,
        nilaiAkhir: 90.5,
        hurufMutu: 'A',
        angkaMutu: 4.0,
        statusKelulusan: 'Lulus',
        kehadiranPersen: 100
      },
      {
        mahasiswaNim: '210101003',
        mahasiswaNama: 'Ahmad Ridwan',
        angkatan: 2021,
        tugas: 79.0,
        kuis: 75,
        praktikum: 82,
        uts: 74,
        uas: 78,
        nilaiAkhir: 77.2,
        hurufMutu: 'B+',
        angkaMutu: 3.5,
        statusKelulusan: 'Lulus',
        kehadiranPersen: 90
      },
      {
        mahasiswaNim: '210101004',
        mahasiswaNama: 'Dina Lestari',
        angkatan: 2021,
        tugas: 85.0,
        kuis: 82,
        praktikum: 88,
        uts: 80,
        uas: 82,
        nilaiAkhir: 82.7,
        hurufMutu: 'A',
        angkaMutu: 4.0,
        statusKelulusan: 'Lulus',
        kehadiranPersen: 100
      },
      {
        mahasiswaNim: '210101005',
        mahasiswaNama: 'Fajar Pratama',
        angkatan: 2021,
        tugas: 70.0,
        kuis: 68,
        praktikum: 75,
        uts: 65,
        uas: 70,
        nilaiAkhir: 69.3,
        hurufMutu: 'B-',
        angkaMutu: 2.75,
        statusKelulusan: 'Lulus',
        kehadiranPersen: 80
      },
      {
        mahasiswaNim: '210101006',
        mahasiswaNama: 'Rian Hidayat',
        angkatan: 2021,
        tugas: 62.0,
        kuis: 60,
        praktikum: 70,
        uts: 58,
        uas: 65,
        nilaiAkhir: 62.4,
        hurufMutu: 'C',
        angkaMutu: 2.0,
        statusKelulusan: 'Lulus',
        kehadiranPersen: 70
      },
      {
        mahasiswaNim: '210101007',
        mahasiswaNama: 'Putri Handayani',
        angkatan: 2021,
        tugas: 88.0,
        kuis: 86,
        praktikum: 90,
        uts: 84,
        uas: 86,
        nilaiAkhir: 86.4,
        hurufMutu: 'A',
        angkaMutu: 4.0,
        statusKelulusan: 'Lulus',
        kehadiranPersen: 100
      },
      {
        mahasiswaNim: '210101008',
        mahasiswaNama: 'Bayu Saputra',
        angkatan: 2021,
        tugas: 75.0,
        kuis: 72,
        praktikum: 80,
        uts: 70,
        uas: 74,
        nilaiAkhir: 73.8,
        hurufMutu: 'B',
        angkaMutu: 3.0,
        statusKelulusan: 'Lulus',
        kehadiranPersen: 90
      }
    ],
    diskusiList: [
      {
        id: 'd-1',
        judul: 'Pemberitahuan: Jadwal Pengumpulan Draft Bab Kolom dan Asistensi Studio',
        pengirimNama: 'Dr. Ir. H. Fakhrurrazi, M.T.',
        pengirimRole: 'Dosen',
        waktu: '2025-11-04 09:30',
        isi: 'Selamat pagi rekan-rekan mahasiswa. Mohon dipersiapkan perhitungan diagram interaksi P-M kolom untuk diasistensikan pada pertemuan ke-11. Format laporan mengikuti template standar FT UNBARI.',
        isPinned: true,
        komentarList: [
          {
            id: 'c-1',
            pengirimNama: 'Budi Santoso',
            pengirimRole: 'Mahasiswa',
            waktu: '2025-11-04 10:15',
            pesan: 'Pak, apakah asistensi dapat dilakukan bersama tim capstone kelompok 2 pada hari Rabu jam 14:00 di ruang dosen?'
          },
          {
            id: 'c-2',
            pengirimNama: 'Dr. Ir. H. Fakhrurrazi, M.T.',
            pengirimRole: 'Dosen',
            waktu: '2025-11-04 10:45',
            pesan: 'Bisa, silakan bawa hardcopy draf gambar denah balok-kolom dan spreadsheet hitungan.'
          }
        ]
      },
      {
        id: 'd-2',
        judul: 'Tanya Jawab: Penggunaan Faktor Reduksi phi untuk Torsi Terbuka',
        pengirimNama: 'Siti Rahmawati',
        pengirimRole: 'Mahasiswa',
        waktu: '2025-10-02 16:20',
        isi: 'Izin bertanya Pak, pada perhitungan balok kanopi dengan torsi kesetimbangan, apakah faktor reduksi Phi yang digunakan adalah 0.75 atau mengikuti ketentuan elemen tekan geser?',
        isPinned: false,
        komentarList: [
          {
            id: 'c-2-1',
            pengirimNama: 'Dr. Ir. H. Fakhrurrazi, M.T.',
            pengirimRole: 'Dosen',
            waktu: '2025-10-02 17:05',
            pesan: 'Sesuai Tabel 21.2.1 SNI 2847:2019, untuk gaya geser dan torsi nilai phi adalah 0.75 baik untuk komponen spandrel maupun kantilever.'
          }
        ]
      }
    ]
  },
  {
    id: 'lms-ts-405',
    prodiId: 'SIPIL',
    kodeMK: 'TS-405',
    namaMK: 'Mekanika Tanah & Rekayasa Fondasi II',
    sks: 3,
    semester: 7,
    tahunAkademik: '2025/2026 Ganjil',
    kelas: 'Kelas B',
    hari: 'Rabu',
    jamMulai: '10:30',
    jamSelesai: '13:00',
    ruanganNama: 'Lab Mekanika Tanah FT UNBARI',
    dosenNidn: '0019088202',
    dosenNama: 'Ir. M. Amin, M.T.',
    dosenEmail: 'm.amin@universitasbatanghari.ac.id',
    deskripsiMK: 'Mata kuliah yang mengkaji daya dukung tiang tunggal dan kelompok tiang (bored pile & driven pile), penurunan elastis dan konsolidasi fondasi dalam, uji beban tiang (PDA test), serta stabilitas lereng dengan geotekstil.',
    silabusRpsUrl: 'https://universitasbatanghari.ac.id/ft/rps/TS-405-Fondasi-II.pdf',
    googleClassroomCode: 'unbari-sipil-405b',
    googleClassroomId: 'c-771239845',
    googleMeetLink: 'https://meet.google.com/ftu-mek-tnh',
    totalPertemuanTarget: 16,
    pertemuanSelesaiCount: 9,
    pesertaCount: 24,
    pertemuanList: [
      {
        id: 'p-ts2-1',
        pertemuanKe: 1,
        tanggal: '2025-09-10',
        topik: 'Ulasan Hasil Penyelidikan Tanah (SPT, CPT, Sondir & Core Drilling)',
        subTopik: 'Interpretasi nilai N-SPT dan qc sondir untuk parameter geoteknik',
        cpmkTarget: 'CPMK-1 (CPL IABEE 3.a)',
        metode: 'Tatap Muka',
        status: 'Selesai',
        materiList: [{ id: 'm-ts2-1-1', judul: 'Modul Interpretasi Koreksi N-SPT & Sondir', tipe: 'PDF', fileSize: '5.4 MB' }],
        kehadiranHadir: 24,
        kehadiranSakit: 0,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 24
      },
      {
        id: 'p-ts2-2',
        pertemuanKe: 2,
        tanggal: '2025-09-17',
        topik: 'Daya Dukung Tiang Tunggal Metode Statis (Metode Meyerhof & Vesic)',
        subTopik: 'Tahanan ujung tiang (end bearing) dan gesekan selimut tiang (skin friction)',
        cpmkTarget: 'CPMK-2 (CPL IABEE 3.b)',
        metode: 'Tatap Muka',
        status: 'Selesai',
        materiList: [{ id: 'm-ts2-2-1', judul: 'Slide Analisis Tiang Bor di Tanah Lempung & Pasir', tipe: 'PPTX', fileSize: '4.8 MB' }],
        kehadiranHadir: 23,
        kehadiranSakit: 1,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 24
      }
    ],
    tugasList: [
      {
        id: 't-ts2-1',
        judul: 'Tugas 1: Analisis Daya Dukung Fondasi Tiang Pancang Berdasarkan Data Sondir Jambi',
        tipe: 'Tugas Mandiri',
        pertemuanKe: 2,
        cpmk: 'CPMK-2',
        bobotPersen: 15,
        deadline: '2025-09-24 23:59 WIB',
        deskripsi: 'Gunakan data sondir proyek Jembatan Batanghari untuk menentukan kedalaman tiang keras dan kapasitas dukung izin Qizin.',
        pengumpulanList: [
          { id: 'sub-t2-1', mahasiswaNim: '210101009', mahasiswaNama: 'Eko Prasetyo', tanggalKumpul: '2025-09-23 15:00', status: 'Sudah Mengumpulkan', nilai: 85 }
        ]
      }
    ],
    nilaiList: [
      {
        mahasiswaNim: '210101009',
        mahasiswaNama: 'Eko Prasetyo',
        angkatan: 2021,
        tugas: 85,
        kuis: 80,
        praktikum: 88,
        uts: 82,
        uas: 84,
        nilaiAkhir: 83.8,
        hurufMutu: 'A',
        angkaMutu: 4.0,
        statusKelulusan: 'Lulus',
        kehadiranPersen: 100
      }
    ],
    diskusiList: [
      {
        id: 'd-ts2-1',
        judul: 'Jadwal Praktikum Uji Triaxial & Konsolidasi di Laboratorium Mekanika Tanah',
        pengirimNama: 'Ir. M. Amin, M.T.',
        pengirimRole: 'Dosen',
        waktu: '2025-10-15 08:00',
        isi: 'Diberitahukan kepada seluruh mahasiswa Kelas B untuk hadir sesuai jadwal kelompok modul pengujian geser langsung dan konsolidasi.',
        isPinned: true,
        komentarList: []
      }
    ]
  },
  {
    id: 'lms-tl-304',
    prodiId: 'LINGKUNGAN',
    kodeMK: 'TL-304',
    namaMK: 'Perencanaan Bangunan Pengolahan Air Minum (PBPAM)',
    sks: 3,
    semester: 5,
    tahunAkademik: '2025/2026 Ganjil',
    kelas: 'Kelas A',
    hari: 'Selasa',
    jamMulai: '08:00',
    jamSelesai: '10:30',
    ruanganNama: 'Ruang Kuliah R.204 (Lantai 2 FT)',
    dosenNidn: '0024097501',
    dosenNama: 'Ir. Hj. Nurjanah, M.T.',
    dosenEmail: 'nurjanah@universitasbatanghari.ac.id',
    deskripsiMK: 'Mata kuliah keahlian Teknik Lingkungan yang mencakup unit koagulasi-flokulasi hidrolis/mekanis, sedimentasi settler plat miring, filtrasi pasir cepat (rapid sand filter), dan desinfeksi klorinasi.',
    silabusRpsUrl: 'https://universitasbatanghari.ac.id/ft/rps/TL-304-PBPAM.pdf',
    googleClassroomCode: 'unbari-lingk-304a',
    googleClassroomId: 'c-882319472',
    googleMeetLink: 'https://meet.google.com/ftu-tl-pbpam',
    totalPertemuanTarget: 16,
    pertemuanSelesaiCount: 10,
    pesertaCount: 22,
    pertemuanList: [
      {
        id: 'p-tl-1',
        pertemuanKe: 1,
        tanggal: '2025-09-09',
        topik: 'Karakteristik Air Baku Sungai Batanghari & Standar Baku Mutu Permenkes 2/2023',
        subTopik: 'Parameter fisik, kimia, mikrobiologis, dan penentuan diagram alir IPA',
        cpmkTarget: 'CPMK-1 (CPL IABEE 3.a)',
        metode: 'Tatap Muka',
        status: 'Selesai',
        materiList: [{ id: 'm-tl-1', judul: 'Baku Mutu Air Minum Permenkes 2023 & Neraca Massa', tipe: 'PDF', fileSize: '4.1 MB' }],
        kehadiranHadir: 22,
        kehadiranSakit: 0,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 22
      },
      {
        id: 'p-tl-2',
        pertemuanKe: 2,
        tanggal: '2025-09-16',
        topik: 'Unit Intake & Prasedimentasi Air Baku Sungai',
        subTopik: 'Desain saringan kasar (bar screen), saluran pembawa, dan bak pengendap pasir (grit chamber)',
        cpmkTarget: 'CPMK-2 (CPL IABEE 3.b)',
        metode: 'Tatap Muka',
        status: 'Selesai',
        materiList: [{ id: 'm-tl-2', judul: 'Perancangan Intake Sungai & Bar Screen', tipe: 'PPTX', fileSize: '5.2 MB' }],
        kehadiranHadir: 21,
        kehadiranSakit: 1,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 22
      }
    ],
    tugasList: [
      {
        id: 't-tl-1',
        judul: 'Tugas Perancangan Unit Koagulator Terjunan Hidrolis & Bak Flokulasi 3 Kompartemen',
        tipe: 'Tugas Kelompok',
        pertemuanKe: 3,
        cpmk: 'CPMK-2 & CPMK-3',
        bobotPersen: 20,
        deadline: '2025-10-14 23:59 WIB',
        deskripsi: 'Rancang dimensi hidrolis bak pengaduk cepat terjunan hidrolis hidrolik jump dengan debit desain Q = 150 L/detik untuk air Sungai Batanghari.',
        pengumpulanList: [
          { id: 'sub-tl-1', mahasiswaNim: '210201001', mahasiswaNama: 'Nadia Safitri', tanggalKumpul: '2025-10-13 14:00', status: 'Sudah Mengumpulkan', nilai: 90, feedback: 'Gradien kecepatan G dan waktu detensi td sangat sesuai pedoman Dirjen Cipta Karya.' }
        ]
      }
    ],
    nilaiList: [
      {
        mahasiswaNim: '210201001',
        mahasiswaNama: 'Nadia Safitri',
        angkatan: 2021,
        tugas: 90,
        kuis: 88,
        praktikum: 92,
        uts: 86,
        uas: 88,
        nilaiAkhir: 88.6,
        hurufMutu: 'A',
        angkaMutu: 4.0,
        statusKelulusan: 'Lulus',
        kehadiranPersen: 100
      },
      {
        mahasiswaNim: '210201002',
        mahasiswaNama: 'Ilham Kurniawan',
        angkatan: 2021,
        tugas: 82,
        kuis: 80,
        praktikum: 85,
        uts: 78,
        uas: 80,
        nilaiAkhir: 80.7,
        hurufMutu: 'A',
        angkaMutu: 4.0,
        statusKelulusan: 'Lulus',
        kehadiranPersen: 95
      }
    ],
    diskusiList: [
      {
        id: 'd-tl-1',
        judul: 'Kunjungan Lapangan ke IPA Broni PDAM Tirta Mayang Kota Jambi',
        pengirimNama: 'Ir. Hj. Nurjanah, M.T.',
        pengirimRole: 'Dosen',
        waktu: '2025-10-25 11:00',
        isi: 'Sebagai bagian dari pengamatan lapangan nyata, seluruh peserta PBPAM akan melakukan observasi teknis unit sedimentasi tube settler dan filtrasi di IPA Broni.',
        isPinned: true,
        komentarList: []
      }
    ]
  },
  {
    id: 'lms-el-203',
    prodiId: 'LISTRIK_D3',
    kodeMK: 'EL-203',
    namaMK: 'Mesin-Mesin Listrik & Motor Induksi',
    sks: 3,
    semester: 3,
    tahunAkademik: '2025/2026 Ganjil',
    kelas: 'Kelas A',
    hari: 'Kamis',
    jamMulai: '08:00',
    jamSelesai: '11:15',
    ruanganNama: 'Bengkel & Lab Mesin Listrik D3',
    dosenNidn: '0015077901',
    dosenNama: 'Ir. Syamsir, M.T.',
    dosenEmail: 'syamsir@universitasbatanghari.ac.id',
    deskripsiMK: 'Mata kuliah terapan D3 Teknik Listrik yang menekankan pengoperasian, karakteristik torsi-kecepatan, rangkaian ekivalen trafo 1 & 3 fasa, motor induksi sangkar tupai, serta rangkaian pengasutan Star-Delta.',
    silabusRpsUrl: 'https://universitasbatanghari.ac.id/ft/rps/EL-203-Mesin-Listrik.pdf',
    googleClassroomCode: 'unbari-listrik-203a',
    googleClassroomId: 'c-991823746',
    googleMeetLink: 'https://meet.google.com/ftu-d3-mesin',
    totalPertemuanTarget: 16,
    pertemuanSelesaiCount: 10,
    pesertaCount: 19,
    pertemuanList: [
      {
        id: 'p-el-1',
        pertemuanKe: 1,
        tanggal: '2025-09-11',
        topik: 'Prinsip Elektromagnetik, Hukum Faraday & Rangkaian Magnetik',
        subTopik: 'Hukum Lorentz, fluks magnetik, kurva histeresis B-H, dan rugi arus eddy',
        cpmkTarget: 'CPMK-1 (CPL Terapan D3 Standar LAM TEKNIK)',
        metode: 'Tatap Muka',
        status: 'Selesai',
        materiList: [{ id: 'm-el-1', judul: 'Slide Konsep Medan Magnet & Transformator', tipe: 'PPTX', fileSize: '4.9 MB' }],
        kehadiranHadir: 19,
        kehadiranSakit: 0,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 19
      },
      {
        id: 'p-el-2',
        pertemuanKe: 2,
        tanggal: '2025-09-18',
        topik: 'Uji Beban Nol (Open Circuit) & Hubung Singkat (Short Circuit) Trafo',
        subTopik: 'Penentuan impedansi ekuivalen Ze, resistansi tembaga Re, dan rugi inti Rc',
        cpmkTarget: 'CPMK-2 (Praktik Bengkel Mesin Listrik)',
        metode: 'Praktikum Lab',
        status: 'Selesai',
        materiList: [{ id: 'm-el-2', judul: 'Jobsheet Praktikum Pengujian Trafo 1 Fasa', tipe: 'PDF', fileSize: '2.8 MB' }],
        kehadiranHadir: 19,
        kehadiranSakit: 0,
        kehadiranIzin: 0,
        kehadiranAlpa: 0,
        totalMahasiswa: 19
      }
    ],
    tugasList: [
      {
        id: 't-el-1',
        judul: 'Laporan Jobsheet: Pengasutan Motor Induksi 3 Fasa Sistem Star-Delta dengan Timer',
        tipe: 'Praktikum Lab',
        pertemuanKe: 5,
        cpmk: 'CPMK-2 & CPMK-3',
        bobotPersen: 20,
        deadline: '2025-10-23 16:00 WIB',
        deskripsi: 'Rakit rangkaian kontrol kontaktor magnetik Star-Delta, ukur arus starting vs running, dan buat diagram pengawatan standar IEC.',
        pengumpulanList: [
          { id: 'sub-el-1', mahasiswaNim: '220301001', mahasiswaNama: 'Rizky Pratama', tanggalKumpul: '2025-10-22 15:30', status: 'Sudah Mengumpulkan', nilai: 88 }
        ]
      }
    ],
    nilaiList: [
      {
        mahasiswaNim: '220301001',
        mahasiswaNama: 'Rizky Pratama',
        angkatan: 2022,
        tugas: 88,
        kuis: 82,
        praktikum: 92,
        uts: 84,
        uas: 85,
        nilaiAkhir: 86.4,
        hurufMutu: 'A',
        angkaMutu: 4.0,
        statusKelulusan: 'Lulus',
        kehadiranPersen: 100
      }
    ],
    diskusiList: [
      {
        id: 'd-el-1',
        judul: 'Prosedur K3 Keselamatan Kerja Bengkel Listrik Tegangan Rendah',
        pengirimNama: 'Ir. Syamsir, M.T.',
        pengirimRole: 'Dosen',
        waktu: '2025-09-12 08:30',
        isi: 'Wajib menggunakan sepatu safety isolasi listrik dan multimeter bertaraf CAT III saat praktikum berlangsung di lab bengkel mesin listrik.',
        isPinned: true,
        komentarList: []
      }
    ]
  }
];
