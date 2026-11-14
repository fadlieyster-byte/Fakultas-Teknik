import React, { useState } from 'react';
import { 
  Clock, 
  Sliders, 
  ChevronDown, 
  RefreshCw, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  Database, 
  ShieldCheck, 
  QrCode,
  GraduationCap,
  Users,
  Calendar,
  Briefcase,
  Layers,
  Award,
  Wallet,
  FileCheck2,
  BookOpen,
  Sparkles,
  LayoutDashboard,
  MonitorPlay,
  BookOpenCheck,
  Handshake,
  LogOut,
  User
} from 'lucide-react';
import { ProgramStudiInfo, AuthUser } from '../types/index';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  selectedProdi: ProgramStudiInfo;
  onSelectProdi: (prodi: ProgramStudiInfo) => void;
  prodiList: ProgramStudiInfo[];
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  currentTimeStr: string;
  currentDay: string;
  isSimulated: boolean;
  onToggleSimulation: () => void;
  onSetSimulatedTime: (day: string, time: string) => void;
  onResetSimulation: () => void;
  activeClassCount: number;
  alertCount: number;
  onOpenExportModal: () => void;
  onOpenBackupModal: () => void;
  yudisiumCount?: number;
  tuPendingCount?: number;
  onOpenVerifikasiModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  selectedProdi,
  onSelectProdi,
  prodiList,
  currentUser,
  onLogout,
  currentTimeStr,
  currentDay,
  isSimulated,
  onToggleSimulation,
  onSetSimulatedTime,
  onResetSimulation,
  activeClassCount,
  alertCount,
  onOpenExportModal,
  onOpenBackupModal,
  yudisiumCount,
  tuPendingCount,
  onOpenVerifikasiModal
}) => {
  const [showProdiDropdown, setShowProdiDropdown] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [customDay, setCustomDay] = useState(currentDay);
  const [customTime, setCustomTime] = useState(currentTimeStr);

  const navItems = [
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'siakad', label: 'SIAKAD', icon: BookOpenCheck, badge: 'KRS / KHS', badgeColor: 'bg-blue-100 text-blue-900 font-bold' },
    { id: 'mahasiswa', label: 'Mahasiswa', icon: Users, badge: alertCount > 0 ? alertCount : null, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'jadwal', label: 'Jadwal & Presensi Dosen', icon: Calendar, badge: activeClassCount > 0 ? `${activeClassCount} Aktif` : 'BAP', badgeColor: 'bg-emerald-100 text-emerald-800 font-bold' },
    { id: 'lms', label: 'LMS Perkuliahan', icon: MonitorPlay, badge: 'E-Learning', badgeColor: 'bg-sky-100 text-sky-800 font-bold' },
    { id: 'sidang_kp', label: 'Kerja Praktek & TA', icon: Award },
    { id: 'dosen', label: 'Data Dosen', icon: GraduationCap },
    { id: 'bkd', label: 'Beban Dosen (BKD)', icon: BookOpen },
    { id: 'laboratorium', label: 'Ruang & Lab', icon: Layers },
    { id: 'workspace', label: 'Google Classroom & Forms', icon: Sparkles, badge: 'G-Suite', badgeColor: 'bg-indigo-100 text-indigo-800 font-bold' },
    { id: 'kerjasama', label: 'Kerjasama & Kemitraan', icon: Handshake, badge: 'MoU/MoA', badgeColor: 'bg-emerald-100 text-emerald-800 font-bold' },
    { id: 'tata_usaha', label: 'Tata Usaha', icon: FileText, badge: tuPendingCount && tuPendingCount > 0 ? tuPendingCount : null, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'keuangan', label: 'Keuangan & SPP', icon: Wallet },
    { id: 'yudisium_wisuda', label: 'Yudisium & Wisuda', icon: CheckCircle2, badge: yudisiumCount && yudisiumCount > 0 ? yudisiumCount : null, badgeColor: 'bg-blue-100 text-blue-800' },
    { id: 'skpi', label: 'SKPI', icon: FileCheck2 },
    { id: 'akreditasi', label: 'Akreditasi (LAM & IABEE)', icon: ShieldCheck }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-2xs">
        {/* Tier 1: Brand Logo, Prodi Selector, Real-time Clock, and Action Buttons */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            
            {/* Zone 1: Logo & Department Dropdown Switcher */}
            <div className="flex items-center gap-3 shrink-0">
              <a
                href="#dashboard"
                onClick={(e) => { e.preventDefault(); onTabChange('dashboard'); }}
                className="flex items-center gap-2.5 text-slate-900 shrink-0 hover:opacity-90 transition-opacity"
              >
                <img 
                  src="/assets/aistudio/logo_unbari_8fe2adcb.png" 
                  alt="Logo Universitas Batanghari" 
                  className="w-10 h-10 object-contain shrink-0" 
                />
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black tracking-tight text-slate-900 leading-tight">
                      SiKaprodi
                    </span>
                    <span className="text-[10px] font-black uppercase bg-blue-700 text-white px-1.5 py-0.2 rounded shadow-2xs">
                      FT UNBARI
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Universitas Batanghari Jambi
                  </span>
                </div>
              </a>

              {/* Department Switcher Dropdown */}
              <div className="relative ml-1 sm:ml-2">
                <button
                  type="button"
                  onClick={() => setShowProdiDropdown(!showProdiDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-950 bg-blue-50/80 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all whitespace-nowrap"
                >
                  <span className="font-mono text-[10px] bg-blue-700 text-white px-1.5 py-0.2 rounded font-bold">
                    {selectedProdi.jenjang}
                  </span>
                  <span>{selectedProdi.nama}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                </button>

                {showProdiDropdown && (
                  <div className="absolute left-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Pilih Program Studi Teknik
                    </div>
                    {prodiList.map((prodi) => (
                      <button
                        key={prodi.id}
                        type="button"
                        onClick={() => {
                          onSelectProdi(prodi);
                          setShowProdiDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-start gap-2.5 transition-colors ${
                          selectedProdi.id === prodi.id
                            ? 'bg-blue-50 text-blue-900 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <img 
                          src={prodi.fotoKaprodi} 
                          alt={prodi.kaprodi} 
                          className="w-7 h-7 rounded-full object-cover border border-slate-300 shrink-0 mt-0.5" 
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{prodi.nama}</span>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1 py-0.2 rounded">
                              {prodi.jenjang}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block truncate">
                            Kaprodi: {prodi.kaprodi}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Zone 2: Real-Time Clock, Action Buttons Toolbar, and Kaprodi Profile */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              
              {/* Real-Time / Simulation Clock Widget */}
              <button
                type="button"
                onClick={() => setShowSimModal(true)}
                title="Atur Simulasi Waktu Perkuliahan FT UNBARI"
                className={`h-9 inline-flex items-center gap-2 px-3 rounded-xl border text-xs font-mono transition-all shadow-2xs ${
                  isSimulated
                    ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isSimulated ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                <span className="font-semibold text-slate-800 hidden xs:inline">{currentDay}, </span>
                <span className="font-bold text-slate-900">{currentTimeStr} WIB</span>
                {isSimulated && (
                  <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">Sim</span>
                )}
              </button>

              {/* Action Buttons Toolbar Group */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100/90 rounded-xl border border-slate-200/80">
                {/* Verifikasi Dokumen Digital (QR Code) Action */}
                {onOpenVerifikasiModal && (
                  <button
                    type="button"
                    onClick={onOpenVerifikasiModal}
                    title="Verifikasi keaslian dokumen resmi FT UNBARI dengan QR Code"
                    className="h-8 inline-flex items-center gap-1.5 px-2.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-50 rounded-lg border border-slate-200/60 shadow-2xs transition-colors whitespace-nowrap"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden md:inline">Verifikasi QR</span>
                  </button>
                )}

                {/* Export / Rekapitulasi Action */}
                <button
                  type="button"
                  onClick={onOpenExportModal}
                  title="Pratinjau & Cetak Rekapitulasi Dokumen Resmi (A4)"
                  className="h-8 inline-flex items-center gap-1.5 px-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg border border-slate-200/60 shadow-2xs transition-colors whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Cetak Rekap A4</span>
                </button>

                {/* Backup & Restore Action */}
                <button
                  type="button"
                  onClick={onOpenBackupModal}
                  title="Cadangkan atau pulihkan basis data Fakultas Teknik (JSON)"
                  className="h-8 inline-flex items-center gap-1.5 px-2.5 text-xs font-semibold text-blue-800 hover:text-blue-950 bg-white hover:bg-blue-50 rounded-lg border border-slate-200/60 shadow-2xs transition-colors whitespace-nowrap"
                >
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden lg:inline">Cadangan</span>
                </button>
              </div>

              {/* User Profile Chip & Logout */}
              <div className="h-9 pl-2 pr-1.5 flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
                <div className="relative shrink-0">
                  {currentUser?.photoURL || selectedProdi.fotoKaprodi ? (
                    <img
                      src={currentUser?.photoURL || selectedProdi.fotoKaprodi}
                      alt={currentUser?.displayName || selectedProdi.kaprodi}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-white shadow-2xs ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {currentUser?.displayName ? currentUser.displayName.charAt(0) : 'U'}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white rounded-full" />
                </div>

                <div className="hidden xl:flex flex-col text-left max-w-[150px]">
                  <span className="text-[11px] font-bold text-slate-900 leading-tight truncate">
                    {currentUser?.displayName || selectedProdi.kaprodi}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[8.5px] font-bold px-1 py-0.2 rounded truncate ${
                      currentUser?.role === 'dekan' 
                        ? 'bg-red-100 text-red-800 font-black' 
                        : currentUser?.role === 'kaprodi' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-slate-200 text-slate-700'
                    }`}>
                      {currentUser?.roleLabel || selectedProdi.singkatan}
                    </span>
                  </div>
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Keluar dari Aplikasi (Logout)"
                    className="ml-1 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Tier 2: Dedicated Navigation Strip (Responsive, Horizontal Scrollable, Zero Overflow Clipping) */}
        <div className="border-t border-slate-200/70 bg-slate-50/80 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none text-xs font-semibold">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-900 text-white shadow-xs font-bold ring-1 ring-blue-950/20'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Time Simulation Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-semibold text-slate-900">Simulasi Waktu Perkuliahan</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSimModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Sebagai Ketua Program Studi {selectedProdi.nama}, Anda dapat menguji jadwal kuliah dan status kehadiran dosen pada berbagai jam kuliah aktif tanpa menunggu jam fisik.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pilih Hari</label>
                <select
                  value={customDay}
                  onChange={(e) => setCustomDay(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white"
                >
                  <option value="Senin">Senin</option>
                  <option value="Selasa">Selasa</option>
                  <option value="Rabu">Rabu</option>
                  <option value="Kamis">Kamis</option>
                  <option value="Jumat">Jumat</option>
                  <option value="Sabtu">Sabtu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pukul (WIB)</label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onResetSimulation();
                  setShowSimModal(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Kembali ke Waktu Asli</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSetSimulatedTime(customDay, customTime);
                  setShowSimModal(false);
                }}
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Terapkan Waktu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
