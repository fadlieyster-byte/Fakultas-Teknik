import { MataKuliahCplMatrixRecord, LevelKontribusiCpl, CpmkItemObe } from '../types/index';

interface RawSipilCourse {
  kodeMK: string;
  namaMK: string;
  sks: number;
  semPenyajian: string;
}

const RAW_SIPIL_COURSES: RawSipilCourse[] = [
  { kodeMK: 'BPM41404', namaMK: 'PRAKTIKUM MEKANIKA TANAH', sks: 1, semPenyajian: '' },
  { kodeMK: 'MBB41731', namaMK: 'KERJA PRAKTEK', sks: 2, semPenyajian: '' },
  { kodeMK: 'MBB41733', namaMK: 'KULIAH KERJA NYATA', sks: 4, semPenyajian: '' },
  { kodeMK: 'MKB41539', namaMK: 'STRUKTUR BETON II', sks: 2, semPenyajian: '' },
  { kodeMK: 'MKB41540', namaMK: 'PENGEMBANGAN SUMBER DAYA AIR', sks: 2, semPenyajian: '' },
  { kodeMK: 'MKB41541', namaMK: 'REKAYASA PONDASI I', sks: 2, semPenyajian: '' },
  { kodeMK: 'MKB4171', namaMK: 'PERANCANGAN JALAN REL', sks: 2, semPenyajian: '' },
  { kodeMK: 'MKB41749', namaMK: 'STRUKTUR BAJA III', sks: 3, semPenyajian: '' },
  { kodeMK: 'MKB41750', namaMK: 'PEMINDAHAN TANAH MEKANIS', sks: 2, semPenyajian: '' },
  { kodeMK: 'MKB41751', namaMK: 'PERANCANGAN JALAN REL', sks: 2, semPenyajian: '' },
  { kodeMK: 'MKB41752', namaMK: 'ANALISA MENGENAI DAMPAK LINGKUNGAN', sks: 2, semPenyajian: '' },
  { kodeMK: 'MKK41131', namaMK: 'MATEMATIKA I', sks: 3, semPenyajian: '' },
  { kodeMK: 'MKK41132', namaMK: 'FISIKA DASAR', sks: 2, semPenyajian: '' },
  { kodeMK: 'MKK41133', namaMK: 'KIMIA TERAPAN', sks: 2, semPenyajian: '' },
  { kodeMK: 'MKK41134', namaMK: 'PENGANTAR GEOLOGI REKAYASA', sks: 2, semPenyajian: '' },
  { kodeMK: 'MKK41343', namaMK: 'MATEMATIKA III', sks: 3, semPenyajian: '' },
  { kodeMK: 'MKK41345', namaMK: 'MEKANIKA TANAH I', sks: 2, semPenyajian: '' },
  { kodeMK: 'MKK41346', namaMK: 'STATIKA DAN MEKANIKA BAHAN I', sks: 3, semPenyajian: '' },
  { kodeMK: 'MKK41349', namaMK: 'REKAYASA LINGKUNGAN', sks: 2, semPenyajian: '' },
  { kodeMK: 'MKK41555', namaMK: 'METODE RISET DAN PENULISAN LAPORAN', sks: 2, semPenyajian: '' },
  { kodeMK: 'MKK41829', namaMK: 'STRUKTUR BAJA PLASTIS', sks: 3, semPenyajian: '' },
  { kodeMK: 'MPB41332', namaMK: 'PRAKTIKUM ILMU UKUR TANAH', sks: 1, semPenyajian: '' },
  { kodeMK: 'MPB41535', namaMK: 'REKAYASA EKONOMI', sks: 2, semPenyajian: '' },
  { kodeMK: 'MPB41536', namaMK: 'PRAKTIKUM BAHAN BETON', sks: 1, semPenyajian: '' },
  { kodeMK: 'MPB41840', namaMK: 'TUGAS AKHIR', sks: 4, semPenyajian: '' },
  { kodeMK: 'MPK41131', namaMK: 'PENDIDIKAN AGAMA', sks: 3, semPenyajian: '' },
  { kodeMK: 'MPK41132', namaMK: 'PENDIDIKAN KEWARGANEGARAAN', sks: 3, semPenyajian: '' },
  { kodeMK: 'MPK41133', namaMK: 'ILMU SOSIAL DAN BUDAYA DASAR', sks: 3, semPenyajian: '' },
  { kodeMK: 'MPK41134', namaMK: 'BAHASA INDONESIA', sks: 3, semPenyajian: '' },
  { kodeMK: 'UBF41102', namaMK: 'FISIKA TEKNIK', sks: 2, semPenyajian: '01' },
  { kodeMK: 'UBF41103', namaMK: 'PRAKTIKUM FISIKA TEKNIK', sks: 1, semPenyajian: '01' },
  { kodeMK: 'UBN41101', namaMK: 'PENDIDIKAN AGAMA', sks: 2, semPenyajian: '01' },
  { kodeMK: 'UBN41102', namaMK: 'PENDIDIKAN PANCASILA', sks: 2, semPenyajian: '01' },
  { kodeMK: 'UBN41104', namaMK: 'BAHASA INDONESIA', sks: 2, semPenyajian: '01' },
  { kodeMK: 'UBP41101', namaMK: 'MATEMATIKA I', sks: 3, semPenyajian: '01' },
  { kodeMK: 'UBP41102', namaMK: 'FISIKA TEKNIK', sks: 3, semPenyajian: '01' },
  { kodeMK: 'UBP41103', namaMK: 'KIMIA TERAPAN', sks: 2, semPenyajian: '01' },
  { kodeMK: 'UBP41104', namaMK: 'PENGANTAR GEOLOGI REKAYASA', sks: 2, semPenyajian: '01' },
  { kodeMK: 'UBP41105', namaMK: 'TEKNOLOGI BAHAN KONSTRUKSI', sks: 2, semPenyajian: '01' },
  { kodeMK: 'UBP41110', namaMK: 'TEKNOLOGI BAHAN KONSTRUKSI', sks: 2, semPenyajian: '01' },
  { kodeMK: 'UBP41212', namaMK: 'PRAKTIKUM FISIKA', sks: 1, semPenyajian: '01' },
  { kodeMK: 'UBR41103', namaMK: 'ILMU SOSIAL DASAR', sks: 2, semPenyajian: '01' },
  { kodeMK: 'MKK41235', namaMK: 'FISIKA TEKNIK', sks: 2, semPenyajian: '02' },
  { kodeMK: 'MKK41241', namaMK: 'ILMU UKUR TANAH', sks: 2, semPenyajian: '03' },
  { kodeMK: 'MKK41344', namaMK: 'ANALISA NUMERIK', sks: 2, semPenyajian: '03' },
  { kodeMK: 'UBP 41317', namaMK: 'PRAKTIKUM MEKANIKA FLUIDA DAN HIDROLIKA', sks: 1, semPenyajian: '03' },
  { kodeMK: 'UBP41308', namaMK: 'MATEMATIKA REKAYASA II', sks: 2, semPenyajian: '03' },
  { kodeMK: 'UBP41309', namaMK: 'ANALISA NUMERIK', sks: 2, semPenyajian: '03' },
  { kodeMK: 'UBP41310', namaMK: 'MEKANIKA TANAH I', sks: 2, semPenyajian: '03' },
  { kodeMK: 'UBP41311', namaMK: 'STATIKA DAN MEK. BAHAN I', sks: 3, semPenyajian: '03' },
  { kodeMK: 'UBP41312', namaMK: 'MENGG. REKAYASA DAN STRUK. BANGUNAN II', sks: 2, semPenyajian: '03' },
  { kodeMK: 'UBP41313', namaMK: 'MATEMATIKA III', sks: 3, semPenyajian: '03' },
  { kodeMK: 'UBP41314', namaMK: 'ANALISA NUMERIK', sks: 2, semPenyajian: '03' },
  { kodeMK: 'UBP41315', namaMK: 'MEKANIKA TANAH I', sks: 2, semPenyajian: '03' },
  { kodeMK: 'UBP41316', namaMK: 'STATIKA DAN MEKANIKA BAHAN I', sks: 3, semPenyajian: '03' },
  { kodeMK: 'UBP41317', namaMK: 'MENGG. REKAYASA DAN STRUKTUR BANGUNAN II', sks: 2, semPenyajian: '03' },
  { kodeMK: 'UBP41320', namaMK: 'REKAYASA LINGKUNGAN', sks: 2, semPenyajian: '03' },
  { kodeMK: 'UBP41321', namaMK: 'PRAKTIKUM IUT', sks: 1, semPenyajian: '03' },
  { kodeMK: 'UBP41322', namaMK: 'HIDROLIKA', sks: 2, semPenyajian: '03' },
  { kodeMK: 'UBP41323', namaMK: 'STRUKTUR BETON I', sks: 2, semPenyajian: '03' },
  { kodeMK: 'UBP41324', namaMK: 'ILMU UKUR TANAH', sks: 2, semPenyajian: '03' },
  { kodeMK: 'UBP41325', namaMK: 'PERANCANGAN GEOMETRI JALAN', sks: 2, semPenyajian: '03' },
  { kodeMK: 'UBP41328', namaMK: 'HIDROLIKA', sks: 2, semPenyajian: '03' },
  { kodeMK: 'UBP41329', namaMK: 'PERENCANAAN GEOMETRIK JALAN', sks: 2, semPenyajian: '03' },
  { kodeMK: 'UBP41330', namaMK: 'PRAK. MEKANIKA FLUIDA DAN HIDROLIKA', sks: 1, semPenyajian: '03' },
  { kodeMK: 'MKB41434', namaMK: 'DRAINASE PERKOTAAN', sks: 2, semPenyajian: '04' },
  { kodeMK: 'MPB41433', namaMK: 'PRAKTIKUM FISIKA', sks: 1, semPenyajian: '04' },
  { kodeMK: 'UBP41531', namaMK: 'ANALISA STRUKTUR I', sks: 3, semPenyajian: '05' },
  { kodeMK: 'UBP41532', namaMK: 'REKAYASA EKONOMI', sks: 2, semPenyajian: '05' },
  { kodeMK: 'UBP41534', namaMK: 'STRUKTUR BETON II', sks: 3, semPenyajian: '05' },
  { kodeMK: 'UBP41535', namaMK: 'REKAYASA PONDASI I', sks: 2, semPenyajian: '05' },
  { kodeMK: 'UBP41536', namaMK: 'STRUKTUR BAJA II', sks: 2, semPenyajian: '05' },
  { kodeMK: 'UBP41537', namaMK: 'METODOLOGI RISET DAN PEN. LAPORAN', sks: 2, semPenyajian: '05' },
  { kodeMK: 'UBP41538', namaMK: 'PENGELOLAAN SUMBER DAYA AIR', sks: 2, semPenyajian: '05' },
  { kodeMK: 'UBP41539', namaMK: 'MANAGEMEN REKAYASA KONSTRUKSI', sks: 2, semPenyajian: '05' },
  { kodeMK: 'UBP41540', namaMK: 'PRAKTIKUM BAHAN BETON', sks: 1, semPenyajian: '05' },
  { kodeMK: 'UBP41541', namaMK: 'PRAKTIKUM BAHAN JALAN', sks: 1, semPenyajian: '05' },
  { kodeMK: 'MKB41643', namaMK: 'STRUKTUR BETON III', sks: 3, semPenyajian: '06' },
  { kodeMK: 'MKB41647', namaMK: 'LAPANGAN TERBANG', sks: 2, semPenyajian: '06' },
  { kodeMK: 'MKB41648', namaMK: 'PELABUHAN', sks: 2, semPenyajian: '06' },
  { kodeMK: 'MPB41637', namaMK: 'MANAJEMEN KOSTRUKSI', sks: 2, semPenyajian: '06' },
  { kodeMK: 'UBF41701', namaMK: 'KERJA PRAKTEK', sks: 2, semPenyajian: '07' },
  { kodeMK: 'UBP4101**', namaMK: 'REKAYASA SUNGAI DAN RAWA', sks: 2, semPenyajian: '07' },
  { kodeMK: 'UBP4102*', namaMK: 'BANGUNAN TENAGA AIR', sks: 2, semPenyajian: '07' },
  { kodeMK: 'UBP4103**', namaMK: 'PELABUHAN', sks: 2, semPenyajian: '07' },
  { kodeMK: 'UBP4104**', namaMK: 'REKAYASA GEMPA DAN VIBRASI', sks: 3, semPenyajian: '07' },
  { kodeMK: 'UBP4105**', namaMK: 'STRUKTUR BETON PRATEGANG', sks: 3, semPenyajian: '07' },
  { kodeMK: 'UBP4106**', namaMK: 'STRUKTUR BAJA III', sks: 3, semPenyajian: '07' },
  { kodeMK: 'UBP4107**', namaMK: 'VALUE ENGINEERING', sks: 2, semPenyajian: '07' },
  { kodeMK: 'UBP4109*', namaMK: 'SISTEM MANAJEMEN KESEL. KERJA KONSTRUKSI', sks: 2, semPenyajian: '07' },
  { kodeMK: 'UBP4110**', namaMK: 'REKAYASA LALU LINTAS', sks: 2, semPenyajian: '07' },
  { kodeMK: 'UBP4111*', namaMK: 'PERANCANGAN JALAN REL', sks: 2, semPenyajian: '07' },
  { kodeMK: 'UBP4112**', namaMK: 'MANAJEMEN LALU LINTAS', sks: 2, semPenyajian: '07' },
  { kodeMK: 'UBP4113*', namaMK: 'ANALISA MENGENAI DAMPAK LINKUNGAN', sks: 2, semPenyajian: '07' },
  { kodeMK: 'UBP4114*', namaMK: 'STRUKTUR BETON III', sks: 3, semPenyajian: '07' },
  { kodeMK: 'UBP41751', namaMK: 'ANALISA STRUKTUR III', sks: 3, semPenyajian: '07' },
  { kodeMK: 'UBP41752', namaMK: 'LAPANGAN TERBANG', sks: 2, semPenyajian: '07' },
  { kodeMK: 'UBP41857', namaMK: 'TUGAS AKHIR/SKRIPSI', sks: 4, semPenyajian: '07' },
  { kodeMK: 'UBR41705', namaMK: 'KULIAH KERJA NYATA (KUKERTA)', sks: 4, semPenyajian: '07' },
  { kodeMK: 'UBP4108**', namaMK: 'TATA LAKSANA PROYEK DAN HUKUM KONSTRUKSI', sks: 2, semPenyajian: '08' },
  { kodeMK: 'UBF41101', namaMK: 'MATEMATIKA TEKNIK', sks: 3, semPenyajian: '1' },
  { kodeMK: 'MPB41434', namaMK: 'PRAKTIKUM BAHAN JALAN', sks: 1, semPenyajian: '4' },
  { kodeMK: 'UBP41426', namaMK: 'STRUKTUR BETON I', sks: 2, semPenyajian: '4' },
  { kodeMK: 'UBP41429', namaMK: 'STRUKTUR KAYU', sks: 2, semPenyajian: '4' },
  { kodeMK: 'MKB41642', namaMK: 'STRUKTUR BAJA II', sks: 2, semPenyajian: '5' },
  { kodeMK: 'UBP41533', namaMK: 'DRAINASE PERKOTAAN', sks: 2, semPenyajian: '5' },
  { kodeMK: 'UBP41542', namaMK: 'STRUKTUR BETON II', sks: 3, semPenyajian: '5' },
  { kodeMK: 'UBP41543', namaMK: 'REKAYASA PONDASI I', sks: 2, semPenyajian: '5' },
  { kodeMK: 'UBP41544', namaMK: 'STRUKTUR BAJA II', sks: 2, semPenyajian: '5' },
  { kodeMK: 'UBP41545', namaMK: 'PENGAMBANGAN SUMBER DAYA AIR', sks: 2, semPenyajian: '5' },
  { kodeMK: 'UBP41546', namaMK: 'MANAJEMEN KONSTRUKSI', sks: 2, semPenyajian: '5' },
  { kodeMK: 'UBP41547', namaMK: 'PRAKTIKUM BAHAN BETON', sks: 1, semPenyajian: '5' },
  { kodeMK: 'MKK41656', namaMK: 'ANALISA STRUKTUR II', sks: 3, semPenyajian: '6' },
  { kodeMK: 'UBP41604', namaMK: 'APLIKASI KOMPUTER', sks: 2, semPenyajian: '6' },
  { kodeMK: 'UBP41638', namaMK: 'ANALISA STRUKTUR II', sks: 3, semPenyajian: '6' },
  { kodeMK: 'UBP41639', namaMK: 'REKAYASA PONDASI II', sks: 2, semPenyajian: '6' },
  { kodeMK: 'UBP41640', namaMK: 'KEWIRAUSAHAAN TEKNIK', sks: 2, semPenyajian: '6' },
  { kodeMK: 'UBP41641', namaMK: 'METODE RISET DAN PENULISAN LAPORAN', sks: 2, semPenyajian: '6' },
  { kodeMK: 'UBP41642', namaMK: 'REKAYASA EKONOMI', sks: 2, semPenyajian: '6' },
  { kodeMK: 'UBP41743', namaMK: 'ANALISA STRUKTUR III', sks: 3, semPenyajian: '7' },
  { kodeMK: 'UBP41744', namaMK: 'IRIGASI DAN BANGUNAN AIR', sks: 3, semPenyajian: '7' },
  { kodeMK: 'UBP41745', namaMK: 'LAPANGAN TERBANG', sks: 2, semPenyajian: '7' },
  { kodeMK: 'UBP41746', namaMK: 'REKAYASA LINGKUNGAN', sks: 2, semPenyajian: '7' },
  { kodeMK: 'UBP41747', namaMK: 'KERJA PRAKTEK', sks: 2, semPenyajian: '7' },
  { kodeMK: 'UBR41706', namaMK: 'KULIAH KERJA NYATA (KUKERTA)', sks: 2, semPenyajian: '7' },
  { kodeMK: 'UBP41848', namaMK: 'TUGAS AKHIR', sks: 6, semPenyajian: '8' },
  { kodeMK: 'MKB41536', namaMK: 'REKAYASA SUNGAI DAN RAWA', sks: 2, semPenyajian: 'B' },
  { kodeMK: 'MKB41537', namaMK: 'STRUKTUR KAYU', sks: 2, semPenyajian: 'B' },
  { kodeMK: 'MKB41538', namaMK: 'STRUKTUR BAJA I', sks: 2, semPenyajian: 'B' },
  { kodeMK: 'MKK41347', namaMK: 'MENGG. REKAYASA DAN STRUKTUR BANGUNAN II', sks: 2, semPenyajian: 'K' },
  { kodeMK: 'MKK41348', namaMK: 'HIDROLIKA', sks: 2, semPenyajian: 'K' },
  { kodeMK: 'MKK41554', namaMK: 'ANALISA STRUKTUR I', sks: 3, semPenyajian: 'K' },
  { kodeMK: 'MKK41757', namaMK: 'ANALISA STRUKTUR III', sks: 3, semPenyajian: 'K' }
];

