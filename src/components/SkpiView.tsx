import React, { useState } from 'react';
import { 
  Award, 
  Search, 
  Filter, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Plus, 
  ShieldCheck, 
  GraduationCap, 
  Globe, 
  ExternalLink,
  BookOpen,
  Briefcase,
  Users,
  X
} from 'lucide-react';
import { SkpiRecord, ProgramStudiInfo, StatusSkpi } from '../types/index';
import { DEKAN_FAKULTAS_TEKNIK, WAKIL_DEKAN_1 } from '../data/mockData';
import { SkpiPrintModal } from './SkpiPrintModal';

interface SkpiViewProps {
  selectedProdi: ProgramStudiInfo;
  skpiList: SkpiRecord[];
  onUpdateSkpiList: (newList: SkpiRecord[]) => void;
}

export const SkpiView: React.FC<SkpiViewProps> = ({
  selectedProdi,
  skpiList,
  onUpdateSkpiList
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProdi, setFilterProdi] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [activeRecord, setActiveRecord] = useState<SkpiRecord | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // New SKPI Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNim, setNewNim] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newProdiId, setNewProdiId] = useState<'SIPIL' | 'LINGKUNGAN' | 'LISTRIK_D3'>('SIPIL');
  const [newCertName, setNewCertName] = useState('');
  const [newCertPenerbit, setNewCertPenerbit] = useState('');
  const [newPrestasi, setNewPrestasi] = useState('');

  // Filtered SKPI List
  const filteredList = skpiList.filter(item => {
    const matchesQuery = 
      item.namaMahasiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nim.includes(searchQuery) ||
      item.nomorSkpi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProdi = filterProdi === 'ALL' || item.prodiId === filterProdi;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    return matchesQuery && matchesProdi && matchesStatus;
  });

  const handleOpenPrint = (record: SkpiRecord) => {
    setActiveRecord(record);
    setIsPrintModalOpen(true);
  };

  const handleApproveSkpi = (id: string) => {
    const updated = skpiList.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'Disahkan Dekan' as StatusSkpi,
          penandatanganNama: DEKAN_FAKULTAS_TEKNIK.nama,
          penandatanganJabatan: DEKAN_FAKULTAS_TEKNIK.jabatan,
          penandatanganNipNidn: DEKAN_FAKULTAS_TEKNIK.nidn,
          tanggalPenerbitan: new Date().toISOString().split('T')[0]
        };
      }
      return item;
    });
    onUpdateSkpiList(updated);
  };

  const handleCreateNewSkpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNim || !newNama) return;

    const isD3 = newProdiId === 'LISTRIK_D3';
    const newRecord: SkpiRecord = {
      id: `SKPI-2026-${Date.now().toString().slice(-4)}`,
      nomorSkpi: `SKPI/FT-UNBARI/2026/${Math.floor(10000 + Math.random() * 90000)}`,
      nomorIjazahNasional: `100412026${Math.floor(1000000 + Math.random() * 9000000)}`,
      nim: newNim,
      namaMahasiswa: newNama,
      tempatTanggalLahir: 'Jambi, 1 Januari 2003',
      tahunMasuk: 2021,
      tahunLulus: 2026,
      gelarAkademik: isD3 ? 'Ahli Madya Teknik (A.Md.T.)' : 'Sarjana Teknik (S.T.)',
      gelarInggris: isD3 ? 'Associate Expert in Engineering (A.Md.T.)' : 'Bachelor of Engineering (B.Eng.)',
      prodiId: newProdiId,
      programStudi: newProdiId === 'SIPIL' ? 'Teknik Sipil' : newProdiId === 'LINGKUNGAN' ? 'Teknik Lingkungan' : 'D3 Teknik Listrik',
      programStudiInggris: newProdiId === 'SIPIL' ? 'Civil Engineering' : newProdiId === 'LINGKUNGAN' ? 'Environmental Engineering' : 'Electrical Engineering',
      jenjangKkni: isD3 ? 'Level 5 (Diploma III)' : 'Level 6 (Sarjana)',
      levelKkniAngka: isD3 ? 5 : 6,
      persyaratanPenerimaan: 'Lulus seleksi penerimaan mahasiswa baru UNBARI dan memenuhi syarat akademik.',
      persyaratanPenerimaanInggris: 'Passed UNBARI entrance examination and met all academic requirements.',
      bahasaPengantar: 'Bahasa Indonesia & English terms',
      sistemPenilaian: 'Skala 0.00 - 4.00. IPK Minimal 2.00.',
      jenisDanJenjangPendidikanLanjutan: isD3 ? 'Program Sarjana Terapan (D4) / S1' : 'Program Magister Teknik (S2)',
      cplList: [
        {
          kategori: 'Kemampuan Kerja',
          deskripsiIndo: 'Mampu merancang sistem keteknikan dan mengoperasikan perangkat komputasi modern sesuai standar profesi.',
          deskripsiInggris: 'Able to design engineering systems and operate modern computational tools in accordance with professional codes.'
        },
        {
          kategori: 'Penguasaan Pengetahuan',
          deskripsiIndo: 'Menguasai konsep teoritis sains rekayasa dasar dan rekayasa terapan.',
          deskripsiInggris: 'Master the theoretical foundations of basic engineering science and applied engineering.'
        }
      ],
      sertifikasiList: newCertName ? [
        {
          id: `CERT-${Date.now()}`,
          namaSertifikatIndo: newCertName,
          namaSertifikatInggris: 'Professional Competency Certificate',
          penerbit: newCertPenerbit || 'Lembaga Sertifikasi Profesi (LSP / BNSP)',
          nomorSertifikat: `LSP-FT-${Math.floor(1000 + Math.random() * 9000)}`,
          tahunPerolehan: 2025
        }
      ] : [],
      prestasiList: newPrestasi ? [
        {
          id: `PRES-${Date.now()}`,
          namaPrestasiIndo: newPrestasi,
          namaPrestasiInggris: 'National Engineering Student Competition Award',
          tingkat: 'Nasional',
          peringkat: 'Juara / Finalis',
          penyelenggara: 'Asosiasi Keteknikan Indonesia',
          tahun: 2025
        }
      ] : [],
      ormawaList: [
        {
          id: `ORM-${Date.now()}`,
          namaOrganisasiIndo: 'Himpunan Mahasiswa Jurusan FT UNBARI',
          namaOrganisasiInggris: 'Engineering Department Student Club',
          jabatan: 'Anggota Aktif',
          periode: '2023 - 2024',
          kategori: 'Organisasi Kampus'
        }
      ],
      status: 'Disahkan Dekan',
      tanggalPenerbitan: new Date().toISOString().split('T')[0],
      penandatanganNama: DEKAN_FAKULTAS_TEKNIK.nama,
      penandatanganJabatan: DEKAN_FAKULTAS_TEKNIK.jabatan,
      penandatanganNipNidn: DEKAN_FAKULTAS_TEKNIK.nidn,
      catatanVerifikasi: 'Portofolio data prestasi terverifikasi lengkap.'
    };

    onUpdateSkpiList([newRecord, ...skpiList]);
    setShowAddModal(false);
    setNewNim('');
    setNewNama('');
    setNewCertName('');
    setNewCertPenerbit('');
    setNewPrestasi('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 rounded-2xl text-white p-6 sm:p-8 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 mb-1">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Surat Keterangan Pendamping Ijazah (SKPI) &bull; Permendikbud Standar KKNI</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Modul SKPI Bilingual (Bahasa Indonesia &amp; English)
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mt-1 leading-relaxed">
            Pencatatan resmi Capaian Pembelajaran Lulusan (CPL) KKNI Level 6 (Sarjana) &amp; Level 5 (D3), Sertifikasi Kompetensi LPJK/BNSP/Autodesk, Prestasi Mahasiswa, dan Pengesahan Dekanat FT UNBARI.
          </p>
        </div>

        {/* Leadership Callout: Dekan & Wadek I */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3.5 flex items-center gap-3 shrink-0">
          <div className="w-11 h-11 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6 text-blue-950" />
          </div>
          <div className="text-left">
            <div className="text-[10px] text-blue-200 uppercase font-semibold">Pengesahan Resmi SKPI</div>
            <div className="text-xs font-bold text-white">{DEKAN_FAKULTAS_TEKNIK.nama}</div>
            <div className="text-[11px] text-amber-300 font-medium">Dekan &bull; &amp; Wadek I {WAKIL_DEKAN_1.nama}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Terbit SKPI</span>
            <div className="text-xl font-black text-slate-900 mt-1">
              {skpiList.length} Dokumen
            </div>
            <span className="text-[11px] text-slate-500">
              Format Bilingual PDDikti Terstandar
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sertifikasi LPJK &amp; BNSP</span>
            <div className="text-xl font-black text-emerald-600 mt-1">
              {skpiList.reduce((acc, curr) => acc + curr.sertifikasiList.length, 0)} Sertifikat
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              Ahli Muda K3, Surveyor, BIM &amp; PLC
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Prestasi Kompetisi</span>
            <div className="text-xl font-black text-amber-600 mt-1">
              {skpiList.reduce((acc, curr) => acc + curr.prestasiList.length, 0)} Prestasi
            </div>
            <span className="text-[11px] text-amber-700 font-medium">
              Lomba Jembatan Balsa, LKTI, Magang BUMN
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Filter & Action Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Nama, NIM, atau No. SKPI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Prodi:</span>
            </div>
            <select
              value={filterProdi}
              onChange={(e) => setFilterProdi(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">Semua Prodi Teknik</option>
              <option value="SIPIL">S1 Teknik Sipil</option>
              <option value="LINGKUNGAN">S1 Teknik Lingkungan</option>
              <option value="LISTRIK_D3">D3 Teknik Listrik</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">Semua Status</option>
              <option value="Disahkan Dekan">Disahkan Dekan</option>
              <option value="Verifikasi Kaprodi">Verifikasi Kaprodi</option>
              <option value="Draft">Draft</option>
            </select>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah SKPI Baru</span>
            </button>
          </div>
        </div>

        {/* List of SKPI Cards */}
        <div className="divide-y divide-slate-100">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Tidak ada data SKPI yang cocok dengan kriteria pencarian Anda.
            </div>
          ) : (
            filteredList.map((item) => (
              <div key={item.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row justify-between gap-4">
                
                {/* Left: Student & Degree Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-950 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {item.nomorSkpi}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {item.status}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {item.jenjangKkni}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{item.namaMahasiswa}</h3>
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                      <span>NIM: <strong className="font-mono text-slate-700">{item.nim}</strong></span>
                      <span>&bull;</span>
                      <span>Prodi: <strong>{item.programStudi}</strong> ({item.programStudiInggris})</span>
                      <span>&bull;</span>
                      <span>Gelar: <strong>{item.gelarAkademik}</strong> / {item.gelarInggris}</span>
                    </div>
                  </div>

                  {/* Highlights: Certifications & Prestasi */}
                  <div className="pt-2 flex flex-wrap gap-2 text-xs">
                    {item.sertifikasiList.map(cert => (
                      <span key={cert.id} className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-md text-[11px] font-medium">
                        <Briefcase className="w-3 h-3 text-amber-700 shrink-0" />
                        <span>{cert.namaSertifikatIndo} ({cert.penerbit})</span>
                      </span>
                    ))}
                    {item.prestasiList.map(pres => (
                      <span key={pres.id} className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-900 px-2.5 py-1 rounded-md text-[11px] font-medium">
                        <Award className="w-3 h-3 text-blue-700 shrink-0" />
                        <span>{pres.namaPrestasiIndo} ({pres.peringkat})</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Signature & Print Action */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-left lg:text-right text-xs">
                    <span className="text-slate-400 text-[10px] uppercase block font-semibold">Pengesahan Dekanat</span>
                    <div className="font-bold text-slate-800 text-xs">{item.penandatanganNama}</div>
                    <div className="text-[11px] text-slate-500 font-mono">NIDN: {item.penandatanganNipNidn}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenPrint(item)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                      title="Cetak Dokumen SKPI Resmi Bilingual ke Printer Default (Ctrl + P)"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Cetak SKPI Resmi (Ctrl+P)</span>
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* Add New SKPI Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Penerbitan Surat Keterangan Pendamping Ijazah (SKPI)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewSkpi} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Program Studi</label>
                <select
                  value={newProdiId}
                  onChange={(e) => setNewProdiId(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="SIPIL">S1 Teknik Sipil (KKNI Level 6 - Sarjana Teknik)</option>
                  <option value="LINGKUNGAN">S1 Teknik Lingkungan (KKNI Level 6 - Sarjana Teknik)</option>
                  <option value="LISTRIK_D3">D3 Teknik Listrik (KKNI Level 5 - Ahli Madya Teknik)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIM Mahasiswa</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2100822201018"
                    value={newNim}
                    onChange={(e) => setNewNim(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Mahasiswa</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: M. Bagas Wicaksono"
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sertifikasi Kompetensi / Keahlian Profesi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: SKK Ahli Muda K3 Konstruksi Jenjang 6"
                  value={newCertName}
                  onChange={(e) => setNewCertName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Badan / Lembaga Penerbit Sertifikat
                </label>
                <input
                  type="text"
                  placeholder="Contoh: LPJK (Lembaga Pengembangan Jasa Konstruksi) &amp; BNSP"
                  value={newCertPenerbit}
                  onChange={(e) => setNewCertPenerbit(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Prestasi / Kejuaraan / Magang Bersertifikat
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Juara II Kompetisi Rancang Bangun Jembatan Balsa Tingkat Nasional"
                  value={newPrestasi}
                  onChange={(e) => setNewPrestasi(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Simpan &amp; Terbitkan SKPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SKPI Print Modal */}
      <SkpiPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        record={activeRecord}
        selectedProdi={selectedProdi}
      />

    </div>
  );
};
