import React, { useState, useEffect } from 'react';
import {
  FileText,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Edit3,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  SkParts,
  buildSkNumber,
  parseSkNumber,
  validateSkNumber,
  getRomanMonth,
  SK_CLASSIFICATIONS,
  ROMAN_MONTHS,
  PRODI_UNIT_OPTIONS,
  getSkPresets,
  SkPreset
} from '../utils/skNumberHelper';

interface SkNumberInputFormProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  helperText?: string;
  dateContext?: string; // ISO date YYYY-MM-DD
  prodiContext?: string; // e.g. "Teknik Sipil"
  showPresets?: boolean;
  defaultExpanded?: boolean;
}

export const SkNumberInputForm: React.FC<SkNumberInputFormProps> = ({
  value,
  onChange,
  label = 'Nomor SK Dekan / Penetapan Yudisium',
  helperText = 'Format resmi: [Nomor]/[Klasifikasi]/[Instansi]/[Prodi]/[Bulan Romawi]/[Tahun]',
  dateContext,
  prodiContext,
  showPresets = true,
  defaultExpanded = true
}) => {
  const [isBuilderMode, setIsBuilderMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Parse initial parts from value
  const [parts, setParts] = useState<SkParts>(() => parseSkNumber(value));

  // Sync state if external value changes drastically
  useEffect(() => {
    if (value) {
      const parsed = parseSkNumber(value);
      setParts(parsed);
    }
  }, [value]);

  // Handle changes in structured parts
  const handlePartChange = (field: keyof SkParts, val: string) => {
    const updated = { ...parts, [field]: val };
    setParts(updated);
    const assembled = buildSkNumber(updated);
    onChange(assembled);
  };

  // Auto-pad nomor urut to 3 digits (e.g. 85 -> 085)
  const handlePadNomorUrut = () => {
    const rawNum = parseInt(parts.nomorUrut.replace(/\D/g, ''), 10);
    if (!isNaN(rawNum)) {
      const padded = rawNum.toString().padStart(3, '0');
      handlePartChange('nomorUrut', padded);
    }
  };

  // Sync bulan & tahun with dateContext
  const handleSyncWithDate = () => {
    const targetDate = dateContext ? new Date(dateContext) : new Date();
    const roman = getRomanMonth(targetDate);
    const yr = targetDate.getFullYear().toString();
    const updated = { ...parts, bulanRomawi: roman, tahun: yr };
    setParts(updated);
    onChange(buildSkNumber(updated));
  };

  // Apply preset
  const handleApplyPreset = (preset: SkPreset) => {
    const updated: SkParts = {
      ...parts,
      ...preset.parts
    };
    // If dateContext exists, prioritize current year/month
    if (dateContext) {
      const targetDate = new Date(dateContext);
      updated.bulanRomawi = getRomanMonth(targetDate);
      updated.tahun = targetDate.getFullYear().toString();
    }
    setParts(updated);
    onChange(buildSkNumber(updated));
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentYear = parts.tahun || new Date().getFullYear().toString();
  const currentRoman = parts.bulanRomawi || getRomanMonth(new Date());
  const presets = getSkPresets(currentYear, currentRoman);
  const validation = validateSkNumber(value);

  return (
    <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-3 transition-all">
      {/* Header & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-800 block">
              {label}
            </label>
            <p className="text-[10px] text-slate-500">
              Fakultas Teknik Universitas Batanghari (FT UNBARI)
            </p>
          </div>
        </div>

        {/* Builder / Manual Toggle */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsBuilderMode(true)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors ${
              isBuilderMode
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Format Terstruktur</span>
          </button>
          <button
            type="button"
            onClick={() => setIsBuilderMode(false)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg flex items-center gap-1 transition-colors ${
              !isBuilderMode
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>Ketik Bebas</span>
          </button>
        </div>
      </div>

      {/* LIVE PREVIEW BANNER */}
      <div className="bg-white border-2 border-blue-200/80 rounded-xl p-3 shadow-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-500" />
            Pratinjau Nomor SK Resmi
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="text-[10px] font-medium text-slate-600 hover:text-blue-900 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"
              title="Salin nomor SK"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Formatted Number Display */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 font-mono text-xs sm:text-sm font-bold bg-slate-900 text-white p-2.5 rounded-lg overflow-x-auto">
          <span className="bg-blue-600/90 text-blue-100 px-2 py-0.5 rounded" title="Nomor Urut SK">
            {parts.nomorUrut || '085'}
          </span>
          <span className="text-slate-500 font-sans">/</span>
          <span className="bg-indigo-600/90 text-indigo-100 px-2 py-0.5 rounded" title="Klasifikasi SK">
            {parts.klasifikasi || 'SK-DEK'}
          </span>
          <span className="text-slate-500 font-sans">/</span>
          <span className="bg-emerald-600/90 text-emerald-100 px-2 py-0.5 rounded" title="Instansi / Fakultas">
            {parts.instansi || 'FT-UNBARI'}
          </span>
          {parts.kodeProdi && (
            <>
              <span className="text-slate-500 font-sans">/</span>
              <span className="bg-amber-600/90 text-amber-100 px-2 py-0.5 rounded" title="Program Studi / Sub-Unit">
                {parts.kodeProdi}
              </span>
            </>
          )}
          <span className="text-slate-500 font-sans">/</span>
          <span className="bg-rose-600/90 text-rose-100 px-2 py-0.5 rounded" title="Bulan Romawi">
            {parts.bulanRomawi || 'VIII'}
          </span>
          <span className="text-slate-500 font-sans">/</span>
          <span className="bg-cyan-600/90 text-cyan-100 px-2 py-0.5 rounded" title="Tahun Anggaran">
            {parts.tahun || '2026'}
          </span>
        </div>

        {/* Validation status badge */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px]">
          <div className="flex items-center gap-1.5">
            {validation.isValid ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {validation.message}
              </span>
            ) : (
              <span className="text-amber-700 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                {validation.message}
              </span>
            )}
          </div>
          {dateContext && (
            <button
              type="button"
              onClick={handleSyncWithDate}
              className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 hover:underline"
              title="Sesuaikan bulan Romawi & tahun dengan tanggal yudisium"
            >
              <Calendar className="w-3 h-3" />
              <span>Sinkron Tanggal ({dateContext})</span>
            </button>
          )}
        </div>
      </div>

      {/* MODE 1: STRUCTURED BUILDER */}
      {isBuilderMode ? (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* 1. Nomor Urut */}
            <div className="col-span-1">
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                1. No. Urut
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={parts.nomorUrut}
                  onChange={(e) => handlePartChange('nomorUrut', e.target.value)}
                  onBlur={handlePadNomorUrut}
                  placeholder="085"
                  className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="text-[9px] text-slate-400 mt-0.5">3 digit (mis. 085)</p>
            </div>

            {/* 2. Kode Klasifikasi SK */}
            <div className="col-span-1 sm:col-span-1 lg:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                2. Klasifikasi SK
              </label>
              <select
                value={parts.klasifikasi}
                onChange={(e) => handlePartChange('klasifikasi', e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {SK_CLASSIFICATIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.label}
                  </option>
                ))}
              </select>
              <p className="text-[9px] text-slate-400 mt-0.5 truncate">
                {SK_CLASSIFICATIONS.find(c => c.code === parts.klasifikasi)?.description || 'Klasifikasi SK'}
              </p>
            </div>

            {/* 3. Instansi Fakultas */}
            <div className="col-span-1">
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                3. Instansi
              </label>
              <input
                type="text"
                value={parts.instansi}
                onChange={(e) => handlePartChange('instansi', e.target.value.toUpperCase())}
                placeholder="FT-UNBARI"
                className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-[9px] text-slate-400 mt-0.5">Fakultas Teknik</p>
            </div>

            {/* 4. Kode Prodi / Sub-Unit */}
            <div className="col-span-1">
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                4. Unit / Prodi
              </label>
              <select
                value={parts.kodeProdi}
                onChange={(e) => handlePartChange('kodeProdi', e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {PRODI_UNIT_OPTIONS.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.code ? `${p.code} (${p.short})` : 'Tanpa Prodi (Dekanat)'}
                  </option>
                ))}
              </select>
              <p className="text-[9px] text-slate-400 mt-0.5">Opsional per prodi</p>
            </div>

            {/* 5. Bulan Romawi */}
            <div className="col-span-1">
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                5. Bulan Romawi
              </label>
              <select
                value={parts.bulanRomawi}
                onChange={(e) => handlePartChange('bulanRomawi', e.target.value)}
                className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {ROMAN_MONTHS.map((m, idx) => (
                  <option key={m} value={m}>
                    {m} (Bln {idx + 1})
                  </option>
                ))}
              </select>
              <p className="text-[9px] text-slate-400 mt-0.5">Bulan terbit SK</p>
            </div>

            {/* 6. Tahun */}
            <div className="col-span-1">
              <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                6. Tahun
              </label>
              <input
                type="text"
                value={parts.tahun}
                onChange={(e) => handlePartChange('tahun', e.target.value)}
                placeholder="2026"
                className="w-full text-xs font-mono font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-[9px] text-slate-400 mt-0.5">Tahun terbit</p>
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: FREE MANUAL TEXT INPUT */
        <div className="space-y-1 pt-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ketik langsung nomor SK, contoh: 085/SK-DEK/FT-UNBARI/VIII/2026"
            className="w-full text-xs font-mono font-bold border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-[10px] text-slate-500">
            {helperText}
          </p>
        </div>
      )}

      {/* QUICK PRESETS */}
      {showPresets && (
        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Pilihan Cepat Format Standar FT UNBARI:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-[10px] bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200 hover:border-blue-300 px-2 py-1 rounded-md font-medium flex items-center gap-1.5 transition-all shadow-2xs"
                title={preset.description}
              >
                <span className="font-bold text-blue-800 bg-blue-100/80 px-1 rounded text-[9px]">
                  {preset.badge}
                </span>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
