import fs from 'fs';

const rawData = [
  { no: 1, nama: "SAID HUSIN", nim: "1900822201004", jk: "L", ipk: 3.29, predikat: "Memuaskan" },
  { no: 2, nama: "DWI SULISTYO AJI", nim: "1900822201009", jk: "L", ipk: 3.53, predikat: "Memuaskan" },
  { no: 3, nama: "GEMA TAMA", nim: "1900822201011", jk: "L", ipk: 2.87, predikat: "Sangat Memuaskan" },
  { no: 4, nama: "AGUS KURNIANTO", nim: "1900822201018", jk: "L", ipk: 3.33, predikat: "Memuaskan" },
  { no: 5, nama: "NANDO ARWANDO", nim: "1900822201025", jk: "L", ipk: 3.10, predikat: "Memuaskan" },
  { no: 6, nama: "DWI YULIANTO", nim: "1900822201029", jk: "L", ipk: 3.49, predikat: "Memuaskan" },
  { no: 7, nama: "MICHAEL ARIFIN SIREGAR", nim: "1900822201035", jk: "L", ipk: 3.02, predikat: "Memuaskan" },
  { no: 8, nama: "REGGY SEPTIAN PUTRA", nim: "1900822201039", jk: "L", ipk: 3.21, predikat: "Memuaskan" },
  { no: 9, nama: "BINTANG SHERRA VALUXCY", nim: "1900822201040", jk: "L", ipk: 3.27, predikat: "Memuaskan" },
  { no: 10, nama: "YUNITA PRATIWI", nim: "1900822201047", jk: "P", ipk: 3.13, predikat: "Memuaskan" },
  { no: 11, nama: "ARMAN LATIF HARAHAP", nim: "1900822201048", jk: "L", ipk: 3.14, predikat: "Memuaskan" },
  { no: 12, nama: "SHAFFA TASYA NADIA", nim: "1900822201049", jk: "P", ipk: 3.20, predikat: "Memuaskan" },
  { no: 13, nama: "SUCI WULANDARI", nim: "1900822201055", jk: "P", ipk: 3.58, predikat: "Sangat Memuaskan" },
  { no: 14, nama: "Zenny De Ageng Diah Alit Nas", nim: "1900822201057", jk: "P", ipk: 3.32, predikat: "Memuaskan" },
  { no: 15, nama: "RAFI DIMAS ANDRE VALEN", nim: "1900822201060", jk: "L", ipk: 3.12, predikat: "Memuaskan" },
  { no: 16, nama: "ILHAM FADILLAH", nim: "1900822201064", jk: "L", ipk: 3.04, predikat: "Memuaskan" },
  { no: 17, nama: "MEIDITA AMARTYA", nim: "1900822201076", jk: "P", ipk: 3.26, predikat: "Memuaskan" },
  { no: 18, nama: "MARYATUL KIBTIYAH", nim: "2000822201019", jk: "P", ipk: 3.52, predikat: "Sangat Memuaskan" },
  { no: 19, nama: "ANGGA RIFANI ALAZHAR", nim: "2000822201023", jk: "L", ipk: 3.29, predikat: "Memuaskan" },
  { no: 20, nama: "DWI SUCI NOVITA SARI", nim: "2000822201024", jk: "P", ipk: 3.43, predikat: "Memuaskan" },
  { no: 21, nama: "ULTIA WAHYUNI", nim: "2000822201025", jk: "P", ipk: 2.95, predikat: "Memuaskan" },
  { no: 22, nama: "ELVITA TIFFANY", nim: "2000822201033", jk: "P", ipk: 3.27, predikat: "Memuaskan" },
  { no: 23, nama: "M. DIMAS ARDHANI ALMUNAWAR", nim: "2000822201045", jk: "L", ipk: 3.42, predikat: "Memuaskan" },
  { no: 24, nama: "AFMURI FAHRIAL", nim: "2000822201055", jk: "L", ipk: 3.09, predikat: "Sangat Memuaskan" },
  { no: 25, nama: "DONA ALDINI FITRI", nim: "2000822201063", jk: "P", ipk: 3.20, predikat: "Sangat Memuaskan" },
  { no: 26, nama: "VARUF IQBAL", nim: "2000822201066", jk: "L", ipk: 3.16, predikat: "Memuaskan" },
  { no: 27, nama: "ASLAMIA PARDEDE", nim: "2000822201071", jk: "P", ipk: 3.40, predikat: "Memuaskan" },
  { no: 28, nama: "MUHAMMAD BAGUS SULAIMAN", nim: "2000822201083", jk: "L", ipk: 3.59, predikat: "Memuaskan" },
  { no: 29, nama: "M YUDI RUKIA SAHPUTRA", nim: "2000822201084", jk: "L", ipk: 3.24, predikat: "Memuaskan" },
  { no: 30, nama: "JERY PRATAMA PUTRA", nim: "2000822201091", jk: "L", ipk: 3.08, predikat: "Memuaskan" },
  { no: 31, nama: "KEMAS M HANDA RESDA", nim: "2000822201104", jk: "L", ipk: 3.30, predikat: "Memuaskan" },
  { no: 32, nama: "MUHAMMAD FIKRI LUKMAN HAKIM", nim: "2100822201008", jk: "L", ipk: 3.25, predikat: "Memuaskan" },
  { no: 33, nama: "DAVID FAUZI", nim: "2100822201010", jk: "L", ipk: 4.00, predikat: "Memuaskan" },
  { no: 34, nama: "IMAM RIZKY PRATAMA", nim: "2100822201014", jk: "L", ipk: 3.23, predikat: "Memuaskan" },
  { no: 35, nama: "ANGGA DWI SAPUTRA", nim: "2100822201037", jk: "L", ipk: 3.33, predikat: "Memuaskan" },
  { no: 36, nama: "MARTIN DIONISIUS NADAPDAP", nim: "2100822201040", jk: "L", ipk: 3.32, predikat: "Memuaskan" },
  { no: 37, nama: "HENGKY SULAIMAN", nim: "2100822201042", jk: "L", ipk: 3.26, predikat: "Memuaskan" },
  { no: 38, nama: "AHMAD SALEH", nim: "2100822201045", jk: "L", ipk: 2.94, predikat: "Memuaskan" },
  { no: 39, nama: "BAGUSTI IKBAL", nim: "2100822201047", jk: "L", ipk: 2.93, predikat: "Memuaskan" },
  { no: 40, nama: "M.BAGAS KURNIAZI", nim: "2100822201050", jk: "L", ipk: 3.18, predikat: "Memuaskan" },
  { no: 41, nama: "YULETA RISKIANI", nim: "2100822201051", jk: "P", ipk: 3.11, predikat: "Memuaskan" },
  { no: 42, nama: "NADILA", nim: "2100822201052", jk: "P", ipk: 3.18, predikat: "Memuaskan" },
  { no: 43, nama: "AFRIZAL BAKRI", nim: "2100822201060", jk: "L", ipk: 3.38, predikat: "Memuaskan" },
  { no: 44, nama: "BIMA WIRAJATI", nim: "2100822201068", jk: "L", ipk: 3.26, predikat: "Memuaskan" },
  { no: 45, nama: "MUHAMMAD AKBAR AGSYAH", nim: "2100822201079", jk: "L", ipk: 3.19, predikat: "Memuaskan" },
  { no: 46, nama: "DEBBY RAMADANA SIMAMORA", nim: "2100822201101", jk: "L", ipk: 3.37, predikat: "Memuaskan" },
  { no: 47, nama: "DELVIAN HARYTAMI", nim: "2100822201102", jk: "L", ipk: 3.13, predikat: "Memuaskan" },
  { no: 48, nama: "FERRI MARTUA SAGALA", nim: "2100822201113", jk: "L", ipk: 3.20, predikat: "Sangat Memuaskan" },
  { no: 49, nama: "Latifah Dwi Murni", nim: "2200822201034", jk: "P", ipk: 3.59, predikat: "Dengan Pujian" }
];

