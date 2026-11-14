import {
  Dosen,
  JadwalKerjaPraktek,
  JadwalSidangTA,
  Mahasiswa
} from '../types/index';

export type BimbinganLoadBand =
  | 'OVERLOAD'
  | 'NEAR_LIMIT'
  | 'IDEAL'
  | 'LOW_CAPACITY';

export interface BimbinganStudentBrief {
  nim: string;
  nama: string;
  jenis: 'TA' | 'KP';
  judulAtauLokasi: string;
}

export interface DosenBimbinganMetric {
  dosen: Dosen;
  taCount: number;
  kpCount: number;
  totalBimbingan: number;
  batasMaksimal: number;
  rasioTerhadapMaksPersen: number;
  selisihDariMaks: number; // + berarti kelebihan, - berarti ruang kosong
  ekuivalenSksBimbingan: number;
  statusBand: BimbinganLoadBand;
  statusLabel: string;
  isExceedingProdiMax: boolean;
  warningLevel: 'CRITICAL' | 'WARNING' | 'NONE';
  warningMessage: string | null;
  heatmapIntensity: number; // 0-100 relative scale for heatmap cells
  studentSamples: BimbinganStudentBrief[];
}

export interface AppliedBimbinganRotation {
  id: string;
  fromDosenId: string;
  toDosenId: string;
  count: number;
  jenis: 'TA' | 'KP' | 'TA & KP';
  appliedAt: string;
}

export interface BimbinganRotationProposal {
  id: string;
  fromDosen: Dosen;
  toDosen: Dosen;
  fromCurrentTotal: number;
  fromProjectedTotal: number;
  toCurrentTotal: number;
  toProjectedTotal: number;
  transferCount: number;
  jenisBimbingan: 'TA' | 'KP' | 'TA & KP';
  alasanKeahlian: string;
  kandidatMahasiswa: BimbinganStudentBrief[];
  isApplied: boolean;
}

export interface BimbinganAnalysisReport {
  batasMaksimal: number;
  standarKeterangan: string;
  totalTaAll: number;
  totalKpAll: number;
  totalBimbinganAll: number;
  avgBimbinganPerDosen: number;
  avgRatioPersen: number;
  overloadedCount: number;
  nearLimitCount: number;
  lowCapacityCount: number;
  highestLoadDosen: DosenBimbinganMetric | null;
  lowestLoadDosen: DosenBimbinganMetric | null;
  overloadedMetrics: DosenBimbinganMetric[];
  sortedMetrics: DosenBimbinganMetric[]; // Descending highest -> lowest
  rotationProposals: BimbinganRotationProposal[];
}

export function getDefaultBimbinganStandardByProdi(prodiId?: string): number {
  if (prodiId === 'LISTRIK_D3') {
    // D3 Vokasi memprioritaskan intensitas praktikum & bimbingan lapangan lebih padat
    return 6;
  }
  return 8;
}

function normalizeLecturerKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(dr|prof|ir|h|hj|st|s\.t|mt|m\.t|m\.eng|m\.sc|m\.si|m\.pd|m\.hum|m\.h|m\.pd\.i|s\.pd|s\.kom|s\.ag|sh|ipm|ipp|asean eng)\b\.?/gi, ' ')
    .replace(/[.,()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function lecturerNamesMatch(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const na = normalizeLecturerKey(a);
  const nb = normalizeLecturerKey(b);
  if (!na || !nb) return false;
  if (na === nb || na.includes(nb) || nb.includes(na)) return true;

  const firstTwoA = na.split(' ').slice(0, 2).join(' ');
  const firstTwoB = nb.split(' ').slice(0, 2).join(' ');
  return firstTwoA.length >= 5 && firstTwoA === firstTwoB;
}

function classifyLoadBand(total: number, maxLimit: number): {
  statusBand: BimbinganLoadBand;
  statusLabel: string;
} {
  const ratio = maxLimit > 0 ? total / maxLimit : 0;
  if (total > maxLimit) {
    return { statusBand: 'OVERLOAD', statusLabel: 'Melampaui Standar Maks' };
  }
  if (ratio >= 0.8) {
    return { statusBand: 'NEAR_LIMIT', statusLabel: 'Mendekati Batas' };
  }
  if (ratio >= 0.45) {
    return { statusBand: 'IDEAL', statusLabel: 'Beban Ideal' };
  }
  return { statusBand: 'LOW_CAPACITY', statusLabel: 'Kapasitas Luang' };
}

export function buildBimbinganAnalysisReport(params: {
  dosenList: Dosen[];
  mahasiswaList: Mahasiswa[];
  sidangList: JadwalSidangTA[];
  kpList: JadwalKerjaPraktek[];
  batasMaksimal: number;
  appliedRotations?: AppliedBimbinganRotation[];
}): BimbinganAnalysisReport {
  const {
    dosenList,
    mahasiswaList,
    sidangList,
    kpList,
    batasMaksimal,
    appliedRotations = []
  } = params;

  // Hitung delta TA/KP dari rotasi yang sudah diterapkan Kaprodi
  const deltaTaByDosen: Record<string, number> = {};
  const deltaKpByDosen: Record<string, number> = {};

  appliedRotations.forEach(rot => {
    const kpShare = rot.jenis === 'KP' ? rot.count : rot.jenis === 'TA & KP' ? Math.floor(rot.count / 2) : 0;
    const taShare = rot.count - kpShare;
    deltaTaByDosen[rot.fromDosenId] = (deltaTaByDosen[rot.fromDosenId] || 0) - taShare;
    deltaTaByDosen[rot.toDosenId] = (deltaTaByDosen[rot.toDosenId] || 0) + taShare;
    deltaKpByDosen[rot.fromDosenId] = (deltaKpByDosen[rot.fromDosenId] || 0) - kpShare;
    deltaKpByDosen[rot.toDosenId] = (deltaKpByDosen[rot.toDosenId] || 0) + kpShare;
  });

  const rawMetrics: DosenBimbinganMetric[] = dosenList.map(dosen => {
    const taSamples: BimbinganStudentBrief[] = [];
    const seenNimTa = new Set<string>();

    // Ambil dari mahasiswaList yang sudah punya dosenPembimbingTA atau status Tugas Akhir
    mahasiswaList.forEach(mhs => {
      if (mhs.prodiId !== dosen.prodiId) return;
      if (lecturerNamesMatch(mhs.dosenPembimbingTA, dosen.namaLengkap)) {
        if (!seenNimTa.has(mhs.nim)) {
          seenNimTa.add(mhs.nim);
          taSamples.push({
            nim: mhs.nim,
            nama: mhs.nama,
            jenis: 'TA',
            judulAtauLokasi: mhs.judulTA || 'Tugas Akhir / Skripsi'
          });
        }
      }
    });

    // Lengkapi dengan sidangList (pembimbing 1 / pembimbing 2)
    sidangList.forEach(sdg => {
      if (sdg.prodiId !== dosen.prodiId) return;
      if (
        lecturerNamesMatch(sdg.pembimbing1, dosen.namaLengkap) ||
        lecturerNamesMatch(sdg.pembimbing2, dosen.namaLengkap)
      ) {
        if (!seenNimTa.has(sdg.nim)) {
          seenNimTa.add(sdg.nim);
          taSamples.push({
            nim: sdg.nim,
            nama: sdg.namaMahasiswa,
            jenis: 'TA',
            judulAtauLokasi: sdg.judulTA
          });
        }
      }
    });

    // Ambil dari jadwal KP
    const kpSamples: BimbinganStudentBrief[] = [];
    kpList.forEach(kp => {
      if (kp.prodiId !== dosen.prodiId) return;
      if (lecturerNamesMatch(kp.dosenPembimbing, dosen.namaLengkap)) {
        kpSamples.push({
          nim: kp.nim,
          nama: kp.namaMahasiswa,
          jenis: 'KP',
          judulAtauLokasi: kp.instansiPerusahaan
        });
      }
    });

    // Rekonsiliasi dengan baseline jumlahMahasiswaBimbingan agar tidak undercount
    const baseTaRaw = Math.max(dosen.jumlahMahasiswaBimbingan, taSamples.length);
    // Estimasi KP realistis: minimal jumlah di kpList atau proporsi bimbingan lapangan untuk dosen prodi
    const isUmumGuest =
      dosen.namaLengkap.includes('Tim B.') ||
      dosen.namaLengkap.includes('Tamu');
    const baselineKpFallback = isUmumGuest
      ? 0
      : dosen.jumlahMahasiswaBimbingan >= 8
      ? 3
      : dosen.jumlahMahasiswaBimbingan >= 6
      ? 2
      : 1;
    const baseKpRaw = Math.max(kpSamples.length, baselineKpFallback);

    const taCount = Math.max(0, baseTaRaw + (deltaTaByDosen[dosen.id] || 0));
    const kpCount = Math.max(0, baseKpRaw + (deltaKpByDosen[dosen.id] || 0));
    const totalBimbingan = taCount + kpCount;
    const rasioTerhadapMaksPersen =
      batasMaksimal > 0 ? Math.round((totalBimbingan / batasMaksimal) * 1000) / 10 : 0;
    const selisihDariMaks = totalBimbingan - batasMaksimal;
    const ekuivalenSksBimbingan =
      Math.round((taCount * 0.25 + kpCount * 0.15) * 10) / 10;

    const { statusBand, statusLabel } = classifyLoadBand(totalBimbingan, batasMaksimal);
    const isExceedingProdiMax = totalBimbingan > batasMaksimal || rasioTerhadapMaksPersen > 100;
    const warningLevel: DosenBimbinganMetric['warningLevel'] =
      rasioTerhadapMaksPersen >= 125
        ? 'CRITICAL'
        : isExceedingProdiMax
        ? 'WARNING'
        : 'NONE';
    const warningMessage = isExceedingProdiMax
      ? `Rasio ${rasioTerhadapMaksPersen}% melampaui standar maks prodi ${batasMaksimal} mhs/dosen (+${selisihDariMaks} mhs)`
      : null;

    return {
      dosen,
      taCount,
      kpCount,
      totalBimbingan,
      batasMaksimal,
      rasioTerhadapMaksPersen,
      selisihDariMaks,
      ekuivalenSksBimbingan,
      statusBand,
      statusLabel,
      isExceedingProdiMax,
      warningLevel,
      warningMessage,
      heatmapIntensity: Math.min(100, Math.round((totalBimbingan / Math.max(1, batasMaksimal * 1.35)) * 100)),
      studentSamples: [...taSamples, ...kpSamples].slice(0, 6)
    };
  });

  // Sort tertinggi -> terendah untuk Heatmap
  const sortedMetrics = [...rawMetrics].sort(
    (a, b) =>
      b.totalBimbingan - a.totalBimbingan ||
      b.taCount - a.taCount ||
      a.dosen.namaLengkap.localeCompare(b.dosen.namaLengkap)
  );

  // Tentukan dosen terendah yang aktif/eligible (prioritaskan yang punya beban < batasMaks)
  const lowestLoadDosen =
    sortedMetrics.length > 0 ? sortedMetrics[sortedMetrics.length - 1] : null;
  const highestLoadDosen = sortedMetrics.length > 0 ? sortedMetrics[0] : null;

  const totalTaAll = sortedMetrics.reduce((s, m) => s + m.taCount, 0);
  const totalKpAll = sortedMetrics.reduce((s, m) => s + m.kpCount, 0);
  const totalBimbinganAll = totalTaAll + totalKpAll;
  const avgBimbinganPerDosen =
    sortedMetrics.length > 0
      ? Math.round((totalBimbinganAll / sortedMetrics.length) * 10) / 10
      : 0;
  const avgRatioPersen =
    batasMaksimal > 0
      ? Math.round((avgBimbinganPerDosen / batasMaksimal) * 1000) / 10
      : 0;

  const overloadedCount = sortedMetrics.filter(m => m.statusBand === 'OVERLOAD').length;
  const nearLimitCount = sortedMetrics.filter(m => m.statusBand === 'NEAR_LIMIT').length;
  const lowCapacityCount = sortedMetrics.filter(
    m => m.statusBand === 'LOW_CAPACITY' || m.totalBimbingan < batasMaksimal
  ).length;

  // Hitung Usulan Rotasi Bimbingan otomatis bagi dosen yang melebihi batas maksimal
  // Gunakan baseline sebelum rotasi atau current load untuk menghasilkan proposal jelas
  const overloadedList = sortedMetrics.filter(m => m.totalBimbingan > batasMaksimal);

  // Track kapasitas penerima saat menyusun pasangan rotasi
  // Prioritas 1: ruang di bawah batasMaksimal; Fallback: pemerataan ke dosen di bawah rata-rata prodi jika seluruh dosen >= batasMaksimal
  const receiverRemainingCap = new Map<string, number>();
  let totalSpare = 0;
  sortedMetrics.forEach(m => {
    const spare = Math.max(0, batasMaksimal - m.totalBimbingan);
    if (spare > 0 && !m.dosen.namaLengkap.includes('Tim B.')) {
      receiverRemainingCap.set(m.dosen.id, spare);
      totalSpare += spare;
    }
  });

  if (totalSpare === 0 && overloadedList.length > 0) {
    const balanceCeiling = Math.max(batasMaksimal + 2, Math.floor(avgBimbinganPerDosen));
    sortedMetrics.forEach(m => {
      // Hanya lakukan pemerataan ke dosen yang sudah di atas batas namun masih jauh di bawah rata-rata prodi
      // agar dosen yang sudah patuh (<= batasMaksimal) tidak terdorong menjadi melampaui standar
      if (
        m.totalBimbingan > batasMaksimal &&
        m.totalBimbingan < balanceCeiling &&
        !m.dosen.namaLengkap.includes('Tim B.')
      ) {
        receiverRemainingCap.set(m.dosen.id, balanceCeiling - m.totalBimbingan);
      }
    });
  }

  const rotationProposals: BimbinganRotationProposal[] = [];

  overloadedList.forEach(overMetric => {
    let remainingExcess = overMetric.totalBimbingan - batasMaksimal;

    // Prioritaskan dosen seprodi dengan beban terendah & keahlian mirip
    const candidates = sortedMetrics
      .filter(
        cand =>
          cand.dosen.id !== overMetric.dosen.id &&
          cand.dosen.prodiId === overMetric.dosen.prodiId &&
          (receiverRemainingCap.get(cand.dosen.id) || 0) > 0
      )
      .sort((a, b) => {
        const aSameField = a.dosen.keahlian
          .toLowerCase()
          .includes(overMetric.dosen.keahlian.toLowerCase().split(' ')[0])
          ? 0
          : 1;
        const bSameField = b.dosen.keahlian
          .toLowerCase()
          .includes(overMetric.dosen.keahlian.toLowerCase().split(' ')[0])
          ? 0
          : 1;
        if (aSameField !== bSameField) return aSameField - bSameField;
        return a.totalBimbingan - b.totalBimbingan;
      });

    for (const target of candidates) {
      if (remainingExcess <= 0) break;
      const cap = receiverRemainingCap.get(target.dosen.id) || 0;
      if (cap <= 0) continue;

      const transferCount = Math.min(remainingExcess, cap, 3);
      if (transferCount <= 0) continue;

      const proposalId = `ROT-${overMetric.dosen.id}->${target.dosen.id}`;
      const isApplied = appliedRotations.some(r => r.id === proposalId);

      const jenisBimbingan: BimbinganRotationProposal['jenisBimbingan'] =
        overMetric.kpCount > 1 && transferCount >= 2
          ? 'TA & KP'
          : overMetric.kpCount >= overMetric.taCount
          ? 'KP'
          : 'TA';

      const reasonsSameDomain =
        target.dosen.keahlian.toLowerCase() === overMetric.dosen.keahlian.toLowerCase()
          ? `Rumpun keahlian identik (${target.dosen.keahlian})`
          : `Homebase ${target.dosen.prodiId} (${target.dosen.keahlian}) · masih memiliki ruang ${cap} mhs`;

      rotationProposals.push({
        id: proposalId,
        fromDosen: overMetric.dosen,
        toDosen: target.dosen,
        fromCurrentTotal: overMetric.totalBimbingan,
        fromProjectedTotal: overMetric.totalBimbingan - transferCount,
        toCurrentTotal: target.totalBimbingan,
        toProjectedTotal: target.totalBimbingan + transferCount,
        transferCount,
        jenisBimbingan,
        alasanKeahlian: reasonsSameDomain,
        kandidatMahasiswa: overMetric.studentSamples.slice(0, transferCount),
        isApplied
      });

      remainingExcess -= transferCount;
      receiverRemainingCap.set(target.dosen.id, cap - transferCount);
    }
  });

  // Sertakan juga rotasi yang sudah diterapkan agar user bisa membatalkan / meninjau riwayat rotasi
  appliedRotations.forEach(app => {
    if (!rotationProposals.some(p => p.id === app.id)) {
      const fromMetric = sortedMetrics.find(m => m.dosen.id === app.fromDosenId);
      const toMetric = sortedMetrics.find(m => m.dosen.id === app.toDosenId);
      if (fromMetric && toMetric) {
        rotationProposals.push({
          id: app.id,
          fromDosen: fromMetric.dosen,
          toDosen: toMetric.dosen,
          fromCurrentTotal: fromMetric.totalBimbingan,
          fromProjectedTotal: fromMetric.totalBimbingan,
          toCurrentTotal: toMetric.totalBimbingan,
          toProjectedTotal: toMetric.totalBimbingan,
          transferCount: app.count,
          jenisBimbingan: app.jenis,
          alasanKeahlian: `Rotasi aktif diterapkan pukul ${app.appliedAt} (${toMetric.dosen.keahlian})`,
          kandidatMahasiswa: [],
          isApplied: true
        });
      }
    }
  });

  const overloadedMetrics = sortedMetrics.filter(m => m.isExceedingProdiMax);

  return {
    batasMaksimal,
    standarKeterangan: `Standar Beban Kerja Maksimal Prodi: ${batasMaksimal} Mhs / Dosen (100%)`,
    totalTaAll,
    totalKpAll,
    totalBimbinganAll,
    avgBimbinganPerDosen,
    avgRatioPersen,
    overloadedCount,
    nearLimitCount,
    lowCapacityCount,
    highestLoadDosen,
    lowestLoadDosen,
    overloadedMetrics,
    sortedMetrics,
    rotationProposals
  };
}
