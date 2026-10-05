import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { NotificationBanner } from './components/NotificationBanner';
import { TambahRekodForm } from './components/TambahRekodForm';
import { LaporanView } from './components/LaporanView';
import { SenaraiUnitView } from './components/SenaraiUnitView';
import { SenaraiGuruView } from './components/SenaraiGuruView';
import { CarianView } from './components/CarianView';
import { AnalisisDashboard } from './components/AnalisisDashboard';
import { TakwimView } from './components/TakwimView';
import { OPRModal } from './components/OPRModal';
import { BukuLaporanModal } from './components/BukuLaporanModal';
import { ImportMuridModal } from './components/ImportMuridModal';
import { ImportGuruModal, ParsedGuruRow } from './components/ImportGuruModal';
import { SenaraiMuridUnitModal } from './components/SenaraiMuridUnitModal';
import { 
  UnitKokurikulum, 
  RekodKokurikulum, 
  ActiveTab, 
  StatusLaporan,
  MuridUnit,
  GuruKokurikulumItem
} from './types';
import { 
  getStoredUnits, 
  getStoredRecords, 
  getStoredStudents,
  getStoredTeachers,
  saveStoredRecords,
  saveStoredStudents,
  saveStoredUnits,
  saveStoredTeachers,
  addStoredRecord, 
  updateStoredRecord, 
  deleteStoredRecord, 
  bulkUpdateRecordStatus,
  addStoredUnit,
  addStoredStudent,
  deleteStoredStudent,
  importStudentsForUnit,
  resetToDemoData 
} from './utils/storage';
import { 
  fetchRecordsFromSupabase, 
  fetchStudentsFromSupabase, 
  fetchUnitsFromSupabase,
  fetchTeachersFromSupabase,
  syncRecordToSupabase, 
  deleteRecordFromSupabase,
  syncStudentToSupabase,
  deleteStudentFromSupabase,
  syncUnitToSupabase,
  syncTeacherToSupabase,
  deleteTeacherFromSupabase,
  batchSyncTeachersToSupabase
} from './services/supabase';

