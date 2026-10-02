import { UnitKokurikulum, RekodKokurikulum, StatusLaporan, MuridUnit } from '../types';
import { INITIAL_UNITS, INITIAL_RECORDS, INITIAL_STUDENTS } from '../data/initialData';

const STORAGE_KEYS = {
  UNITS: 'mykokum_units_smk_madai_2026_v3',
  RECORDS: 'mykokum_records_smk_madai_2026_v3',
  STUDENTS: 'mykokum_students_smk_madai_2026_v3',
  INITIALIZED_V3: 'mykokum_init_smk_madai_v3',
};

// ==========================================
// PENGURUSAN UNIT KOKURIKULUM
// ==========================================
export const getStoredUnits = (): UnitKokurikulum[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNITS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(INITIAL_UNITS));
      return INITIAL_UNITS;
    }
    const parsed = JSON.parse(raw);
    // Jika senarai unit lama kurang daripada 30 unit (iaitu sebelum penambahan semua unit SMK Madai)
    if (!Array.isArray(parsed) || parsed.length < 30) {
      localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(INITIAL_UNITS));
      return INITIAL_UNITS;
    }
    return parsed;
  } catch (err) {
    console.error('Ralat membaca units dari localStorage:', err);
    return INITIAL_UNITS;
  }
};

export const saveStoredUnits = (units: UnitKokurikulum[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
  } catch (err) {
    console.error('Ralat menyimpan units ke localStorage:', err);
  }
};

export const addStoredUnit = (unit: UnitKokurikulum): UnitKokurikulum[] => {
  const current = getStoredUnits();
  const updated = [...current, unit];
  saveStoredUnits(updated);
  return updated;
};

// ==========================================
// PENGURUSAN SENARAI MURID MENGIKUT UNIT
// ==========================================
export const getStoredStudents = (): MuridUnit[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_STUDENTS;
  } catch (err) {
    console.error('Ralat membaca senarai murid dari localStorage:', err);
    return INITIAL_STUDENTS;
  }
};

export const saveStoredStudents = (students: MuridUnit[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    // Kemaskini juga bilangan ahli unit secara automatik berdasarkan bilangan murid berdaftar
    syncUnitsMemberCount(students);
  } catch (err) {
    console.error('Ralat menyimpan senarai murid ke localStorage:', err);
  }
};

export const getStudentsByUnitId = (unitId: string): MuridUnit[] => {
  const all = getStoredStudents();
  return all.filter((m) => m.unitId === unitId);
};

export const addStoredStudent = (student: MuridUnit): MuridUnit[] => {
  const all = getStoredStudents();
  const updated = [student, ...all];
  saveStoredStudents(updated);
  return updated;
};

export const updateStoredStudent = (student: MuridUnit): MuridUnit[] => {
  const all = getStoredStudents();
  const updated = all.map((m) => (m.id === student.id ? student : m));
  saveStoredStudents(updated);
  return updated;
};

export const deleteStoredStudent = (studentId: string): MuridUnit[] => {
  const all = getStoredStudents();
  const updated = all.filter((m) => m.id !== studentId);
  saveStoredStudents(updated);
  return updated;
};

export const importStudentsForUnit = (
  unitId: string, 
  newStudents: Omit<MuridUnit, 'id' | 'unitId'>[],
  mode: 'append' | 'replace' = 'append'
): { students: MuridUnit[]; addedCount: number } => {
  const current = getStoredStudents();
  const now = new Date().toISOString();

  const prepared: MuridUnit[] = newStudents.map((s, index) => ({
    id: `m_${unitId}_${Date.now()}_${index}`,
    unitId,
    namaMurid: s.namaMurid.trim(),
    noKp: s.noKp?.trim() || '',
    tingkatanKelas: s.tingkatanKelas?.trim() || 'Tingkatan 1',
    jantina: s.jantina || 'Lelaki',
    jawatan: s.jawatan?.trim() || 'Ahli Aktif',
    tarikhDidaftar: now,
  }));

  let updatedList: MuridUnit[];
  if (mode === 'replace') {
    updatedList = [...current.filter((m) => m.unitId !== unitId), ...prepared];
  } else {
    updatedList = [...prepared, ...current];
  }

  saveStoredStudents(updatedList);
  return { students: updatedList, addedCount: prepared.length };
};

