import { JadwalKuliah, RuanganLab } from '../types/index';

export type EquipmentCategory = 'PC' | 'JARINGAN' | 'ALAT_TEKNIK';

export type EquipmentConditionStatus =
  | 'BAIK'
  | 'PERBAIKAN'
  | 'KALIBRASI_TERLAMBAT'
  | 'MENDEKATI_KALIBRASI';

export type CalibrationUrgency =
  | 'KADALUARSA'
  | 'KRITIS_14_HARI'
  | 'PERINGATAN_30_HARI'
  | 'TERJADWAL'
  | 'AMAN';

export type ScheduleAuditStatus =
  | 'PERBAIKAN_KRITIS'
  | 'UNIT_KURANG'
  | 'BENTROK_MAINTENANCE'
  | 'SIAP_PRAKTIKUM';

export interface LabEquipmentItem {
  id: string;
  ruanganId: string;
  namaAlat: string;
  kategori: EquipmentCategory;
  spesifikasiRingkas: string;
  unitTotal: number;
  unitTersedia: number;
  unitDalamPerbaikan: number;
  minRatioPerKelompok: number; // misal 1 alat untuk setiap N mahasiswa (1 = 1:1, 4 = 1 per 4 mhs)
  wajibKalibrasi: boolean;
  terakhirKalibrasi: string; // YYYY-MM-DD
  jatuhTempoKalibrasi: string; // YYYY-MM-DD
  jadwalMaintenanceSlot?: string; // misal "Selasa 13:00-15:00"
  statusKalibrasiDijadwalkan?: boolean;
  kodeAsetBmn: string;
}

export interface EquipmentOverrideState {
  unitTersedia?: number;
  unitDalamPerbaikan?: number;
  statusKalibrasiDijadwalkan?: boolean;
}

export interface AuditedEquipmentItem extends LabEquipmentItem {
  kondisi: EquipmentConditionStatus;
  daysToCalibration: number;
  calibrationUrgency: CalibrationUrgency;
  rasioKetersediaanPersen: number;
}

export interface LabScheduleAuditFinding {
  id: string;
  ruanganId: string;
  ruanganKode: string;
  ruanganNama: string;
  prodiId: string;
  sumberJadwal: 'JADWAL_KULIAH' | 'AKTIF_SAAT_INI';
  kodeMK: string;
  namaMK: string;
  kelas: string;
  hari: string;
  jam: string;
  dosenNama: string;
  pesertaTotal: number;
  kapasitasRuang: number;
  equipmentDeficits: {
    equipmentId: string;
    namaAlat: string;
    kategori: EquipmentCategory;
    unitDibutuhkan: number;
    unitTersedia: number;
    unitDalamPerbaikan: number;
    alasan: string;
  }[];
  maintenanceBentrokItems: string[];
  auditStatus: ScheduleAuditStatus;
  auditStatusLabel: string;
  rekomendasi: string;
}

export interface IabeeChecklistCriterion {
  kode: string;
  label: string;
  terpenuhi: boolean;
  catatan: string;
}

export interface LabIabeeReadinessResult {
  ruangan: RuanganLab;
  score: number; // Strictly 1 - 100
  predikat: 'Layak Penuh (IABEE Grade A)' | 'Layak Bersyarat (Perlu Kalibrasi)' | 'Perlu Tindakan Segera (Kritis)';
  statusKelayakan: 'LAYAK' | 'BERSYARAT' | 'TIDAK_LAYAK';
  totalAlatTerdaftar: number;
  totalUnit: number;
  unitTersedia: number;
  unitDalamPerbaikan: number;
  ketersediaanPersen: number;
  alatPerluKalibrasiCount: number;
  alatKadaluarsaCount: number;
  jadwalBermasalahCount: number;
  checklist: IabeeChecklistCriterion[];
  equipments: AuditedEquipmentItem[];
}

export interface MaintenanceTriggerItem {
  equipmentId: string;
  ruanganId: string;
  ruanganKode: string;
  ruanganNama: string;
  prodiId: string;
  namaAlat: string;
  kategori: EquipmentCategory;
  kodeAsetBmn: string;
  terakhirKalibrasi: string;
  jatuhTempoKalibrasi: string;
  daysToCalibration: number;
  urgency: CalibrationUrgency;
  urgencyLabel: string;
  statusKalibrasiDijadwalkan: boolean;
  tindakanSaran: string;
}

export interface CategorySummaryMetric {
  kategori: EquipmentCategory;
  label: string;
  jenisAlatCount: number;
  totalUnits: number;
  availableUnits: number;
  repairUnits: number;
  availabilityPercent: number;
  calibrationAlertCount: number;
}

export interface LabEquipmentAuditReport {
  referenceDate: string;
  categorySummaries: CategorySummaryMetric[];
  allEquipments: AuditedEquipmentItem[];
  scheduleFindings: LabScheduleAuditFinding[];
  criticalScheduleAlerts: LabScheduleAuditFinding[];
  iabeeResults: LabIabeeReadinessResult[];
  maintenanceTriggers: MaintenanceTriggerItem[];
  avgIabeeScore: number;
  overallAvailabilityPercent: number;
  totalRepairUnits: number;
  urgentCalibrationCount: number;
}

export const AUDIT_REFERENCE_DATE = '2026-10-19';

export const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  PC: 'PC / Workstation',
  JARINGAN: 'Perangkat Jaringan',
  ALAT_TEKNIK: 'Alat Teknik & Ukur'
};

