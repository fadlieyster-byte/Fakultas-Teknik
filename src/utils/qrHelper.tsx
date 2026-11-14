import React from 'react';
import { DokumenVerifikasiRecord } from '../types/index';

/**
 * Generates a deterministic 25x25 QR Matrix representation for SVG rendering.
 * Includes official Finder patterns (7x7), timing patterns, and data modules.
 */
export function generateQrMatrix(data: string, matrixSize = 25): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: matrixSize }, () =>
    Array(matrixSize).fill(false)
  );

  // Helper: Draw 7x7 Finder Pattern with 1px border, 1px space, 3x3 solid core
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 || // Outer ring
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)      // Inner core
        ) {
          matrix[startY + r][startX + c] = true;
        } else {
          matrix[startY + r][startX + c] = false;
        }
      }
    }
  };

  // Top-Left Finder
  drawFinder(0, 0);
  // Top-Right Finder
  drawFinder(matrixSize - 7, 0);
  // Bottom-Left Finder
  drawFinder(0, matrixSize - 7);

  // Separator zones around finders (kept false)
  for (let i = 0; i < 8; i++) {
    if (matrixSize > 7) {
      matrix[7][i] = false;
      matrix[i][7] = false;
      matrix[7][matrixSize - 1 - i] = false;
      matrix[i][matrixSize - 8] = false;
      matrix[matrixSize - 8][i] = false;
      matrix[matrixSize - 1 - i][7] = false;
    }
  }

  // Timing Patterns (Alternating dots along Row 6 and Column 6)
  for (let i = 8; i < matrixSize - 8; i++) {
    const isEven = i % 2 === 0;
    matrix[6][i] = isEven;
    matrix[i][6] = isEven;
  }

  // Alignment Pattern for size >= 25 (at index [16, 16])
  const alignCenter = matrixSize - 7;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isRing = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCore = r === 0 && c === 0;
      matrix[alignCenter + r][alignCenter + c] = isRing || isCore;
    }
  }

  // Deterministic Hash Module Distribution
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Don't overwrite Finders or timing rows
      const inTopLeft = r < 9 && c < 9;
      const inTopRight = r < 9 && c > matrixSize - 9;
      const inBottomLeft = r > matrixSize - 9 && c < 9;
      const isTiming = r === 6 || c === 6;
      const inAlign = Math.abs(r - alignCenter) <= 2 && Math.abs(c - alignCenter) <= 2;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !isTiming && !inAlign) {
        hash = (hash * 1103515245 + 12345) & 0x7fffffff;
        matrix[r][c] = (hash % 3 === 0) || ((r + c + data.charCodeAt((r * c) % data.length)) % 2 === 0);
      }
    }
  }

  return matrix;
}

interface QrCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
  fgColor?: string;
  bgColor?: string;
  title?: string;
  includeBorder?: boolean;
}

/**
 * Pure SVG QR Code renderer for razor-sharp physical print & screen display.
 */
export const QrCodeSvg: React.FC<QrCodeSvgProps> = ({
  value,
  size = 80,
  className = '',
  fgColor = '#0f172a',
  bgColor = '#ffffff',
  title = 'QR Code Verifikasi Resmi FT UNBARI',
  includeBorder = true,
}) => {
  const matrixSize = 25;
  const matrix = React.useMemo(() => generateQrMatrix(value, matrixSize), [value, matrixSize]);

  return (
    <svg
      role="img"
      aria-label={title}
      viewBox={`0 0 ${matrixSize} ${matrixSize}`}
      width={size}
      height={size}
      className={`inline-block shrink-0 ${includeBorder ? 'bg-white p-1 rounded border border-slate-300' : ''} ${className}`}
      style={{ shapeRendering: 'crispEdges' }}
    >
      <rect width={matrixSize} height={matrixSize} fill={bgColor} />
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width={1}
              height={1}
              fill={fgColor}
            />
          ) : null
        )
      )}
    </svg>
  );
};

