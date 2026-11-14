import React, { useState } from 'react';
import { 
  X, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Printer, 
  Save, 
  ShieldCheck, 
  BookOpen, 
  ExternalLink,
  Shirt
} from 'lucide-react';
import { YudisiumRecord, StatusVerifikasiYudisium, StatusWisuda, UkuranToga, PredikatKelulusan } from '../types/index';
import { tentukanPredikatKelulusan } from '../data/mockYudisiumData';
import { STAFF_TU_FAKULTAS } from '../data/mockTataUsahaData';

import { YudisiumDocType } from './YudisiumPrintModal';
import { SkNumberInputForm } from './SkNumberInputForm';
import { getRomanMonth } from '../utils/skNumberHelper';

interface YudisiumDetailModalProps {
  record: YudisiumRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRecord: (updated: YudisiumRecord) => void;
  onPrintSkl: (record: YudisiumRecord, docType?: YudisiumDocType) => void;
  onShowToast: (msg: string) => void;
}

export const YudisiumDetailModal: React.FC<YudisiumDetailModalProps> = ({
  record,
  isOpen,
  onClose,
  onUpdateRecord,
  onPrintSkl,
  onShowToast
}) => {
  if (!isOpen || !record) return null;

  const [form, setForm] = useState<YudisiumRecord>({ ...record });
  const [activeTab, setActiveTab] = useState<'verifikasi' | 'ijazah' | 'wisuda'>('verifikasi');

  // Sync if record changes
  React.useEffect(() => {
    setForm({ ...record });
  }, [record]);

  const handleToggleSyarat = (key: keyof typeof form.syaratKelengkapan) => {
    const updatedSyarat = {
      ...form.syaratKelengkapan,
      [key]: !form.syaratKelengkapan[key]
    };
    
    // Check if all are true
    const allComplete = Object.values(updatedSyarat).every(v => v === true);
    let newStatus = form.statusVerifikasi;
    if (allComplete && form.statusVerifikasi === 'Menunggu Verifikasi') {
      newStatus = 'Berkas Lengkap';
    } else if (!allComplete && form.statusVerifikasi === 'Berkas Lengkap') {
      newStatus = 'Menunggu Verifikasi';
    }

    setForm(prev => ({
      ...prev,
      syaratKelengkapan: updatedSyarat,
      statusVerifikasi: newStatus
    }));
  };

  const handleIpkChange = (newIpk: number) => {
    const autoPredikat = tentukanPredikatKelulusan(newIpk);
    setForm(prev => ({
      ...prev,
      ipk: newIpk,
      predikat: autoPredikat
    }));
  };

  const handleSahKanDekan = () => {
    const updated: YudisiumRecord = {
      ...form,
      statusVerifikasi: 'Disahkan Dekan',
      nomorSkYudisium: form.nomorSkYudisium || `085/SK-DEK/FT-UNBARI/${getRomanMonth(new Date())}/${new Date().getFullYear()}`,
      nomorIjazahNasional: form.nomorIjazahNasional || `01004${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`,
      nomorSeriIjazah: form.nomorSeriIjazah || `FT-UNBARI-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
    };
    setForm(updated);
    onUpdateRecord(updated);
    onShowToast(`Kelulusan ${updated.nama} berhasil disahkan oleh Dekan Fakultas Teknik!`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRecord(form);
    onShowToast('Data yudisium berhasil diperbarui.');
    onClose();
  };

  const allSyaratComplete = Object.values(form.syaratKelengkapan).every(v => v === true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <GraduationCap className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white leading-tight">
                  {form.nama}
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/20 text-blue-100 font-semibold">
                  NIM: {form.nim}
                </span>
                {form.isLulusanTerbaik && (
                  <span className="text-[10px] font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Award className="w-3 h-3 text-slate-900" />
                    Lulusan Terbaik
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                {form.programStudi} · Angkatan {form.angkatan} · Calon {form.jenjang === 'S1' ? 'Sarjana Teknik' : 'Ahli Madya Teknik'} ({form.gelarLulusan})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2.5 gap-4 shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('verifikasi')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'verifikasi'
                ? 'border-blue-700 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>1. Verifikasi Berkas & Syarat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ijazah')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'ijazah'
                ? 'border-blue-700 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. SK Yudisium & PIN Ijazah</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wisuda')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'wisuda'
                ? 'border-blue-700 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>3. Wisuda & Pengambilan Toga</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] text-slate-500">IPK Akhir</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                {form.ipk.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400">Total SKS: {form.sksLulus}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] text-slate-500">Predikat Kelulusan</span>
              <div className={`text-xs font-bold mt-1 px-2 py-0.5 rounded inline-block ${
                form.predikat.includes('Cum Laude')
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {form.predikat}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] text-slate-500">Masa Studi</span>
              <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                {form.lamaStudi}
              </div>
              <span className="text-[10px] text-slate-400">Lulus Tepat Waktu</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] text-slate-500">Status Validasi</span>
              <div className="mt-1">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  form.statusVerifikasi === 'Disahkan Dekan'
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : form.statusVerifikasi === 'Berkas Lengkap'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {form.statusVerifikasi}
                </span>
              </div>
            </div>
          </div>

          {/* TAB 1: VERIFIKASI BERKAS */}
          {activeTab === 'verifikasi' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-950">Syarat Bebas Beban Fakultas Teknik UNBARI</h4>
                  <p className="text-blue-800/90 text-[11px] mt-0.5">
                    Centang seluruh berkas persyaratan untuk meloloskan mahasiswa ke Sidang Rapat Yudisium Dekan.
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                <label className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.syaratKelengkapan.bebasPustaka}
                      onChange={() => handleToggleSyarat('bebasPustaka')}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Surat Keterangan Bebas Perpustakaan UNBARI</div>
                      <div className="text-[11px] text-slate-500">Tidak ada tanggungan pinjaman buku dan telah donasi buku akademik</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${form.syaratKelengkapan.bebasPustaka ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {form.syaratKelengkapan.bebasPustaka ? 'Lengkap' : 'Belum Ada'}
                  </span>
                </label>

                <label className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.syaratKelengkapan.bebasLab}
                      onChange={() => handleToggleSyarat('bebasLab')}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Bebas Laboratorium & Workshop FT UNBARI</div>
                      <div className="text-[11px] text-slate-500">Surat pengesahan dari Kepala Laboratorium Prodi terkait alat praktikum</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${form.syaratKelengkapan.bebasLab ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {form.syaratKelengkapan.bebasLab ? 'Lengkap' : 'Belum Ada'}
                  </span>
                </label>

                <label className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.syaratKelengkapan.bebasKeuangan}
                      onChange={() => handleToggleSyarat('bebasKeuangan')}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Bebas Administrasi Keuangan (BAUK UNBARI)</div>
                      <div className="text-[11px] text-slate-500">Lunas seluruh SPP/BPP, biaya skripsi, dan administrasi wisuda</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${form.syaratKelengkapan.bebasKeuangan ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {form.syaratKelengkapan.bebasKeuangan ? 'Lengkap' : 'Belum Ada'}
                  </span>
                </label>

                <label className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.syaratKelengkapan.bebasPlagiarisme}
                      onChange={() => handleToggleSyarat('bebasPlagiarisme')}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Bebas Plagiarisme (Turnitin Similarity &lt; 20%)</div>
                      <div className="text-[11px] text-slate-500">Surat lolos uji kemiripan naskah skripsi dari Tim Pengelola Jurnal FT</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${form.syaratKelengkapan.bebasPlagiarisme ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {form.syaratKelengkapan.bebasPlagiarisme ? 'Lengkap' : 'Belum Ada'}
                  </span>
                </label>

                <label className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.syaratKelengkapan.unggahJurnalRepository}
                      onChange={() => handleToggleSyarat('unggahJurnalRepository')}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Unggah Naskah Jurnal & Repository Perpustakaan</div>
                      <div className="text-[11px] text-slate-500">Softcopy PDF full text dan artikel jurnal ilmiah telah diverifikasi</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${form.syaratKelengkapan.unggahJurnalRepository ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {form.syaratKelengkapan.unggahJurnalRepository ? 'Lengkap' : 'Belum Ada'}
                  </span>
                </label>

                <label className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.syaratKelengkapan.fotoIjazah}
                      onChange={() => handleToggleSyarat('fotoIjazah')}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Pas Foto Ijazah (Studio)</div>
                      <div className="text-[11px] text-slate-500">Pas foto hitam putih doff & berwarna latar biru kemeja putih berdasi</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${form.syaratKelengkapan.fotoIjazah ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                    {form.syaratKelengkapan.fotoIjazah ? 'Lengkap' : 'Belum Ada'}
                  </span>
                </label>
              </div>

              {/* Status Update Card */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-slate-900">Status Validasi Berkas Mahasiswa</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {allSyaratComplete ? 'Semua syarat terpenuhi. Mahasiswa siap disahkan kelulusannya.' : 'Masih ada syarat yang belum lengkap.'}
                  </div>
                </div>
                <select
                  value={form.statusVerifikasi}
                  onChange={(e) => setForm(prev => ({ ...prev, statusVerifikasi: e.target.value as StatusVerifikasiYudisium }))}
                  className="text-xs font-bold border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-800"
                >
                  <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                  <option value="Berkas Lengkap">Berkas Lengkap</option>
                  <option value="Disahkan Dekan">Disahkan Dekan</option>
                </select>
              </div>

              {/* Staff Verifikator TU */}
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>Staf Pelayanan Akademik &amp; Ijazah (Verifikator): <strong>{STAFF_TU_FAKULTAS.stafPelayananAkademikDanIjazah}</strong></span>
                </div>
                <span className="text-[11px] text-blue-800 font-medium">Tata Usaha FT UNBARI</span>
              </div>
            </div>
          )}

          {/* TAB 2: SK YUDISIUM & PENOMORAN IJAZAH NASIONAL (PIN) */}
          {activeTab === 'ijazah' && (
            <div className="space-y-5">
              {/* INTERACTIVE SK NUMBER BUILDER */}
              <SkNumberInputForm
                value={form.nomorSkYudisium}
                onChange={(val) => setForm(prev => ({ ...prev, nomorSkYudisium: val }))}
                dateContext={form.tanggalYudisium}
                prodiContext={record.programStudi}
                label="Nomor SK Dekan FT UNBARI Penetapan Yudisium"
                helperText="Ditandatangani Dekan FT UNBARI: Fadli Eka Yandra, ST., MT"
                showPresets={true}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Penetapan Yudisium
                  </label>
                  <input
                    type="date"
                    value={form.tanggalYudisium}
                    onChange={(e) => setForm(prev => ({ ...prev, tanggalYudisium: e.target.value }))}
                    className="w-full text-xs font-mono border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Ijazah Nasional (PIN PDDikti)
                  </label>
                  <input
                    type="text"
                    value={form.nomorIjazahNasional}
                    onChange={(e) => setForm(prev => ({ ...prev, nomorIjazahNasional: e.target.value }))}
                    placeholder="Contoh: 010042026001281"
                    className="w-full text-xs font-mono border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Verifikasi resmi melalui portal SIVIL Kemendikbudristek</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Seri Ijazah & Transkrip Nilai
                  </label>
                  <input
                    type="text"
                    value={form.nomorSeriIjazah}
                    onChange={(e) => setForm(prev => ({ ...prev, nomorSeriIjazah: e.target.value }))}
                    placeholder="Contoh: FT-UNBARI-2026-081"
                    className="w-full text-xs font-mono border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    IPK Kumulatif Kelulusan
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="2.00"
                    max="4.00"
                    value={form.ipk}
                    onChange={(e) => handleIpkChange(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono font-bold border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Predikat Kelulusan
                  </label>
                  <select
                    value={form.predikat}
                    onChange={(e) => setForm(prev => ({ ...prev, predikat: e.target.value as PredikatKelulusan }))}
                    className="w-full text-xs font-bold border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                  >
                    <option value="Dengan Pujian (Cum Laude)">Dengan Pujian (Cum Laude)</option>
                    <option value="Sangat Memuaskan">Sangat Memuaskan</option>
                    <option value="Memuaskan">Memuaskan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Skripsi / Tugas Akhir Resmi
                </label>
                <textarea
                  rows={2}
                  value={form.judulSkripsi}
                  onChange={(e) => setForm(prev => ({ ...prev, judulSkripsi: e.target.value }))}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dosen Pembimbing I
                  </label>
                  <input
                    type="text"
                    value={form.dosenPembimbing1}
                    onChange={(e) => setForm(prev => ({ ...prev, dosenPembimbing1: e.target.value }))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dosen Pembimbing II
                  </label>
                  <input
                    type="text"
                    value={form.dosenPembimbing2 || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, dosenPembimbing2: e.target.value }))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  />
                </div>
              </div>

              {/* Dekan Endorsement Button */}
              {form.statusVerifikasi !== 'Disahkan Dekan' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="text-xs text-amber-950">
                    <p className="font-bold">Otorisasi Pengesahan Dekan Fakultas Teknik</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Klik untuk mengesahkan kelulusan dan menerbitkan penomoran ijazah secara otomatis.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSahKanDekan}
                    className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-300" />
                    <span>Sahkan Kelulusan (Dekan)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WISUDA & PENGAMBILAN TOGA */}
          {activeTab === 'wisuda' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Pendaftaran Wisuda UNBARI
                  </label>
                  <select
                    value={form.statusWisuda}
                    onChange={(e) => setForm(prev => ({ ...prev, statusWisuda: e.target.value as StatusWisuda }))}
                    className="w-full text-xs font-bold border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="Belum Terdaftar">Belum Terdaftar</option>
                    <option value="Terdaftar Wisuda">Terdaftar Wisuda</option>
                    <option value="Toga Diambil">Toga Diambil</option>
                    <option value="Selesai Wisuda">Selesai Wisuda / Alumni</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Periode Pelaksanaan Wisuda
                  </label>
                  <input
                    type="text"
                    value={form.periodeWisuda}
                    onChange={(e) => setForm(prev => ({ ...prev, periodeWisuda: e.target.value }))}
                    placeholder="Contoh: Wisuda Ke-56 UNBARI (Oktober 2026)"
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ukuran Baju Toga Wisuda
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['S', 'M', 'L', 'XL', 'XXL'] as UkuranToga[]).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, ukuranToga: sz }))}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          form.ukuranToga === sz
                            ? 'bg-blue-700 text-white border-blue-800 shadow-xs scale-102'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2.5 p-3 border border-slate-200 rounded-xl w-full cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={!!form.isLulusanTerbaik}
                      onChange={(e) => setForm(prev => ({ ...prev, isLulusanTerbaik: e.target.checked }))}
                      className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        Nominasi Lulusan Terbaik Fakultas
                      </span>
                      <p className="text-[10px] text-slate-500">
                        IPK tertinggi dan masa studi tercepat tingkat Program Studi/Fakultas
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Panitia Wisuda & Bagian Akademik FT
                </label>
                <textarea
                  rows={2}
                  value={form.catatan || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, catatan: e.target.value }))}
                  placeholder="Catatan mengenai kelengkapan map ijazah, undangan wisudawan, dll..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onPrintSkl(form, 'SKL')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-blue-300 text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors"
              title="Cetak Surat Keterangan Lulus Resmi Berkop & Berwatermark UNBARI"
            >
              <Printer className="w-3.5 h-3.5 text-blue-700" />
              <span>Cetak SKL</span>
            </button>

            <button
              type="button"
              onClick={() => onPrintSkl(form, 'BEBAS_TANGGUNGAN')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-emerald-300 text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors"
              title="Cetak Formulir Bukti Bebas Tanggungan Perpustakaan, Lab, & Keuangan"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>Bebas Tanggungan</span>
            </button>

            <button
              type="button"
              onClick={() => onPrintSkl(form, 'TANDA_TERIMA_TOGA')}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-indigo-300 text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors"
              title="Cetak Formulir Tanda Terima Pengambilan Toga & Undangan Wisuda"
            >
              <Shirt className="w-3.5 h-3.5 text-indigo-700" />
              <span>Tanda Terima Toga</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
