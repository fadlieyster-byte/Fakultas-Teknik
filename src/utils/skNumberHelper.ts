/**
 * Utility helper untuk standardisasi dan generator penomoran Surat Keputusan (SK)
 * Fakultas Teknik Universitas Batanghari (FT UNBARI).
 * 
 * Format Standar SK UNBARI:
 * [Nomor Urut]/[Kode Klasifikasi]/[Instansi]/[Kode Prodi/Unit]/[Bulan Romawi]/[Tahun]
 * Contoh:
 * - 085/SK-DEK/FT-UNBARI/VIII/2026  (SK Dekan Bersama/Fakultas)
 * - 112/SK-YUD/FT-UNBARI/TS/VIII/2026 (SK Yudisium Prodi Teknik Sipil)
 * - 094/SK-YUD/FT-UNBARI/TL/VIII/2026 (SK Yudisium Prodi Teknik Lingkungan)
 * - 042/SK-TA/FT-UNBARI/TS/IX/2026 (SK Pembimbing / Penguji TA)
 */

export interface SkClassification {
  code: string;
  label: string;
  description: string;
  defaultTitle: string;
}

export const SK_CLASSIFICATIONS: SkClassification[] = [
  {
    code: 'SK-DEK',
    label: 'SK Dekan (Umum / Yudisium Bersama)',
    description: 'Surat Keputusan Dekan untuk penetapan umum, dekanat, atau yudisium gabungan se-fakultas',
    defaultTitle: 'Penetapan Kelulusan (Yudisium) dan Pemberian Gelar Akademik'
  },
  {
    code: 'SK-YUD',
    label: 'SK Yudisium (Spesifik Prodi / Lulusan)',
    description: 'Surat Keputusan penetapan yudisium per program studi atau daftar peserta wisuda',
    defaultTitle: 'Penetapan Yudisium dan Kelulusan Sarjana / Ahli Madya Teknik'
  },
  {
    code: 'SK-TA',
    label: 'SK Tugas Akhir / Skripsi',
    description: 'Penetapan Dosen Pembimbing dan Tim Penguji Sidang Tugas Akhir',
    defaultTitle: 'Penetapan Dosen Pembimbing dan Penguji Tugas Akhir'
  },
  {
    code: 'SK-KP',
    label: 'SK Kerja Praktik (KP)',
    description: 'Penetapan Dosen Pembimbing Lapangan dan Pelaksanaan Kerja Praktik',
    defaultTitle: 'Penugasan Dosen Pembimbing Kerja Praktik Mahasiswa'
  },
  {
    code: 'SK-BKD',
    label: 'SK Beban Kinerja Dosen / Mengajar',
    description: 'Penetapan penugasan mengajar dosen per semester genap/ganjil',
    defaultTitle: 'Beban Mengajar dan Penugasan Dosen Semester'
  },
  {
    code: 'SK-LAB',
    label: 'SK Pengelola Laboratorium',
    description: 'Penetapan kepala laboratorium, teknisi, dan asisten praktikum',
    defaultTitle: 'Penetapan Pengelola dan Asisten Laboratorium Fakultas Teknik'
  },
  {
    code: 'SK-PAN',
    label: 'SK Panitia Kegiatan / Yudisium',
    description: 'Penetapan panitia pelaksana kegiatan akademik, yudisium, atau akreditasi',
    defaultTitle: 'Susunan Panitia Pelaksana Rapat Yudisium dan Wisuda'
  }
];

export type JenisSkDokumenTU = 'SK Mengajar' | 'SK Bimbingan' | 'SK Yudisium';

export interface SkDokumenInfo {
  jenis: JenisSkDokumenTU;
  kodeKlasifikasi: string; // e.g. 'SK-BKD', 'SK-TA', 'SK-YUD'
  label: string;
  perihalDefault: string;
  defaultSeq: string;
  deskripsi: string;
}