export const INITIAL_LAB_EQUIPMENT_INVENTORY: LabEquipmentItem[] = [
  // --- S1 TEKNIK SIPIL ---
  {
    id: 'EQ-SPL-01',
    ruanganId: 'LAB-STRUKTUR',
    namaAlat: 'Universal Testing Machine (UTM) 2000 kN',
    kategori: 'ALAT_TEKNIK',
    spesifikasiRingkas: 'Servo-Hydraulic Load Cell 2000 kN & Extensometer Digital',
    unitTotal: 2,
    unitTersedia: 1,
    unitDalamPerbaikan: 1,
    minRatioPerKelompok: 18,
    wajibKalibrasi: true,
    terakhirKalibrasi: '2025-10-10',
    jatuhTempoKalibrasi: '2026-10-10', // Kadaluarsa 9 hari
    jadwalMaintenanceSlot: 'Kamis 10:30 - 12:30',
    kodeAsetBmn: 'BMN-FT-SPL-001'
  },
  {
    id: 'EQ-SPL-02',
    ruanganId: 'LAB-STRUKTUR',
    namaAlat: 'Digital Concrete Compression & Hammer Test Set',
    kategori: 'ALAT_TEKNIK',
    spesifikasiRingkas: 'Mesin Uji Tekan Silinder 150 kN + Schmidt Hammer Digital',
    unitTotal: 4,
    unitTersedia: 4,
    unitDalamPerbaikan: 0,
    minRatioPerKelompok: 9,
    wajibKalibrasi: true,
    terakhirKalibrasi: '2026-04-20',
    jatuhTempoKalibrasi: '2026-10-29', // Kritis 10 hari lagi
    kodeAsetBmn: 'BMN-FT-SPL-002'
  },
  {
    id: 'EQ-SPL-03',
    ruanganId: 'LAB-STRUKTUR',
    namaAlat: 'PC Akuisisi Data Logger Strain Gauge',
    kategori: 'PC',
    spesifikasiRingkas: 'Workstation Core i5 / 16GB RAM / DAQ National Instruments',
    unitTotal: 4,
    unitTersedia: 4,
    unitDalamPerbaikan: 0,
    minRatioPerKelompok: 10,
    wajibKalibrasi: false,
    terakhirKalibrasi: '2026-07-15',
    jatuhTempoKalibrasi: '2027-07-15',
    kodeAsetBmn: 'BMN-FT-SPL-003'
  },
  {
    id: 'EQ-SPL-04',
    ruanganId: 'LAB-MEKTAN',
    namaAlat: 'Apparatus Triaxial UU/CU & Konsolidasi Oedometer',
    kategori: 'ALAT_TEKNIK',
    spesifikasiRingkas: 'Cell Triaxial Gambut Jambi + Pressure Transducer 1000 kPa',
    unitTotal: 5,
    unitTersedia: 3,
    unitDalamPerbaikan: 2,
    minRatioPerKelompok: 6, // 36 mhs -> butuh 6 unit, tersedia hanya 3!
    wajibKalibrasi: true,
    terakhirKalibrasi: '2025-11-05',
    jatuhTempoKalibrasi: '2026-11-05', // 17 hari lagi (Peringatan 30 hari)
    jadwalMaintenanceSlot: 'Selasa 09:00 - 11:30',
    kodeAsetBmn: 'BMN-FT-SPL-004'
  },
  {
    id: 'EQ-SPL-05',
    ruanganId: 'LAB-MEKTAN',
    namaAlat: 'Sieve Shaker Digital & Direct Shear Box',
    kategori: 'ALAT_TEKNIK',
    spesifikasiRingkas: 'ASTM D3080 Automated Direct Shear & Ayakan Digital',
    unitTotal: 6,
    unitTersedia: 5,
    unitDalamPerbaikan: 1,
    minRatioPerKelompok: 6, // 36 mhs -> butuh 6 unit, tersedia 5!
    wajibKalibrasi: true,
    terakhirKalibrasi: '2026-03-10',
    jatuhTempoKalibrasi: '2027-03-10',
    kodeAsetBmn: 'BMN-FT-SPL-005'
  },
  {
    id: 'EQ-SPL-06',
    ruanganId: 'LAB-MEKTAN',
    namaAlat: 'Router Telemetri & Access Point Lab Geoteknik',
    kategori: 'JARINGAN',
    spesifikasiRingkas: 'MikroTik RB4011 + Wi-Fi 6 AP Sinkronisasi Data Lapangan',
    unitTotal: 2,
    unitTersedia: 2,
    unitDalamPerbaikan: 0,
    minRatioPerKelompok: 25,
    wajibKalibrasi: false,
    terakhirKalibrasi: '2026-06-01',
    jatuhTempoKalibrasi: '2027-06-01',
    kodeAsetBmn: 'BMN-FT-SPL-006'
  },
  {
    id: 'EQ-SPL-07',
    ruanganId: 'LAB-HIDROLIKA',
    namaAlat: 'Tilting Flume 12m & Current Meter Sungai Digital',
    kategori: 'ALAT_TEKNIK',
    spesifikasiRingkas: 'Saluran Terbuka Kemiringan Variabel + Ultrasonic Flow Meter',
    unitTotal: 4,
    unitTersedia: 4,
    unitDalamPerbaikan: 0,
    minRatioPerKelompok: 10,
    wajibKalibrasi: true,
    terakhirKalibrasi: '2025-11-12',
    jatuhTempoKalibrasi: '2026-11-12', // 24 hari lagi
    kodeAsetBmn: 'BMN-FT-SPL-007'
  },
  {
    id: 'EQ-SPL-08',
    ruanganId: 'STUDIO-BIM',
    namaAlat: 'PC Workstation BIM & Civil 3D RTX 4060',
    kategori: 'PC',
    spesifikasiRingkas: 'Core i7-13700 / 32GB RAM / RTX 4060 / Lisensi Revit & ETABS',
    unitTotal: 40,
    unitTersedia: 36,
    unitDalamPerbaikan: 4,
    minRatioPerKelompok: 1, // 1 PC per mahasiswa
    wajibKalibrasi: false,
    terakhirKalibrasi: '2026-08-01',
    jatuhTempoKalibrasi: '2027-08-01',
    kodeAsetBmn: 'BMN-FT-SPL-008'
  },
  {
    id: 'EQ-SPL-09',
    ruanganId: 'STUDIO-BIM',
    namaAlat: 'Managed Switch Gigabit 48-Port & License Server NAS',
    kategori: 'JARINGAN',
    spesifikasiRingkas: 'Cisco Catalyst 2960X 48P + NAS Synology Render Farm',
    unitTotal: 3,
    unitTersedia: 3,
    unitDalamPerbaikan: 0,
    minRatioPerKelompok: 20,
    wajibKalibrasi: false,
    terakhirKalibrasi: '2026-08-01',
    jatuhTempoKalibrasi: '2027-08-01',
    kodeAsetBmn: 'BMN-FT-SPL-009'
  },

  // --- S1 TEKNIK LINGKUNGAN ---
  {
    id: 'EQ-LKG-01',
    ruanganId: 'LAB-KUALITAS-AIR',
    namaAlat: 'Spektrofotometer UV-Vis Double Beam',
    kategori: 'ALAT_TEKNIK',
    spesifikasiRingkas: 'Shimadzu UV-1900i Pengujian Logam Berat & COD/BOD Air',
    unitTotal: 3,
    unitTersedia: 2,
    unitDalamPerbaikan: 1,
    minRatioPerKelompok: 10, // 30 mhs butuh 3, tersedia 2 + 1 perbaikan!
    wajibKalibrasi: true,
    terakhirKalibrasi: '2025-10-15',
    jatuhTempoKalibrasi: '2026-10-15', // Kadaluarsa 4 hari lalu
    jadwalMaintenanceSlot: 'Senin 08:00 - 10:30',
    kodeAsetBmn: 'BMN-FT-LKG-001'
  },
  {
    id: 'EQ-LKG-02',
    ruanganId: 'LAB-KUALITAS-AIR',
    namaAlat: 'DO & pH Meter Multiparameter Digital Portable',
    kategori: 'ALAT_TEKNIK',
    spesifikasiRingkas: 'Hach HQ40d Sensor Oksigen Terlarut & Konduktivitas',
    unitTotal: 8,
    unitTersedia: 7,
    unitDalamPerbaikan: 1,
    minRatioPerKelompok: 4,
    wajibKalibrasi: true,
    terakhirKalibrasi: '2026-04-28',
    jatuhTempoKalibrasi: '2026-10-28', // Kritis 9 hari lagi
    kodeAsetBmn: 'BMN-FT-LKG-002'
  },
  {
    id: 'EQ-LKG-03',
    ruanganId: 'LAB-KUALITAS-AIR',
    namaAlat: 'PC LIMS (Laboratory Information System) & Spektro Station',
    kategori: 'PC',
    spesifikasiRingkas: 'Core i5 / 16GB RAM Terhubung Spektrofotometer Lab',
    unitTotal: 4,
    unitTersedia: 4,
    unitDalamPerbaikan: 0,
    minRatioPerKelompok: 10,
    wajibKalibrasi: false,
    terakhirKalibrasi: '2026-07-01',
    jatuhTempoKalibrasi: '2027-07-01',
    kodeAsetBmn: 'BMN-FT-LKG-003'
  },
  {
    id: 'EQ-LKG-04',
    ruanganId: 'LAB-PENGOLAHAN-LIMBAH',
    namaAlat: 'Reaktor Anaerobik UASB & Jar Test 6 Flokulator',
    kategori: 'ALAT_TEKNIK',
    spesifikasiRingkas: 'Pilot Plant Pengolahan POME Sawit & Turbidimeter Digital',
    unitTotal: 4,
    unitTersedia: 4,
    unitDalamPerbaikan: 0,
    minRatioPerKelompok: 8,
    wajibKalibrasi: true,
    terakhirKalibrasi: '2026-05-12',
    jatuhTempoKalibrasi: '2026-11-10', // 22 hari lagi
    kodeAsetBmn: 'BMN-FT-LKG-004'
  },
  {
    id: 'EQ-LKG-05',
    ruanganId: 'STUDIO-AMDAL',
    namaAlat: 'PC Workstation GIS ArcGIS & AERMOD Lingkungan',
    kategori: 'PC',
    spesifikasiRingkas: '35 PC Core i7 / 32GB RAM Pemodelan Spasial DAS Batanghari',
    unitTotal: 35,
    unitTersedia: 33,
    unitDalamPerbaikan: 2,
    minRatioPerKelompok: 1,
    wajibKalibrasi: false,
    terakhirKalibrasi: '2026-08-12',
    jatuhTempoKalibrasi: '2027-08-12',
    kodeAsetBmn: 'BMN-FT-LKG-005'
  },
  {
    id: 'EQ-LKG-06',
    ruanganId: 'STUDIO-AMDAL',
    namaAlat: 'Switch Core & Access Point Studio GIS AMDAL',
    kategori: 'JARINGAN',
    spesifikasiRingkas: 'Switch PoE 48-Port + Dual Band AP Server Peta Raster',
    unitTotal: 2,
    unitTersedia: 2,
    unitDalamPerbaikan: 0,
    minRatioPerKelompok: 20,
    wajibKalibrasi: false,
    terakhirKalibrasi: '2026-06-20',
    jatuhTempoKalibrasi: '2027-06-20',
    kodeAsetBmn: 'BMN-FT-LKG-006'
  },

  // --- D3 TEKNIK LISTRIK ---
  {
    id: 'EQ-LST-01',
    ruanganId: 'LAB-LIST',
    namaAlat: 'Power Quality Analyzer Fluke 435 & Oscilloscope Digital',
    kategori: 'ALAT_TEKNIK',
    spesifikasiRingkas: '3-Phase Power Harmonics Analyzer 600V CAT IV & DSO 100MHz',
    unitTotal: 6,
    unitTersedia: 4,
    unitDalamPerbaikan: 2,
    minRatioPerKelompok: 5, // 30 mhs butuh 6 unit, tersedia 4!
    wajibKalibrasi: true,
    terakhirKalibrasi: '2025-10-12',
    jatuhTempoKalibrasi: '2026-10-12', // Kadaluarsa 7 hari lalu
    jadwalMaintenanceSlot: 'Senin 08:00 - 11:00',
    kodeAsetBmn: 'BMN-FT-LST-001'
  },
  {
    id: 'EQ-LST-02',
    ruanganId: 'LAB-LIST',
    namaAlat: 'Workbench Instalasi Panel & Mesin Trafo Uji Beban',
    kategori: 'ALAT_TEKNIK',
    spesifikasiRingkas: '12 Panel Latih Instalasi Tenaga 3 Fasa + MCB Proteksi',
    unitTotal: 12,
    unitTersedia: 11,
    unitDalamPerbaikan: 1,
    minRatioPerKelompok: 3,
    wajibKalibrasi: true,
    terakhirKalibrasi: '2026-04-30',
    jatuhTempoKalibrasi: '2026-10-30', // Kritis 11 hari lagi
    kodeAsetBmn: 'BMN-FT-LST-002'
  },
  {
    id: 'EQ-LST-03',
    ruanganId: 'WS-INSTALASI-LISTRIK',
    namaAlat: 'Megaohmmeter Kyoritsu Insulation & Earth Tester Digital',
    kategori: 'ALAT_TEKNIK',
    spesifikasiRingkas: 'Kyoritsu 3125A High Voltage Insulation Tester 5000V',
    unitTotal: 10,
    unitTersedia: 8,
    unitDalamPerbaikan: 2,
    minRatioPerKelompok: 3, // 32 mhs butuh 11 atau 10, tersedia 8
    wajibKalibrasi: true,
    terakhirKalibrasi: '2026-05-08',
    jatuhTempoKalibrasi: '2026-11-08', // 20 hari lagi
    kodeAsetBmn: 'BMN-FT-LST-003'
  },
  {
    id: 'EQ-LST-04',
    ruanganId: 'LAB-MESIN-LISTRIK',
    namaAlat: 'Tachometer Laser & Dinamometer Motor Induksi 3 Fasa 5 HP',
    kategori: 'ALAT_TEKNIK',
    spesifikasiRingkas: 'Test Bench Motor Sinkron/Induksi + Sensor Torsi Digital',
    unitTotal: 6,
    unitTersedia: 6,
    unitDalamPerbaikan: 0,
    minRatioPerKelompok: 5,
    wajibKalibrasi: true,
    terakhirKalibrasi: '2026-06-15',
    jatuhTempoKalibrasi: '2026-12-15', // Aman > 30 hari
    kodeAsetBmn: 'BMN-FT-LST-004'
  },
  {
    id: 'EQ-LST-05',
    ruanganId: 'LAB-PLC-OTOMASI',
    namaAlat: 'Trainer PLC Schneider Modicon M221 & Siemens S7-1200',
    kategori: 'ALAT_TEKNIK',
    spesifikasiRingkas: '15 Unit Modul PLC + VFD Altivar + HMI Magelis Touch Panel',
    unitTotal: 15,
    unitTersedia: 14,
    unitDalamPerbaikan: 1,
    minRatioPerKelompok: 2, // 30 mhs butuh 15, tersedia 14
    wajibKalibrasi: true,
    terakhirKalibrasi: '2026-04-26',
    jatuhTempoKalibrasi: '2026-10-26', // Kritis 7 hari lagi
    kodeAsetBmn: 'BMN-FT-LST-005'
  },
  {
    id: 'EQ-LST-06',
    ruanganId: 'LAB-PLC-OTOMASI',
    namaAlat: 'Industrial Ethernet Switch & Modbus TCP Gateway PLC',
    kategori: 'JARINGAN',
    spesifikasiRingkas: 'Manageable Industrial Switch 24-Port DIN-Rail SCADA',
    unitTotal: 4,
    unitTersedia: 3,
    unitDalamPerbaikan: 1,
    minRatioPerKelompok: 10,
    wajibKalibrasi: false,
    terakhirKalibrasi: '2026-05-20',
    jatuhTempoKalibrasi: '2027-05-20',
    kodeAsetBmn: 'BMN-FT-LST-006'
  },
  {
    id: 'EQ-LST-07',
    ruanganId: 'LAB-COMP',
    namaAlat: 'PC Praktikum MATLAB Simulink, ETAP & SCADA Client',
    kategori: 'PC',
    spesifikasiRingkas: '30 Unit PC Core i5 Gen-12 / 16GB RAM / Dual LAN',
    unitTotal: 30,
    unitTersedia: 27,
    unitDalamPerbaikan: 3,
    minRatioPerKelompok: 1, // 1 PC per mhs
    wajibKalibrasi: false,
    terakhirKalibrasi: '2026-07-20',
    jatuhTempoKalibrasi: '2027-07-20',
    kodeAsetBmn: 'BMN-FT-LST-007'
  },
  {
    id: 'EQ-LST-08',
    ruanganId: 'LAB-COMP',
    namaAlat: 'Router VLAN & Switch Gigabit Lab Komputasi Teknik',
    kategori: 'JARINGAN',
    spesifikasiRingkas: 'MikroTik CCR + Switch 48-Port Terkoneksi License Server ETAP',
    unitTotal: 3,
    unitTersedia: 2,
    unitDalamPerbaikan: 1,
    minRatioPerKelompok: 15,
    wajibKalibrasi: false,
    terakhirKalibrasi: '2026-07-20',
    jatuhTempoKalibrasi: '2027-07-20',
    kodeAsetBmn: 'BMN-FT-LST-008'
  }
];

