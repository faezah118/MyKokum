import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { NotificationBanner } from './components/NotificationBanner';
import { TambahRekodForm } from './components/TambahRekodForm';
import { LaporanView } from './components/LaporanView';
import { SenaraiUnitView } from './components/SenaraiUnitView';
import { CarianView } from './components/CarianView';
import { AnalisisDashboard } from './components/AnalisisDashboard';
import { OPRModal } from './components/OPRModal';
import { BukuLaporanModal } from './components/BukuLaporanModal';
import { KemaskiniPukalModal } from './components/KemaskiniPukalModal';
import { ImportMuridModal } from './components/ImportMuridModal';
import { SenaraiMuridUnitModal } from './components/SenaraiMuridUnitModal';
import { SupabaseModal } from './components/SupabaseModal';
import { 
  UnitKokurikulum, 
  RekodKokurikulum, 
  ActiveTab, 
  StatusLaporan,
  MuridUnit
} from './types';
import { 
  getStoredUnits, 
  getStoredRecords, 
  getStoredStudents,
  saveStoredRecords,
  saveStoredStudents,
  saveStoredUnits,
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
  syncRecordToSupabase, 
  deleteRecordFromSupabase,
  syncStudentToSupabase,
  deleteStudentFromSupabase,
  syncUnitToSupabase
} from './services/supabase';

export default function App() {
  const [units, setUnits] = useState<UnitKokurikulum[]>([]);
  const [records, setRecords] = useState<RekodKokurikulum[]>([]);
  const [students, setStudents] = useState<MuridUnit[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('laporan');
  const [userRole, setUserRole] = useState<'penyelaras' | 'setiausaha'>('penyelaras');

  // Modals & Sub-states
  const [editingRecord, setEditingRecord] = useState<RekodKokurikulum | null>(null);
  const [activeOPRRecord, setActiveOPRRecord] = useState<RekodKokurikulum | null>(null);
  const [showBukuLaporan, setShowBukuLaporan] = useState<boolean>(false);
  const [showKemaskiniPukal, setShowKemaskiniPukal] = useState<boolean>(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);
  
  // Import & Senarai Murid Modals
  const [showImportMurid, setShowImportMurid] = useState<boolean>(false);
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
    setUnits(loadedUnits);
    setRecords(loadedRecords);
    setStudents(loadedStudents);

    // Ambil data sahih dari Supabase Database (Hanya paparkan rekod dari database)
    const loadFromCloud = async () => {
      try {
        const [cloudRecords, cloudStudents, cloudUnits] = await Promise.all([
          fetchRecordsFromSupabase(),
          fetchStudentsFromSupabase(),
          fetchUnitsFromSupabase(),
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
        onResetData={handleResetData}
        onOpenImportMurid={() => {
          setTargetUnitForImport(undefined);
          setShowImportMurid(true);
        }}
        onOpenSupabaseModal={() => setShowSupabaseModal(true)}
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
            onOpenKemaskiniPukal={() => setShowKemaskiniPukal(true)}
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

        {/* Tab 4: Carian Pantas Rekod */}
        {activeTab === 'carian' && (
          <CarianView
            records={records}
            units={units}
            onOpenOPR={(record) => setActiveOPRRecord(record)}
            onEditRecord={handleStartEdit}
            onDeleteRecord={handleDeleteRecord}
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

      {/* MODAL 3: Kemaskini Pukal */}
      {showKemaskiniPukal && (
        <KemaskiniPukalModal
          records={records}
          onBulkUpdate={handleBulkUpdate}
          onClose={() => setShowKemaskiniPukal(false)}
        />
      )}

      {/* MODAL 4: Import Senarai Murid SMK Madai */}
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

      {/* MODAL 6: Pangkalan Data Supabase Cloud */}
      <SupabaseModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
        records={records}
        students={students}
        units={units}
        onSyncComplete={() => {
          showToast('Penyegerakan ke Supabase Cloud berjaya!');
        }}
      />

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