export const SK_DOKUMEN_CONFIGS: Record<JenisSkDokumenTU, SkDokumenInfo> = {
  'SK Mengajar': {
    jenis: 'SK Mengajar',
    kodeKlasifikasi: 'SK-BKD',
    label: 'SK Dekan Penugasan Beban Mengajar (BKD)',
    perihalDefault: 'Penetapan Beban Mengajar dan Penugasan Dosen Semester Gasal/Genap',
    defaultSeq: '065',
    deskripsi: 'SK Dekan FT UNBARI mengenai penugasan dosen pengampu mata kuliah teori dan praktikum'
  },
  'SK Bimbingan': {
    jenis: 'SK Bimbingan',
    kodeKlasifikasi: 'SK-TA',
    label: 'SK Dekan Dosen Pembimbing Skripsi & KP',
    perihalDefault: 'Penetapan Dosen Pembimbing dan Tim Penguji Tugas Akhir / Kerja Praktik Mahasiswa',
    defaultSeq: '042',
    deskripsi: 'SK Dekan FT UNBARI penugasan dosen pembimbing utama/pendamping tugas akhir atau kerja praktik'
  },
  'SK Yudisium': {
    jenis: 'SK Yudisium',
    kodeKlasifikasi: 'SK-YUD',
    label: 'SK Dekan Penetapan Kelulusan Yudisium',
    perihalDefault: 'Penetapan Kelulusan (Yudisium) dan Pemberian Gelar Akademik Lulusan Fakultas Teknik',
    defaultSeq: '112',
    deskripsi: 'SK Dekan FT UNBARI penetapan kelulusan mahasiswa pada rapat yudisium dekanat dan gelar S.T./A.Md.T.'
  }
};

export const ROMAN_MONTHS = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
];

export const PRODI_UNIT_OPTIONS = [
  { code: '', label: 'Tanpa Kode Prodi (Tingkat Fakultas Dekanat)', short: '-' },
  { code: 'TS', label: 'TS - S1 Teknik Sipil', short: 'Teknik Sipil' },
  { code: 'TL', label: 'TL - S1 Teknik Lingkungan', short: 'Teknik Lingkungan' },
  { code: 'TL-D3', label: 'TL-D3 - D3 Teknik Listrik', short: 'D3 Teknik Listrik' },
  { code: 'DEK', label: 'DEK - Dekanat / Tata Usaha', short: 'Dekanat' }
];

export interface SkParts {
  nomorUrut: string;          // e.g. "085"
  klasifikasi: string;         // e.g. "SK-DEK" or "SK-YUD"
  instansi: string;            // e.g. "FT-UNBARI"
  kodeProdi: string;           // e.g. "TS", "TL", "TL-D3", or ""
  bulanRomawi: string;         // e.g. "VIII"
  tahun: string;               // e.g. "2026"
}

/**
 * Mendapatkan representasi bulan romawi dari Date atau angka bulan (1-12)
 */
export function getRomanMonth(dateOrMonth: Date | string | number): string {
  let monthIndex = 0;
  if (dateOrMonth instanceof Date) {
    monthIndex = dateOrMonth.getMonth();
  } else if (typeof dateOrMonth === 'number') {
    monthIndex = Math.max(0, Math.min(11, dateOrMonth - 1));
  } else if (typeof dateOrMonth === 'string') {
    const parsed = new Date(dateOrMonth);
    if (!isNaN(parsed.getTime())) {
      monthIndex = parsed.getMonth();
    } else {
      const num = parseInt(dateOrMonth, 10);
      if (!isNaN(num) && num >= 1 && num <= 12) {
        monthIndex = num - 1;
      }
    }
  }
  return ROMAN_MONTHS[monthIndex] || 'VIII';
}

/**
 * Membentuk string nomor SK dari bagian-bagiannya
 */
export function buildSkNumber(parts: SkParts): string {
  const nomor = (parts.nomorUrut || '001').trim();
  const klas = (parts.klasifikasi || 'SK-DEK').trim();
  const inst = (parts.instansi || 'FT-UNBARI').trim();
  const prodi = (parts.kodeProdi || '').trim();
  const bulan = (parts.bulanRomawi || 'VIII').trim();
  const thn = (parts.tahun || new Date().getFullYear().toString()).trim();

  if (prodi) {
    return `${nomor}/${klas}/${inst}/${prodi}/${bulan}/${thn}`;
  }
  return `${nomor}/${klas}/${inst}/${bulan}/${thn}`;
}

/**
 * Otomatisasi penomoran SK berdasarkan Jenis Dokumen:
 * - SK Mengajar -> Kode SK-BKD
 * - SK Bimbingan -> Kode SK-TA atau SK-KP
 * - SK Yudisium -> Kode SK-YUD atau SK-DEK
 */