const skripsiTopics = [
  "Analisis Stabilitas Lereng dan Perkuatan Sheet Pile pada Ruas Tol Betung-Tempino-Jambi",
  "Perencanaan Struktur Gedung Rawat Inap 6 Lantai dengan Sistem Rangka Pemikul Momen Khusus",
  "Kajian Kapasitas Drainase Perkotaan Kawasan Sipin Kota Jambi Menggunakan Pemodelan SWMM",
  "Pengaruh Penambahan Serat Limbah Plastik PET terhadap Kuat Tekan dan Kuat Lentur Beton K-300",
  "Analisis Kinerja Jembatan Rangka Baja Sungai Batanghari Berdasarkan SNI 1725:2016",
  "Evaluasi Tebal Perkerasan Lentur Menggunakan Metode Bina Marga 2017 pada Jalan Lintas Timur",
  "Kajian Karakteristik Tanah Lempung Ekspansif Menggunakan Stabilisasi Kapur dan Fly Ash",
  "Perencanaan Bangunan Pengendali Banjir Sungai Batang Merao Kabupaten Kerinci",
  "Optimasi Waktu dan Biaya Pelaksanaan Proyek Pembangunan Jembatan Menggunakan Metode CPM",
  "Analisis Daya Dukung Fondasi Tiang Pancang Berdasarkan Data SPT dan CPT pada Tanah Aluvial",
  "Evaluasi Tingkat Kerusakan Jalan dengan Metode Pavement Condition Index (PCI)",
  "Pengaruh Kadar Air Terhadap Kekuatan Geser Tanah Lempung Daerah Muaro Jambi"
];

