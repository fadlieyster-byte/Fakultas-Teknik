import React, { useState } from 'react';
import {
  FileText,
  X,
  Check,
  CheckCircle2,
  Users,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { SkNumberInputForm } from './SkNumberInputForm';
import { DEKAN_FAKULTAS_TEKNIK } from '../data/mockData';

interface SkNumberBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSkNumber: string;
  periodeName?: string;
  tanggalYudisium?: string;
  totalPeserta?: number;
  onSave: (newSkNumber: string, applyToAllGraduates: boolean) => void;
}

export const SkNumberBuilderModal: React.FC<SkNumberBuilderModalProps> = ({
  isOpen,
  onClose,
  currentSkNumber,
  periodeName = 'Periode Yudisium Gasal 2025/2026',
  tanggalYudisium,
  totalPeserta = 0,
  onSave
}) => {
  const [skNumber, setSkNumber] = useState(currentSkNumber || '085/SK-DEK/FT-UNBARI/VIII/2026');
  const [applyToAll, setApplyToAll] = useState(true);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(skNumber, applyToAll);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Atur Format Penomoran SK Dekan FT UNBARI</span>
                <span className="text-[10px] bg-yellow-400 text-blue-950 font-extrabold px-2 py-0.5 rounded-full">
                  Resmi
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                Surat Keputusan Dekan untuk {periodeName}
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

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Institutional decree info card */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-blue-900">
            <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-blue-950">
                Standardisasi Format Surat Keputusan Dekan Fakultas Teknik UNBARI
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Nomor SK Dekan diterbitkan resmi oleh Dekanat FT UNBARI dan ditandatangani oleh{' '}
                <strong>{DEKAN_FAKULTAS_TEKNIK.nama}</strong> ({DEKAN_FAKULTAS_TEKNIK.jabatan}). Nomor SK ini tercantum pada Surat Keterangan Lulus (SKL), Berita Acara, Lembar SK Dekan, dan ijazah lulusan.
              </p>
            </div>
          </div>

          {/* Interactive SK Number Form */}
          <SkNumberInputForm
            value={skNumber}
            onChange={(val) => setSkNumber(val)}
            dateContext={tanggalYudisium}
            label="Formulir Isian Penomoran SK Resmi"
            showPresets={true}
          />

          {/* Batch apply option */}
          {totalPeserta > 0 && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToAll}
                  onChange={(e) => setApplyToAll(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-700" />
                    Terapkan Nomor SK ini ke Semua Lulusan ({totalPeserta} Mahasiswa)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Memperbarui field <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-blue-900">nomorSkYudisium</code> pada seluruh berkas kelulusan mahasiswa peserta periode ini secara otomatis.
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Preview: <span className="font-mono font-bold text-blue-950">{skNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Simpan &amp; Terapkan SK</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
