import { CplItemObe, MataKuliahCplMatrixRecord, LevelKontribusiCpl } from '../types/index';
import { TEKNIK_SIPIL_KURIKULUM_20261 } from './mockTeknikSipilKurikulum';

/**
 * Daftar Capaian Pembelajaran Lulusan (CPL) Kurikulum OBE
 * Terakreditasi LAM-Teknik & IABEE untuk Fakultas Teknik Universitas Batanghari Jambi
 */
export const CPL_DEFINITIONS_PRODI: Record<string, CplItemObe[]> = {
  SIPIL: [
    {
      kode: 'CPL-01',
      ranah: 'Sikap',
      judul: 'Etika & Integritas Profesional',
      deskripsi: 'Menunjukkan integritas akademik, etika profesi keinsinyuran sipil, dan komitmen terhadap keselamatan publik serta lingkungan.',
      targetKetercapaianMinimal: 80
    },
    {
      kode: 'CPL-02',
      ranah: 'Penguasaan Pengetahuan',
      judul: 'Matematika & Sains Rekayasa',
      deskripsi: 'Menguasai konsep teoretis sains rekayasa dasar (kalkulus, fisika, mekanika rekayasa, geoteknik, dan hidrologi).',
      targetKetercapaianMinimal: 75
    },
    {
      kode: 'CPL-03',
      ranah: 'Keterampilan Khusus',
      judul: 'Perancangan Struktur & Konstruksi',
      deskripsi: 'Mampu merancang elemen dan sistem struktur bangunan gedung, jembatan, jalan raya, dan keairan berstandar SNI.',
      targetKetercapaianMinimal: 75
    },
    {
      kode: 'CPL-04',
      ranah: 'Keterampilan Khusus',
      judul: 'Investigasi & Pengujian Lab/Lapangan',
      deskripsi: 'Mampu merencanakan dan melaksanakan pengujian material beton, tanah, hidrolika, serta menganalisis data empiris rekayasa.',
      targetKetercapaianMinimal: 75
    },
    {
      kode: 'CPL-05',
      ranah: 'Keterampilan Khusus',
      judul: 'Manajemen & K3 Konstruksi',
      deskripsi: 'Mampu menyusun estimasi biaya (RAB), jadwal kerja konstruksi, dan menerapkan Sistem Manajemen Keselamatan Konstruksi (SMKK/K3).',
      targetKetercapaianMinimal: 80
    },
    {
      kode: 'CPL-06',
      ranah: 'Penguasaan Pengetahuan',
      judul: 'Aplikasi Software & BIM Rekayasa',
      deskripsi: 'Mampu memanfaatkan software rekayasa sipil modern (AutoCAD Civil 3D, SAP2000, ETABS, Plaxis, GIS) dalam analisis dan perancangan.',
      targetKetercapaianMinimal: 75
    },
    {
      kode: 'CPL-07',
      ranah: 'Keterampilan Umum',
      judul: 'Komunikasi Ilmiah & Presentasi',
      deskripsi: 'Mampu menyusun dokumen teknis, laporan ilmiah, dan mengomunikasikan ide keteknikan secara efektif lisan maupun tulisan.',
      targetKetercapaianMinimal: 75
    },
    {
      kode: 'CPL-08',
      ranah: 'Keterampilan Umum',
      judul: 'Kerjasama Tim & Pembelajaran Sepanjang Hayat',
      deskripsi: 'Mampu bekerjasama dalam tim multidisiplin proyek, memimpin tim, dan terus memperbarui kompetensi keinsinyuran.',
      targetKetercapaianMinimal: 80
    }
  ],
  LINGKUNGAN: [
    {
      kode: 'CPL-01',
      ranah: 'Sikap',
      judul: 'Etika & Wawasan Lingkungan Berkelanjutan',
      deskripsi: 'Berkomitmen pada etika keteknikan lingkungan, pelestarian ekosistem lahan basah/gambut, dan kepatuhan hukum lingkungan.',
      targetKetercapaianMinimal: 80
    },
    {
      kode: 'CPL-02',
      ranah: 'Penguasaan Pengetahuan',
      judul: 'Sains & Prinsip Rekayasa Lingkungan',
      deskripsi: 'Menguasai konsep kimia lingkungan, mikrobiologi air/tanah, termodinamika, hidrolika lingkungan, dan ekologi rekayasa.',
      targetKetercapaianMinimal: 75
    },
    {
      kode: 'CPL-03',
      ranah: 'Keterampilan Khusus',
      judul: 'Desain Sistem Pengolahan Air & Limbah (IPAL)',
      deskripsi: 'Mampu merancang unit operasi dan proses pengolahan air minum (IPA) serta instalasi pengolahan air limbah domestik dan industri kelapa sawit.',
      targetKetercapaianMinimal: 75
    },
    {
      kode: 'CPL-04',
      ranah: 'Keterampilan Khusus',
      judul: 'Pengelolaan Limbah Padat & B3',
      deskripsi: 'Mampu merencanakan sistem reduksi, pengumpulan, pengangkutan, pemanfaatan, dan pemrosesan akhir sampah serta limbah B3 industri.',
      targetKetercapaianMinimal: 75
    },
    {
      kode: 'CPL-05',
      ranah: 'Keterampilan Khusus',
      judul: 'Analisis Dampak Lingkungan (AMDAL & KLHS)',
      deskripsi: 'Mampu menyusun dokumen AMDAL, UKL-UPL, dan kajian lingkungan strategis sesuai baku mutu lingkungan hidup nasional.',
      targetKetercapaianMinimal: 80
    },
    {
      kode: 'CPL-06',
      ranah: 'Penguasaan Pengetahuan',
      judul: 'Pemantauan Kualitas Lingkungan & GIS',
      deskripsi: 'Mampu mengoperasikan instrumen sampling kualitas air, udara, dan pemodelan sebaran polutan dengan sistem informasi geografis.',
      targetKetercapaianMinimal: 75
    },
    {
      kode: 'CPL-07',
      ranah: 'Keterampilan Umum',
      judul: 'Komunikasi & Advokasi Lingkungan',
      deskripsi: 'Mampu menyajikan rekomendasi teknis pengelolaan lingkungan secara persuasif kepada masyarakat, industri, dan regulator.',
      targetKetercapaianMinimal: 75
    },
    {
      kode: 'CPL-08',
      ranah: 'Keterampilan Umum',
      judul: 'Manajemen Proyek Lingkungan & Kerjasama',
      deskripsi: 'Mampu berkolaborasi dalam tim interdisiplin dan mengelola proyek mitigasi pencemaran serta audit lingkungan hidup.',
      targetKetercapaianMinimal: 80
    }
  ],
  LISTRIK_D3: [
    {
      kode: 'CPL-01',
      ranah: 'Sikap',
      judul: 'Kedisiplinan & Keselamatan Kerja PUIL',
      deskripsi: 'Menerapkan norma K3 ketenagalistrikan, standar PUIL 2020, dan etika teknisi profesional bersertifikat.',
      targetKetercapaianMinimal: 80
    },
    {
      kode: 'CPL-02',
      ranah: 'Penguasaan Pengetahuan',
      judul: 'Konsep Rangkaian & Mesin Listrik',
      deskripsi: 'Menguasai prinsip rangkaian listrik arus searah/bolak-balik, elektromagnetik, transformator, dan motor listrik AC/DC.',
      targetKetercapaianMinimal: 75
    },
    {
      kode: 'CPL-03',
      ranah: 'Keterampilan Khusus',
      judul: 'Pemasangan & Pengujian Instalasi Tenaga',
      deskripsi: 'Mampu memasang, menginspeksi, dan menguji instalasi listrik gedung bertingkat, panel hubung bagi (PHB), dan sistem proteksi.',
      targetKetercapaianMinimal: 80
    },
    {
      kode: 'CPL-04',
      ranah: 'Keterampilan Khusus',
      judul: 'Otomasi Industri & PLC / SCADA',
      deskripsi: 'Mampu merakit panel kendali, memprogram PLC Omron/Siemens, dan mengintegrasikan sistem sensor/aktuator industri kelapa sawit.',
      targetKetercapaianMinimal: 75
    },
    {
      kode: 'CPL-05',
      ranah: 'Keterampilan Khusus',
      judul: 'Pemeliharaan & Troubleshooting Peralatan',
      deskripsi: 'Mampu mendeteksi gangguan teknis (troubleshooting) dan melaksanakan preventive maintenance transformator serta motor listrik.',
      targetKetercapaianMinimal: 80
    },
    {
      kode: 'CPL-06',
      ranah: 'Penguasaan Pengetahuan',
      judul: 'Gambar Rancang Kelistrikan & CAD',
      deskripsi: 'Mampu membaca dan membuat diagram satu garis (single line diagram) dan wiring layout menggunakan CAD kelistrikan.',
      targetKetercapaianMinimal: 75
    },
    {
      kode: 'CPL-07',
      ranah: 'Keterampilan Umum',
      judul: 'Pelaporan Teknis & Logbook Lapangan',
      deskripsi: 'Mampu menyusun berita acara pemeriksaan (BAP), logbook pemeliharaan, dan mempresentasikan hasil pekerjaan instalasi.',
      targetKetercapaianMinimal: 75
    },
    {
      kode: 'CPL-08',
      ranah: 'Keterampilan Umum',
      judul: 'Kerja Sama Tim & Kewirausahaan Bengkel Listrik',
      deskripsi: 'Mampu bekerja efektif dalam regu kerja teknisi lapangan dan memiliki jiwa kewirausahaan jasa kontraktor mekanikal elektrikal.',
      targetKetercapaianMinimal: 80
    }
  ]
};