export function generateAutoSkForDocType(
  jenis: JenisSkDokumenTU,
  options?: {
    prodiCode?: string;
    date?: Date | string;
    sequence?: number | string;
    subType?: 'TA' | 'KP'; // untuk SK Bimbingan
  }
): { 
  nomorSk: string; 
  kodeKlasifikasi: string; 
  perihal: string; 
  deskripsi: string;
  bulanRomawi: string;
  tahun: string;
  nomorUrut: string;
  kodeProdi: string;
} {
  const config = SK_DOKUMEN_CONFIGS[jenis] || SK_DOKUMEN_CONFIGS['SK Mengajar'];
  const targetDate = options?.date ? new Date(options.date) : new Date();
  const romanMonth = getRomanMonth(targetDate);
  const year = !isNaN(targetDate.getFullYear()) ? targetDate.getFullYear().toString() : new Date().getFullYear().toString();
  
  let kodeKlasifikasi = config.kodeKlasifikasi;
  let perihal = config.perihalDefault;

  if (jenis === 'SK Bimbingan' && options?.subType === 'KP') {
    kodeKlasifikasi = 'SK-KP';
    perihal = 'Penugasan Dosen Pembimbing Kerja Praktik Mahasiswa';
  } else if (jenis === 'SK Bimbingan' && options?.subType === 'TA') {
    kodeKlasifikasi = 'SK-TA';
    perihal = 'Penetapan Dosen Pembimbing dan Penguji Tugas Akhir Mahasiswa';
  }

  const rawSeq = options?.sequence 
    ? options.sequence.toString().padStart(3, '0')
    : config.defaultSeq;

  const prodi = options?.prodiCode || '';

  const parts: SkParts = {
    nomorUrut: rawSeq,
    klasifikasi: kodeKlasifikasi,
    instansi: 'FT-UNBARI',
    kodeProdi: prodi,
    bulanRomawi: romanMonth,
    tahun: year
  };

  return {
    nomorSk: buildSkNumber(parts),
    kodeKlasifikasi,
    perihal,
    deskripsi: config.deskripsi,
    bulanRomawi: romanMonth,
    tahun: year,
    nomorUrut: rawSeq,
    kodeProdi: prodi
  };
}

/**
 * Mem-parse string nomor SK UNBARI menjadi objek bagian-bagian
 */
export function parseSkNumber(rawStr: string): SkParts {
  const currentYear = new Date().getFullYear().toString();
  const currentRomanMonth = getRomanMonth(new Date());

  const defaults: SkParts = {
    nomorUrut: '085',
    klasifikasi: 'SK-DEK',
    instansi: 'FT-UNBARI',
    kodeProdi: '',
    bulanRomawi: currentRomanMonth,
    tahun: currentYear
  };

  if (!rawStr || typeof rawStr !== 'string') {
    return defaults;
  }

  const clean = rawStr.trim().replace(/^NOMOR\s*:\s*/i, '');
  const segments = clean.split('/').map(s => s.trim());

  if (segments.length >= 6) {
    // Format: 085 / SK-DEK / FT-UNBARI / TS / VIII / 2026
    return {
      nomorUrut: segments[0] || '085',
      klasifikasi: segments[1] || 'SK-DEK',
      instansi: segments[2] || 'FT-UNBARI',
      kodeProdi: segments[3] || '',
      bulanRomawi: segments[4] || currentRomanMonth,
      tahun: segments[5] || currentYear
    };
  }

  if (segments.length === 5) {
    // Bisa berupa:
    // Format A (tanpa prodi): 085 / SK-DEK / FT-UNBARI / VIII / 2026
    // Format B (dengan prodi tapi instansi ringkas): 085 / SK / FT-UNBARI / VIII / 2026
    const seg3 = segments[3];
    const isSeg3Roman = ROMAN_MONTHS.includes(seg3.toUpperCase());

    if (isSeg3Roman) {
      return {
        nomorUrut: segments[0] || '085',
        klasifikasi: segments[1] || 'SK-DEK',
        instansi: segments[2] || 'FT-UNBARI',
        kodeProdi: '',
        bulanRomawi: seg3.toUpperCase(),
        tahun: segments[4] || currentYear
      };
    } else {
      // seg3 mungkin kode prodi
      return {
        nomorUrut: segments[0] || '085',
        klasifikasi: segments[1] || 'SK-DEK',
        instansi: 'FT-UNBARI',
        kodeProdi: segments[2] || '',
        bulanRomawi: segments[3] || currentRomanMonth,
        tahun: segments[4] || currentYear
      };
    }
  }

  if (segments.length === 4) {
    return {
      nomorUrut: segments[0] || '085',
      klasifikasi: segments[1] || 'SK-DEK',
      instansi: segments[2] || 'FT-UNBARI',
      kodeProdi: '',
      bulanRomawi: currentRomanMonth,
      tahun: segments[3] || currentYear
    };
  }

  // Jika format bebas / 1 segmen
  return {
    ...defaults,
    nomorUrut: clean
  };
}