// Initial database of official verifiable documents
export const INITIAL_DOKUMEN_VERIFIKASI: DokumenVerifikasiRecord[] = [
  {
    kodeVerifikasi: 'FT-UNBARI/2026/BA-SKR/042',
    jenisDokumen: 'Berita Acara Sidang Skripsi',
    nomorSurat: '042/BA-SKR/FT-UB/X/2026',
    namaMahasiswa: 'Rahmat Hidayat',
    nim: '211001121001',
    prodi: 'S1 Teknik Sipil',
    pejabatPenandatangan: 'Fadli Eka Yandra, ST., MT',
    jabatanPejabat: 'Dekan Fakultas Teknik UNBARI',
    tanggalTerbit: '2026-10-21',
    statusKeaslian: 'TERDAFTAR_VALID',
    hashKeamanan: 'SHA256:7B8F9A1C4D2E5F80',
    ringkasanIsi: 'Kelulusan Sidang Meja Hijau / Skripsi dengan predikat Lulus Dengan Revisi (Nilai 85.5 / Grade A). Judul: Analisis Daya Dukung Fondasi Tiang Pancang Jembatan Batanghari.'
  },
  {
    kodeVerifikasi: 'FT-UNBARI/2026/SK-AKT/104',
    jenisDokumen: 'Surat Keterangan Aktif Kuliah',
    nomorSurat: '104/UNBARI-FT/TU/X/2026',
    namaMahasiswa: 'Dimas Tri Prabowo',
    nim: '211001121007',
    prodi: 'S1 Teknik Sipil',
    pejabatPenandatangan: 'Hadrah, ST., MT',
    jabatanPejabat: 'Wakil Dekan I (Bidang Akademik)',
    tanggalTerbit: '2026-10-18',
    statusKeaslian: 'TERDAFTAR_VALID',
    hashKeamanan: 'SHA256:91E2A34F7C80BD11',
    ringkasanIsi: 'Menerangkan mahasiswa bersangkutan aktif terdaftar pada Semester Ganjil 2025/2026 untuk keperluan Tunjangan Gaji Orang Tua (PNS/BUMN).'
  },
  {
    kodeVerifikasi: 'FT-UNBARI/2026/YUD/018',
    jenisDokumen: 'Rekomendasi Kelayakan Yudisium',
    nomorSurat: '018/YUD-FT/UNBARI/IX/2026',
    namaMahasiswa: 'Bambang Pamungkas',
    nim: '201001121003',
    prodi: 'S1 Teknik Sipil',
    pejabatPenandatangan: 'Fadli Eka Yandra, ST., MT',
    jabatanPejabat: 'Dekan Fakultas Teknik UNBARI',
    tanggalTerbit: '2026-09-30',
    statusKeaslian: 'TERDAFTAR_VALID',
    hashKeamanan: 'SHA256:56C78D9E0123AB45',
    ringkasanIsi: 'Pengesahan kelayakan yudisium Sarjana Teknik (S.T.) dengan IPK 3.82, predikat Dengan Pujian (Cum Laude), bebas tanggungan perpus/lab/keuangan.'
  },
  {
    kodeVerifikasi: 'FT-UNBARI/2026/SKPI/089',
    jenisDokumen: 'SKPI Resmi FT UNBARI',
    nomorSurat: 'SKPI/FT-UNBARI/2026/089',
    namaMahasiswa: 'Bambang Pamungkas',
    nim: '201001121003',
    prodi: 'S1 Teknik Sipil',
    pejabatPenandatangan: 'Fadli Eka Yandra, ST., MT',
    jabatanPejabat: 'Dekan Fakultas Teknik UNBARI',
    tanggalTerbit: '2026-10-02',
    statusKeaslian: 'TERDAFTAR_VALID',
    hashKeamanan: 'SHA256:34F56E7890ABCD12',
    ringkasanIsi: 'Dokumen Surat Keterangan Pendamping Ijazah (SKPI) Bilingual KKNI Level 6 memuat capaian pembelajaran, sertifikasi kompetensi LPJK, dan kejuaraan nasional.'
  },
  {
    kodeVerifikasi: 'FT-UNBARI/2026/EWS-SP/003',
    jenisDokumen: 'Surat Peringatan Evaluasi Studi',
    nomorSurat: '003/EWS-FT/UNBARI/X/2026',
    namaMahasiswa: 'Ilham Kurniawan',
    nim: '191001121045',
    prodi: 'S1 Teknik Sipil',
    pejabatPenandatangan: 'Hadrah, ST., MT',
    jabatanPejabat: 'Wakil Dekan I Bidang Akademik',
    tanggalTerbit: '2026-10-25',
    statusKeaslian: 'TERDAFTAR_VALID',
    hashKeamanan: 'SHA256:A1B2C3D4E5F60718',
    ringkasanIsi: 'Peringatan Evaluasi Masa Studi Semester 11 (Kritis Batas Waktu Studi). Diwajibkan hadir pada sesi pendampingan khusus Dosen Pembimbing Akademik.'
  },
  {
    kodeVerifikasi: 'FT-UNBARI/2026/BORANG-LAM/01',
    jenisDokumen: 'Laporan Borang Akreditasi LAM-Teknik',
    nomorSurat: '001/GPMF-LAMTEK/FT-UB/2026',
    namaMahasiswa: 'Tim Task Force Akreditasi',
    nim: 'GPMF-UNBARI',
    prodi: 'S1 Teknik Sipil',
    pejabatPenandatangan: 'Fadli Eka Yandra, ST., MT',
    jabatanPejabat: 'Dekan Fakultas Teknik UNBARI',
    tanggalTerbit: '2026-10-28',
    statusKeaslian: 'TERDAFTAR_VALID',
    hashKeamanan: 'SHA256:456789ABCDEF0123',
    ringkasanIsi: 'Rekapitulasi Kesiapan LED dan LKPS 9 Kriteria LAM-Teknik serta Evaluasi Capaian Pembelajaran Lulusan (CPL-OBE) Predikat Proyeksi Unggul (Skor 368.5).'
  }
];

export function lookupDokumenVerifikasi(
  records: DokumenVerifikasiRecord[],
  query: string
): DokumenVerifikasiRecord | undefined {
  const clean = query.trim().toLowerCase();
  if (!clean) return undefined;
  return records.find(r => 
    r.kodeVerifikasi.toLowerCase().includes(clean) ||
    r.nomorSurat.toLowerCase().includes(clean) ||
    r.nim.toLowerCase() === clean
  );
}
