import React, { useMemo, useRef, useState } from 'react';
import {
  X,
  Printer,
  FileText,
  UserCheck,
  Users,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Dosen, JadwalKuliah, ProgramStudiInfo } from '../types/index';
import { StandardKopSurat } from './StandardKopSurat';
import { generateOfficialReportHeader } from '../utils/akreditasiPdfExport';
import { printDocumentElement } from '../utils/printHelper';

export interface BkdLldiktiDosenMetric {
  dosen: Dosen;
  scheduledClasses: JadwalKuliah[];
  scheduledSks: number;
  sksKuliah: number;
  sksBimbingan: number;
  totalBebanSks: number;
  rasioLldiktiPersen: number;
  rasioTerhadapProdi: number;
  kelebihanSks: number;
  kekuranganSks: number;
  isOverload: boolean;
  isNearLimit: boolean;
  isUnderload: boolean;
  isCompliant: boolean;
}

interface BkdLldiktiPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricsList: BkdLldiktiDosenMetric[];
  initialDosenId?: string | null;
  initialViewMode?: 'individu' | 'kolektif';
  calculationMode: 'bkd_total' | 'tatap_muka';
  prodiAvgSks: number;
  selectedProdi: ProgramStudiInfo;
  onShowToast?: (msg: string) => void;
}