/**
 * Validasi apakah nomor SK memenuhi format resmi FT UNBARI
 */
export function validateSkNumber(sk: string): { isValid: boolean; message: string } {
  if (!sk || sk.trim().length === 0) {
    return { isValid: false, message: 'Nomor SK belum diisi' };
  }
  const clean = sk.trim().replace(/^NOMOR\s*:\s*/i, '');
  const segments = clean.split('/');

  if (segments.length < 4) {
    return { 
      isValid: false, 
      message: 'Format minimal harus memiliki 4 segmen: [No]/[Klasifikasi]/[Instansi]/[Tahun]' 
    };
  }

  const hasInstansi = segments.some(s => s.toUpperCase().includes('UNBARI') || s.toUpperCase().includes('FT'));
  if (!hasInstansi) {
    return {
      isValid: false,
      message: 'Peringatan: Instansi FT-UNBARI tidak ditemukan dalam format nomor SK'
    };
  }

  return { isValid: true, message: 'Format SK sesuai standar Fakultas Teknik UNBARI' };
}

/**
 * Pre-set template siap pakai untuk penomoran SK UNBARI
 */
export interface SkPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  parts: Partial<SkParts>;
}

export function getSkPresets(year: string, romanMonth: string): SkPreset[] {
  return [
    {
      id: 'sk-dek-yudisium',
      name: 'SK Dekan Yudisium Bersama',
      badge: 'Fakultas',
      description: 'Digunakan untuk penetapan yudisium gabungan tingkat Fakultas Teknik',
      parts: {
        nomorUrut: '085',
        klasifikasi: 'SK-DEK',
        instansi: 'FT-UNBARI',
        kodeProdi: '',
        bulanRomawi: romanMonth,
        tahun: year
      }
    },
    {
      id: 'sk-yud-sipil',
      name: 'SK Yudisium Teknik Sipil',
      badge: 'S1 Sipil',
      description: 'Penetapan yudisium khusus lulusan Program Studi S1 Teknik Sipil',
      parts: {
        nomorUrut: '112',
        klasifikasi: 'SK-YUD',
        instansi: 'FT-UNBARI',
        kodeProdi: 'TS',
        bulanRomawi: romanMonth,
        tahun: year
      }
    },
    {
      id: 'sk-yud-lingkungan',
      name: 'SK Yudisium Teknik Lingkungan',
      badge: 'S1 Lingkungan',
      description: 'Penetapan yudisium khusus lulusan Program Studi S1 Teknik Lingkungan',
      parts: {
        nomorUrut: '094',
        klasifikasi: 'SK-YUD',
        instansi: 'FT-UNBARI',
        kodeProdi: 'TL',
        bulanRomawi: romanMonth,
        tahun: year
      }
    },
    {
      id: 'sk-yud-listrik',
      name: 'SK Yudisium Teknik Listrik (D3)',
      badge: 'D3 Listrik',
      description: 'Penetapan yudisium khusus lulusan Program Studi D3 Teknik Listrik',
      parts: {
        nomorUrut: '031',
        klasifikasi: 'SK-YUD',
        instansi: 'FT-UNBARI',
        kodeProdi: 'TL-D3',
        bulanRomawi: romanMonth,
        tahun: year
      }
    },
    {
      id: 'sk-ta-pembimbing',
      name: 'SK Dosen Pembimbing TA',
      badge: 'Tugas Akhir',
      description: 'Penugasan dosen pembimbing dan penguji sidang skripsi',
      parts: {
        nomorUrut: '045',
        klasifikasi: 'SK-TA',
        instansi: 'FT-UNBARI',
        kodeProdi: 'TS',
        bulanRomawi: romanMonth,
        tahun: year
      }
    },
    {
      id: 'sk-kerja-praktik',
      name: 'SK Pembimbing Kerja Praktik',
      badge: 'Kerja Praktik',
      description: 'Penetapan pembimbingan kerja praktik mahasiswa ke instansi/industri',
      parts: {
        nomorUrut: '028',
        klasifikasi: 'SK-KP',
        instansi: 'FT-UNBARI',
        kodeProdi: 'TL',
        bulanRomawi: romanMonth,
        tahun: year
      }
    }
  ];
}