export default function App() {
  const [units, setUnits] = useState<UnitKokurikulum[]>([]);
  const [records, setRecords] = useState<RekodKokurikulum[]>([]);
  const [students, setStudents] = useState<MuridUnit[]>([]);
  const [teachers, setTeachers] = useState<GuruKokurikulumItem[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('laporan');
  const [userRole, setUserRole] = useState<'penyelaras' | 'setiausaha'>('penyelaras');

  // Modals & Sub-states
  const [editingRecord, setEditingRecord] = useState<RekodKokurikulum | null>(null);
  const [activeOPRRecord, setActiveOPRRecord] = useState<RekodKokurikulum | null>(null);
  const [showBukuLaporan, setShowBukuLaporan] = useState<boolean>(false);
  
  // Import & Senarai Murid / Guru Modals
  const [showImportMurid, setShowImportMurid] = useState<boolean>(false);
  const [showImportGuru, setShowImportGuru] = useState<boolean>(false);
  const [targetUnitForImport, setTargetUnitForImport] = useState<string | undefined>(undefined);
  const [activeUnitForSenaraiMurid, setActiveUnitForSenaraiMurid] = useState<UnitKokurikulum | null>(null);

  const [targetUnitForAdd, setTargetUnitForAdd] = useState<string | undefined>(undefined);
  const [targetUnitFilter, setTargetUnitFilter] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from local storage immediately, then check Supabase Cloud
  useEffect(() => {
    const loadedUnits = getStoredUnits();
    const loadedRecords = getStoredRecords();
    const loadedStudents = getStoredStudents();
    const loadedTeachers = getStoredTeachers();
    setUnits(loadedUnits);
    setRecords(loadedRecords);
    setStudents(loadedStudents);
    setTeachers(loadedTeachers);

    // Ambil data sahih dari Supabase Database (Hanya paparkan rekod dari database)
    const loadFromCloud = async () => {
      try {
        const [cloudRecords, cloudStudents, cloudUnits, cloudTeachers] = await Promise.all([
          fetchRecordsFromSupabase(),
          fetchStudentsFromSupabase(),
          fetchUnitsFromSupabase(),
          fetchTeachersFromSupabase(),
        ]);

        if (cloudUnits && cloudUnits.length >= 30) {
          setUnits(cloudUnits);
          saveStoredUnits(cloudUnits);
        }

        // Hanya paparkan rekod yang benar-benar wujud dalam pangkalan data
        if (cloudRecords !== null) {
          setRecords(cloudRecords);
          saveStoredRecords(cloudRecords);
        }

        if (cloudStudents && cloudStudents.length > 0) {
          setStudents(cloudStudents);
          saveStoredStudents(cloudStudents);
        }

        // Hanya paparkan rekod senarai guru dari Supabase sahaja
        if (cloudTeachers !== null) {
          setTeachers(cloudTeachers);
          saveStoredTeachers(cloudTeachers);

          // Kemaskini maklumat penyelaras pada senarai unit jika ada padanan guru Supabase
          setUnits((prevUnits) => {
            const updated = prevUnits.map((u) => {
              const ketua = cloudTeachers.find((t) => t.unitId === u.id && t.isKetua);
              const unitTeachers = cloudTeachers.filter((t) => t.unitId === u.id).map((t) => t.nama);
              return {
                ...u,
                guruPenyelaras: ketua ? ketua.nama : (u.guruPenyelaras && u.guruPenyelaras !== 'Belum Ditetapkan' ? u.guruPenyelaras : (unitTeachers[0] || 'Belum Ditetapkan')),
                senaraiGuru: unitTeachers.length > 0 ? unitTeachers : (u.senaraiGuru || []),
              };
            });
            saveStoredUnits(updated);
            return updated;
          });
        }
      } catch (err) {
        console.warn('Perhatian sambungan Supabase:', err);
      }
    };

    loadFromCloud();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Handle Save Record (Add or Edit)
  const handleSaveRecord = (recordToSave: RekodKokurikulum) => {
    if (editingRecord) {
      const updated = updateStoredRecord(recordToSave);
      setRecords(updated);
      setEditingRecord(null);
      showToast(`Rekod "${recordToSave.tajukAktiviti}" berjaya dikemaskini.`);
    } else {
      const updated = addStoredRecord(recordToSave);
      setRecords(updated);
      showToast(`Rekod "${recordToSave.tajukAktiviti}" berjaya disimpan ke dalam sistem.`);
    }

    // Segerak ke Supabase Cloud di latar belakang
    syncRecordToSupabase(recordToSave).catch((err) => {
      console.warn('Sync Supabase Rekod tertunda:', err);
    });

    setActiveTab('laporan');
    setTargetUnitForAdd(undefined);
  };

  // Handle Delete Record
  const handleDeleteRecord = (id: string) => {
    const updated = deleteStoredRecord(id);
    setRecords(updated);
    deleteRecordFromSupabase(id).catch((err) => {
      console.warn('Padam Supabase Rekod tertunda:', err);
    });
    showToast('Rekod aktiviti berjaya dipadamkan.');
  };

  // Handle Bulk Status Update
  const handleBulkUpdate = (recordIds: string[], newStatus: StatusLaporan) => {
    const updated = bulkUpdateRecordStatus(recordIds, newStatus);
    setRecords(updated);
    showToast(`Status bagi ${recordIds.length} rekod telah dikemaskini kepada "${newStatus}".`);
  };

  // Handle Add New Unit
  const handleAddUnit = (newUnit: UnitKokurikulum) => {
    const updated = addStoredUnit(newUnit);
    setUnits(updated);
    syncUnitToSupabase(newUnit).catch((err) => {
      console.warn('Sync Supabase Unit tertunda:', err);
    });
    showToast(`Unit "${newUnit.nama}" berjaya didaftarkan di SMK Madai.`);
  };

  // Handle Import Students
  const handleImportStudents = (
    unitId: string, 
    newStudents: Omit<MuridUnit, 'id' | 'unitId'>[], 
    mode: 'append' | 'replace'
  ) => {
    const res = importStudentsForUnit(unitId, newStudents, mode);
    setStudents(res.students);
    // Reload updated units to reflect synced member counts
    const updatedUnits = getStoredUnits();
    setUnits(updatedUnits);
    const targetUnit = updatedUnits.find((u) => u.id === unitId);
    showToast(`Berjaya menyimpan ${res.addedCount} orang murid untuk unit "${targetUnit?.nama || 'Kokurikulum'}".`);
  };

  // Handle Single Student Add
  const handleAddStudent = (student: MuridUnit) => {
    const updated = addStoredStudent(student);
    setStudents(updated);
    const updatedUnits = getStoredUnits();
    setUnits(updatedUnits);
    syncStudentToSupabase(student).catch((err) => {
      console.warn('Sync Supabase Murid tertunda:', err);
    });
    showToast(`Murid "${student.namaMurid}" berjaya didaftarkan.`);
  };

  // Handle Single Student Delete
  const handleDeleteStudent = (studentId: string) => {
    const updated = deleteStoredStudent(studentId);
    setStudents(updated);
    const updatedUnits = getStoredUnits();
    setUnits(updatedUnits);
    deleteStudentFromSupabase(studentId).catch((err) => {
      console.warn('Padam Supabase Murid tertunda:', err);
    });
    showToast('Rekod murid berjaya dipadamkan.');
  };

  // Handle Quick Record For Specific Unit
  const handleSelectUnitForRecord = (unitId: string) => {
    setTargetUnitForAdd(unitId);
    setEditingRecord(null);
    setActiveTab('tambah');
  };

  // Handle Edit Record Action
  const handleStartEdit = (record: RekodKokurikulum) => {
    setEditingRecord(record);
    setActiveTab('tambah');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Reset Data
  const handleResetData = () => {
    const demo = resetToDemoData();
    setUnits(demo.units);
    setRecords(demo.records);
    setStudents(demo.students);
    setEditingRecord(null);
    setActiveTab('laporan');
    showToast('Data contoh rasmi SMK Madai 2026 berjaya dimuatkan semula.');
  };

  // Handle Import Guru - Segerak ke Supabase
  const handleImportGuru = async (
    assignments: ParsedGuruRow[],
    mode: 'replace' | 'append'
  ) => {
    const newGuruItems: GuruKokurikulumItem[] = assignments.map((a, idx) => {
      const targetUnit = units.find((u) => u.id === a.unitIdMatched);
      const isKetua = a.peranan === 'Ketua Penyelaras / Penasihat';
      return {
        id: `guru_${a.unitIdMatched}_${a.namaGuru.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_')}_${Date.now()}_${idx}`,
        nama: a.namaGuru,
        unitId: a.unitIdMatched,
        namaUnit: targetUnit?.nama || a.unitDetected || 'Unit Kokurikulum',
        kategoriUnit: targetUnit?.kategori || 'Kelab & Persatuan',
        peranan: a.peranan,
        isKetua: isKetua,
        rekodDirekodCount: 0,
        jawatan: isKetua ? `Guru Penyelaras ${targetUnit?.nama || ''}` : 'Guru Penasihat',
        noTelefon: a.noTelefon,
        emel: a.emel,
        sumber: 'supabase',
      };
    });

    let updatedTeachers = [...teachers];
    if (mode === 'replace') {
      const affectedUnitIds = new Set(assignments.map((a) => a.unitIdMatched));
      updatedTeachers = [
        ...updatedTeachers.filter((t) => !affectedUnitIds.has(t.unitId)),
        ...newGuruItems,
      ];
    } else {
      newGuruItems.forEach((ng) => {
        const idx = updatedTeachers.findIndex((t) => t.nama.toLowerCase() === ng.nama.toLowerCase() && t.unitId === ng.unitId);
        if (idx !== -1) {
          updatedTeachers[idx] = ng;
        } else {
          updatedTeachers.push(ng);
        }
      });
    }

    setTeachers(updatedTeachers);
    saveStoredTeachers(updatedTeachers);

    // Kemaskini units
    let updatedUnits = [...units];
    assignments.forEach((a) => {
      const unitIndex = updatedUnits.findIndex((u) => u.id === a.unitIdMatched);
      if (unitIndex !== -1) {
        const targetUnit = updatedUnits[unitIndex];
        const currentSenarai = targetUnit.senaraiGuru || [];
        const newSenarai = mode === 'replace'
          ? [a.namaGuru]
          : Array.from(new Set([...currentSenarai, a.namaGuru]));

        updatedUnits[unitIndex] = {
          ...targetUnit,
          guruPenyelaras: (a.peranan === 'Ketua Penyelaras / Penasihat' || mode === 'replace')
            ? a.namaGuru
            : targetUnit.guruPenyelaras,
          senaraiGuru: newSenarai,
        };
      }
    });

    setUnits(updatedUnits);
    saveStoredUnits(updatedUnits);

    showToast(`${assignments.length} Guru berjaya diimport dan disegerakkan ke Supabase Cloud.`);
    setShowImportGuru(false);

    // Muat naik pukal ke Supabase
    try {
      await batchSyncTeachersToSupabase(newGuruItems);
    } catch (err) {
      console.warn('Ralat segerak pukal guru ke Supabase:', err);
    }
  };

  // Handle Save Guru (Tambah atau Kemas Kini) - Terus ke Supabase
  const handleSaveGuru = async (guruToSave: GuruKokurikulumItem) => {
    const exists = teachers.some((t) => t.id === guruToSave.id);
    const updatedTeachers = exists
      ? teachers.map((t) => (t.id === guruToSave.id ? guruToSave : t))
      : [guruToSave, ...teachers];
    setTeachers(updatedTeachers);
    saveStoredTeachers(updatedTeachers);

    // Kemaskini unit berkaitan
    setUnits((prevUnits) => {
      const updated = prevUnits.map((u) => {
        if (u.id === guruToSave.unitId) {
          const currentList = u.senaraiGuru || [];
          const newList = Array.from(new Set([...currentList, guruToSave.nama]));
          return {
            ...u,
            guruPenyelaras: guruToSave.isKetua ? guruToSave.nama : u.guruPenyelaras,
            senaraiGuru: newList,
          };
        }
        return u;
      });
      saveStoredUnits(updated);
      return updated;
    });

    showToast(`Maklumat guru "${guruToSave.nama}" berjaya disimpan ke Supabase.`);

    try {
      await syncTeacherToSupabase(guruToSave);
    } catch (err) {
      console.warn('Ralat segerak guru ke Supabase:', err);
    }
  };

  // Handle Delete Guru - Padam dari Supabase
  const handleDeleteGuru = async (guruToDelete: GuruKokurikulumItem) => {
    const updatedTeachers = teachers.filter((t) => t.id !== guruToDelete.id);
    setTeachers(updatedTeachers);
    saveStoredTeachers(updatedTeachers);

    // Kemaskini unit berkaitan
    setUnits((prevUnits) => {
      const updated = prevUnits.map((u) => {
        if (u.id === guruToDelete.unitId) {
          const newList = (u.senaraiGuru || []).filter((g) => g !== guruToDelete.nama);
          return {
            ...u,
            guruPenyelaras: u.guruPenyelaras === guruToDelete.nama ? (newList[0] || 'Belum Ditetapkan') : u.guruPenyelaras,
            senaraiGuru: newList,
          };
        }
        return u;
      });
      saveStoredUnits(updated);
      return updated;
    });

    showToast(`Rekod guru "${guruToDelete.nama}" telah dipadam daripada Supabase.`);

    try {
      await deleteTeacherFromSupabase(guruToDelete);
    } catch (err) {
      console.warn('Ralat memadam guru di Supabase:', err);
    }
  };

  // Handle Refresh Guru from Supabase
  const handleRefreshGuruFromSupabase = async () => {
    const cloudTeachers = await fetchTeachersFromSupabase();
    if (cloudTeachers !== null) {
      setTeachers(cloudTeachers);
      saveStoredTeachers(cloudTeachers);
      showToast(`${cloudTeachers.length} rekod guru berjaya disegerakkan daripada Supabase.`);
    }
  };

  // Handle Update Single Unit
  const handleUpdateUnit = async (updatedUnit: UnitKokurikulum) => {
    const updatedList = units.map((u) => (u.id === updatedUnit.id ? updatedUnit : u));
    setUnits(updatedList);
    saveStoredUnits(updatedList);

    try {
      await syncUnitToSupabase(updatedUnit);
    } catch (err) {
      console.warn('Sync unit error:', err);
    }

    showToast(`Maklumat ${updatedUnit.nama} berjaya dikemas kini!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-fadeIn no-print">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Aplikasi (SMK Madai) */}
      <Header
        records={records}
        units={units}
        onOpenBukuLaporan={() => setShowBukuLaporan(true)}
        onOpenImportMurid={() => {
          setTargetUnitForImport(undefined);
          setShowImportMurid(true);
        }}
        onOpenImportGuru={() => setShowImportGuru(true)}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      {/* Navigasi Utama */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'tambah') {
            setEditingRecord(null);
          }
          setActiveTab(tab);
        }}
        recordCount={records.length}
        unitCount={units.length}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Automated Reminder Banner */}
        <NotificationBanner
          records={records}
          onEditRecord={handleStartEdit}
        />

        {/* Tab 1: Tambah / Kemaskini Rekod */}
        {activeTab === 'tambah' && (
          <TambahRekodForm
            units={units}
            students={students}
            onOpenImportForUnit={(unitId) => {
              setTargetUnitForImport(unitId);
              setShowImportMurid(true);
            }}
            onSaveRecord={handleSaveRecord}
            onCancel={() => {
              setEditingRecord(null);
              setActiveTab('laporan');
            }}
            editingRecord={editingRecord}
            defaultUnitId={targetUnitForAdd}
          />
        )}

        {/* Tab 2: Laporan Aktiviti & OPR */}
        {activeTab === 'laporan' && (
          <LaporanView
            records={records}
            units={units}
            onOpenOPR={(record) => setActiveOPRRecord(record)}
            onEditRecord={handleStartEdit}
            onDeleteRecord={handleDeleteRecord}
            onNavigateTambah={(unitId) => {
              setTargetUnitForAdd(unitId);
              setEditingRecord(null);
              setActiveTab('tambah');
            }}
            onOpenBukuLaporan={() => setShowBukuLaporan(true)}
            initialFilterUnitId={targetUnitFilter}
          />
        )}

        {/* Tab 3: Senarai Unit Kokurikulum (41 Unit SMK Madai) */}
        {activeTab === 'senarai' && (
          <SenaraiUnitView
            units={units}
            records={records}
            students={students}
            onAddUnit={handleAddUnit}
            onSelectUnitForRecord={handleSelectUnitForRecord}
            onFilterRecordsByUnit={(unitId) => {
              setTargetUnitFilter(unitId);
              setActiveTab('laporan');
            }}
            onOpenImportMurid={(unitId) => {
              setTargetUnitForImport(unitId);
              setShowImportMurid(true);
            }}
            onOpenSenaraiMurid={(unit) => {
              setActiveUnitForSenaraiMurid(unit);
            }}
          />
        )}

        {/* Tab 4: Senarai Guru Kokurikulum (Supabase Sahaja) */}
        {activeTab === 'guru' && (
          <SenaraiGuruView
            units={units}
            records={records}
            teachers={teachers}
            onOpenImportGuru={() => setShowImportGuru(true)}
            onSelectUnit={(unitId) => {
              setTargetUnitFilter(unitId);
              setActiveTab('senarai');
            }}
            onUpdateUnit={handleUpdateUnit}
            onSaveGuru={handleSaveGuru}
            onDeleteGuru={handleDeleteGuru}
            onRefreshFromSupabase={handleRefreshGuruFromSupabase}
          />
        )}

        {/* Tab 5: Analisis SU Kokum */}
        {activeTab === 'analisis' && (
          <AnalisisDashboard
            records={records}
            units={units}
            onOpenBukuLaporan={() => setShowBukuLaporan(true)}
            onSelectUnit={(unitId) => {
              setActiveTab('senarai');
            }}
          />
        )}

        {/* Tab 6: Takwim Kokurikulum (Carta Gantt) */}
        {activeTab === 'takwim' && (
          <TakwimView
            records={records}
            units={units}
            onNavigateTambah={(unitId) => {
              setTargetUnitForAdd(unitId);
              setEditingRecord(null);
              setActiveTab('tambah');
            }}
            onOpenOPR={(record) => setActiveOPRRecord(record)}
          />
        )}

        {/* Tab 7: Carian Pantas Rekod */}
        {activeTab === 'carian' && (
          <CarianView
            records={records}
            units={units}
            onOpenOPR={(record) => setActiveOPRRecord(record)}
            onEditRecord={handleStartEdit}
            onDeleteRecord={handleDeleteRecord}
          />
        )}

      </main>

      {/* MODAL 1: OPR Automatik (One Page Report) */}
      {activeOPRRecord && (
        <OPRModal
          record={activeOPRRecord}
          onClose={() => setActiveOPRRecord(null)}
        />
      )}

      {/* MODAL 2: Buku Laporan Tahunan Kokurikulum 2026 */}
      {showBukuLaporan && (
        <BukuLaporanModal
          records={records}
          units={units}
          onClose={() => setShowBukuLaporan(false)}
        />
      )}

      {/* MODAL 3: Import Senarai Murid SMK Madai */}
      {showImportMurid && (
        <ImportMuridModal
          units={units}
          selectedUnitId={targetUnitForImport}
          onClose={() => setShowImportMurid(false)}
          onImportStudents={handleImportStudents}
          onImportComplete={(unitId, count) => {
            // Callback after successful import
          }}
        />
      )}

      {/* MODAL 4: Import Senarai Guru Penasihat Kokurikulum */}
      {showImportGuru && (
        <ImportGuruModal
          units={units}
          onClose={() => setShowImportGuru(false)}
          onImportGuru={handleImportGuru}
        />
      )}

      {/* MODAL 5: Paparan & Pengurusan Senarai Murid Unit */}
      {activeUnitForSenaraiMurid && (
        <SenaraiMuridUnitModal
          unit={activeUnitForSenaraiMurid}
          students={students.filter((s) => s.unitId === activeUnitForSenaraiMurid.id)}
          onClose={() => setActiveUnitForSenaraiMurid(null)}
          onAddStudent={handleAddStudent}
          onDeleteStudent={handleDeleteStudent}
          onOpenImportForUnit={(unitId) => {
            setTargetUnitForImport(unitId);
            setShowImportMurid(true);
          }}
        />
      )}

      {/* Footer Aplikasi */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            MyKokum+ © 2026 — Sistem Pengurusan Kokurikulum SMK Madai
          </p>
          <p className="text-slate-400 text-[11px]">
            Direka khas untuk Guru Penyelaras Unit & Setiausaha Kokurikulum SMK Madai
          </p>
        </div>
      </footer>

    </div>
  );
}