export const BkdLldiktiPdfModal: React.FC<BkdLldiktiPdfModalProps> = ({
  isOpen,
  onClose,
  metricsList,
  initialDosenId,
  initialViewMode = 'individu',
  calculationMode,
  prodiAvgSks,
  selectedProdi,
  onShowToast
}) => {
  const [viewMode, setViewMode] = useState<'individu' | 'kolektif'>(initialViewMode);
  const [selectedDosenId, setSelectedDosenId] = useState<string>(
    initialDosenId || metricsList[0]?.dosen.id || ''
  );
  const [isPrinting, setIsPrinting] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const [reportDate, setReportDate] = useState<Date>(() => new Date());

  React.useEffect(() => {
    if (!isOpen) return;
    setReportDate(new Date());
    setViewMode(initialViewMode);
    if (initialDosenId) {
      setSelectedDosenId(initialDosenId);
    } else if (metricsList.length > 0) {
      setSelectedDosenId(prev =>
        metricsList.some(m => m.dosen.id === prev) ? prev : metricsList[0].dosen.id
      );
    }
  }, [isOpen, initialDosenId, initialViewMode, metricsList]);

  const activeMetric = useMemo(() => {
    return (
      metricsList.find(m => m.dosen.id === selectedDosenId) ||
      metricsList[0] ||
      null
    );
  }, [metricsList, selectedDosenId]);

  const headerConfig = useMemo(() => {
    const codePrefix =
      selectedProdi.id === 'SIPIL' ? 'SPL' : selectedProdi.id === 'LINGKUNGAN' ? 'LKG' : 'LST';
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const roman = romanMonths[reportDate.getMonth()] || 'I';
    const nomorDoc =
      viewMode === 'individu' && activeMetric
        ? `012/BKD-${activeMetric.dosen.nidn.slice(-4)}/FT-UB/${roman}/${reportDate.getFullYear()}`
        : `012/GPMF-BKD-${codePrefix}/FT-UB/${roman}/${reportDate.getFullYear()}`;

    return {
      nomorDoc,
      ...generateOfficialReportHeader(selectedProdi, {
        reportDate,
        nomorDokumen: nomorDoc,
        subUnitLabel:
          'Gugus Penjaminan Mutu Fakultas (GPMF) · Format Laporan BKD LLDIKTI Wilayah X'
      })
    };
  }, [selectedProdi, reportDate, viewMode, activeMetric]);

  if (!isOpen) return null;

  const getLldiktiConclusion = (m: BkdLldiktiDosenMetric) => {
    if (m.isOverload) {
      return {
        kode: 'LB',
        label: 'LB — Lebih Beban (> 16 SKS)',
        short: 'Lebih Beban (>16 SKS)',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300'
      };
    }
    if (m.isUnderload) {
      return {
        kode: 'TM',
        label: 'TM — Tidak Memenuhi (< 12 SKS)',
        short: 'Kurang Beban (<12 SKS)',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
      };
    }
    return {
      kode: 'M',
      label: 'M — Memenuhi Standar (12–16 SKS)',
      short: 'Memenuhi (12–16 SKS)',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    };
  };

  const handlePrintPdf = () => {
    if (!printAreaRef.current) return;
    setIsPrinting(true);
    const title =
      viewMode === 'individu' && activeMetric
        ? `Laporan_BKD_LLDIKTI_${activeMetric.dosen.nidn}_${activeMetric.dosen.namaLengkap.replace(/[^a-zA-Z0-9]/g, '_')}`
        : `Rekap_BKD_LLDIKTI_${selectedProdi.singkatan.replace(/[^a-zA-Z0-9]/g, '_')}`;

    printDocumentElement(printAreaRef.current, {
      documentTitle: title,
      orientation: viewMode === 'kolektif' ? 'landscape' : 'portrait',
      onAfterPrint: () => setIsPrinting(false)
    });

    if (onShowToast) {
      onShowToast(
        viewMode === 'individu' && activeMetric
          ? `Laporan BKD format LLDIKTI untuk ${activeMetric.dosen.namaLengkap} siap disimpan sebagai PDF / dicetak.`
          : `Rekapitulasi Rasio BKD LLDIKTI (${metricsList.length} dosen) siap disimpan sebagai PDF / dicetak.`
      );
    }
    setTimeout(() => setIsPrinting(false), 1200);
  };

  const overloadCount = metricsList.filter(m => m.isOverload).length;
  const compliantCount = metricsList.filter(m => m.isCompliant).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Top Modal Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold">
                Unduh Laporan Beban Mengajar Dosen (PDF Template LLDIKTI)
              </h3>
              <p className="text-[11px] text-slate-300">
                Kop Surat Resmi FT UNBARI · Pedoman Operasional BKD LLDIKTI (12–16 SKS)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Switch Individu vs Kolektif */}
            <div className="inline-flex items-center p-0.5 bg-slate-800 border border-slate-700 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setViewMode('individu')}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === 'individu' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Per Dosen (LKD/BKD)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kolektif')}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === 'kolektif' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Rekap Kolektif ({metricsList.length})</span>
              </button>
            </div>

            {/* Lecturer selector in individual mode */}
            {viewMode === 'individu' && metricsList.length > 0 && (
              <select
                value={activeMetric?.dosen.id || ''}
                onChange={e => setSelectedDosenId(e.target.value)}
                aria-label="Pilih dosen untuk laporan BKD LLDIKTI"
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 max-w-[230px]"
              >
                {metricsList.map(m => (
                  <option key={m.dosen.id} value={m.dosen.id}>
                    {m.dosen.namaLengkap} ({m.totalBebanSks} SKS)
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={handlePrintPdf}
              disabled={isPrinting || metricsList.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-extrabold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isPrinting ? 'Memproses...' : 'Simpan PDF / Cetak'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal cetak BKD"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex justify-center">
          <div
            ref={printAreaRef}
            className={`printable-document bg-white text-slate-900 w-full ${
              viewMode === 'kolektif' ? 'max-w-[297mm]' : 'max-w-[210mm]'
            } p-8 sm:p-10 shadow-md border border-slate-300 text-xs font-serif leading-relaxed`}
          >
            {/* Official FT UNBARI Header */}
            <StandardKopSurat
              prodiName={headerConfig.prodiLine}
              subTitle={headerConfig.subUnitLabel}
              showQrCode={true}
              qrCodeUrl={headerConfig.qrVerificationUrl}
              qrCodeTitle="QR Validasi BKD LLDIKTI FT UNBARI"
              qrBadgeText="BKD-LLDIKTI"
            />

            {/* INDIVIDUAL LECTURER LLDIKTI TEMPLATE */}
            {viewMode === 'individu' && activeMetric && (
              <div>
                <div className="text-center mb-5 font-sans">
                  <h1 className="text-sm font-extrabold uppercase tracking-wide underline text-slate-950">
                    LAPORAN BEBAN KERJA DOSEN (BKD) — BIDANG PENDIDIKAN &amp; PENGAJARAN
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-700 mt-1">
                    Template Evaluasi Beban Mengajar Perguruan Tinggi · LLDIKTI Wilayah X / SISTER BKD
                  </p>
                  <p className="text-[10px] font-mono text-slate-600 mt-0.5">
                    Nomor: {headerConfig.nomorDoc} · Semester Ganjil TA 2026/2027
                  </p>
                </div>

                {/* I. IDENTITAS DOSEN */}
                <div className="mb-4 font-sans">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-1.5 border-b border-slate-400 pb-0.5">
                    I. Identitas Dosen &amp; Perguruan Tinggi Homebase
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 bg-slate-50 border border-slate-300 rounded p-3 text-[10.5px]">
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-600">Nama Lengkap &amp; Gelar</span>
                      <strong className="text-slate-950 text-right">{activeMetric.dosen.namaLengkap}</strong>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-600">NIDN / NUPTK</span>
                      <strong className="font-mono text-slate-950 text-right">
                        {activeMetric.dosen.nidn}
                        {activeMetric.dosen.nuptk ? ` / ${activeMetric.dosen.nuptk}` : ''}
                      </strong>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-600">Jabatan Fungsional</span>
                      <strong className="text-slate-950 text-right">{activeMetric.dosen.jabatanFungsional}</strong>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-600">Program Studi Homebase</span>
                      <strong className="text-slate-950 text-right">
                        {activeMetric.dosen.prodiId === 'SIPIL'
                          ? 'S1 Teknik Sipil'
                          : activeMetric.dosen.prodiId === 'LINGKUNGAN'
                          ? 'S1 Teknik Lingkungan'
                          : 'D3 Teknik Listrik'}
                      </strong>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-600">Perguruan Tinggi</span>
                      <strong className="text-slate-950 text-right">Universitas Batanghari (LLDIKTI Wil. X)</strong>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-600">Bidang Keahlian</span>
                      <strong className="text-slate-950 text-right">{activeMetric.dosen.keahlian}</strong>
                    </div>
                  </div>
                </div>

                {/* II. RINCIAN KINERJA BIDANG PENDIDIKAN */}
                <div className="mb-4 font-sans">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-1.5 border-b border-slate-400 pb-0.5">
                    II. Pelaksanaan Pendidikan &amp; Pengajaran (Semester Ganjil TA 2026/2027)
                  </div>
                  <table className="w-full border-collapse border border-black text-[9.5px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold">
                        <th className="border border-black px-1.5 py-1.5 text-center w-7">No</th>
                        <th className="border border-black px-2 py-1.5 text-center w-20">Kode MK</th>
                        <th className="border border-black px-2 py-1.5 text-left">Jenis Kegiatan / Nama Mata Kuliah</th>
                        <th className="border border-black px-1.5 py-1.5 text-center w-12">Kelas</th>
                        <th className="border border-black px-2 py-1.5 text-left w-36">Jadwal &amp; Ruang</th>
                        <th className="border border-black px-1.5 py-1.5 text-center w-12">Mhs</th>
                        <th className="border border-black px-1.5 py-1.5 text-right w-14">SKS BKD</th>
                        <th className="border border-black px-2 py-1.5 text-center w-24">Bukti Penugasan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeMetric.scheduledClasses.length > 0 ? (
                        activeMetric.scheduledClasses.map((cls, idx) => (
                          <tr key={cls.id}>
                            <td className="border border-black px-1.5 py-1 text-center font-mono">{idx + 1}</td>
                            <td className="border border-black px-2 py-1 text-center font-mono font-semibold">
                              {cls.kodeMK}
                            </td>
                            <td className="border border-black px-2 py-1 font-medium">
                              Mengajar MK: {cls.namaMK}
                            </td>
                            <td className="border border-black px-1.5 py-1 text-center font-mono">{cls.kelas}</td>
                            <td className="border border-black px-2 py-1 text-[9px]">
                              {cls.hari}, {cls.jamMulai}–{cls.jamSelesai} ({cls.ruanganNama})
                            </td>
                            <td className="border border-black px-1.5 py-1 text-center font-mono tabular-nums">
                              {cls.pesertaTotal}
                            </td>
                            <td className="border border-black px-1.5 py-1 text-right font-mono font-bold tabular-nums">
                              {cls.sks.toFixed(1)}
                            </td>
                            <td className="border border-black px-2 py-1 text-center text-[8.5px]">
                              SK Mengajar &amp; BAP ({activeMetric.dosen.kehadiranBapPersen}%)
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="border border-black px-1.5 py-1 text-center font-mono">1</td>
                          <td className="border border-black px-2 py-1 text-center font-mono">SIAKAD-MK</td>
                          <td className="border border-black px-2 py-1 font-medium">
                            Beban Pengajaran Perkuliahan Terstruktur (Rekap Kurikulum Prodi)
                          </td>
                          <td className="border border-black px-1.5 py-1 text-center font-mono">REG</td>
                          <td className="border border-black px-2 py-1 text-[9px]">Terjadwal Fakultas Teknik</td>
                          <td className="border border-black px-1.5 py-1 text-center font-mono">-</td>
                          <td className="border border-black px-1.5 py-1 text-right font-mono font-bold tabular-nums">
                            {activeMetric.sksKuliah.toFixed(1)}
                          </td>
                          <td className="border border-black px-2 py-1 text-center text-[8.5px]">
                            SK Mengajar &amp; BAP ({activeMetric.dosen.kehadiranBapPersen}%)
                          </td>
                        </tr>
                      )}

                      {/* Adjustment row if dosen.totalSksMengajar > scheduledSks */}
                      {activeMetric.scheduledClasses.length > 0 &&
                        activeMetric.sksKuliah > activeMetric.scheduledSks && (
                          <tr>
                            <td className="border border-black px-1.5 py-1 text-center font-mono">
                              {activeMetric.scheduledClasses.length + 1}
                            </td>
                            <td className="border border-black px-2 py-1 text-center font-mono">TIM-MK</td>
                            <td className="border border-black px-2 py-1 font-medium">
                              Pengajaran Kelas Paralel / Team Teaching &amp; Praktikum Terstruktur
                            </td>
                            <td className="border border-black px-1.5 py-1 text-center font-mono">TIM</td>
                            <td className="border border-black px-2 py-1 text-[9px]">Sesuai SK Dekan FT UNBARI</td>
                            <td className="border border-black px-1.5 py-1 text-center font-mono">-</td>
                            <td className="border border-black px-1.5 py-1 text-right font-mono font-bold tabular-nums">
                              {(activeMetric.sksKuliah - activeMetric.scheduledSks).toFixed(1)}
                            </td>
                            <td className="border border-black px-2 py-1 text-center text-[8.5px]">
                              SK Dekan &amp; Daftar Hadir
                            </td>
                          </tr>
                        )}

                      {/* TA / Thesis Mentoring Equivalence Row */}
                      {calculationMode === 'bkd_total' && (
                        <tr>
                          <td className="border border-black px-1.5 py-1 text-center font-mono">
                            {(activeMetric.scheduledClasses.length || 1) +
                              (activeMetric.scheduledClasses.length > 0 &&
                              activeMetric.sksKuliah > activeMetric.scheduledSks
                                ? 2
                                : 1)}
                          </td>
                          <td className="border border-black px-2 py-1 text-center font-mono">BKD-TA</td>
                          <td className="border border-black px-2 py-1 font-medium">
                            Pembimbingan Tugas Akhir / Skripsi / Proyek Akhir Mahasiswa (0.25 SKS/Mhs)
                          </td>
                          <td className="border border-black px-1.5 py-1 text-center font-mono">-</td>
                          <td className="border border-black px-2 py-1 text-[9px]">Konsultasi &amp; Sidang TA</td>
                          <td className="border border-black px-1.5 py-1 text-center font-mono tabular-nums">
                            {activeMetric.dosen.jumlahMahasiswaBimbingan}
                          </td>
                          <td className="border border-black px-1.5 py-1 text-right font-mono font-bold tabular-nums">
                            {activeMetric.sksBimbingan.toFixed(1)}
                          </td>
                          <td className="border border-black px-2 py-1 text-center text-[8.5px]">
                            SK Bimbingan &amp; Logbook
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-bold text-slate-950">
                        <td colSpan={6} className="border border-black px-2 py-1.5 text-right uppercase text-[10px]">
                          Total Beban Kerja Pendidikan &amp; Pengajaran (SKS):
                        </td>
                        <td className="border border-black px-1.5 py-1.5 text-right font-mono tabular-nums text-[10.5px]">
                          {activeMetric.totalBebanSks.toFixed(1)}
                        </td>
                        <td className="border border-black px-2 py-1.5 text-center font-mono text-[9px]">
                          Maks 16.0 SKS
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* III. RASIO & KESIMPULAN KEPATUHAN REGULASI LLDIKTI */}
                {(() => {
                  const conclusion = getLldiktiConclusion(activeMetric);
                  return (
                    <div className="mb-5 font-sans">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-1.5 border-b border-slate-400 pb-0.5">
                        III. Evaluasi Rasio Beban Mengajar &amp; Kesimpulan Regulasi LLDIKTI
                      </div>
                      <div className="border border-black rounded p-3 bg-slate-50/70 space-y-2 text-[10px]">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <span className="text-slate-600 block text-[9.5px]">Ambang Wajib LLDIKTI</span>
                            <strong className="font-mono text-slate-950">12.0 – 16.0 SKS</strong>
                          </div>
                          <div>
                            <span className="text-slate-600 block text-[9.5px]">Rasio vs Batas 16 SKS</span>
                            <strong
                              className={`font-mono tabular-nums ${
                                activeMetric.isOverload ? 'text-rose-700' : 'text-slate-950'
                              }`}
                            >
                              {activeMetric.rasioLldiktiPersen.toFixed(1)}%
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-600 block text-[9.5px]">Rasio vs Rerata Prodi ({prodiAvgSks} SKS)</span>
                            <strong className="font-mono tabular-nums text-slate-950">
                              {activeMetric.rasioTerhadapProdi.toFixed(2)}x
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-600 block text-[9.5px]">Kesimpulan BKD (LLDIKTI)</span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9.5px] font-bold mt-0.5 ${conclusion.badgeClass}`}
                            >
                              {activeMetric.isOverload ? (
                                <AlertTriangle className="w-3 h-3" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              <span>{conclusion.label}</span>
                            </span>
                          </div>
                        </div>

                        {activeMetric.isOverload && (
                          <div className="p-2 bg-rose-50 border border-rose-300 rounded text-rose-900 text-[9.5px]">
                            <strong>Catatan Kepatuhan LLDIKTI:</strong> Total beban mengajar tercatat{' '}
                            <strong>{activeMetric.totalBebanSks.toFixed(1)} SKS</strong> (melebihi batas maksimal 16,0 SKS sebesar{' '}
                            <strong>+{activeMetric.kelebihanSks.toFixed(1)} SKS</strong>). Program Studi wajib melakukan redistribusi melalui skema{' '}
                            <em>team teaching</em> atau pengalihan kelas sebelum pelaporan SISTER BKD.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* IV. PERNYATAAN & TANDA TANGAN RESMI */}
                <div className="signature-block font-sans text-[10px] mt-6 pt-2">
                  <p className="text-[9.5px] text-slate-700 italic mb-4">
                    Demikian Laporan Beban Kerja Dosen (BKD) bidang pendidikan ini dibuat dengan sebenar-benarnya sesuai data perkuliahan SIAKAD &amp; Pedoman Operasional BKD LLDIKTI Wilayah X.
                  </p>
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div>Dosen Yang Melaporkan,</div>
                      <div className="font-bold">Dosen Tetap Prodi</div>
                      <div className="h-14" />
                      <div className="font-bold underline">{activeMetric.dosen.namaLengkap}</div>
                      <div className="text-[9px] font-mono text-slate-600">NIDN: {activeMetric.dosen.nidn}</div>
                    </div>
                    <div>
                      <div>Diverifikasi Asesor / Kaprodi,</div>
                      <div className="font-bold">Kaprodi {selectedProdi.nama}</div>
                      <div className="h-14" />
                      <div className="font-bold underline">{selectedProdi.kaprodi}</div>
                      <div className="text-[9px] font-mono text-slate-600">
                        NIDN / NUPTK: {selectedProdi.nipKaprodi}
                      </div>
                    </div>
                    <div>
                      <div>{headerConfig.tempatTanggalSurat}</div>
                      <div className="font-bold">Dekan Fakultas Teknik UNBARI</div>
                      <div className="h-14" />
                      <div className="font-bold underline">Ir. Fadli Eka Yandra, S.T., M.T.</div>
                      <div className="text-[9px] font-mono text-slate-600">NIDN: 1004077102</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* COLLECTIVE LLDIKTI WORKLOAD SUMMARY TEMPLATE */}
            {viewMode === 'kolektif' && (
              <div>
                <div className="text-center mb-4 font-sans">
                  <h1 className="text-sm font-extrabold uppercase tracking-wide underline text-slate-950">
                    REKAPITULASI RASIO BEBAN MENGAJAR DOSEN — TEMPLATE BKD LLDIKTI
                  </h1>
                  <p className="text-[11px] font-semibold text-slate-700 mt-1">
                    Evaluasi Beban Minimal 12 SKS &amp; Batas Maksimal 16 SKS · {selectedProdi.nama} ({selectedProdi.jenjang})
                  </p>
                  <p className="text-[10px] font-mono text-slate-600 mt-0.5">
                    Nomor: {headerConfig.nomorDoc} · Terbit: {headerConfig.tempatTanggalSurat}
                  </p>
                </div>

                {/* Metadata Strip */}
                <div className="grid grid-cols-4 gap-3 text-[10px] font-sans bg-slate-50 border border-slate-300 rounded p-2.5 mb-4">
                  <div>
                    <span className="text-slate-500 block">Jumlah Dosen</span>
                    <strong className="font-mono tabular-nums">{metricsList.length} Dosen</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Rata-rata Beban Prodi</span>
                    <strong className="font-mono tabular-nums">{prodiAvgSks} SKS</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Memenuhi (12–16 SKS)</span>
                    <strong className="font-mono tabular-nums text-emerald-800">
                      {compliantCount} / {metricsList.length} Dosen
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Pelanggaran (&gt;16 SKS LLDIKTI)</span>
                    <strong className="font-mono tabular-nums text-rose-700">
                      {overloadCount} Dosen
                    </strong>
                  </div>
                </div>

                <table className="w-full border-collapse border border-black text-[9.5px] font-sans mb-5">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-900">
                      <th className="border border-black p-1 text-center w-7">No</th>
                      <th className="border border-black p-1 text-left">Nama Dosen &amp; NIDN</th>
                      <th className="border border-black p-1 text-center w-24">Jabfung</th>
                      <th className="border border-black p-1 text-right w-16">Kuliah</th>
                      <th className="border border-black p-1 text-right w-16">Bimb. TA</th>
                      <th className="border border-black p-1 text-right w-16">Total SKS</th>
                      <th className="border border-black p-1 text-right w-20">Rasio / 16 SKS</th>
                      <th className="border border-black p-1 text-right w-16">vs Rerata</th>
                      <th className="border border-black p-1 text-center w-36">Kesimpulan LLDIKTI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricsList.map((m, idx) => {
                      const c = getLldiktiConclusion(m);
                      return (
                        <tr key={m.dosen.id} className={m.isOverload ? 'bg-rose-50' : ''}>
                          <td className="border border-black p-1 text-center font-mono">{idx + 1}</td>
                          <td className="border border-black p-1">
                            <div className="font-bold text-slate-900">{m.dosen.namaLengkap}</div>
                            <div className="font-mono text-[8.5px] text-slate-600">NIDN: {m.dosen.nidn}</div>
                          </td>
                          <td className="border border-black p-1 text-center">{m.dosen.jabatanFungsional}</td>
                          <td className="border border-black p-1 text-right font-mono tabular-nums">
                            {m.sksKuliah.toFixed(1)}
                          </td>
                          <td className="border border-black p-1 text-right font-mono tabular-nums">
                            {calculationMode === 'bkd_total' ? m.sksBimbingan.toFixed(1) : '0.0'}
                          </td>
                          <td className="border border-black p-1 text-right font-mono font-bold tabular-nums">
                            {m.totalBebanSks.toFixed(1)}
                          </td>
                          <td className="border border-black p-1 text-right font-mono font-bold tabular-nums">
                            {m.rasioLldiktiPersen.toFixed(1)}%
                          </td>
                          <td className="border border-black p-1 text-right font-mono tabular-nums">
                            {m.rasioTerhadapProdi.toFixed(2)}x
                          </td>
                          <td className="border border-black p-1 text-center font-semibold">
                            {c.kode} · {c.short}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={5} className="border border-black p-1 text-right">
                        Rata-rata Beban &amp; Rasio Program Studi:
                      </td>
                      <td className="border border-black p-1 text-right font-mono tabular-nums">
                        {prodiAvgSks.toFixed(1)}
                      </td>
                      <td className="border border-black p-1 text-right font-mono tabular-nums">
                        {((prodiAvgSks / 16) * 100).toFixed(1)}%
                      </td>
                      <td className="border border-black p-1 text-right font-mono tabular-nums">1.00x</td>
                      <td className="border border-black p-1 text-center">
                        {overloadCount > 0 ? `${overloadCount} Overload >16` : 'Semua Aman'}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Collective Signatures */}
                <div className="signature-block grid grid-cols-2 gap-12 text-center text-[10.5px] font-sans mt-6 pt-2">
                  <div>
                    <div>Mengetahui,</div>
                    <div className="font-bold">Ketua Program Studi {selectedProdi.nama}</div>
                    <div className="h-14" />
                    <div className="font-bold underline">{selectedProdi.kaprodi}</div>
                    <div className="text-[9.5px] font-mono text-slate-600">
                      NIDN / NUPTK: {selectedProdi.nipKaprodi}
                    </div>
                  </div>
                  <div>
                    <div>{headerConfig.tempatTanggalSurat}</div>
                    <div className="font-bold">Dekan Fakultas Teknik UNBARI</div>
                    <div className="h-14" />
                    <div className="font-bold underline">Ir. Fadli Eka Yandra, S.T., M.T.</div>
                    <div className="text-[9.5px] font-mono text-slate-600">NIDN: 1004077102</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-slate-600">
            Format dokumen A4 ({viewMode === 'kolektif' ? 'Landscape' : 'Portrait'}) sesuai template BKD LLDIKTI. Pilih <strong>Save as PDF</strong> pada dialog cetak untuk mengunduh file PDF.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrintPdf}
              disabled={isPrinting || metricsList.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Unduh PDF / Cetak (A4)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