function diffDays(fromDateStr: string, toDateStr: string): number {
  const from = new Date(`${fromDateStr}T00:00:00Z`).getTime();
  const to = new Date(`${toDateStr}T00:00:00Z`).getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

function classifyCalibrationUrgency(
  item: LabEquipmentItem,
  daysToCal: number
): { urgency: CalibrationUrgency; label: string } {
  if (!item.wajibKalibrasi) {
    return { urgency: 'AMAN', label: 'Pemeliharaan Rutin Non-Kalibrasi' };
  }
  if (item.statusKalibrasiDijadwalkan) {
    return { urgency: 'TERJADWAL', label: 'Kalibrasi Sudah Dijadwalkan' };
  }
  if (daysToCal < 0) {
    return {
      urgency: 'KADALUARSA',
      label: `Kadaluarsa ${Math.abs(daysToCal)} Hari Lalu`
    };
  }
  if (daysToCal <= 14) {
    return {
      urgency: 'KRITIS_14_HARI',
      label: `Kritis (${daysToCal} Hari Lagi)`
    };
  }
  if (daysToCal <= 30) {
    return {
      urgency: 'PERINGATAN_30_HARI',
      label: `Mendekati Batas (${daysToCal} Hari)`
    };
  }
  return { urgency: 'AMAN', label: `Valid (${daysToCal} Hari)` };
}

function parseTimeToMinutes(hhmm: string): number {
  const clean = hhmm.trim();
  const parts = clean.split(':');
  if (parts.length < 2) return -1;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function doesMaintenanceSlotOverlap(
  maintenanceSlot: string | undefined,
  hariJadwal: string,
  jamJadwal: string
): boolean {
  if (!maintenanceSlot) return false;
  const parts = maintenanceSlot.trim().split(' ');
  const mDay = parts[0]?.toLowerCase();
  if (!mDay || mDay !== hariJadwal.trim().toLowerCase()) return false;

  const mTimeRange = maintenanceSlot.slice(mDay.length).trim();
  const [mStartStr, mEndStr] = mTimeRange.split('-').map(s => s.trim());
  const [jStartStr, jEndStr] = jamJadwal.split('-').map(s => s.trim());
  if (!mStartStr || !mEndStr || !jStartStr || !jEndStr) return false;

  const mStart = parseTimeToMinutes(mStartStr);
  const mEnd = parseTimeToMinutes(mEndStr);
  const jStart = parseTimeToMinutes(jStartStr);
  const jEnd = parseTimeToMinutes(jEndStr);
  if (mStart < 0 || mEnd < 0 || jStart < 0 || jEnd < 0) return false;

  return Math.max(mStart, jStart) < Math.min(mEnd, jEnd);
}

export function buildLabEquipmentAuditReport(params: {
  ruanganList: RuanganLab[];
  jadwalList: JadwalKuliah[];
  overrides?: Record<string, EquipmentOverrideState>;
  referenceDate?: string;
}): LabEquipmentAuditReport {
  const {
    ruanganList,
    jadwalList,
    overrides = {},
    referenceDate = AUDIT_REFERENCE_DATE
  } = params;

  const roomById = new Map<string, RuanganLab>();
  ruanganList.forEach(r => roomById.set(r.id, r));

  // Build audited equipment items with live overrides applied
  const allEquipments: AuditedEquipmentItem[] = INITIAL_LAB_EQUIPMENT_INVENTORY.filter(eq =>
    roomById.has(eq.ruanganId)
  ).map(raw => {
    const ov = overrides[raw.id];
    const unitDalamPerbaikan =
      ov?.unitDalamPerbaikan !== undefined ? ov.unitDalamPerbaikan : raw.unitDalamPerbaikan;
    const unitTersedia =
      ov?.unitTersedia !== undefined
        ? Math.min(raw.unitTotal, Math.max(0, ov.unitTersedia))
        : Math.max(0, raw.unitTotal - unitDalamPerbaikan);
    const statusKalibrasiDijadwalkan =
      ov?.statusKalibrasiDijadwalkan !== undefined
        ? ov.statusKalibrasiDijadwalkan
        : Boolean(raw.statusKalibrasiDijadwalkan);

    const merged: LabEquipmentItem = {
      ...raw,
      unitTersedia,
      unitDalamPerbaikan,
      statusKalibrasiDijadwalkan
    };

    const daysToCalibration = diffDays(referenceDate, merged.jatuhTempoKalibrasi);
    const { urgency } = classifyCalibrationUrgency(merged, daysToCalibration);

    let kondisi: EquipmentConditionStatus = 'BAIK';
    if (merged.unitDalamPerbaikan > 0) {
      kondisi = 'PERBAIKAN';
    } else if (urgency === 'KADALUARSA') {
      kondisi = 'KALIBRASI_TERLAMBAT';
    } else if (urgency === 'KRITIS_14_HARI' || urgency === 'PERINGATAN_30_HARI') {
      kondisi = 'MENDEKATI_KALIBRASI';
    }

    const rasioKetersediaanPersen =
      merged.unitTotal > 0 ? Math.round((merged.unitTersedia / merged.unitTotal) * 100) : 100;

    return {
      ...merged,
      kondisi,
      daysToCalibration,
      calibrationUrgency: urgency,
      rasioKetersediaanPersen
    };
  });

  const equipmentsByRoom = new Map<string, AuditedEquipmentItem[]>();
  allEquipments.forEach(eq => {
    const arr = equipmentsByRoom.get(eq.ruanganId) || [];
    arr.push(eq);
    equipmentsByRoom.set(eq.ruanganId, arr);
  });

  // 1. Category summaries (PC, JARINGAN, ALAT_TEKNIK)
  const categories: EquipmentCategory[] = ['PC', 'JARINGAN', 'ALAT_TEKNIK'];
  const categorySummaries: CategorySummaryMetric[] = categories.map(kat => {
    const list = allEquipments.filter(e => e.kategori === kat);
    const totalUnits = list.reduce((s, e) => s + e.unitTotal, 0);
    const availableUnits = list.reduce((s, e) => s + e.unitTersedia, 0);
    const repairUnits = list.reduce((s, e) => s + e.unitDalamPerbaikan, 0);
    const calibrationAlertCount = list.filter(
      e =>
        e.calibrationUrgency === 'KADALUARSA' ||
        e.calibrationUrgency === 'KRITIS_14_HARI' ||
        e.calibrationUrgency === 'PERINGATAN_30_HARI'
    ).length;

    return {
      kategori: kat,
      label: CATEGORY_LABELS[kat],
      jenisAlatCount: list.length,
      totalUnits,
      availableUnits,
      repairUnits,
      availabilityPercent: totalUnits > 0 ? Math.round((availableUnits / totalUnits) * 100) : 100,
      calibrationAlertCount
    };
  });

  // 2. Real schedule vs Equipment Inventory Audit
  const scheduleFindings: LabScheduleAuditFinding[] = [];
  const coveredRoomSessions = new Set<string>();

  jadwalList.forEach(j => {
    if (!j.ruanganId) return;
    const room = roomById.get(j.ruanganId);
    if (!room) return;
    if (room.tipe === 'Ruang Teori' || room.tipe === 'Auditorium') return;

    const eqs = equipmentsByRoom.get(room.id) || [];
    const peserta = j.pesertaTotal ?? j.terdaftar ?? room.kapasitas;
    const jamStr = `${j.jamMulai} - ${j.jamSelesai}`;
    coveredRoomSessions.add(`${room.id}:${j.namaMK.toLowerCase()}`);

    const deficits: LabScheduleAuditFinding['equipmentDeficits'] = [];
    const maintenanceBentrokItems: string[] = [];

    eqs.forEach(eq => {
      const unitDibutuhkan = Math.min(
        eq.unitTotal,
        Math.max(1, Math.ceil(peserta / Math.max(1, eq.minRatioPerKelompok)))
      );

      if (doesMaintenanceSlotOverlap(eq.jadwalMaintenanceSlot, j.hari, jamStr)) {
        maintenanceBentrokItems.push(`${eq.namaAlat} (${eq.jadwalMaintenanceSlot})`);
      }

      if (eq.unitTersedia < unitDibutuhkan || eq.unitDalamPerbaikan > 0) {
        const shortage = Math.max(0, unitDibutuhkan - eq.unitTersedia);
        let alasan = '';
        if (eq.unitDalamPerbaikan > 0 && shortage > 0) {
          alasan = `${eq.unitDalamPerbaikan} unit dalam perbaikan & kurang ${shortage} unit untuk ${peserta} mhs`;
        } else if (eq.unitDalamPerbaikan > 0) {
          alasan = `${eq.unitDalamPerbaikan} dari ${eq.unitTotal} unit sedang dalam perbaikan/maintenance`;
        } else {
          alasan = `Tersedia ${eq.unitTersedia} unit < kebutuhan ${unitDibutuhkan} unit (${peserta} mhs)`;
        }

        deficits.push({
          equipmentId: eq.id,
          namaAlat: eq.namaAlat,
          kategori: eq.kategori,
          unitDibutuhkan,
          unitTersedia: eq.unitTersedia,
          unitDalamPerbaikan: eq.unitDalamPerbaikan,
          alasan
        });
      }
    });

    const hasRepairDeficit = deficits.some(d => d.unitDalamPerbaikan > 0);
    const hasShortage = deficits.some(d => d.unitTersedia < d.unitDibutuhkan);
    const hasMaintOverlap = maintenanceBentrokItems.length > 0;

    let auditStatus: ScheduleAuditStatus = 'SIAP_PRAKTIKUM';
    let auditStatusLabel = 'Perangkat Siap & Memadai';
    let rekomendasi =
      'Seluruh unit PC, perangkat jaringan, dan alat ukur memenuhi rasio peserta kelas.';

    if (hasMaintOverlap) {
      auditStatus = 'BENTROK_MAINTENANCE';
      auditStatusLabel = 'Bentrok Jadwal Maintenance';
      rekomendasi = `Jadwal praktikum ${j.hari} ${jamStr} beririsan dengan slot maintenance alat (${maintenanceBentrokItems[0]}). Geser maintenance ke jam kosong atau tukar sesi lab.`;
    } else if (hasRepairDeficit && hasShortage) {
      auditStatus = 'PERBAIKAN_KRITIS';
      auditStatusLabel = 'Alat Perbaikan & Kurang Unit';
      rekomendasi = `Segera selesaikan perbaikan ${deficits[0].namaAlat} atau bagi kelas ${j.kelas} (${peserta} mhs) menjadi 2 shift praktikum.`;
    } else if (hasShortage) {
      auditStatus = 'UNIT_KURANG';
      auditStatusLabel = 'Ketersediaan Unit Kurang';
      rekomendasi = `Rasio peserta (${peserta} mhs) melebihi unit siap (${deficits[0].unitTersedia}/${deficits[0].unitDibutuhkan} unit). Pecah kelompok praktik atau ajukan pengadaan unit tambahan.`;
    } else if (hasRepairDeficit) {
      auditStatus = 'PERBAIKAN_KRITIS';
      auditStatusLabel = 'Ada Perangkat Dalam Perbaikan';
      rekomendasi = `Terdapat unit dalam perbaikan (${deficits[0].namaAlat}). Pastikan unit cadangan aktif sebelum kelas dimulai.`;
    }

    scheduleFindings.push({
      id: `AUDIT-JAD-${j.id}`,
      ruanganId: room.id,
      ruanganKode: room.kode,
      ruanganNama: room.nama,
      prodiId: room.prodiId || j.prodiId,
      sumberJadwal: 'JADWAL_KULIAH',
      kodeMK: j.kodeMK,
      namaMK: j.namaMK,
      kelas: j.kelas,
      hari: j.hari,
      jam: jamStr,
      dosenNama: j.dosenNama,
      pesertaTotal: peserta,
      kapasitasRuang: room.kapasitas,
      equipmentDeficits: deficits,
      maintenanceBentrokItems,
      auditStatus,
      auditStatusLabel,
      rekomendasi
    });
  });

  // Include active real-time sessions from ruanganList.jadwalAktifSaatIni when not already in jadwalList
  ruanganList.forEach(room => {
    if (!room.jadwalAktifSaatIni) return;
    if (room.tipe === 'Ruang Teori' || room.tipe === 'Auditorium') return;

    const act = room.jadwalAktifSaatIni;
    const dupKey = `${room.id}:${act.matakuliah.toLowerCase()}`;
    if (coveredRoomSessions.has(dupKey)) return;

    const eqs = equipmentsByRoom.get(room.id) || [];
    const peserta = room.kapasitas;
    const deficits: LabScheduleAuditFinding['equipmentDeficits'] = [];
    const maintenanceBentrokItems: string[] = [];

    eqs.forEach(eq => {
      const unitDibutuhkan = Math.min(
        eq.unitTotal,
        Math.max(1, Math.ceil(peserta / Math.max(1, eq.minRatioPerKelompok)))
      );

      if (doesMaintenanceSlotOverlap(eq.jadwalMaintenanceSlot, 'Senin', act.jam)) {
        maintenanceBentrokItems.push(`${eq.namaAlat} (${eq.jadwalMaintenanceSlot})`);
      }

      if (eq.unitTersedia < unitDibutuhkan || eq.unitDalamPerbaikan > 0) {
        const shortage = Math.max(0, unitDibutuhkan - eq.unitTersedia);
        deficits.push({
          equipmentId: eq.id,
          namaAlat: eq.namaAlat,
          kategori: eq.kategori,
          unitDibutuhkan,
          unitTersedia: eq.unitTersedia,
          unitDalamPerbaikan: eq.unitDalamPerbaikan,
          alasan:
            shortage > 0
              ? `Sesi aktif (${peserta} kursi): tersedia ${eq.unitTersedia}/${unitDibutuhkan} unit, ${eq.unitDalamPerbaikan} dalam perbaikan`
              : `${eq.unitDalamPerbaikan} unit dalam perbaikan/maintenance saat sesi aktif`
        });
      }
    });

    const hasRepairDeficit = deficits.some(d => d.unitDalamPerbaikan > 0);
    const hasShortage = deficits.some(d => d.unitTersedia < d.unitDibutuhkan);
    const hasMaintOverlap = maintenanceBentrokItems.length > 0;

    let auditStatus: ScheduleAuditStatus = 'SIAP_PRAKTIKUM';
    let auditStatusLabel = 'Sesi Aktif: Siap';
    let rekomendasi = 'Seluruh perangkat pendukung sesi aktif siap dioperasikan.';

    if (hasMaintOverlap) {
      auditStatus = 'BENTROK_MAINTENANCE';
      auditStatusLabel = 'Bentrok Maintenance (Aktif)';
      rekomendasi = `Sesi praktikum aktif beririsan dengan jadwal kalibrasi/maintenance (${maintenanceBentrokItems[0]}). Koordinasikan laboran untuk penjadwalan ulang servis.`;
    } else if (hasRepairDeficit || hasShortage) {
      auditStatus = hasShortage ? 'PERBAIKAN_KRITIS' : 'PERBAIKAN_KRITIS';
      auditStatusLabel = hasShortage ? 'Unit Kurang & Perbaikan' : 'Unit Dalam Perbaikan';
      rekomendasi = `Sesi praktikum berlangsung dengan keterbatasan ${deficits[0]?.namaAlat}. Terapkan rotasi kelompok dan percepat perbaikan teknisi.`;
    }

    scheduleFindings.push({
      id: `AUDIT-ACT-${room.id}`,
      ruanganId: room.id,
      ruanganKode: room.kode,
      ruanganNama: room.nama,
      prodiId: room.prodiId || 'UMUM',
      sumberJadwal: 'AKTIF_SAAT_INI',
      kodeMK: room.kode,
      namaMK: act.matakuliah,
      kelas: act.kelas,
      hari: 'Hari Ini',
      jam: act.jam,
      dosenNama: act.dosen,
      pesertaTotal: peserta,
      kapasitasRuang: room.kapasitas,
      equipmentDeficits: deficits,
      maintenanceBentrokItems,
      auditStatus,
      auditStatusLabel,
      rekomendasi
    });
  });

  // Sort critical findings to the top
  const severityRank: Record<ScheduleAuditStatus, number> = {
    BENTROK_MAINTENANCE: 0,
    PERBAIKAN_KRITIS: 1,
    UNIT_KURANG: 2,
    SIAP_PRAKTIKUM: 3
  };
  scheduleFindings.sort((a, b) => severityRank[a.auditStatus] - severityRank[b.auditStatus]);

  const criticalScheduleAlerts = scheduleFindings.filter(f => f.auditStatus !== 'SIAP_PRAKTIKUM');

  // 3. IABEE Facility Readiness Score (Strictly 1 - 100 per Lab/Workshop/Studio)
  const labRooms = ruanganList.filter(
    r => r.tipe === 'Laboratorium' || r.tipe === 'Workshop' || r.tipe === 'Studio'
  );

  const iabeeResults: LabIabeeReadinessResult[] = labRooms
    .map(ruangan => {
      const eqs = equipmentsByRoom.get(ruangan.id) || [];
      const totalUnit = eqs.reduce((s, e) => s + e.unitTotal, 0);
      const unitTersedia = eqs.reduce((s, e) => s + e.unitTersedia, 0);
      const unitDalamPerbaikan = eqs.reduce((s, e) => s + e.unitDalamPerbaikan, 0);
      const ketersediaanPersen =
        totalUnit > 0 ? Math.round((unitTersedia / totalUnit) * 100) : 100;

      const alatKadaluarsaCount = eqs.filter(
        e => e.calibrationUrgency === 'KADALUARSA'
      ).length;
      const alatMendekatiCount = eqs.filter(
        e =>
          e.calibrationUrgency === 'KRITIS_14_HARI' ||
          e.calibrationUrgency === 'PERINGATAN_30_HARI'
      ).length;
      const alatPerluKalibrasiCount = alatKadaluarsaCount + alatMendekatiCount;

      const jadwalBermasalahCount = scheduleFindings.filter(
        f => f.ruanganId === ruangan.id && f.auditStatus !== 'SIAP_PRAKTIKUM'
      ).length;

      // 4 IABEE Criteria totaling 100 pts (clamped 1..100):
      // 1) Ketersediaan Perangkat Operasional (max 35)
      const availScore = Math.round((ketersediaanPersen / 100) * 35);
      // 2) Kepatuhan Kalibrasi Alat Teknik (max 30)
      const calPenalty = alatKadaluarsaCount * 14 + alatMendekatiCount * 5;
      const calScore = Math.max(4, 30 - calPenalty);
      // 3) Kesesuaian Rasio Alat vs Jadwal Praktikum (max 20)
      const schedScore = Math.max(4, 20 - jadwalBermasalahCount * 6);
      // 4) Standar K3, SOP & Logbook Maintenance IABEE (max 15)
      const k3Score = unitDalamPerbaikan === 0 ? 15 : 11;

      const rawScore = availScore + calScore + schedScore + k3Score;
      const score = Math.max(1, Math.min(100, rawScore));

      let predikat: LabIabeeReadinessResult['predikat'] = 'Layak Penuh (IABEE Grade A)';
      let statusKelayakan: LabIabeeReadinessResult['statusKelayakan'] = 'LAYAK';
      if (score < 70 || alatKadaluarsaCount > 0) {
        if (score < 70) {
          predikat = 'Perlu Tindakan Segera (Kritis)';
          statusKelayakan = 'TIDAK_LAYAK';
        } else {
          predikat = 'Layak Bersyarat (Perlu Kalibrasi)';
          statusKelayakan = 'BERSYARAT';
        }
      } else if (score < 85) {
        predikat = 'Layak Bersyarat (Perlu Kalibrasi)';
        statusKelayakan = 'BERSYARAT';
      }

      const checklist: IabeeChecklistCriterion[] = [
        {
          kode: 'IABEE-F1',
          label: 'Ketersediaan Unit Praktikum ≥ 85%',
          terpenuhi: ketersediaanPersen >= 85,
          catatan: `${unitTersedia}/${totalUnit} unit operasional (${ketersediaanPersen}%)`
        },
        {
          kode: 'IABEE-F2',
          label: 'Zero Alat Ukur Kadaluarsa Kalibrasi',
          terpenuhi: alatKadaluarsaCount === 0,
          catatan:
            alatKadaluarsaCount === 0
              ? 'Semua instrumen terkalibrasi aktif'
              : `${alatKadaluarsaCount} instrumen melewati batas kalibrasi tahunan`
        },
        {
          kode: 'IABEE-F3',
          label: 'Kesesuaian Kapasitas & Beban Jadwal Riil',
          terpenuhi: jadwalBermasalahCount === 0,
          catatan:
            jadwalBermasalahCount === 0
              ? 'Tidak ada defisit unit pada jadwal kelas'
              : `${jadwalBermasalahCount} sesi perkuliahan terdampak keterbatasan alat`
        },
        {
          kode: 'IABEE-F4',
          label: 'K3 Laboratorium & Logbook Maintenance Terdokumentasi',
          terpenuhi: unitDalamPerbaikan <= 1,
          catatan:
            unitDalamPerbaikan === 0
              ? 'SOP K3 & logbook perawatan rutin lengkap'
              : `${unitDalamPerbaikan} unit dalam catatan perbaikan aktif`
        }
      ];

      return {
        ruangan,
        score,
        predikat,
        statusKelayakan,
        totalAlatTerdaftar: eqs.length,
        totalUnit,
        unitTersedia,
        unitDalamPerbaikan,
        ketersediaanPersen,
        alatPerluKalibrasiCount,
        alatKadaluarsaCount,
        jadwalBermasalahCount,
        checklist,
        equipments: eqs
      };
    })
    .sort((a, b) => a.score - b.score);

  // 4. Calibration Maintenance Triggers
  const maintenanceTriggers: MaintenanceTriggerItem[] = allEquipments
    .filter(eq => eq.wajibKalibrasi)
    .map(eq => {
      const room = roomById.get(eq.ruanganId)!;
      const { label } = classifyCalibrationUrgency(eq, eq.daysToCalibration);

      let tindakanSaran = 'Pantau jadwal kalibrasi berkala sesuai siklus 12 bulan.';
      if (eq.statusKalibrasiDijadwalkan) {
        tindakanSaran = 'Teknisi/vendor kalibrasi eksternal telah dijadwalkan. Siapkan berita acara sertifikat.';
      } else if (eq.daysToCalibration < 0) {
        tindakanSaran = `PRIORITAS TINGGI: Segera hentikan sementara pengukuran presisi pada ${eq.namaAlat} dan terbitkan surat perintah kalibrasi ulang KAN.`;
      } else if (eq.daysToCalibration <= 14) {
        tindakanSaran = `Booking vendor kalibrasi sebelum ${eq.jatuhTempoKalibrasi} agar praktikum prodi ${room.prodiId || 'FT'} tidak terhambat.`;
      } else if (eq.daysToCalibration <= 30) {
        tindakanSaran = `Ajukan penganggaran kalibrasi rutin pada siklus maintenance bulan berjalan (${eq.jatuhTempoKalibrasi}).`;
      }

      return {
        equipmentId: eq.id,
        ruanganId: room.id,
        ruanganKode: room.kode,
        ruanganNama: room.nama,
        prodiId: room.prodiId || 'UMUM',
        namaAlat: eq.namaAlat,
        kategori: eq.kategori,
        kodeAsetBmn: eq.kodeAsetBmn,
        terakhirKalibrasi: eq.terakhirKalibrasi,
        jatuhTempoKalibrasi: eq.jatuhTempoKalibrasi,
        daysToCalibration: eq.daysToCalibration,
        urgency: eq.calibrationUrgency,
        urgencyLabel: label,
        statusKalibrasiDijadwalkan: Boolean(eq.statusKalibrasiDijadwalkan),
        tindakanSaran
      };
    })
    .sort((a, b) => a.daysToCalibration - b.daysToCalibration);

  const totalUnitsAll = allEquipments.reduce((s, e) => s + e.unitTotal, 0);
  const availUnitsAll = allEquipments.reduce((s, e) => s + e.unitTersedia, 0);
  const totalRepairUnits = allEquipments.reduce((s, e) => s + e.unitDalamPerbaikan, 0);

  const avgIabeeScore =
    iabeeResults.length > 0
      ? Math.max(
          1,
          Math.min(
            100,
            Math.round(iabeeResults.reduce((s, r) => s + r.score, 0) / iabeeResults.length)
          )
        )
      : 100;

  const urgentCalibrationCount = maintenanceTriggers.filter(
    m =>
      !m.statusKalibrasiDijadwalkan &&
      (m.urgency === 'KADALUARSA' ||
        m.urgency === 'KRITIS_14_HARI' ||
        m.urgency === 'PERINGATAN_30_HARI')
  ).length;

  return {
    referenceDate,
    categorySummaries,
    allEquipments,
    scheduleFindings,
    criticalScheduleAlerts,
    iabeeResults,
    maintenanceTriggers,
    avgIabeeScore,
    overallAvailabilityPercent:
      totalUnitsAll > 0 ? Math.round((availUnitsAll / totalUnitsAll) * 100) : 100,
    totalRepairUnits,
    urgentCalibrationCount
  };
}

export function buildIabeeCalibrationReportText(
  report: LabEquipmentAuditReport,
  prodiLabel: string
): string {
  const urgentItems = report.maintenanceTriggers.filter(
    m =>
      m.urgency === 'KADALUARSA' ||
      m.urgency === 'KRITIS_14_HARI' ||
      m.urgency === 'PERINGATAN_30_HARI'
  );
  const repairItems = report.allEquipments.filter(e => e.unitDalamPerbaikan > 0);

  const lines: string[] = [
    `LAPORAN OTOMATIS AUDIT KELAYAKAN FASILITAS IABEE & KALIBRASI ALAT TEKNIK`,
    `Fakultas Teknik Universitas Batanghari (UNBARI) - Cakupan: ${prodiLabel}`,
    `Tanggal Audit: ${report.referenceDate} | Rata-rata Skor Kelayakan IABEE: ${report.avgIabeeScore}/100`,
    `================================================================`,
    ``,
    `1. RINGKASAN KESIAPAN PER KATEGORI INVENTARIS:`,
    ...report.categorySummaries.map(
      c =>
        `- ${c.label}: ${c.availableUnits}/${c.totalUnits} unit siap (${c.availabilityPercent}%), ${c.repairUnits} unit perbaikan, ${c.calibrationAlertCount} peringatan kalibrasi`
    ),
    ``,
    `2. DAFTAR PERALATAN MEMERLUKAN KALIBRASI SEGERA (${urgentItems.length} Instrumen):`,
    ...(urgentItems.length === 0
      ? ['- Tidak ada instrumen yang mendekati atau melewati jatuh tempo kalibrasi.']
      : urgentItems.map(
          (m, idx) =>
            `${idx + 1}. [${m.ruanganKode}] ${m.namaAlat} (${m.kodeAsetBmn}) | Jatuh Tempo: ${m.jatuhTempoKalibrasi} (${m.urgencyLabel}) | Aksi: ${m.tindakanSaran}`
        )),
    ``,
    `3. PERANGKAT DALAM STATUS PERBAIKAN & DAMPAK JADWAL (${repairItems.length} Item):`,
    ...(repairItems.length === 0
      ? ['- Seluruh perangkat laboratorium dalam kondisi operasional baik.']
      : repairItems.map(
          (e, idx) =>
            `${idx + 1}. ${e.namaAlat} (${e.ruanganId}): ${e.unitDalamPerbaikan} dari ${e.unitTotal} unit dalam perbaikan (Tersedia: ${e.unitTersedia} unit).`
        )),
    ``,
    `4. SKOR KELAYAKAN LABORATORIUM STANDAR IABEE (SKALA 1-100):`,
    ...report.iabeeResults.map(
      r =>
        `- ${r.ruangan.kode} (${r.ruangan.nama}): Skor ${r.score}/100 — ${r.predikat}`
    )
  ];

  return lines.join('\n');
}