const SIPIL_LECTURERS_BY_DOMAIN = {
  struktur: 'Ir. Suhendra, M.T.',
  beton: 'Ir. Rioni Rizki Aldiansyah, ST., MT, IPM, ASEAN Eng.',
  baja: 'Annisaa Dwiretnani, S.T., M.T.',
  geoteknik: 'Dwitya Okky Azanna, S.T., M.Eng.',
  hidro: 'Ir. Azwarman, MT',
  transportasi: 'Ir. Muhammad Asmuni Jatoeb, M.T.',
  manajemen: 'Elvira Handayani, S.T., M.T.',
  sains: 'Fadlan, S.T., M.T.',
  lingkungan: 'Emelda Raudhati, S.T., M.T.',
  umum: 'Tim Pengampu MKU FT UNBARI'
};

function resolveSipilCourseMetadata(raw: RawSipilCourse): {
  semester: number;
  semesterLabel: string;
  kelompokKurikulum: 'Wajib' | 'Pilihan';
  kategori: MataKuliahCplMatrixRecord['kategori'];
  dosenPengampu: string;
  pemetaanCpl: Record<string, LevelKontribusiCpl>;
  cpmkList: CpmkItemObe[];
  catatanKurikulum: string;
} {
  const upperName = raw.namaMK.toUpperCase();
  const upperCode = raw.kodeMK.toUpperCase();
  const semTrim = raw.semPenyajian.trim().toUpperCase();

  let semester = 0;
  let semesterLabel = '-';
  if (/^\d+$/.test(semTrim)) {
    semester = parseInt(semTrim, 10);
    semesterLabel = semTrim.padStart(2, '0');
  } else if (semTrim === 'B' || semTrim === 'K') {
    semester = 0;
    semesterLabel = semTrim;
  }

  // Classify Wajib vs Pilihan
  const isPilihan =
    upperCode.includes('*') ||
    upperName.includes('LAPANGAN TERBANG') ||
    upperName.includes('PELABUHAN') ||
    upperName.includes('JALAN REL') ||
    upperName.includes('VALUE ENGINEERING') ||
    upperName.includes('BANGUNAN TENAGA AIR') ||
    upperName.includes('STRUKTUR BAJA PLASTIS') ||
    upperName.includes('STRUKTUR BETON PRATEGANG') ||
    upperName.includes('STRUKTUR BAJA III') ||
    upperName.includes('STRUKTUR BETON III') ||
    upperName.includes('PEMINDAHAN TANAH MEKANIS') ||
    upperName.includes('REKAYASA GEMPA');

  const kelompokKurikulum: 'Wajib' | 'Pilihan' = isPilihan ? 'Pilihan' : 'Wajib';

  // Detailed Kategori
  let kategori: MataKuliahCplMatrixRecord['kategori'] = 'Wajib Prodi';
  if (upperName.includes('TUGAS AKHIR') || upperName.includes('SKRIPSI') || upperName.includes('KERJA PRAKTEK') || upperName.includes('KULIAH KERJA NYATA')) {
    kategori = 'Tugas Akhir';
  } else if (isPilihan) {
    kategori = 'Pilihan';
  } else if (upperName.includes('PRAKTIKUM') || upperName.includes('PRAK.') || upperName.includes('MENGG.') || upperName.includes('APLIKASI KOMPUTER')) {
    kategori = 'Studio/Praktikum';
  } else if (
    upperCode.startsWith('UBN') ||
    upperCode.startsWith('UBF') ||
    upperCode.startsWith('UBR') ||
    upperCode.startsWith('MPK') ||
    upperName.includes('MATEMATIKA') ||
    upperName.includes('FISIKA') ||
    upperName.includes('KIMIA') ||
    upperName.includes('AGAMA') ||
    upperName.includes('PANCASILA') ||
    upperName.includes('KEWARGANEGARAAN') ||
    upperName.includes('BAHASA INDONESIA') ||
    upperName.includes('ILMU SOSIAL')
  ) {
    kategori = 'Wajib Fakultas';
  }

  // Domain classification for lecturer & realistic OBE mapping
  let dosenPengampu = SIPIL_LECTURERS_BY_DOMAIN.struktur;
  let pemetaanCpl: Record<string, LevelKontribusiCpl> = {
    'CPL-01': 'Low',
    'CPL-02': 'Strong',
    'CPL-03': 'Strong',
    'CPL-04': 'Medium',
    'CPL-05': 'Low',
    'CPL-06': 'Medium',
    'CPL-07': 'Medium',
    'CPL-08': 'Low'
  };
  let cpmkFocus = 'analisis rekayasa dan perancangan komponen sipil sesuai SNI';

  if (upperName.includes('AGAMA') || upperName.includes('PANCASILA') || upperName.includes('KEWARGANEGARAAN') || upperName.includes('ILMU SOSIAL')) {
    dosenPengampu = SIPIL_LECTURERS_BY_DOMAIN.umum;
    pemetaanCpl = { 'CPL-01': 'Strong', 'CPL-02': 'None', 'CPL-03': 'None', 'CPL-04': 'None', 'CPL-05': 'Low', 'CPL-06': 'None', 'CPL-07': 'Medium', 'CPL-08': 'Strong' };
    cpmkFocus = 'nilai moral, integritas kebangsaan, etika profesi keteknikan, dan kerjasama sosial';
  } else if (upperName.includes('BAHASA INDONESIA') || upperName.includes('METODE RISET') || upperName.includes('METODOLOGI RISET')) {
    dosenPengampu = SIPIL_LECTURERS_BY_DOMAIN.manajemen;
    pemetaanCpl = { 'CPL-01': 'Medium', 'CPL-02': 'Medium', 'CPL-03': 'Low', 'CPL-04': 'Medium', 'CPL-05': 'Low', 'CPL-06': 'Medium', 'CPL-07': 'Strong', 'CPL-08': 'Medium' };
    cpmkFocus = 'penyusunan karya tulis ilmiah, metode riset teknik sipil, dan komunikasi akademik';
  } else if (upperName.includes('MATEMATIKA') || upperName.includes('FISIKA') || upperName.includes('KIMIA') || upperName.includes('ANALISA NUMERIK')) {
    dosenPengampu = SIPIL_LECTURERS_BY_DOMAIN.sains;
    const isPrak = upperName.includes('PRAK');
    pemetaanCpl = {
      'CPL-01': 'Low',
      'CPL-02': 'Strong',
      'CPL-03': 'Medium',
      'CPL-04': isPrak ? 'Strong' : 'Low',
      'CPL-05': 'None',
      'CPL-06': upperName.includes('NUMERIK') ? 'Strong' : 'Low',
      'CPL-07': isPrak ? 'Medium' : 'Low',
      'CPL-08': isPrak ? 'Strong' : 'Low'
    };
    cpmkFocus = isPrak ? 'pengujian eksperimen fisika material dan pengukuran laboratorium' : 'konsep sains rekayasa, kalkulus, dan pemodelan matematis sipil';
  } else if (upperName.includes('TANAH') || upperName.includes('GEOLOGI') || upperName.includes('PONDASI') || upperName.includes('UKUR TANAH') || upperName.includes('IUT')) {
    dosenPengampu = SIPIL_LECTURERS_BY_DOMAIN.geoteknik;
    const isPrak = upperName.includes('PRAK') || upperName.includes('UKUR');
    pemetaanCpl = {
      'CPL-01': 'Medium',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Strong',
      'CPL-05': 'Low',
      'CPL-06': 'Medium',
      'CPL-07': 'Medium',
      'CPL-08': isPrak ? 'Strong' : 'Medium'
    };
    cpmkFocus = 'karakteristik geoteknik, daya dukung pondasi tanah lunak, dan pemetaan topografi';
  } else if (upperName.includes('HIDROLIKA') || upperName.includes('FLUIDA') || upperName.includes('DRAINASE') || upperName.includes('SUNGAI') || upperName.includes('SUMBER DAYA AIR') || upperName.includes('IRIGASI') || upperName.includes('TENAGA AIR') || upperName.includes('PELABUHAN')) {
    dosenPengampu = SIPIL_LECTURERS_BY_DOMAIN.hidro;
    pemetaanCpl = {
      'CPL-01': 'Medium',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': upperName.includes('PRAK') ? 'Strong' : 'Medium',
      'CPL-05': 'Low',
      'CPL-06': 'Strong',
      'CPL-07': 'Medium',
      'CPL-08': 'Medium'
    };
    cpmkFocus = 'rekayasa keairan, hidraulika saluran terbuka, drainase perkotaan, dan bangunan air DAS Batanghari';
  } else if (upperName.includes('JALAN') || upperName.includes('LALU LINTAS') || upperName.includes('LAPANGAN TERBANG')) {
    dosenPengampu = SIPIL_LECTURERS_BY_DOMAIN.transportasi;
    pemetaanCpl = {
      'CPL-01': 'Medium',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': upperName.includes('PRAK') ? 'Strong' : 'Medium',
      'CPL-05': 'Medium',
      'CPL-06': 'Strong',
      'CPL-07': 'Medium',
      'CPL-08': 'Medium'
    };
    cpmkFocus = 'geometrik jalan, perkerasan lentur/kaku, dan manajemen rekayasa transportasi';
  } else if (upperName.includes('BETON') || upperName.includes('BAJA') || upperName.includes('KAYU') || upperName.includes('STATIKA') || upperName.includes('ANALISA STRUKTUR') || upperName.includes('GEMPA') || upperName.includes('BAHAN KONSTRUKSI')) {
    dosenPengampu = upperName.includes('BAJA') ? SIPIL_LECTURERS_BY_DOMAIN.baja : upperName.includes('BETON') ? SIPIL_LECTURERS_BY_DOMAIN.beton : SIPIL_LECTURERS_BY_DOMAIN.struktur;
    const isPrak = upperName.includes('PRAK') || upperName.includes('BAHAN');
    pemetaanCpl = {
      'CPL-01': 'Medium',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': isPrak ? 'Strong' : 'Medium',
      'CPL-05': 'Low',
      'CPL-06': 'Strong',
      'CPL-07': 'Medium',
      'CPL-08': 'Medium'
    };
    cpmkFocus = 'analisis mekanika struktur dan perancangan elemen beton, baja, serta tahan gempa berstandar SNI';
  } else if (upperName.includes('MANAJEMEN') || upperName.includes('MANAGEMEN') || upperName.includes('EKONOMI') || upperName.includes('VALUE') || upperName.includes('HUKUM') || upperName.includes('KESEL') || upperName.includes('KEWIRAUSAHAAN')) {
    dosenPengampu = SIPIL_LECTURERS_BY_DOMAIN.manajemen;
    pemetaanCpl = {
      'CPL-01': 'Strong',
      'CPL-02': 'Low',
      'CPL-03': 'Medium',
      'CPL-04': 'None',
      'CPL-05': 'Strong',
      'CPL-06': 'Medium',
      'CPL-07': 'Strong',
      'CPL-08': 'Strong'
    };
    cpmkFocus = 'penjadwalan proyek, estimasi RAB, kelayakan ekonomi teknik, dan K3/SMKK konstruksi';
  } else if (upperName.includes('MENGG.') || upperName.includes('APLIKASI KOMPUTER')) {
    dosenPengampu = SIPIL_LECTURERS_BY_DOMAIN.baja;
    pemetaanCpl = {
      'CPL-01': 'Low',
      'CPL-02': 'Medium',
      'CPL-03': 'Strong',
      'CPL-04': 'Low',
      'CPL-05': 'Low',
      'CPL-06': 'Strong',
      'CPL-07': 'Strong',
      'CPL-08': 'Medium'
    };
    cpmkFocus = 'pemodelan BIM, CAD gambar kerja rekayasa, dan komputasi struktur/keairan';
  } else if (upperName.includes('LINGKUNGAN') || upperName.includes('DAMPAK') || upperName.includes('LINKUNGAN')) {
    dosenPengampu = SIPIL_LECTURERS_BY_DOMAIN.lingkungan;
    pemetaanCpl = {
      'CPL-01': 'Strong',
      'CPL-02': 'Medium',
      'CPL-03': 'Medium',
      'CPL-04': 'Medium',
      'CPL-05': 'Medium',
      'CPL-06': 'Low',
      'CPL-07': 'Strong',
      'CPL-08': 'Strong'
    };
    cpmkFocus = 'kelestarian lingkungan konstruksi dan penyusunan kajian AMDAL infrastruktur sipil';
  } else if (upperName.includes('TUGAS AKHIR') || upperName.includes('SKRIPSI') || upperName.includes('KERJA PRAKTEK') || upperName.includes('KULIAH KERJA NYATA')) {
    dosenPengampu = SIPIL_LECTURERS_BY_DOMAIN.beton;
    pemetaanCpl = {
      'CPL-01': 'Strong',
      'CPL-02': 'Strong',
      'CPL-03': 'Strong',
      'CPL-04': 'Strong',
      'CPL-05': 'Strong',
      'CPL-06': 'Strong',
      'CPL-07': 'Strong',
      'CPL-08': 'Strong'
    };
    cpmkFocus = 'integrasi menyeluruh kompetensi riset, perancangan rekayasa, kerja lapangan, dan komunikasi ilmiah';
  }

  const supportedCpls = Object.entries(pemetaanCpl)
    .filter(([, lvl]) => lvl === 'Strong' || lvl === 'Medium')
    .map(([kode]) => kode);

  const primaryCpl = supportedCpls[0] || 'CPL-02';
  const secondaryCpl = supportedCpls[1] || primaryCpl;
  const thirdCpl = supportedCpls[2] || 'CPL-07';

  const cpmkList: CpmkItemObe[] = [
    {
      kode: 'CPMK-1',
      deskripsi: `Mampu memahami prinsip dasar dan formulasi konsep ${raw.namaMK} dalam lingkup Teknik Sipil (C3)`,
      levelBloom: 'C3 - Penerapan',
      cplTerkait: [primaryCpl],
      metodeAsesmen: 'Kuis & Tugas Terstruktur',
      bobotPersen: 30
    },
    {
      kode: 'CPMK-2',
      deskripsi: `Mampu menganalisis dan menyelesaikan permasalahan ${cpmkFocus} secara sistematis (C4)`,
      levelBloom: 'C4 - Analisis',
      cplTerkait: Array.from(new Set([primaryCpl, secondaryCpl])),
      metodeAsesmen: 'UTS & Studi Kasus',
      bobotPersen: 35
    },
    {
      kode: 'CPMK-3',
      deskripsi: `Mampu mengevaluasi hasil perhitungan/pengujian ${raw.namaMK} serta menyusun laporan teknis standar borang OBE (C5)`,
      levelBloom: 'C5 - Evaluasi/Sintesis',
      cplTerkait: Array.from(new Set([secondaryCpl, thirdCpl])),
      metodeAsesmen: kategori === 'Studio/Praktikum' ? 'Praktikum & Responsi Akhir' : 'UAS & Tugas Besar',
      bobotPersen: 35
    }
  ];

  return {
    semester,
    semesterLabel,
    kelompokKurikulum,
    kategori,
    dosenPengampu,
    pemetaanCpl,
    cpmkList,
    catatanKurikulum: `Kurikulum Resmi S1 Teknik Sipil UNBARI (TA 2026/2027 · Kelompok ${kelompokKurikulum} · Penyajian ${semesterLabel === '-' ? 'Lintas/Konversi' : `Sem ${semesterLabel}`}) — fokus pada ${cpmkFocus}.`
  };
}

export const TEKNIK_SIPIL_KURIKULUM_20261: MataKuliahCplMatrixRecord[] = RAW_SIPIL_COURSES.map((raw, idx) => {
  const meta = resolveSipilCourseMetadata(raw);
  return {
    id: `MK-SPL-261-${String(idx + 1).padStart(3, '0')}`,
    kodeMK: raw.kodeMK,
    namaMK: raw.namaMK,
    sks: raw.sks,
    semester: meta.semester,
    semesterLabel: meta.semesterLabel,
    kelompokKurikulum: meta.kelompokKurikulum,
    kategori: meta.kategori,
    dosenPengampu: meta.dosenPengampu,
    prodiId: 'SIPIL',
    cpmkList: meta.cpmkList,
    pemetaanCpl: meta.pemetaanCpl,
    catatanKurikulum: meta.catatanKurikulum
  };
});
