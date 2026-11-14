import React, { useMemo, useState } from 'react';
import {
  CplItemObe,
  MataKuliahCplMatrixRecord,
  ProgramStudiInfo
} from '../types/index';
import {
  AkreditasiMatrixPdfMeta,
  CplGapComparisonRow,
  generateOfficialReportHeader
} from '../utils/akreditasiPdfExport';
import { QrCodeSvg } from '../utils/qrHelper';

export interface PrintableReportProps {
  prodi: ProgramStudiInfo;
  cpls: CplItemObe[];
  courses: MataKuliahCplMatrixRecord[];
  gapAnalysisRows: CplGapComparisonRow[];
  meta: AkreditasiMatrixPdfMeta;
  orientation?: 'landscape' | 'portrait';
  mode?: 'preview' | 'print-only';
  facultyLogoUrl?: string;
  reportDate?: Date;
  subUnitLabel?: string;
  generatedTimestamp?: string;
  children?: React.ReactNode;
}

/**
 * PrintableReport wrapper component utilizing @media print CSS classes
 * and a dynamic official FT UNBARI header generator pulling Prodi name,
 * faculty logo, and standardized university date formatting.
 */
export const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(
  (
    {
      prodi,
      cpls,
      courses,
      gapAnalysisRows,
      meta,
      orientation = 'landscape',
      mode = 'preview',
      facultyLogoUrl,
      reportDate,
      subUnitLabel,
      generatedTimestamp,
      children
    },
    ref
  ) => {
    const [logoFailed, setLogoFailed] = useState(false);

    const headerConfig = useMemo(
      () =>
        generateOfficialReportHeader(prodi, {
          facultyLogoUrl,
          reportDate,
          subUnitLabel,
          nomorDokumen: meta.nomorDokumen
        }),
      [prodi, facultyLogoUrl, reportDate, subUnitLabel, meta.nomorDokumen]
    );

    // Reset error state whenever dynamic logo URL changes
    React.useEffect(() => {
      setLogoFailed(false);
    }, [headerConfig.logoUrl]);

    const resolvedTimestamp =
      generatedTimestamp ||
      `${headerConfig.tanggalLengkapHari} · ${headerConfig.waktuCetakWib}`;

    const wrapperVisibilityClass =
      mode === 'print-only'
        ? 'hidden print:block printable-report-auto'
        : 'block';

    const maxWidthClass = orientation === 'landscape' ? 'max-w-5xl' : 'max-w-4xl';

    return (
      <div className={wrapperVisibilityClass}>
        <article
          ref={ref}
          aria-label="Laporan Resmi Matriks Kontribusi CPL FT UNBARI"
          className={`printable-report printable-document bg-white p-8 rounded-lg shadow-sm w-full ${maxWidthClass} text-slate-900 font-serif border border-slate-300`}
        >
          {/* Dynamic Formal FT UNBARI Header */}
          <div className="printable-report-header mb-5 text-center font-sans" data-kop-surat="true">
            <div className="flex items-center justify-between gap-4">
              {/* Official Faculty Logo Slot with Graceful Box Placeholder */}
              <div className="w-20 sm:w-24 shrink-0 flex flex-col items-center justify-center">
                {!logoFailed ? (
                  <img
                    src={headerConfig.logoUrl}
                    alt={headerConfig.logoAlt}
                    onError={() => setLogoFailed(true)}
                    className="w-18 h-18 sm:w-20 sm:h-20 object-contain"
                  />
                ) : (
                  <div
                    className="printable-report-logo-placeholder w-16 h-16 border-2 border-dashed border-slate-500 rounded flex flex-col items-center justify-center text-[8px] font-mono font-bold text-slate-600 bg-slate-50 leading-tight p-1 text-center"
                    aria-label="Placeholder Logo Resmi UNBARI"
                  >
                    <span>{headerConfig.logoPlaceholderCode}</span>
                  </div>
                )}
              </div>

              {/* Official Faculty & Prodi Identity Block */}
              <div className="flex-1 text-center">
                <p className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-900 leading-tight">
                  {headerConfig.yayasan}
                </p>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-950 tracking-tight leading-tight mt-0.5">
                  {headerConfig.universitas}
                </h2>
                <h3 className="text-xs sm:text-sm font-extrabold uppercase text-slate-900 tracking-wide leading-tight mt-0.5">
                  {headerConfig.fakultas}
                </h3>
                <p className="text-[11px] sm:text-xs font-bold text-slate-800 uppercase tracking-tight mt-0.5">
                  {headerConfig.prodiLine}
                </p>
                <p className="text-[10px] font-medium text-slate-700 italic">
                  {headerConfig.subUnitLabel} · Akreditasi: {headerConfig.akreditasiLabel}
                </p>
                <p className="text-[10px] text-slate-800 font-normal mt-1 leading-snug">
                  {headerConfig.kontakResmi}
                </p>
                <p className="text-[9.5px] text-slate-800 font-normal mt-0.5 leading-snug">
                  {headerConfig.alamatLengkap}
                </p>
              </div>

              {/* Inline SVG QR Validation Stamp */}
              <div className="w-20 sm:w-24 shrink-0 flex flex-col items-center justify-center text-center">
                <QrCodeSvg
                  value={headerConfig.qrVerificationUrl}
                  size={56}
                  title="QR Validasi Dokumen Borang CPL"
                />
                <span className="text-[7.5px] font-mono font-bold text-slate-600 mt-0.5 uppercase tracking-wider">
                  GPMF FT
                </span>
              </div>
            </div>

            {/* Official UNBARI Double Rule */}
            <div className="w-full mt-3" aria-hidden="true">
              <div className="h-[3.5px] bg-slate-950 w-full" />
              <div className="h-[1px] bg-slate-950 w-full mt-[1.5px]" />
            </div>
          </div>

          {/* Automatic Document Title & Standardized Date Metadata */}
          <div className="text-center mb-4">
            <h1 className="text-sm font-bold uppercase tracking-wide text-slate-900 underline">
              {meta.judulDokumen}
            </h1>
            <p className="text-[11px] font-sans font-semibold text-slate-700 mt-1">
              {meta.subJudulDokumen}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] font-sans bg-slate-50 border border-slate-300 rounded p-2.5 mb-4">
            <div>
              <span className="text-slate-500">Nomor Dokumen:</span>{' '}
              <strong className="font-mono text-slate-900">{meta.nomorDokumen}</strong>
            </div>
            <div>
              <span className="text-slate-500">Tanggal &amp; Waktu Terbit:</span>{' '}
              <strong className="tabular-nums text-slate-900">{resolvedTimestamp}</strong>
            </div>
            <div>
              <span className="text-slate-500">Cakupan Data Borang:</span>{' '}
              <strong className="text-slate-900">{meta.filterScopeLabel}</strong>
            </div>
            <div>
              <span className="text-slate-500">Rekap Kurikulum:</span>{' '}
              <strong className="font-mono tabular-nums text-slate-900">
                {meta.totalMataKuliah} Mata Kuliah ({meta.totalSks} SKS)
              </strong>
            </div>
          </div>

          {/* Primary Matrix Contribution Tabular Layout */}
          <table className="printable-report-table w-full text-[9.5px] font-sans border-collapse border border-black mb-5">
            <thead>
              <tr className="bg-slate-100 border border-black">
                <th className="border border-black p-1 text-center w-7">No</th>
                <th className="border border-black p-1 text-center w-20">Kode MK</th>
                <th className="border border-black p-1 text-left">Nama Mata Kuliah</th>
                <th className="border border-black p-1 text-center w-9">SKS</th>
                <th className="border border-black p-1 text-center w-9">Sem</th>
                <th className="border border-black p-1 text-center w-14">Kelompok</th>
                {cpls.map(cpl => (
                  <th key={cpl.kode} className="border border-black p-1 text-center w-10">
                    {cpl.kode}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td
                    colSpan={6 + cpls.length}
                    className="border border-black p-4 text-center text-slate-500"
                  >
                    Tidak ada mata kuliah pada filter semester / kelompok yang dipilih.
                  </td>
                </tr>
              ) : (
                courses.map((course, idx) => {
                  const semDisplay =
                    course.semesterLabel ||
                    (course.semester > 0 ? String(course.semester).padStart(2, '0') : '-');
                  const kelompok =
                    course.kelompokKurikulum ||
                    (course.kategori === 'Pilihan' ? 'Pilihan' : 'Wajib');
                  return (
                    <tr
                      key={course.id}
                      className={`border border-black ${idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}`}
                    >
                      <td className="border border-black p-1 text-center tabular-nums">{idx + 1}</td>
                      <td className="border border-black p-1 font-mono whitespace-nowrap">
                        {course.kodeMK}
                      </td>
                      <td className="border border-black p-1 font-semibold leading-tight">
                        {course.namaMK}
                      </td>
                      <td className="border border-black p-1 text-center tabular-nums">
                        {course.sks}
                      </td>
                      <td className="border border-black p-1 text-center tabular-nums">
                        {semDisplay}
                      </td>
                      <td className="border border-black p-1 text-center">{kelompok}</td>
                      {cpls.map(cpl => {
                        const lvl = course.pemetaanCpl[cpl.kode] || 'None';
                        const shortLvl =
                          lvl === 'Strong' ? 'S' : lvl === 'Medium' ? 'M' : lvl === 'Low' ? 'L' : '-';
                        const cellBg =
                          lvl === 'Strong'
                            ? 'bg-emerald-100 font-bold text-emerald-950'
                            : lvl === 'Medium'
                            ? 'bg-amber-100 font-semibold text-amber-950'
                            : lvl === 'Low'
                            ? 'bg-sky-50 text-sky-900'
                            : 'text-slate-400';
                        return (
                          <td key={cpl.kode} className={`border border-black p-1 text-center ${cellBg}`}>
                            {shortLvl}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 border border-black font-bold">
                <td colSpan={3} className="border border-black p-1 text-right">
                  Total SKS / Sebaran Kontribusi (S/M/L):
                </td>
                <td className="border border-black p-1 text-center tabular-nums">
                  {meta.totalSks}
                </td>
                <td colSpan={2} className="border border-black p-1 text-center">
                  -
                </td>
                {cpls.map(cpl => {
                  const s = courses.filter(m => m.pemetaanCpl[cpl.kode] === 'Strong').length;
                  const m = courses.filter(m => m.pemetaanCpl[cpl.kode] === 'Medium').length;
                  const l = courses.filter(m => m.pemetaanCpl[cpl.kode] === 'Low').length;
                  return (
                    <td key={cpl.kode} className="border border-black p-1 text-center text-[8px] font-mono tabular-nums">
                      {s}/{m}/{l}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>

          {/* Gap Analysis Summary Table */}
          <div className="mb-4 font-sans">
            <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5 text-slate-900">
              Ringkasan Gap Analysis Capaian CPL vs Target Kurikulum OBE:
            </div>
            <table className="printable-report-table w-full text-[9px] border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-black p-1 text-center w-14">Kode</th>
                  <th className="border border-black p-1 text-left">Kompetensi Lulusan</th>
                  <th className="border border-black p-1 text-right w-16">Capaian</th>
                  <th className="border border-black p-1 text-right w-16">Target</th>
                  <th className="border border-black p-1 text-right w-14">Gap</th>
                  <th className="border border-black p-1 text-center w-24">Status</th>
                </tr>
              </thead>
              <tbody>
                {gapAnalysisRows.map(row => (
                  <tr key={row.kode}>
                    <td className="border border-black p-1 text-center font-mono font-bold">
                      {row.kode}
                    </td>
                    <td className="border border-black p-1">
                      {row.judul} ({row.ranah})
                    </td>
                    <td className="border border-black p-1 text-right font-mono tabular-nums">
                      {row.capaianSaatIni.toFixed(1)}%
                    </td>
                    <td className="border border-black p-1 text-right font-mono tabular-nums">
                      {row.targetKurikulum.toFixed(1)}%
                    </td>
                    <td className="border border-black p-1 text-right font-mono tabular-nums font-bold">
                      {row.gap >= 0 ? '+' : ''}
                      {row.gap.toFixed(1)}%
                    </td>
                    <td className="border border-black p-1 text-center">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CPL Legend Box */}
          <div className="border border-slate-400 p-2.5 rounded text-[8.5px] font-sans mb-5 bg-slate-50">
            <div className="font-bold mb-1 uppercase">
              Keterangan Skala Kontribusi (S = Strong &ge;40%, M = Medium 20–39%, L = Low &lt;20%) &amp; Rumusan CPL:
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {cpls.map(cpl => (
                <div key={cpl.kode}>
                  <strong>
                    {cpl.kode} ({cpl.ranah}):
                  </strong>{' '}
                  {cpl.judul} — Target &ge; {cpl.targetKetercapaianMinimal}%
                </div>
              ))}
            </div>
          </div>

          {children}

          {/* Official Signatures Block */}
          <div className="signature-block grid grid-cols-2 gap-12 text-center text-xs mt-6 pt-3">
            <div>
              <div>Mengetahui,</div>
              <div className="font-bold">Ketua Program Studi {prodi.nama}</div>
              <div className="h-16" />
              <div className="font-bold underline">{meta.kaprodiNama}</div>
              <div className="text-[10px] text-slate-600">NIDN / NUPTK: {meta.kaprodiNidn}</div>
            </div>
            <div>
              <div>{headerConfig.tempatTanggalSurat}</div>
              <div className="font-bold">Dekan Fakultas Teknik UNBARI</div>
              <div className="h-16" />
              <div className="font-bold underline">{meta.dekanNama}</div>
              <div className="text-[10px] text-slate-600">NIDN: {meta.dekanNidn}</div>
            </div>
          </div>
        </article>
      </div>
    );
  }
);

PrintableReport.displayName = 'PrintableReport';