/**
 * Dataset Master Matriks Relasi Mata Kuliah, CPMK, dan CPL
 */
export const INITIAL_CPL_CPMK_MATRIX_DATA: MataKuliahCplMatrixRecord[] = [
  // =========================================================================
  // S1 TEKNIK SIPIL (KURIKULUM RESMI TA 2026/2027 - 133 MATA KULIAH)
  // =========================================================================
  ...TEKNIK_SIPIL_KURIKULUM_20261,

  // =========================================================================
  // S1 TEKNIK LINGKUNGAN
  // =========================================================================
  {
    id: 'MK-LKG-101',
    kodeMK: 'UBP42102',
    namaMK: 'KIMIA LINGKUNGAN I',
    sks: 3,
    semester: 1,
    kategori: 'Studio/Praktikum',
    dosenPengampu: 'Putra Anugrah, ST, MT',
    prodiId: 'LINGKUNGAN',
    catatanKurikulum: 'Pengujian kinetika reaksi air, kesetimbangan karbonat, alkalinitas, BOD, COD, dan koagulasi-flokulasi.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu menjelaskan kinetika reaksi kimia air dan kesetimbangan asam-basa perairan alami Sungai Batanghari (C3)',
        levelBloom: 'C3 - Pemahaman',
        cplTerkait: ['CPL-02'],
        metodeAsesmen: 'UTS Ujian Tulis',
        bobotPersen: 30
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu mengukur parameter kualitas air (BOD5, COD, pH, kekeruhan, TSS) sesuai Standard Methods (P3)',
        levelBloom: 'P3 - Keterampilan Laboratorium',
        cplTerkait: ['CPL-03', 'CPL-06'],
        metodeAsesmen: 'Praktikum & Ujian Responsi',
        bobotPersen: 40
      },
      {
        kode: 'CPMK-3',
        deskripsi: 'Mampu mengevaluasi kepatuhan baku mutu limbah cair industri sawit terhadap Permen LHK No. 5/2014 (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-01', 'CPL-05', 'CPL-07'],
        metodeAsesmen: 'UAS & Laporan Ilmiah',
        bobotPersen: 30
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Medium',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Low',
      'CPL-05': 'Medium',
      'CPL-06': 'Strong',
      'CPL-07': 'Medium',
      'CPL-08': 'Medium'
    }
  },
  {
    id: 'MK-LKG-201',
    kodeMK: 'UBP42317',
    namaMK: 'MEKANIKA FLUIDA',
    sks: 3,
    semester: 3,
    kategori: 'Wajib Prodi',
    dosenPengampu: 'Hadrah, ST, MT',
    prodiId: 'LINGKUNGAN',
    catatanKurikulum: 'Hukum dasar hidrolika, kontinuitas aliran, persamaan Bernoulli, dan head loss perpipaan distribusi air.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu menghitung gaya hidrostatik pada dinding bak sedimentasi dan pintu air bendung (C3)',
        levelBloom: 'C3 - Penerapan',
        cplTerkait: ['CPL-02'],
        metodeAsesmen: 'Kuis & Tugas Mandiri',
        bobotPersen: 30
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu menganalisis kehilangan energi mayor dan minor pada jaringan pipa transmisi fluida (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-02', 'CPL-03'],
        metodeAsesmen: 'UTS',
        bobotPersen: 35
      },
      {
        kode: 'CPMK-3',
        deskripsi: 'Mampu merancang dimensi pipa hisap dan tekan pompa sentrifugal instalasi pengolahan air (C5)',
        levelBloom: 'C5 - Perancangan',
        cplTerkait: ['CPL-03', 'CPL-06'],
        metodeAsesmen: 'Tugas Besar & UAS',
        bobotPersen: 35
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Low',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Medium',
      'CPL-05': 'Low',
      'CPL-06': 'Strong',
      'CPL-07': 'Low',
      'CPL-08': 'Medium'
    }
  },
  {
    id: 'MK-LKG-202',
    kodeMK: 'UBP42319',
    namaMK: 'PENGELOLAAN LAHAN BASAH',
    sks: 2,
    semester: 3,
    kategori: 'Wajib Prodi',
    dosenPengampu: 'Dian Afriyanti, SP., M.Sc.',
    prodiId: 'LINGKUNGAN',
    catatanKurikulum: 'Karakteristik hidrologi tanah gambut Jambi, kebakaran lahan gambut, sekat kanal (canal blocking) dan restorasi.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu mengidentifikasi sifat fisik, kimiawi dan hidrologis ekosistem gambut tropis Jambi (C3)',
        levelBloom: 'C3 - Pemahaman',
        cplTerkait: ['CPL-02', 'CPL-04'],
        metodeAsesmen: 'Makalah & Kuis',
        bobotPersen: 30
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu menganalisis subsistensi muka air tanah gambut dan risiko emisi karbon kebakaran hutan/lahan (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-04', 'CPL-05'],
        metodeAsesmen: 'UTS Kasus Gambut Muaro Jambi',
        bobotPersen: 35
      },
      {
        kode: 'CPMK-3',
        deskripsi: 'Mampu merancang strategi 3R (Rewetting, Revegetation, Revitalization) lahan basah gambut terdegradasi (C5)',
        levelBloom: 'C5 - Perancangan',
        cplTerkait: ['CPL-01', 'CPL-04', 'CPL-05', 'CPL-07'],
        metodeAsesmen: 'UAS Desain Sekat Kanal',
        bobotPersen: 35
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Medium',
      'CPL-02': 'Strong',
      'CPL-03': 'Medium',
      'CPL-04': 'Strong',
      'CPL-05': 'Strong',
      'CPL-06': 'Medium',
      'CPL-07': 'Strong',
      'CPL-08': 'Medium'
    }
  },
  {
    id: 'MK-LKG-203',
    kodeMK: 'UBP42327',
    namaMK: 'TEKNIK PENGOLAHAN AIR',
    sks: 2,
    semester: 3,
    kategori: 'Wajib Prodi',
    dosenPengampu: 'Anggrika Riyanti, ST., M.Si',
    prodiId: 'LINGKUNGAN',
    catatanKurikulum: 'Unit operasi koagulasi, flokulasi, sedimentasi plate settler, filtrasi pasir cepat, dan desinfeksi klorin.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu merencanakan unit koagulasi hidrolis terjunan dan flokulator baffle channel air sungai (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-02', 'CPL-03'],
        metodeAsesmen: 'UTS',
        bobotPersen: 35
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu merancang bak sedimentasi tube settler kecepatan pengendapan partikel flok (C5)',
        levelBloom: 'C5 - Perancangan',
        cplTerkait: ['CPL-03', 'CPL-06'],
        metodeAsesmen: 'Tugas Perhitungan Desain',
        bobotPersen: 35
      },
      {
        kode: 'CPMK-3',
        deskripsi: 'Mampu menghitung laju filtrasi rapid sand filter dan dosis klorin desinfeksi residual (C5)',
        levelBloom: 'C5 - Sintesis',
        cplTerkait: ['CPL-03', 'CPL-07'],
        metodeAsesmen: 'UAS Gambar Perencanaan',
        bobotPersen: 30
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Medium',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Medium',
      'CPL-05': 'Medium',
      'CPL-06': 'Strong',
      'CPL-07': 'Medium',
      'CPL-08': 'Medium'
    }
  },
  {
    id: 'MK-LKG-204',
    kodeMK: 'UBP42328',
    namaMK: 'PENCEMARAN UDARA',
    sks: 2,
    semester: 3,
    kategori: 'Wajib Prodi',
    dosenPengampu: 'Peppy Herawati, S.T., MT.',
    prodiId: 'LINGKUNGAN',
    catatanKurikulum: 'Karakteristik emisi cerobong pabrik kelapa sawit, dispersi Gauss, partikulat PM2.5/PM10, dan alat pengendali emisi.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu mengidentifikasi sumber emisi gas polutan (SO2, NOx, CO, partikulat) industri manufaktur dan sawit (C3)',
        levelBloom: 'C3 - Pemahaman',
        cplTerkait: ['CPL-02', 'CPL-04'],
        metodeAsesmen: 'Kuis & Kajian Kasus',
        bobotPersen: 30
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu memodelkan dispersi polutan udara cerobong menggunakan persamaan Gauss Pasquill-Gifford (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-02', 'CPL-06'],
        metodeAsesmen: 'UTS Pemodelan',
        bobotPersen: 35
      },
      {
        kode: 'CPMK-3',
        deskripsi: 'Mampu memilih dan merancang unit pengendali pencemar udara (Cyclone, Baghouse Filter, Wet Scrubber) (C5)',
        levelBloom: 'C5 - Perancangan',
        cplTerkait: ['CPL-03', 'CPL-05', 'CPL-07'],
        metodeAsesmen: 'UAS Perancangan Alat',
        bobotPersen: 35
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Medium',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Strong',
      'CPL-05': 'Strong',
      'CPL-06': 'Strong',
      'CPL-07': 'Medium',
      'CPL-08': 'Medium'
    }
  },
  {
    id: 'MK-LKG-301',
    kodeMK: 'UBP42536',
    namaMK: 'PENGELOLAAN BAHAN BERACUN & BERBAHAYA',
    sks: 3,
    semester: 5,
    kategori: 'Wajib Prodi',
    dosenPengampu: 'Ir. Marhadi, S.T, M.Si',
    prodiId: 'LINGKUNGAN',
    catatanKurikulum: 'Regulasi PP 22/2021, identifikasi kode limbah B3, sistem manifes FESTRONIK, TPS Limbah B3, dan metode solidifikasi.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu mengklasifikasikan limbah B3 berdasarkan sifat reaktif, mudah meledak, beracun, infeksius, dan korosif (C3)',
        levelBloom: 'C3 - Pemahaman',
        cplTerkait: ['CPL-01', 'CPL-05'],
        metodeAsesmen: 'Kuis Regulasi B3',
        bobotPersen: 25
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu menyusun tata kelola Tempat Penyimpanan Sementara (TPS) Limbah B3 berizin dan manifes FESTRONIK (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-05', 'CPL-07', 'CPL-08'],
        metodeAsesmen: 'UTS SOP TPS B3',
        bobotPersen: 35
      },
      {
        kode: 'CPMK-3',
        deskripsi: 'Mampu mengevaluasi teknologi pengolahan termal insinerator dan stabilisasi/solidifikasi (S/S) lumpur B3 (C5)',
        levelBloom: 'C5 - Evaluasi',
        cplTerkait: ['CPL-03', 'CPL-05', 'CPL-06'],
        metodeAsesmen: 'UAS Laporan Kajian Kelayakan',
        bobotPersen: 40
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Strong',
      'CPL-02': 'Medium',
      'CPL-03': 'Strong',
      'CPL-04': 'Medium',
      'CPL-05': 'Strong',
      'CPL-06': 'Strong',
      'CPL-07': 'Strong',
      'CPL-08': 'Strong'
    }
  },
  {
    id: 'MK-LKG-302',
    kodeMK: 'UBP42537',
    namaMK: 'TEKNIK PENYEDIAAN AIR MINUM (+T)',
    sks: 3,
    semester: 5,
    kategori: 'Wajib Prodi',
    dosenPengampu: 'Anggrika Riyanti, ST., M.Si',
    prodiId: 'LINGKUNGAN',
    catatanKurikulum: 'Proyeksi pertumbuhan penduduk, kebutuhan air harian maksimum, desain intake Sungai Batanghari, dan jaringan pipa EPANET.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu memproyeksikan kebutuhan air minum kota menggunakan metode aritmatika, geometris, dan least square (C3)',
        levelBloom: 'C3 - Penerapan',
        cplTerkait: ['CPL-02', 'CPL-03'],
        metodeAsesmen: 'Tugas Proyeksi Demografi',
        bobotPersen: 25
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu merancang kapasitas reservoir air minum dan unit transmisi air baku dari Sungai Batanghari (C5)',
        levelBloom: 'C5 - Perancangan Rekayasa',
        cplTerkait: ['CPL-03', 'CPL-06'],
        metodeAsesmen: 'UTS Perhitungan Reservoir',
        bobotPersen: 35
      },
      {
        kode: 'CPMK-3',
        deskripsi: 'Mampu menyimulasikan aliran hidrolika jaringan pipa distribusi air minum zona layanan kota dengan EPANET (C5)',
        levelBloom: 'C5 - Pemodelan Komputasi',
        cplTerkait: ['CPL-03', 'CPL-06', 'CPL-08'],
        metodeAsesmen: 'Tugas Besar & UAS EPANET',
        bobotPersen: 40
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Medium',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Low',
      'CPL-05': 'Medium',
      'CPL-06': 'Strong',
      'CPL-07': 'Medium',
      'CPL-08': 'Strong'
    }
  },
  {
    id: 'MK-LKG-303',
    kodeMK: 'UBP42539',
    namaMK: 'MITIGASI DAN PERUBAHAN IKLIM',
    sks: 2,
    semester: 5,
    kategori: 'Wajib Prodi',
    dosenPengampu: 'Monik Kasman, M.Eng.Sc',
    prodiId: 'LINGKUNGAN',
    catatanKurikulum: 'Inventarisasi gas rumah kaca (GRK), Nationally Determined Contribution (NDC) Indonesia, dan nilai ekonomi karbon Provinsi Jambi.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu menghitung emisi gas rumah kaca sektor FOLU, limbah, dan energi menggunakan metodologi IPCC Guidelines (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-02', 'CPL-04'],
        metodeAsesmen: 'UTS Inventarisasi GRK',
        bobotPersen: 35
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu merumuskan program mitigasi penurunan emisi karbon berbasis pemanfaatan biogas POME dan reboisasi (C5)',
        levelBloom: 'C5 - Perumusan Kebijakan',
        cplTerkait: ['CPL-04', 'CPL-05', 'CPL-08'],
        metodeAsesmen: 'Makalah Analisis Strategi',
        bobotPersen: 35
      },
      {
        kode: 'CPMK-3',
        deskripsi: 'Mampu menyusun dokumen Nilai Ekonomi Karbon (NEK) dan perdagangan karbon pasar sukarela (C5)',
        levelBloom: 'C5 - Sintesis',
        cplTerkait: ['CPL-01', 'CPL-07', 'CPL-08'],
        metodeAsesmen: 'UAS Presentasi Rencana Proyek',
        bobotPersen: 30
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Strong',
      'CPL-02': 'Strong',
      'CPL-03': 'Medium',
      'CPL-04': 'Strong',
      'CPL-05': 'Strong',
      'CPL-06': 'Medium',
      'CPL-07': 'Strong',
      'CPL-08': 'Strong'
    }
  },
  {
    id: 'MK-LKG-401',
    kodeMK: 'UBP42745',
    namaMK: 'PERENC. BANGUNAN PENGOLAHAN AIR BUANGAN',
    sks: 3,
    semester: 7,
    kategori: 'Wajib Prodi',
    dosenPengampu: 'Monik Kasman, M.Eng.Sc',
    prodiId: 'LINGKUNGAN',
    catatanKurikulum: 'Perancangan detail IPAL industri kelapa sawit dan domestik, aerasi lumpur aktif, UASB, dan sludge dewatering.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu menganalisis neraca massa polutan limbah POME dan debit rancangan bak ekualisasi (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-02', 'CPL-03'],
        metodeAsesmen: 'UTS Neraca Massa',
        bobotPersen: 30
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu mendesain dimensi reaktor anaerobik fakultatif, kolam aerasi dan bak sedimentasi sekunder (C5)',
        levelBloom: 'C5 - Perancangan',
        cplTerkait: ['CPL-03', 'CPL-06'],
        metodeAsesmen: 'Tugas Besar Detail Engineering Design (DED)',
        bobotPersen: 45
      },
      {
        kode: 'CPMK-3',
        deskripsi: 'Mampu menyusun bill of quantity (BOQ), estimasi biaya investasi, dan profil hidrolis aliran limbah gravitasi (C5)',
        levelBloom: 'C5 - Evaluasi',
        cplTerkait: ['CPL-03', 'CPL-07', 'CPL-08'],
        metodeAsesmen: 'UAS Gambar DED & Presentasi',
        bobotPersen: 25
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Medium',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Medium',
      'CPL-05': 'Strong',
      'CPL-06': 'Strong',
      'CPL-07': 'Strong',
      'CPL-08': 'Strong'
    }
  },
  {
    id: 'MK-LKG-402',
    kodeMK: 'UBP42747',
    namaMK: 'SISTEM MANAJEMEN LINGKUNGAN',
    sks: 2,
    semester: 7,
    kategori: 'Wajib Prodi',
    dosenPengampu: 'Ir. Marhadi, S.T, M.Si',
    prodiId: 'LINGKUNGAN',
    catatanKurikulum: 'Penerapan ISO 14001:2015, audit lingkungan hidup, pemenuhan kriteria PROPER KLHK Emas/Hijau/Biru.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu mengidentifikasi aspek dan dampak lingkungan penting industri sawit dan karet berdasarkan ISO 14001 (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-01', 'CPL-05'],
        metodeAsesmen: 'Kuis Matriks Aspek Dampak',
        bobotPersen: 30
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu menyusun rencana pemantauan audit kepatuhan lingkungan dan pelaporan kinerja PROPER KLHK (C5)',
        levelBloom: 'C5 - Evaluasi',
        cplTerkait: ['CPL-05', 'CPL-07'],
        metodeAsesmen: 'UTS Audit SML',
        bobotPersen: 35
      },
      {
        kode: 'CPMK-3',
        deskripsi: 'Mampu merumuskan program circular economy, life cycle assessment (LCA), dan pencegahan pencemaran terpadu (C5)',
        levelBloom: 'C5 - Sintesis',
        cplTerkait: ['CPL-04', 'CPL-05', 'CPL-08'],
        metodeAsesmen: 'UAS Dokumen Kebijakan SML',
        bobotPersen: 35
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Strong',
      'CPL-02': 'Medium',
      'CPL-03': 'Medium',
      'CPL-04': 'Strong',
      'CPL-05': 'Strong',
      'CPL-06': 'Medium',
      'CPL-07': 'Strong',
      'CPL-08': 'Strong'
    }
  },
  {
    id: 'MK-LKG-403',
    kodeMK: 'UBP42801',
    namaMK: 'TUGAS AKHIR (SKRIPSI)',
    sks: 6,
    semester: 8,
    kategori: 'Wajib Prodi',
    dosenPengampu: 'Ir. Marhadi, S.T, M.Si',
    prodiId: 'LINGKUNGAN',
    catatanKurikulum: 'Penelitian komprehensif, eksperimen laboratorium, publikasi jurnal, dan sidang meja hijau sarjana teknik.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu merumuskan latar belakang masalah, gap riset, dan hipotesis rekayasa lingkungan secara ilmiah (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-02', 'CPL-04'],
        metodeAsesmen: 'Seminar Proposal',
        bobotPersen: 25
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu melaksanakan pengujian laboratorium/lapangan dengan integritas akademik dan metode standar (P4)',
        levelBloom: 'P4 - Pengujian Rekayasa',
        cplTerkait: ['CPL-01', 'CPL-03', 'CPL-06'],
        metodeAsesmen: 'Bimbingan & Logbook Penelitian',
        bobotPersen: 35
      },
      {
        kode: 'CPMK-3',
        deskripsi: 'Mampu mempertahankan hasil temuan riset di depan dewan penguji meja hijau dan menulis manuskrip publikasi (C6)',
        levelBloom: 'C6 - Kreasi & Pertanggungjawaban',
        cplTerkait: ['CPL-05', 'CPL-07', 'CPL-08'],
        metodeAsesmen: 'Ujian Sidang Skripsi',
        bobotPersen: 40
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Strong',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Strong',
      'CPL-05': 'Strong',
      'CPL-06': 'Strong',
      'CPL-07': 'Strong',
      'CPL-08': 'Strong'
    }
  },

  {
    id: 'MK-LKG-404',
    kodeMK: 'UBP42641',
    namaMK: 'TEKNOLOGI PENGOLAHAN LIMBAH CAIR SAWIT (POME) LANJUT',
    sks: 2,
    semester: 6,
    semesterLabel: '06',
    kelompokKurikulum: 'Pilihan',
    kategori: 'Pilihan',
    dosenPengampu: 'Hadrah, S.T., M.T.',
    prodiId: 'LINGKUNGAN',
    catatanKurikulum: 'Mata kuliah pilihan peminatan industri agro-sawit Provinsi Jambi: biokonversi POME menjadi biogas metana.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu menganalisis karakteristik beban pencemar tinggi (COD/BOD/TSS/Minyak) limbah cair pabrik kelapa sawit (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-02', 'CPL-03'],
        metodeAsesmen: 'UTS & Studi Kasus PKS',
        bobotPersen: 35
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu merancang reaktor covered lagoon biodigester untuk penangkapan gas metana (CH4) energi terbarukan (C5)',
        levelBloom: 'C5 - Perancangan',
        cplTerkait: ['CPL-03', 'CPL-05'],
        metodeAsesmen: 'Tugas Desain Bioreaktor',
        bobotPersen: 35
      },
      {
        kode: 'CPMK-3',
        deskripsi: 'Mampu mengevaluasi pemenuhan baku mutu land application PKS sesuai regulasi KLHK terkini (C5)',
        levelBloom: 'C5 - Evaluasi',
        cplTerkait: ['CPL-01', 'CPL-05', 'CPL-07'],
        metodeAsesmen: 'UAS Presentasi Desain',
        bobotPersen: 30
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Strong',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Medium',
      'CPL-05': 'Strong',
      'CPL-06': 'Medium',
      'CPL-07': 'Strong',
      'CPL-08': 'Medium'
    }
  },

  // =========================================================================
  // D3 TEKNIK LISTRIK (21 MATA KULIAH RESMI FT UNBARI)
  // =========================================================================
  {
    id: 'MK-LST-01',
    kodeMK: 'MBF43101',
    namaMK: 'MATEMATIKA TEKNIK',
    sks: 2,
    semester: 1,
    semesterLabel: '01',
    kelompokKurikulum: 'Wajib',
    kategori: 'Wajib Fakultas',
    dosenPengampu: 'ROZLINDA DEWI IR., M.SI',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Matematika terapan vokasi: bilangan kompleks fasor AC, matriks impedansi, dan transformasi Laplace rangkaian listrik.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu menyelesaikan operasi bilangan kompleks bentuk polar dan rektangular untuk analisis arus bolak-balik (C3)',
        levelBloom: 'C3 - Penerapan',
        cplTerkait: ['CPL-02'],
        metodeAsesmen: 'Kuis & Tugas Mandiri',
        bobotPersen: 35
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu menggunakan determinan matriks dan persamaan diferensial pada analisis rangkaian mesh dan transien RLC (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-02', 'CPL-06'],
        metodeAsesmen: 'UTS & UAS',
        bobotPersen: 65
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Low',
      'CPL-02': 'Strong',
      'CPL-03': 'Medium',
      'CPL-04': 'Low',
      'CPL-05': 'Low',
      'CPL-06': 'Medium',
      'CPL-07': 'Low',
      'CPL-08': 'Low'
    }
  },
  {
    id: 'MK-LST-02',
    kodeMK: 'MBN43101',
    namaMK: 'AGAMA',
    sks: 2,
    semester: 1,
    semesterLabel: '01',
    kelompokKurikulum: 'Wajib',
    kategori: 'Wajib Fakultas',
    dosenPengampu: 'HASBI M.PD.I',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Pembentukan karakter religius, etika profesi keteknikan, dan amanah kerja keselamatan publik.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu menginternalisasi nilai ketuhanan dan kejujuran moral dalam praktik ketenagalistrikan (A3)',
        levelBloom: 'A3 - Nilai & Sikap',
        cplTerkait: ['CPL-01'],
        metodeAsesmen: 'Tugas Esai & Observasi',
        bobotPersen: 50
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu menunjukkan tanggung jawab sosial dan etika profesi teknisi dalam tim lapangan (A4)',
        levelBloom: 'A4 - Organisasi Sikap',
        cplTerkait: ['CPL-01', 'CPL-08'],
        metodeAsesmen: 'UTS & UAS',
        bobotPersen: 50
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Strong',
      'CPL-02': 'None',
      'CPL-03': 'None',
      'CPL-04': 'None',
      'CPL-05': 'Low',
      'CPL-06': 'None',
      'CPL-07': 'Medium',
      'CPL-08': 'Strong'
    }
  },
  {
    id: 'MK-LST-03',
    kodeMK: 'MBN43102',
    namaMK: 'PANCASILA',
    sks: 2,
    semester: 1,
    semesterLabel: '01',
    kelompokKurikulum: 'Wajib',
    kategori: 'Wajib Fakultas',
    dosenPengampu: 'ISLAH M.H.',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Wawasan kebangsaan, kepatuhan hukum K3 nasional, dan etika bernegara bagi ahli madya teknik.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu memahami nilai Pancasila sebagai landasan etika profesi keteknikan nasional (A3)',
        levelBloom: 'A3 - Sikap',
        cplTerkait: ['CPL-01'],
        metodeAsesmen: 'Kajian Kasus',
        bobotPersen: 50
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu berkolaborasi lintas kelompok dengan menjunjung semangat persatuan dan keadilan sosial (A4)',
        levelBloom: 'A4 - Karakter',
        cplTerkait: ['CPL-01', 'CPL-07', 'CPL-08'],
        metodeAsesmen: 'UTS & UAS',
        bobotPersen: 50
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Strong',
      'CPL-02': 'None',
      'CPL-03': 'None',
      'CPL-04': 'None',
      'CPL-05': 'None',
      'CPL-06': 'None',
      'CPL-07': 'Medium',
      'CPL-08': 'Strong'
    }
  },
  {
    id: 'MK-LST-04',
    kodeMK: 'MBR43102',
    namaMK: 'ILMU SOSIAL DASAR',
    sks: 2,
    semester: 1,
    semesterLabel: '01',
    kelompokKurikulum: 'Wajib',
    kategori: 'Wajib Fakultas',
    dosenPengampu: 'ARIF RAHIM M.Hum',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Sosiologi teknologi, komunikasi masyarakat desa dalam program elektrifikasi dan K3 publik.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu mengidentifikasi dinamika sosial masyarakat terhadap pembangunan infrastruktur kelistrikan (C3)',
        levelBloom: 'C3 - Penerapan',
        cplTerkait: ['CPL-01', 'CPL-07'],
        metodeAsesmen: 'Diskusi & Makalah',
        bobotPersen: 50
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu menyusun komunikasi efektif dengan pemangku kepentingan masyarakat dalam proyek instalasi (A3)',
        levelBloom: 'A3 - Komunikasi',
        cplTerkait: ['CPL-07', 'CPL-08'],
        metodeAsesmen: 'Presentasi & UAS',
        bobotPersen: 50
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Medium',
      'CPL-02': 'None',
      'CPL-03': 'None',
      'CPL-04': 'None',
      'CPL-05': 'None',
      'CPL-06': 'None',
      'CPL-07': 'Strong',
      'CPL-08': 'Strong'
    }
  },
  {
    id: 'MK-LST-05',
    kodeMK: 'MBP43101',
    namaMK: 'RANGKAIAN LISTRIK I',
    sks: 2,
    semester: 1,
    semesterLabel: '01',
    kelompokKurikulum: 'Wajib',
    kategori: 'Wajib Prodi',
    dosenPengampu: 'LEILY WUSTHA JOHAR ST, MT',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Hukum Ohm, Kirchhoff, analisis mesh/node, teorema Thevenin-Norton, dan rangkaian DC/AC dasar.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu menghitung arus dan tegangan pada jaringan DC menggunakan hukum Kirchhoff, Thevenin, dan Norton (C3)',
        levelBloom: 'C3 - Penerapan',
        cplTerkait: ['CPL-02'],
        metodeAsesmen: 'UTS',
        bobotPersen: 45
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu menganalisis daya aktif, reaktif, dan faktor daya pada rangkaian AC satu fasa (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-02', 'CPL-03'],
        metodeAsesmen: 'UAS & Tugas Latihan',
        bobotPersen: 55
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Medium',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Low',
      'CPL-05': 'Medium',
      'CPL-06': 'Low',
      'CPL-07': 'Low',
      'CPL-08': 'Low'
    }
  },
  {
    id: 'MK-LST-06',
    kodeMK: 'MBP43103',
    namaMK: 'ELEKTROMAGNETIK',
    sks: 2,
    semester: 1,
    semesterLabel: '01',
    kelompokKurikulum: 'Wajib',
    kategori: 'Wajib Prodi',
    dosenPengampu: 'MYSON Ir., MT.',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Medan elektrostatik, hukum Gauss, hukum Biot-Savart, hukum Faraday induksi elektromagnetik, dan rangkaian magnetik.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu menghitung intensitas medan listrik, fluks magnetik, dan gaya Lorentz pada konduktor berarus (C3)',
        levelBloom: 'C3 - Penerapan',
        cplTerkait: ['CPL-02'],
        metodeAsesmen: 'UTS',
        bobotPersen: 50
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu menganalisis rangkaian magnetik inti besi dan prinsip GGL induksi Faraday pada trafo & generator (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-02', 'CPL-05'],
        metodeAsesmen: 'UAS',
        bobotPersen: 50
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Low',
      'CPL-02': 'Strong',
      'CPL-03': 'Medium',
      'CPL-04': 'Low',
      'CPL-05': 'Medium',
      'CPL-06': 'Low',
      'CPL-07': 'Low',
      'CPL-08': 'Low'
    }
  },
  {
    id: 'MK-LST-07',
    kodeMK: 'MBP43104',
    namaMK: 'GAMBAR TEKNIK KELISTRIKA',
    sks: 2,
    semester: 1,
    semesterLabel: '01',
    kelompokKurikulum: 'Wajib',
    kategori: 'Studio/Praktikum',
    dosenPengampu: 'FADLI EKA YANDRA ST, MT',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Simbol standar PUIL/IEC, diagram pengawatan instalasi, single line diagram (SLD), dan AutoCAD Electrical.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu membaca dan menerapkan simbol kelistrikan standar IEC dan PUIL 2020 pada denah bangunan (C3)',
        levelBloom: 'C3 - Penerapan',
        cplTerkait: ['CPL-01', 'CPL-06'],
        metodeAsesmen: 'Tugas Gambar Manual',
        bobotPersen: 40
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu menggambar diagram garis tunggal (SLD) dan diagram pengawatan panel PHB menggunakan software CAD (P3)',
        levelBloom: 'P3 - Keterampilan CAD',
        cplTerkait: ['CPL-03', 'CPL-06', 'CPL-07'],
        metodeAsesmen: 'UTS & UAS Studio CAD',
        bobotPersen: 60
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Medium',
      'CPL-02': 'Medium',
      'CPL-03': 'Strong',
      'CPL-04': 'Low',
      'CPL-05': 'Medium',
      'CPL-06': 'Strong',
      'CPL-07': 'Strong',
      'CPL-08': 'Medium'
    }
  },
  {
    id: 'MK-LST-08',
    kodeMK: 'MBP43110',
    namaMK: 'WORKSHOP INSTALASI PENERANGAN',
    sks: 2,
    semester: 1,
    semesterLabel: '01',
    kelompokKurikulum: 'Wajib',
    kategori: 'Studio/Praktikum',
    dosenPengampu: 'LEILY WUSTHA JOHAR ST, MT',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Praktik pengawatan saklar tukar, saklar seri, MCB/ELCB, pembumian, dan uji Megger di LAB. LIST.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu merakit instalasi penerangan 1 fasa dengan saklar tunggal, seri, dan tukar sesuai standar PUIL (P4)',
        levelBloom: 'P4 - Perakitan Bengkel',
        cplTerkait: ['CPL-01', 'CPL-03'],
        metodeAsesmen: 'Uji Kinerja Bengkel',
        bobotPersen: 60
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu menguji tahanan isolasi dengan Megaohmmeter dan menyusun berita acara pemeriksaan instalasi (C4)',
        levelBloom: 'C4 - Pengujian',
        cplTerkait: ['CPL-03', 'CPL-05', 'CPL-07'],
        metodeAsesmen: 'Laporan Logbook & UAS',
        bobotPersen: 40
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Strong',
      'CPL-02': 'Medium',
      'CPL-03': 'Strong',
      'CPL-04': 'Low',
      'CPL-05': 'Strong',
      'CPL-06': 'Strong',
      'CPL-07': 'Medium',
      'CPL-08': 'Strong'
    }
  },
  {
    id: 'MK-LST-09',
    kodeMK: 'MBR43104',
    namaMK: 'WORKSHOP PEMOGRAMAN KOMPUTER',
    sks: 2,
    semester: 1,
    semesterLabel: '01',
    kelompokKurikulum: 'Wajib',
    kategori: 'Studio/Praktikum',
    dosenPengampu: 'FADLI EKA YANDRA ST, MT',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Logika algoritma pemrograman C/Python untuk perhitungan jaringan listrik dan dasar otomasi di LAB. COMP.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu menyusun algoritma dan kode program terstruktur untuk perhitungan daya, rugi tegangan, dan ukuran kabel (C4)',
        levelBloom: 'C4 - Pemrograman',
        cplTerkait: ['CPL-02', 'CPL-04', 'CPL-06'],
        metodeAsesmen: 'Praktikum LAB. COMP',
        bobotPersen: 60
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu mendokumentasikan aplikasi bantu perhitungan kelistrikan dan mempresentasikan hasilnya (C4)',
        levelBloom: 'C4 - Evaluasi',
        cplTerkait: ['CPL-06', 'CPL-07', 'CPL-08'],
        metodeAsesmen: 'UAS Project Pemrograman',
        bobotPersen: 40
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Low',
      'CPL-02': 'Strong',
      'CPL-03': 'Medium',
      'CPL-04': 'Strong',
      'CPL-05': 'Low',
      'CPL-06': 'Strong',
      'CPL-07': 'Medium',
      'CPL-08': 'Medium'
    }
  },
  {
    id: 'MK-LST-10',
    kodeMK: 'MBP43313',
    namaMK: 'TEKNIK KENDALI',
    sks: 2,
    semester: 3,
    semesterLabel: '03',
    kelompokKurikulum: 'Wajib',
    kategori: 'Wajib Prodi',
    dosenPengampu: 'ROZLINDA DEWI IR., M.SI',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Sistem kendali loop terbuka/tertutup, fungsi alih blok diagram, kestabilan Routh-Hurwitz, dan pengendali PID.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu menyederhanakan diagram blok sistem kendali dan menentukan fungsi alih plant elektro-mekanik (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-02', 'CPL-04'],
        metodeAsesmen: 'UTS',
        bobotPersen: 45
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu menganalisis respon transien sistem dan melakukan tuning parameter PID (Kp, Ki, Kd) (C5)',
        levelBloom: 'C5 - Evaluasi/Desain',
        cplTerkait: ['CPL-04', 'CPL-06'],
        metodeAsesmen: 'UAS & Simulasi',
        bobotPersen: 55
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Low',
      'CPL-02': 'Strong',
      'CPL-03': 'Medium',
      'CPL-04': 'Strong',
      'CPL-05': 'Medium',
      'CPL-06': 'Medium',
      'CPL-07': 'Low',
      'CPL-08': 'Medium'
    }
  },
  {
    id: 'MK-LST-11',
    kodeMK: 'MBP43314',
    namaMK: 'SISTEM MIKROKONTROLER & TEK. ANTAR MUKA',
    sks: 2,
    semester: 3,
    semesterLabel: '03',
    kelompokKurikulum: 'Wajib',
    kategori: 'Wajib Prodi',
    dosenPengampu: 'HENDI MATALATA ST, MT',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Arsitektur mikrokontroler AVR/ESP32, pemrograman I/O digital-analog, ADC, PWM, dan antarmuka sensor-aktuator.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu memprogram port I/O, timer/interrupt, dan ADC mikrokontroler untuk pembacaan sensor listrik (C4)',
        levelBloom: 'C4 - Pemrograman',
        cplTerkait: ['CPL-02', 'CPL-04'],
        metodeAsesmen: 'UTS & Tugas Proyek',
        bobotPersen: 50
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu merancang rangkaian antarmuka driver relay, optocoupler, dan komunikasi serial HMI (C5)',
        levelBloom: 'C5 - Perancangan',
        cplTerkait: ['CPL-03', 'CPL-04', 'CPL-06'],
        metodeAsesmen: 'UAS Prototype',
        bobotPersen: 50
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Medium',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Strong',
      'CPL-05': 'Medium',
      'CPL-06': 'Strong',
      'CPL-07': 'Medium',
      'CPL-08': 'Strong'
    }
  },
  {
    id: 'MK-LST-12',
    kodeMK: 'MBP43315',
    namaMK: 'ELEKTRONIKA DAYA',
    sks: 2,
    semester: 3,
    semesterLabel: '03',
    kelompokKurikulum: 'Wajib',
    kategori: 'Wajib Prodi',
    dosenPengampu: 'HENDI MATALATA ST, MT',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Semikonduktor daya (SCR, IGBT, MOSFET), penyearah terkendali, DC-DC chopper, dan inverter VFD penggerak motor.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu menganalisis kerja penyearah tak terkendali dan terkendali (SCR) satu dan tiga fasa (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-02', 'CPL-03'],
        metodeAsesmen: 'UTS',
        bobotPersen: 50
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu merancang konverter DC-DC dan inverter PWM untuk pengendalian kecepatan motor AC (C5)',
        levelBloom: 'C5 - Evaluasi',
        cplTerkait: ['CPL-03', 'CPL-04', 'CPL-05'],
        metodeAsesmen: 'UAS',
        bobotPersen: 50
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Medium',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Strong',
      'CPL-05': 'Medium',
      'CPL-06': 'Medium',
      'CPL-07': 'Low',
      'CPL-08': 'Medium'
    }
  },
  {
    id: 'MK-LST-13',
    kodeMK: 'MBP43316',
    namaMK: 'LABOR ELEKTRONIK DAYA DAN KENDALI',
    sks: 1,
    semester: 3,
    semesterLabel: '03',
    kelompokKurikulum: 'Wajib',
    kategori: 'Studio/Praktikum',
    dosenPengampu: 'HENDI MATALATA ST, MT',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Praktikum bengkel LAB. LIST: pengujian gelombang osiloskop penyearah SCR, inverter VFD, dan kontrol PID motor DC.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu mengoperasikan osiloskop dan modul praktikum elektronika daya untuk mengamati sudut penyulutan SCR/PWM (P3)',
        levelBloom: 'P3 - Keterampilan Lab',
        cplTerkait: ['CPL-01', 'CPL-04'],
        metodeAsesmen: 'Praktikum LAB. LIST',
        bobotPersen: 60
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu menyusun laporan pengukuran osilogram dan analisis efisiensi konverter daya (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-05', 'CPL-07', 'CPL-08'],
        metodeAsesmen: 'Laporan & Responsi',
        bobotPersen: 40
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Strong',
      'CPL-02': 'Medium',
      'CPL-03': 'Strong',
      'CPL-04': 'Strong',
      'CPL-05': 'Strong',
      'CPL-06': 'Medium',
      'CPL-07': 'Strong',
      'CPL-08': 'Strong'
    }
  },
  {
    id: 'MK-LST-14',
    kodeMK: 'MBP43317',
    namaMK: 'PEMBANGKIT TENAGA LISTRIK',
    sks: 2,
    semester: 3,
    semesterLabel: '03',
    kelompokKurikulum: 'Wajib',
    kategori: 'Wajib Prodi',
    dosenPengampu: 'MYSON Ir., MT.',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Prinsip kerja PLTD, PLTU, PLTG/PLTGU, PLTA, PLTS surya, dan pemanfaatan biomassa/biogas PKS Jambi.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu menjelaskan siklus termodinamika dan skema konversi energi pada pembangkit konvensional & EBT (C3)',
        levelBloom: 'C3 - Penerapan',
        cplTerkait: ['CPL-02', 'CPL-03'],
        metodeAsesmen: 'UTS',
        bobotPersen: 45
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu menghitung kapasitas terpasang, faktor beban, dan efisiensi pembangkit hibrid PLTS-biomassa (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-03', 'CPL-05'],
        metodeAsesmen: 'UAS & Kajian Pembangkit',
        bobotPersen: 55
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Medium',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Low',
      'CPL-05': 'Medium',
      'CPL-06': 'Medium',
      'CPL-07': 'Medium',
      'CPL-08': 'Medium'
    }
  },
  {
    id: 'MK-LST-15',
    kodeMK: 'MBP43318',
    namaMK: 'KUALITAS DAYA LISTRIK',
    sks: 2,
    semester: 3,
    semesterLabel: '03',
    kelompokKurikulum: 'Pilihan',
    kategori: 'Pilihan',
    dosenPengampu: 'UMAR DJUFRI PENS',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Gangguan sag/swell tegangan, harmonik arus (THD), flicker, standar IEEE 519, serta mitigasi bank kapasitor & filter aktif.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu mengidentifikasi fenomena gangguan kualitas daya (voltage sag, swell, harmonik, ketidakseimbangan fasa) (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-02', 'CPL-05'],
        metodeAsesmen: 'UTS',
        bobotPersen: 50
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu mengevaluasi batas THD sesuai standar IEEE 519 dan merancang filter harmonik pasif/kapasitor (C5)',
        levelBloom: 'C5 - Evaluasi',
        cplTerkait: ['CPL-03', 'CPL-05', 'CPL-07'],
        metodeAsesmen: 'UAS Audit Kualitas Daya',
        bobotPersen: 50
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Medium',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Medium',
      'CPL-05': 'Strong',
      'CPL-06': 'Medium',
      'CPL-07': 'Strong',
      'CPL-08': 'Medium'
    }
  },
  {
    id: 'MK-LST-16',
    kodeMK: 'MBP43319',
    namaMK: 'GARDU INDUK & TRANSFORMATOR',
    sks: 2,
    semester: 3,
    semesterLabel: '03',
    kelompokKurikulum: 'Wajib',
    kategori: 'Wajib Prodi',
    dosenPengampu: 'FADLI EKA YANDRA ST, MT',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Konfigurasi busbar GI 150 kV, peralatan PMT/PMS/CT/PT, vektor grup trafo daya, pendingin, dan proteksi Buchholz.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu menganalisis konfigurasi single line diagram gardu induk (single/double busbar, 1.5 breaker) dan switchgear (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-02', 'CPL-03', 'CPL-06'],
        metodeAsesmen: 'UTS',
        bobotPersen: 50
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu menghitung parameter rangkaian ekuivalen trafo, efisiensi, regulasi tegangan, dan kerja paralel transformator (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-03', 'CPL-05'],
        metodeAsesmen: 'UAS',
        bobotPersen: 50
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Strong',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Low',
      'CPL-05': 'Strong',
      'CPL-06': 'Strong',
      'CPL-07': 'Medium',
      'CPL-08': 'Medium'
    }
  },
  {
    id: 'MK-LST-17',
    kodeMK: 'MBP43320',
    namaMK: 'MESIN LISTRIK',
    sks: 2,
    semester: 3,
    semesterLabel: '03',
    kelompokKurikulum: 'Wajib',
    kategori: 'Wajib Prodi',
    dosenPengampu: 'MYSON Ir., MT.',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Konstruksi dan karakteristik motor DC, generator sinkron 3 fasa, serta motor induksi sangkar tupai dan slip ring.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu menghitung torsi, kecepatan putar, slip, dan efisiensi motor induksi 3 fasa dan motor DC (C3)',
        levelBloom: 'C3 - Penerapan',
        cplTerkait: ['CPL-02'],
        metodeAsesmen: 'UTS',
        bobotPersen: 50
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu menganalisis metode starting motor induksi (DOL, Star-Delta, Soft Starter) dan sinkronisasi generator (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-02', 'CPL-03', 'CPL-05'],
        metodeAsesmen: 'UAS',
        bobotPersen: 50
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Medium',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Medium',
      'CPL-05': 'Strong',
      'CPL-06': 'Low',
      'CPL-07': 'Low',
      'CPL-08': 'Medium'
    }
  },
  {
    id: 'MK-LST-18',
    kodeMK: 'MBP43321',
    namaMK: 'LABOR MESIN LISTRIK & TRANFORMATOR',
    sks: 1,
    semester: 3,
    semesterLabel: '03',
    kelompokKurikulum: 'Wajib',
    kategori: 'Studio/Praktikum',
    dosenPengampu: 'LEILY WUSTHA JOHAR ST, MT',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Praktikum LAB. LIST: uji beban nol dan hubung singkat trafo, uji karakteristik motor induksi 3 fasa, dan sinkronisasi generator.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu melaksanakan pengujian beban nol (open circuit) dan hubung singkat (short circuit) transformator 3 fasa (P4)',
        levelBloom: 'P4 - Pengujian Mesin',
        cplTerkait: ['CPL-01', 'CPL-03', 'CPL-05'],
        metodeAsesmen: 'Praktikum LAB. LIST',
        bobotPersen: 60
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu menganalisis kurva efisiensi dan faktor daya hasil pengujian motor listrik serta menyusun laporan lab (C4)',
        levelBloom: 'C4 - Analisis',
        cplTerkait: ['CPL-05', 'CPL-07', 'CPL-08'],
        metodeAsesmen: 'Laporan & Responsi',
        bobotPersen: 40
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Strong',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Low',
      'CPL-05': 'Strong',
      'CPL-06': 'Medium',
      'CPL-07': 'Strong',
      'CPL-08': 'Strong'
    }
  },
  {
    id: 'MK-LST-19',
    kodeMK: 'MBP43322',
    namaMK: 'WORKSHOP PEMELIHARAAB PERALATAN LISTRIK',
    sks: 2,
    semester: 3,
    semesterLabel: '03',
    kelompokKurikulum: 'Wajib',
    kategori: 'Studio/Praktikum',
    dosenPengampu: 'Herbert Siregar ST.',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Preventive & corrective maintenance switchgear, penggulungan ulang kumparan motor (rewinding), uji isolasi & minyak trafo.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu melakukan inspeksi tahanan isolasi, tahanan kontak, dan pemeliharaan berkala peralatan listrik industri (P4)',
        levelBloom: 'P4 - Pemeliharaan',
        cplTerkait: ['CPL-01', 'CPL-03', 'CPL-05'],
        metodeAsesmen: 'Uji Praktik Bengkel',
        bobotPersen: 60
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu mendiagnosis gangguan kerusakan belitan motor/trafo serta menyusun SOP & logbook pemeliharaan (C5)',
        levelBloom: 'C5 - Evaluasi SOP',
        cplTerkait: ['CPL-05', 'CPL-07', 'CPL-08'],
        metodeAsesmen: 'Logbook & UAS',
        bobotPersen: 40
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Strong',
      'CPL-02': 'Medium',
      'CPL-03': 'Strong',
      'CPL-04': 'Medium',
      'CPL-05': 'Strong',
      'CPL-06': 'Medium',
      'CPL-07': 'Strong',
      'CPL-08': 'Strong'
    }
  },
  {
    id: 'MK-LST-20',
    kodeMK: 'MBP43323',
    namaMK: 'WORKSHOP PANEL LISTRIK',
    sks: 2,
    semester: 3,
    semesterLabel: '03',
    kelompokKurikulum: 'Pilihan',
    kategori: 'Pilihan',
    dosenPengampu: 'Herbert Siregar ST.',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Perakitan panel LVMDP, panel kontrol motor Star-Delta, panel ATS-AMF genset, dan wiring terminal busbar sesuai PUIL.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu merancang tata letak komponen dan diagram kontrol panel ATS-AMF serta panel Star-Delta (C4)',
        levelBloom: 'C4 - Perancangan',
        cplTerkait: ['CPL-03', 'CPL-06'],
        metodeAsesmen: 'Tugas Desain Panel',
        bobotPersen: 40
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu merakit, melakukan pengawatan (wiring), dan menguji fungsi interlock panel listrik 3 fasa di LAB. LIST (P4)',
        levelBloom: 'P4 - Perakitan Panel',
        cplTerkait: ['CPL-01', 'CPL-03', 'CPL-04', 'CPL-08'],
        metodeAsesmen: 'UAS Uji Fungsi Panel',
        bobotPersen: 60
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Strong',
      'CPL-02': 'Medium',
      'CPL-03': 'Strong',
      'CPL-04': 'Strong',
      'CPL-05': 'Strong',
      'CPL-06': 'Strong',
      'CPL-07': 'Medium',
      'CPL-08': 'Strong'
    }
  },
  {
    id: 'MK-LST-21',
    kodeMK: 'MBF43507',
    namaMK: 'PROYEK AKHIR',
    sks: 10,
    semester: 5,
    semesterLabel: '05',
    kelompokKurikulum: 'Wajib',
    kategori: 'Tugas Akhir',
    dosenPengampu: 'Tim Pembimbing D3 Teknik Listrik FT UNBARI',
    prodiId: 'LISTRIK_D3',
    catatanKurikulum: 'Rancang bangun prototipe sistem kelistrikan/otomasi terapan, pengujian lab, dan sidang tugas akhir diploma.',
    cpmkList: [
      {
        kode: 'CPMK-1',
        deskripsi: 'Mampu merumuskan proposal rancang bangun sistem ketenagalistrikan atau otomasi industri tepat guna (C4)',
        levelBloom: 'C4 - Analisis & Desain',
        cplTerkait: ['CPL-01', 'CPL-02', 'CPL-06'],
        metodeAsesmen: 'Seminar Proposal Proyek Akhir',
        bobotPersen: 25
      },
      {
        kode: 'CPMK-2',
        deskripsi: 'Mampu merakit dan menguji prototipe alat/panel di LAB. LIST dengan standar keselamatan kerja PUIL (P4)',
        levelBloom: 'P4 - Implementasi & Uji',
        cplTerkait: ['CPL-03', 'CPL-04', 'CPL-05'],
        metodeAsesmen: 'Demonstrasi Alat & Logbook',
        bobotPersen: 45
      },
      {
        kode: 'CPMK-3',
        deskripsi: 'Mampu menyusun laporan teknis tugas akhir dan mempertahankannya di hadapan tim penguji prodi (C6)',
        levelBloom: 'C6 - Pertahanan Sidang',
        cplTerkait: ['CPL-07', 'CPL-08'],
        metodeAsesmen: 'Sidang Proyek Akhir Vokasi',
        bobotPersen: 30
      }
    ],
    pemetaanCpl: {
      'CPL-01': 'Strong',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Strong',
      'CPL-05': 'Strong',
      'CPL-06': 'Strong',
      'CPL-07': 'Strong',
      'CPL-08': 'Strong'
    }
  }
];

/**
 * Helper untuk mendapatkan styling badge kontribusi CPL
 */
export const getKontribusiBadgeStyle = (level: LevelKontribusiCpl) => {
  switch (level) {
    case 'Strong':
      return {
        bgClass: 'bg-emerald-600 text-white',
        borderClass: 'border-emerald-700',
        label: 'Strong (S)',
        score: 3,
        short: 'S'
      };
    case 'Medium':
      return {
        bgClass: 'bg-amber-500 text-white',
        borderClass: 'border-amber-600',
        label: 'Medium (M)',
        score: 2,
        short: 'M'
      };
    case 'Low':
      return {
        bgClass: 'bg-sky-500 text-white',
        borderClass: 'border-sky-600',
        label: 'Low (L)',
        score: 1,
        short: 'L'
      };
    case 'None':
    default:
      return {
        bgClass: 'bg-slate-100 text-slate-400 hover:bg-slate-200',
        borderClass: 'border-slate-200',
        label: 'None (-)',
        score: 0,
        short: '-'
      };
  }
};