const dosens1 = [
  "Ir. Rioni Rizki Aldiansyah, ST., MT, IPM, ASEAN Eng.",
  "Annisaa Dwiretnani, S.T., M.T.",
  "Ir. Moh. Nur Ridwan, M.T.",
  "Ir. Hendra Saputra, ST., MT",
  "Ir. Ahmad Ridwan, ST., MT",
  "Dr. Ir. H. Sudirman, MT"
];

const dosens2 = [
  "Ir. Azwarman, MT",
  "Ir. Fachruddin, M.T.",
  "Fadli Eka Yandra, ST., MT",
  "Leily Wustha Johar, ST., MT",
  "Hadrah, ST., MT"
];

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

const sipilYudisiumRecords = rawData.map((item, idx) => {
  const ang = parseInt(item.nim.slice(0, 2), 10) + 2000;
  const noStr = String(item.no).padStart(3, '0');
  const serialNo = String(100 + item.no);
  
  // Format predikat exact to interface: 'Dengan Pujian (Cum Laude)' | 'Sangat Memuaskan' | 'Memuaskan'
  let predikatClean = 'Memuaskan';
  if (item.predikat.toLowerCase().includes('pujian')) {
    predikatClean = 'Dengan Pujian (Cum Laude)';
  } else if (item.predikat.toLowerCase().includes('sangat')) {
    predikatClean = 'Sangat Memuaskan';
  }

  // Calculate realistic study duration
  let lamaStudi = '4 Tahun 0 Bulan';
  if (ang === 2019) lamaStudi = '5 Tahun 0 Bulan';
  else if (ang === 2020) lamaStudi = '4 Tahun 6 Bulan';
  else if (ang === 2021) lamaStudi = '3 Tahun 10 Bulan';
  else if (ang === 2022) lamaStudi = '3 Tahun 6 Bulan (Fast Track)';

  const judulSkripsi = skripsiTopics[idx % skripsiTopics.length];
  const d1 = dosens1[idx % dosens1.length];
  const d2 = dosens2[idx % dosens2.length];
  const ukuranToga = sizes[idx % sizes.length];

  return {
    id: `YUD-SPL-${noStr}`,
    prodiId: 'SIPIL',
    mahasiswaId: `MHS-SPL-${item.nim.slice(-5)}`,
    nim: item.nim,
    nama: item.nama,
    jenisKelamin: item.jk,
    angkatan: ang,
    jenjang: 'S1',
    programStudi: 'S1 Teknik Sipil',
    ipk: item.ipk,
    sksLulus: 144,
    lamaStudi,
    predikat: predikatClean,
    gelarLulusan: 'S.T.',
    tanggalYudisium: '2026-08-28',
    nomorSkYudisium: '085/SK-DEK/FT-UNBARI/VIII/2026',
    nomorIjazahNasional: `010042026001${serialNo}`,
    nomorSeriIjazah: `FT-UNBARI-2026-${serialNo}`,
    nomorTranskrip: `TR-FT/2026/${serialNo}`,
    judulSkripsi,
    dosenPembimbing1: d1,
    dosenPembimbing2: d2,
    statusVerifikasi: 'Disahkan Dekan',
    syaratKelengkapan: {
      bebasPustaka: true,
      bebasLab: true,
      bebasKeuangan: true,
      bebasPlagiarisme: true,
      unggahJurnalRepository: true,
      fotoIjazah: true
    },
    statusWisuda: 'Terdaftar Wisuda',
    periodeWisuda: 'Wisuda Ke-56 UNBARI (Oktober 2026)',
    ukuranToga,
    isLulusanTerbaik: item.ipk >= 3.58,
    catatan: `Peserta resmi Yudisium S1 Teknik Sipil Periode TA 2025/2026 (No. Urut ${item.no}).`
  };
});

console.log(`Generated ${sipilYudisiumRecords.length} Sipil Yudisium Records.`);
fs.writeFileSync('scripts/sipil_yudisium_data.json', JSON.stringify(sipilYudisiumRecords, null, 2), 'utf8');