export const importStudentsMultiUnits = (
  items: { unitId: string; student: Omit<MuridUnit, 'id' | 'unitId'> }[]
): { students: MuridUnit[]; addedCount: number } => {
  const current = getStoredStudents();
  const now = new Date().toISOString();

  const prepared: MuridUnit[] = items.map((item, index) => ({
    id: `m_${item.unitId}_${Date.now()}_${index}`,
    unitId: item.unitId,
    namaMurid: item.student.namaMurid.trim(),
    noKp: item.student.noKp?.trim() || '',
    tingkatanKelas: item.student.tingkatanKelas?.trim() || 'Tingkatan 1',
    jantina: item.student.jantina || 'Lelaki',
    jawatan: item.student.jawatan?.trim() || 'Ahli Aktif',
    tarikhDidaftar: now,
  }));

  const updatedList = [...prepared, ...current];
  saveStoredStudents(updatedList);
  return { students: updatedList, addedCount: prepared.length };
};

// Menyelaraskan bilangan ahli dalam unit apabila bilangan murid berubah
const syncUnitsMemberCount = (students: MuridUnit[]) => {
  try {
    const units = getStoredUnits();
    let hasChanges = false;

    const countByUnitId: Record<string, number> = {};
    students.forEach((s) => {
      countByUnitId[s.unitId] = (countByUnitId[s.unitId] || 0) + 1;
    });

    const updatedUnits = units.map((u) => {
      const actualCount = countByUnitId[u.id];
      if (actualCount && actualCount > 0 && actualCount !== u.bilanganAhli) {
        hasChanges = true;
        return { ...u, bilanganAhli: actualCount };
      }
      return u;
    });

    if (hasChanges) {
      localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(updatedUnits));
    }
  } catch (err) {
    console.error('Ralat menyelaraskan bilangan ahli unit:', err);
  }
};

// ==========================================
// PENGURUSAN REKOD AKTIVITI
// ==========================================
export const getStoredRecords = (): RekodKokurikulum[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    }
    return parsed;
  } catch (err) {
    console.error('Ralat membaca rekod dari localStorage:', err);
    return INITIAL_RECORDS;
  }
};

export const saveStoredRecords = (records: RekodKokurikulum[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (err) {
    console.error('Ralat menyimpan rekod ke localStorage:', err);
  }
};

export const addStoredRecord = (newRecord: RekodKokurikulum): RekodKokurikulum[] => {
  const current = getStoredRecords();
  const updated = [newRecord, ...current];
  saveStoredRecords(updated);
  return updated;
};

export const updateStoredRecord = (updatedRecord: RekodKokurikulum): RekodKokurikulum[] => {
  const current = getStoredRecords();
  const updated = current.map((rec) => (rec.id === updatedRecord.id ? updatedRecord : rec));
  saveStoredRecords(updated);
  return updated;
};

export const deleteStoredRecord = (id: string): RekodKokurikulum[] => {
  const current = getStoredRecords();
  const updated = current.filter((rec) => rec.id !== id);
  saveStoredRecords(updated);
  return updated;
};

export const bulkUpdateRecordStatus = (ids: string[], newStatus: StatusLaporan): RekodKokurikulum[] => {
  const current = getStoredRecords();
  const now = new Date().toISOString();
  const updated = current.map((rec) => {
    if (ids.includes(rec.id)) {
      return {
        ...rec,
        status: newStatus,
        dikemaskiniPada: now,
      };
    }
    return rec;
  });
  saveStoredRecords(updated);
  return updated;
};

export const resetToDemoData = (): { 
  units: UnitKokurikulum[]; 
  records: RekodKokurikulum[];
  students: MuridUnit[];
} => {
  saveStoredUnits(INITIAL_UNITS);
  saveStoredRecords(INITIAL_RECORDS);
  saveStoredStudents(INITIAL_STUDENTS);
  return { units: INITIAL_UNITS, records: INITIAL_RECORDS, students: INITIAL_STUDENTS };
};

export const formatTarikhMY = (tarikhStr: string): string => {
  if (!tarikhStr) return '-';
  try {
    const [year, month, day] = tarikhStr.split('-');
    if (!year || !month || !day) return tarikhStr;
    const monthsMalay = [
      'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
      'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
    ];
    const mIdx = parseInt(month, 10) - 1;
    return `${parseInt(day, 10)} ${monthsMalay[mIdx] || month} ${year}`;
  } catch {
    return tarikhStr;
  }
};
