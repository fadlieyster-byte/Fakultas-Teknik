import * as XLSX from 'xlsx';
import {
  Mahasiswa,
  YudisiumRecord,
  MataKuliahCplMatrixRecord,
  CplItemObe,
  ProgramStudiInfo
} from '../types/index';

/**
 * Format string to be safely placed in a CSV cell
 */
function escapeCsvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exports students list to CSV formatted for Feeder PDDIKTI / Excel compatibility.
 * Includes UTF-8 BOM so Microsoft Excel opens it with proper Indonesian text formatting.
 */
export function exportMahasiswaToPddiktiCsv(
  mahasiswaList: Mahasiswa[],
  prodiNama: string,
  filterContextLabel?: string
): void {
  const headers = [
    'No',
    'NIM',
    'Nama Mahasiswa',
    'Jenis Kelamin',
    'Program Studi',
    'Jenjang',
    'Kelas',
    'Angkatan / Thn Masuk',
    'Semester',
    'Status Akademik',
    'IPK',
    'SKS Lulus',
    'SKS Semester Berjalan',
    'Asal Sekolah / SMA/SMK',
    'Dosen Pembimbing Akademik (PA)',
    'Status Peringatan (SP)',
    'Evaluasi Masa Studi (DO Guard)',
    'Konsentrasi / Peminatan',
    'Email Mahasiswa',
    'Nomor Handphone'
  ];

  const rows = mahasiswaList.map((mhs, idx) => {
    // DO Guard Status calculation
    let masaStudiStatus = 'Aman (Dalam Rentang Wajar)';
    if (mhs.semester >= 12) {
      masaStudiStatus = 'KRITIS - Mendekati Batas Maksimal DO (Sem 12-14)';
    } else if (mhs.semester >= 8) {
      masaStudiStatus = 'Perhatian Khusus - Melewati Masa Studi Ideal (Sem 8+)';
    } else if (mhs.peringatanSp > 0) {
      masaStudiStatus = `Evaluasi Khusus - Terbit SP ${mhs.peringatanSp}`;
    }

    return [
      idx + 1,
      mhs.nim,
      mhs.nama,
      mhs.jenisKelamin || (mhs.nim ? '-' : '-'),
      mhs.programStudi,
      mhs.jenjang,
      mhs.jenisKelas || 'REGULER',
      mhs.angkatan,
      mhs.semester,
      mhs.status,
      mhs.ipk.toFixed(2),
      mhs.sksLulus,
      mhs.sksSemesterIni,
      mhs.asalSekolah || '-',
      mhs.dosenPA,
      mhs.peringatanSp > 0 ? `SP ${mhs.peringatanSp}` : 'Tidak Ada (Normal)',
      masaStudiStatus,
      mhs.konsentrasi || '-',
      mhs.email || '-',
      mhs.nomorHp || '-'
    ].map(escapeCsvCell).join(',');
  });

  const csvContent = '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  const safeProdi = prodiNama.replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = new Date().toISOString().slice(0, 10);
  const filterSuffix = filterContextLabel ? `_${filterContextLabel.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
  link.setAttribute('download', `PDDIKTI_FT_UNBARI_${safeProdi}${filterSuffix}_${timestamp}.csv`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Yudisium & Wisuda records to CSV for PDDIKTI PIN & Ijazah reporting
 */
export function exportYudisiumToCsv(
  yudisiumList: YudisiumRecord[],
  prodiNama: string
): void {
  const headers = [
    'No',
    'NIM',
    'Nama Lengkap',
    'Jenis Kelamin',
    'Program Studi',
    'Jenjang',
    'Gelar Lulusan',
    'IPK',
    'SKS Lulus',
    'Lama Studi',
    'Predikat Kelulusan',
    'Tanggal Yudisium',
    'Nomor SK Yudisium Dekan',
    'Nomor Ijazah Nasional (PIN Dikti)',
    'Nomor Seri Ijazah',
    'Nomor Transkrip',
    'Judul Skripsi / Tugas Akhir',
    'Dosen Pembimbing 1',
    'Dosen Pembimbing 2',
    'Status Verifikasi Berkas',
    'Bebas Pustaka',
    'Bebas Lab',
    'Bebas Keuangan',
    'Bebas Plagiarisme Turnitin',
    'Unggah Jurnal Repo',
    'Status Wisuda',
    'Periode Wisuda',
    'Ukuran Toga'
  ];

  const rows = yudisiumList.map((y, idx) => [
    idx + 1,
    y.nim,
    y.nama,
    y.jenisKelamin,
    y.programStudi,
    y.jenjang,
    y.gelarLulusan,
    y.ipk.toFixed(2),
    y.sksLulus,
    y.lamaStudi,
    y.predikat,
    y.tanggalYudisium,
    y.nomorSkYudisium || '-',
    y.nomorIjazahNasional || '-',
    y.nomorSeriIjazah || '-',
    y.nomorTranskrip || '-',
    y.judulSkripsi,
    y.dosenPembimbing1,
    y.dosenPembimbing2 || '-',
    y.statusVerifikasi,
    y.syaratKelengkapan.bebasPustaka ? 'Lengkap' : 'Belum',
    y.syaratKelengkapan.bebasLab ? 'Lengkap' : 'Belum',
    y.syaratKelengkapan.bebasKeuangan ? 'Lengkap' : 'Belum',
    y.syaratKelengkapan.bebasPlagiarisme ? 'Lengkap (<20%)' : 'Belum',
    y.syaratKelengkapan.unggahJurnalRepository ? 'Lengkap' : 'Belum',
    y.statusWisuda,
    y.periodeWisuda,
    y.ukuranToga
  ].map(escapeCsvCell).join(','));

  const csvContent = '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  const safeProdi = prodiNama.replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `YUDISIUM_WISUDA_FT_UNBARI_${safeProdi}_${timestamp}.csv`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface CplGapAnalysisExportRow {
  kode: string;
  ranah: string;
  judul: string;
  capaianSaatIni: number;
  targetKurikulum: number;
  gap: number;
  strongCount: number;
  mediumCount: number;
  lowCount: number;
  status: string;
  rekomendasiCqi: string;
}

export interface ExecutiveGapCplExportItem {
  kode: string;
  avgMkCpl: number;
  targetProdi: number;
  gapPercent: number;
  signedDiff: number;
  statusLabel: string;
}

export interface ExportMatriksCplOptions {
  filterContextLabel?: string;
  gapAnalysisRows?: CplGapAnalysisExportRow[];
  executiveGapPerCpl?: ExecutiveGapCplExportItem[];
  executiveOverall?: {
    avgCourseCpl: number;
    avgTargetProdi: number;
    overallGapPercent: number;
    statusLabel: string;
  };
}

/**
 * Ekspor Laporan Matriks Kontribusi CPL per Mata Kuliah ke format Microsoft Excel (.xlsx) atau CSV.
 * Didesain khusus untuk lampiran borang akreditasi LAM-Teknik LKPS Kriteria 6 & Kurikulum OBE.
 * Menghasilkan workbook 3 sheet: Matriks Kontribusi CPL, Gap Analysis CPL, dan Rincian CPMK & Bloom.
 */
export function exportMatriksCplToExcel(
  courses: MataKuliahCplMatrixRecord[],
  cpls: CplItemObe[],
  prodiInfo: ProgramStudiInfo,
  format: 'xlsx' | 'xls' | 'csv' = 'xlsx',
  options?: ExportMatriksCplOptions
): void {
  const safeProdi = prodiInfo.nama.replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = new Date().toISOString().slice(0, 10);
  const filterSuffix = options?.filterContextLabel
    ? `_${options.filterContextLabel.replace(/[^a-zA-Z0-9]/g, '_')}`
    : '';
  const createdAtReadable = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const scopeLabel = options?.filterContextLabel || 'Seluruh Semester & Kelompok Kurikulum';

  // Derive Gap Analysis rows consistently whether caller passed precomputed rows or not
  const gapRows: CplGapAnalysisExportRow[] = options?.gapAnalysisRows && options.gapAnalysisRows.length > 0
    ? options.gapAnalysisRows
    : cpls.map(cpl => {
        const sCount = courses.filter(c => c.pemetaanCpl[cpl.kode] === 'Strong').length;
        const mCount = courses.filter(c => c.pemetaanCpl[cpl.kode] === 'Medium').length;
        const lCount = courses.filter(c => c.pemetaanCpl[cpl.kode] === 'Low').length;
        const weighted = sCount * 3 + mCount * 2 + lCount;
        const approxScore = Math.min(92, Math.round((70 + Math.min(20, weighted * 1.1)) * 10) / 10);
        const gapVal = Math.round((approxScore - cpl.targetKetercapaianMinimal) * 10) / 10;
        return {
          kode: cpl.kode,
          ranah: cpl.ranah,
          judul: cpl.judul,
          capaianSaatIni: approxScore,
          targetKurikulum: cpl.targetKetercapaianMinimal,
          gap: gapVal,
          strongCount: sCount,
          mediumCount: mCount,
          lowCount: lCount,
          status: gapVal >= 3 ? 'Melampaui Target' : gapVal >= 0 ? 'Memenuhi Target' : 'Perlu Intervensi CQI',
          rekomendasiCqi: gapVal >= 0
            ? 'Pertahankan asesmen portofolio CPMK dan perkuat studi kasus industri.'
            : 'Tingkatkan porsi asistensi praktikum & evaluasi rubrik CPMK terkait.'
        };
      });

  const execMap = new Map<string, ExecutiveGapCplExportItem>(
    (options?.executiveGapPerCpl || []).map(item => [item.kode, item])
  );

  if (format === 'csv') {
    const headers = [
      'No',
      'Kode MK',
      'Nama Mata Kuliah',
      'SKS',
      'Semester',
      'Kelompok',
      'Kategori',
      'Dosen Pengampu',
      ...cpls.map(c => `${c.kode} (${c.judul})`),
      'Jumlah CPL Terdukung',
      'Rincian Butir CPMK'
    ];

    const rows = courses.map((course, idx) => {
      const cplCols = cpls.map(c => {
        const lvl = course.pemetaanCpl[c.kode] || 'None';
        return lvl === 'Strong' ? 'S' : lvl === 'Medium' ? 'M' : lvl === 'Low' ? 'L' : '-';
      });

      const mappedCount = cpls.filter(c => {
        const lvl = course.pemetaanCpl[c.kode];
        return lvl && lvl !== 'None';
      }).length;

      const kelompok = course.kelompokKurikulum || (course.kategori === 'Pilihan' ? 'Pilihan' : 'Wajib');
      const semDisplay = course.semesterLabel || (course.semester > 0 ? String(course.semester).padStart(2, '0') : '-');
      const cpmkSummary = course.cpmkList
        .map(cp => `[${cp.kode}] ${cp.deskripsi} (${cp.levelBloom}, Bobot ${cp.bobotPersen}%)`)
        .join(' | ');

      return [
        idx + 1,
        course.kodeMK,
        course.namaMK,
        course.sks,
        semDisplay,
        kelompok,
        course.kategori,
        course.dosenPengampu,
        ...cplCols,
        mappedCount,
        cpmkSummary
      ].map(escapeCsvCell).join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Borang_LKPS_Matriks_CPL_${safeProdi}${filterSuffix}_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  // Real .xlsx workbook generation via SheetJS
  const wb = XLSX.utils.book_new();
  const totalCols = 9 + cpls.length;
  const totalSks = courses.reduce((s, c) => s + c.sks, 0);

  // SHEET 1: Matriks Kontribusi CPL (preserves matrix structure, descriptive headers & calculated gap %)
  const matrixAoA: (string | number)[][] = [
    ['YAYASAN PENDIDIKAN JAMBI — UNIVERSITAS BATANGHARI (UNBARI)'],
    ['FAKULTAS TEKNIK · GUGUS PENJAMINAN MUTU FAKULTAS (GPMF)'],
    ['Jl. Slamet Riyadi No. 1 Broni, Telanaipura, Kota Jambi 36122 | Email: ftunbari.tpa@gmail.com | ft.unbari.ac.id'],
    [],
    ['MATRIKS KONTRIBUSI CAPAIAN PEMBELAJARAN LULUSAN (CPL) PER MATA KULIAH'],
    [`Program Studi: ${prodiInfo.nama} (${prodiInfo.jenjang})`, '', '', `Cakupan Filter: ${scopeLabel}`],
    [`Tanggal Pembuatan: ${createdAtReadable}`, '', '', `Total Mata Kuliah: ${courses.length} MK (${totalSks} SKS)`],
    [],
    [
      'No',
      'Kode MK',
      'Nama Mata Kuliah',
      'SKS',
      'Sem',
      'Kelompok',
      'Kategori',
      'Dosen Pengampu',
      ...cpls.map(c => c.kode),
      'Jml CPL'
    ],
    [
      '',
      '',
      'Label Kompetensi Lulusan & Ranah KKNI',
      '',
      '',
      '',
      '',
      'Sub-Header CPL ->',
      ...cpls.map(c => `${c.judul} (${c.ranah})`),
      'Total'
    ]
  ];

  courses.forEach((c, idx) => {
    const kelompok = c.kelompokKurikulum || (c.kategori === 'Pilihan' ? 'Pilihan' : 'Wajib');
    const semDisplay = c.semesterLabel || (c.semester > 0 ? String(c.semester).padStart(2, '0') : '-');
    const cplValues = cpls.map(cpl => {
      const lvl = c.pemetaanCpl[cpl.kode] || 'None';
      return lvl === 'Strong' ? 'S' : lvl === 'Medium' ? 'M' : lvl === 'Low' ? 'L' : '-';
    });
    const mappedCount = cpls.filter(cpl => {
      const lvl = c.pemetaanCpl[cpl.kode];
      return lvl && lvl !== 'None';
    }).length;

    matrixAoA.push([
      idx + 1,
      c.kodeMK,
      c.namaMK,
      c.sks,
      semDisplay,
      kelompok,
      c.kategori,
      c.dosenPengampu,
      ...cplValues,
      mappedCount
    ]);
  });

  // Summary Distribution Row
  const distRow: (string | number)[] = [
    '',
    'TOTAL',
    `Rekap Distribusi S / M / L (${courses.length} Mata Kuliah)`,
    totalSks,
    '',
    '',
    '',
    'Sebaran Kontribusi ->',
    ...cpls.map(cpl => {
      const sCount = courses.filter(c => c.pemetaanCpl[cpl.kode] === 'Strong').length;
      const mCount = courses.filter(c => c.pemetaanCpl[cpl.kode] === 'Medium').length;
      const lCount = courses.filter(c => c.pemetaanCpl[cpl.kode] === 'Low').length;
      return `${sCount}S / ${mCount}M / ${lCount}L`;
    }),
    ''
  ];

  // Aligned Target, Achievement & Calculated Gap Percentage Rows per CPL column
  const targetRowValues = cpls.map(cpl => {
    const exec = execMap.get(cpl.kode);
    const gapRow = gapRows.find(g => g.kode === cpl.kode);
    return exec?.targetProdi ?? gapRow?.targetKurikulum ?? cpl.targetKetercapaianMinimal;
  });
  const avgTargetCol =
    targetRowValues.length > 0
      ? Math.round((targetRowValues.reduce((s, v) => s + v, 0) / targetRowValues.length) * 10) / 10
      : 0;

  const targetRow: (string | number)[] = [
    '',
    'TARGET',
    'Target Ketercapaian Prodi Kurikulum OBE (%)',
    '',
    '',
    '',
    '',
    'Ambang Prodi (%) ->',
    ...targetRowValues,
    options?.executiveOverall?.avgTargetProdi ?? avgTargetCol
  ];

  const mkAvgRowValues = cpls.map(cpl => {
    const exec = execMap.get(cpl.kode);
    const gapRow = gapRows.find(g => g.kode === cpl.kode);
    return exec?.avgMkCpl ?? gapRow?.capaianSaatIni ?? 0;
  });
  const avgMkCol =
    mkAvgRowValues.length > 0
      ? Math.round((mkAvgRowValues.reduce((s, v) => s + v, 0) / mkAvgRowValues.length) * 10) / 10
      : 0;

  const mkAvgRow: (string | number)[] = [
    '',
    'CAPAIAN',
    'Rata-rata CPL Mata Kuliah Terukur (%)',
    '',
    '',
    '',
    '',
    'Rerata MK (%) ->',
    ...mkAvgRowValues,
    options?.executiveOverall?.avgCourseCpl ?? avgMkCol
  ];

  const gapPercentValues = cpls.map((cpl, idx) => {
    const exec = execMap.get(cpl.kode);
    if (exec) return exec.gapPercent;
    return Math.max(0, Math.round((targetRowValues[idx] - mkAvgRowValues[idx]) * 10) / 10);
  });
  const overallGapAvg =
    gapPercentValues.length > 0
      ? Math.round((gapPercentValues.reduce((s, v) => s + v, 0) / gapPercentValues.length) * 10) / 10
      : 0;

  const gapPercentRow: (string | number)[] = [
    '',
    'GAP (%)',
    'Persentase Gap MK vs Target Prodi (%)',
    '',
    '',
    '',
    '',
    'Defisit Gap (%) ->',
    ...gapPercentValues,
    options?.executiveOverall?.overallGapPercent ?? overallGapAvg
  ];

  const signedDiffValues = cpls.map((cpl, idx) => {
    const exec = execMap.get(cpl.kode);
    if (exec) return exec.signedDiff;
    return Math.round((mkAvgRowValues[idx] - targetRowValues[idx]) * 10) / 10;
  });
  const avgSignedDiff =
    signedDiffValues.length > 0
      ? Math.round((signedDiffValues.reduce((s, v) => s + v, 0) / signedDiffValues.length) * 10) / 10
      : 0;

  const signedDiffRow: (string | number)[] = [
    '',
    'SELISIH',
    'Selisih Capaian Terhadap Target (+/- %)',
    '',
    '',
    '',
    '',
    'Selisih (+/- %) ->',
    ...signedDiffValues,
    avgSignedDiff
  ];

  const statusZoneRow: (string | number)[] = [
    '',
    'ZONA GAP',
    'Klasifikasi Risiko Gap (<5% Hijau | 5-10% Kuning | >10% Merah)',
    '',
    '',
    '',
    '',
    'Status Zona ->',
    ...cpls.map((cpl, idx) => {
      const exec = execMap.get(cpl.kode);
      if (exec) return exec.statusLabel;
      const g = gapPercentValues[idx];
      return g > 10 ? 'Kritis (> 10%)' : g >= 5 ? 'Perhatian (5–10%)' : 'Terkendali (< 5%)';
    }),
    options?.executiveOverall?.statusLabel ?? '-'
  ];

  matrixAoA.push(distRow, targetRow, mkAvgRow, gapPercentRow, signedDiffRow, statusZoneRow);
  matrixAoA.push([]);
  matrixAoA.push([
    'KETERANGAN SKALA KONTRIBUSI CPL:',
    'S = Strong (Kontribusi Kuat, >=40%)',
    '',
    'M = Medium (Kontribusi Sedang, 20-39%)',
    '',
    'L = Low (Kontribusi Rendah, <20%)',
    '',
    'Gap (%) = Max(0, Target Prodi - Rata-rata CPL MK)'
  ]);
  matrixAoA.push([]);
  matrixAoA.push(['Mengetahui,', '', '', '', '', '', '', `Jambi, ${createdAtReadable}`]);
  matrixAoA.push([`Ketua Program Studi ${prodiInfo.nama}`, '', '', '', '', '', '', 'Dekan Fakultas Teknik UNBARI']);
  matrixAoA.push([]);
  matrixAoA.push([]);
  matrixAoA.push([prodiInfo.kaprodi, '', '', '', '', '', '', 'Ir. Fadli Eka Yandra, S.T., M.T.']);
  matrixAoA.push([`NIDN/NUPTK: ${prodiInfo.nipKaprodi}`, '', '', '', '', '', '', 'NIDN: 1004077102']);

  const wsMatrix = XLSX.utils.aoa_to_sheet(matrixAoA);
  wsMatrix['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } },
    { s: { r: 4, c: 0 }, e: { r: 4, c: totalCols - 1 } },
    { s: { r: 5, c: 0 }, e: { r: 5, c: 2 } },
    { s: { r: 5, c: 3 }, e: { r: 5, c: totalCols - 1 } },
    { s: { r: 6, c: 0 }, e: { r: 6, c: 2 } },
    { s: { r: 6, c: 3 }, e: { r: 6, c: totalCols - 1 } }
  ];
  wsMatrix['!cols'] = [
    { wch: 5 },
    { wch: 13 },
    { wch: 44 },
    { wch: 6 },
    { wch: 6 },
    { wch: 10 },
    { wch: 18 },
    { wch: 32 },
    ...cpls.map(() => ({ wch: 18 })),
    { wch: 12 }
  ];
  wsMatrix['!rows'] = Array.from({ length: 10 }, (_, idx) => (idx === 9 ? { hpt: 32 } : {}));
  XLSX.utils.book_append_sheet(wb, wsMatrix, 'Matriks Kontribusi CPL');

  // SHEET 2: Gap Analysis CPL (Preserves numeric values & percentages for Excel analysis)
  const avgCapaian = gapRows.length > 0
    ? Math.round((gapRows.reduce((s, r) => s + r.capaianSaatIni, 0) / gapRows.length) * 10) / 10
    : 0;
  const avgTarget = gapRows.length > 0
    ? Math.round((gapRows.reduce((s, r) => s + r.targetKurikulum, 0) / gapRows.length) * 10) / 10
    : 0;
  const avgGap = gapRows.length > 0
    ? Math.round((gapRows.reduce((s, r) => s + r.gap, 0) / gapRows.length) * 10) / 10
    : 0;

  const gapAoA: (string | number)[][] = [
    ['ANALISIS KESENJANGAN (GAP ANALYSIS) CAPAIAN CPL VS TARGET KURIKULUM OBE'],
    [`Program Studi: ${prodiInfo.nama} (${prodiInfo.jenjang}) | Cakupan: ${scopeLabel} | Tanggal: ${createdAtReadable}`],
    [],
    [
      'Kode CPL',
      'Ranah KKNI',
      'Kompetensi Lulusan',
      'Capaian Kurikulum (%)',
      'Target Kurikulum (%)',
      'Selisih Kurikulum (%)',
      'Rata-rata CPL MK (%)',
      'Gap Defisit MK vs Target (%)',
      'Zona Risiko Gap',
      'MK Strong (S)',
      'MK Medium (M)',
      'MK Low (L)',
      'Status Ketercapaian',
      'Rekomendasi Tindak Lanjut (CQI)'
    ],
    ...gapRows.map(r => {
      const exec = execMap.get(r.kode);
      const mkAvg = exec ? exec.avgMkCpl : r.capaianSaatIni;
      const gapDeficit = exec
        ? exec.gapPercent
        : Math.max(0, Math.round((r.targetKurikulum - mkAvg) * 10) / 10);
      const zoneLabel = exec
        ? exec.statusLabel
        : gapDeficit > 10
        ? 'Kritis (> 10%)'
        : gapDeficit >= 5
        ? 'Perhatian (5–10%)'
        : 'Terkendali (< 5%)';

      return [
        r.kode,
        r.ranah,
        r.judul,
        r.capaianSaatIni,
        r.targetKurikulum,
        r.gap,
        mkAvg,
        gapDeficit,
        zoneLabel,
        r.strongCount,
        r.mediumCount,
        r.lowCount,
        r.status,
        r.rekomendasiCqi
      ];
    }),
    [
      'RATA-RATA',
      '-',
      `Evaluasi ${gapRows.length} Butir CPL`,
      avgCapaian,
      avgTarget,
      avgGap,
      options?.executiveOverall?.avgCourseCpl ?? avgMkCol,
      options?.executiveOverall?.overallGapPercent ?? overallGapAvg,
      options?.executiveOverall?.statusLabel ?? '-',
      gapRows.reduce((s, r) => s + r.strongCount, 0),
      gapRows.reduce((s, r) => s + r.mediumCount, 0),
      gapRows.reduce((s, r) => s + r.lowCount, 0),
      avgGap >= 0 ? 'Memenuhi Standar OBE' : 'Perlu Penguatan CQI',
      'Siklus Evaluasi Mutu Internal GPMF FT UNBARI'
    ]
  ];

  const wsGap = XLSX.utils.aoa_to_sheet(gapAoA);
  wsGap['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 13 } }
  ];
  wsGap['!cols'] = [
    { wch: 11 },
    { wch: 22 },
    { wch: 32 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 24 },
    { wch: 18 },
    { wch: 13 },
    { wch: 13 },
    { wch: 12 },
    { wch: 22 },
    { wch: 48 }
  ];
  XLSX.utils.book_append_sheet(wb, wsGap, 'Gap Analysis CPL');

  // SHEET 3: Rincian CPMK & Taksonomi Bloom
  const cpmkAoA: (string | number)[][] = [
    ['RINCIAN CAPAIAN PEMBELAJARAN MATA KULIAH (CPMK) & ASESMEN OBE'],
    [`Program Studi: ${prodiInfo.nama} | Cakupan: ${scopeLabel} | Tanggal: ${createdAtReadable}`],
    [],
    [
      'No',
      'Kode MK',
      'Nama Mata Kuliah',
      'Sem',
      'Kelompok',
      'Kode CPMK',
      'Deskripsi CPMK',
      'Taksonomi Bloom',
      'Bobot (%)',
      'Metode Asesmen',
      'CPL Terkait'
    ]
  ];

  let cpmkRowNum = 1;
  courses.forEach(course => {
    const kelompok = course.kelompokKurikulum || (course.kategori === 'Pilihan' ? 'Pilihan' : 'Wajib');
    const semDisplay = course.semesterLabel || (course.semester > 0 ? String(course.semester).padStart(2, '0') : '-');
    course.cpmkList.forEach(cp => {
      cpmkAoA.push([
        cpmkRowNum++,
        course.kodeMK,
        course.namaMK,
        semDisplay,
        kelompok,
        cp.kode,
        cp.deskripsi,
        cp.levelBloom,
        cp.bobotPersen,
        cp.metodeAsesmen,
        cp.cplTerkait.join(', ')
      ]);
    });
  });

  const wsCpmk = XLSX.utils.aoa_to_sheet(cpmkAoA);
  wsCpmk['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } }
  ];
  wsCpmk['!cols'] = [
    { wch: 5 },
    { wch: 13 },
    { wch: 36 },
    { wch: 6 },
    { wch: 10 },
    { wch: 11 },
    { wch: 56 },
    { wch: 22 },
    { wch: 10 },
    { wch: 24 },
    { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(wb, wsCpmk, 'Rincian CPMK & Bloom');

  const ext = format === 'xls' ? 'xls' : 'xlsx';
  const fileName = `Borang_LKPS_Matriks_CPL_${safeProdi}${filterSuffix}_${timestamp}.${ext}`;
  XLSX.writeFile(wb, fileName, { bookType: format === 'xls' ? 'biff8' : 'xlsx' });
}



