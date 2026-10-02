import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, 
  Save, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Image as ImageIcon, 
  Trash2, 
  Clock, 
  MapPin, 
  Users, 
  Trophy, 
  Calendar, 
  UploadCloud, 
  X, 
  Plus, 
  MinusCircle, 
  FileText,
  UserCheck,
  UserPlus,
  Search,
  CheckSquare,
  Square,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Copy
} from 'lucide-react';
import { 
  RekodKokurikulum, 
  UnitKokurikulum, 
  PeringkatAktiviti, 
  JenisRekod, 
  StatusLaporan,
  GambarAktiviti,
  MuridUnit
} from '../types';
import { KATEGORI_TEMPLATE_PRESETS } from '../data/initialData';
import { uploadImageToSupabaseStorage, SUPABASE_STORAGE_BUCKET } from '../services/supabase';

interface TambahRekodFormProps {
  units: UnitKokurikulum[];
  students?: MuridUnit[];
  onOpenImportForUnit?: (unitId: string) => void;
  onSaveRecord: (record: RekodKokurikulum) => void;
  onCancel?: () => void;
  editingRecord?: RekodKokurikulum | null;
  defaultUnitId?: string;
}

interface GuruItem {
  id: string;
  nama: string;
  peranan: string;
}

// Client-side image compression helper returning both Blob (for Supabase Storage) and dataUrl (for preview)
const compressImageToBlobAndDataUrl = (
  file: File,
  maxDimension: number = 1200,
  quality: number = 0.82
): Promise<{ blob: Blob; dataUrl: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve({ blob, dataUrl });
              } else {
                resolve({ blob: file, dataUrl });
              }
            },
            'image/jpeg',
            quality
          );
        } else {
          const dataUrl = e.target?.result as string;
          resolve({ blob: file, dataUrl });
        }
      };
      img.onerror = () => reject(new Error('Gagal memproses fail imej'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca fail'));
    reader.readAsDataURL(file);
  });
};

// Fungsi pembantu susunan mengikut: Tingkatan -> Kelas -> Nama
const getTingkatanRank = (kelasStr: string = ''): number => {
  const str = kelasStr.trim().toLowerCase();
  if (str.startsWith('ppki')) return 0;
  if (str.startsWith('peralihan')) return 0.5;
  if (str.startsWith('1')) return 1;
  if (str.startsWith('2')) return 2;
  if (str.startsWith('3')) return 3;
  if (str.startsWith('4')) return 4;
  if (str.startsWith('5')) return 5;
  if (str.startsWith('6 rendah') || str.startsWith('6 r')) return 6.1;
  if (str.startsWith('6 atas') || str.startsWith('6 a') || str.startsWith('6')) return 6.2;
  const match = str.match(/\d+/);
  if (match) return parseInt(match[0], 10);
  return 99;
};

const sortStudentsByTingkatanKelasNama = (list: MuridUnit[]): MuridUnit[] => {
  return [...list].sort((a, b) => {
    const rankA = getTingkatanRank(a.tingkatanKelas);
    const rankB = getTingkatanRank(b.tingkatanKelas);
    if (rankA !== rankB) return rankA - rankB;
    const classComp = a.tingkatanKelas.localeCompare(b.tingkatanKelas);
    if (classComp !== 0) return classComp;
    return a.namaMurid.localeCompare(b.namaMurid);
  });
};

export const TambahRekodForm: React.FC<TambahRekodFormProps> = ({
  units,
  students = [],
  onOpenImportForUnit,
  onSaveRecord,
  onCancel,
  editingRecord,
  defaultUnitId,
}) => {
  const isEditing = !!editingRecord;
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  // Selected Unit State
  const initialUnit = editingRecord 
    ? units.find((u) => u.id === editingRecord.unitId) || units[0]
    : (defaultUnitId ? units.find((u) => u.id === defaultUnitId) || units[0] : units[0]);

  const [selectedUnitId, setSelectedUnitId] = useState<string>(initialUnit?.id || '');
  const activeUnit = units.find((u) => u.id === selectedUnitId) || units[0];

  // ==========================================
  // SUB-MENU (1) MAKLUMAT PERJUMPAAN
  // ==========================================
  const [tajukAktiviti, setTajukAktiviti] = useState<string>('');
  // Pilihan Jenis Rekod: HANYA ADA 3: 'Perjumpaan Mingguan' | 'Penglibatan' | 'Pencapaian'
  const [jenisRekod, setJenisRekod] = useState<'Perjumpaan Mingguan' | 'Penglibatan' | 'Pencapaian'>('Perjumpaan Mingguan');
  const [peringkat, setPeringkat] = useState<PeringkatAktiviti>('Sekolah');
  const [tarikh, setTarikh] = useState<string>('2026-09-23');
  const [masaMula, setMasaMula] = useState<string>('14:30');
  const [masaTamat, setMasaTamat] = useState<string>('16:30');
  const [tempat, setTempat] = useState<string>('');
  const [objektifList, setObjektifList] = useState<string[]>(['']);

  // ==========================================
  // SUB-MENU (2) KEHADIRAN MURID & GURU
  // ==========================================
  // Local student list for the active unit (allows adding new ones inline if needed)
  const [unitStudents, setUnitStudents] = useState<MuridUnit[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Inline new student modal/drawer
  const [showAddStudentModal, setShowAddStudentModal] = useState<boolean>(false);
  const [newStudentNama, setNewStudentNama] = useState<string>('');
  const [newStudentKelas, setNewStudentKelas] = useState<string>('');
  const [newStudentNoKp, setNewStudentNoKp] = useState<string>('');

  // Senarai Guru Hadir
  const [guruList, setGuruList] = useState<GuruItem[]>([]);
  const [selectedGuruIds, setSelectedGuruIds] = useState<string[]>([]);
  const [showAddGuruInput, setShowAddGuruInput] = useState<boolean>(false);
  const [newGuruNama, setNewGuruNama] = useState<string>('');
  const [newGuruPeranan, setNewGuruPeranan] = useState<string>('Guru Penasihat');

  // Kumpulan Sasaran
  const [kumpulanSasaran, setKumpulanSasaran] = useState<string>('Semua ahli berdaftar');

  // ==========================================
  // SUB-MENU (3) RUMUSAN DAN FOTO AKTIVITI
  // ==========================================
  const [refleksi, setRefleksi] = useState<string>('');
  const [ringkasanAktiviti, setRingkasanAktiviti] = useState<string>('');
  const [pencapaian, setPencapaian] = useState<string>('');
  const [status, setStatus] = useState<StatusLaporan>('Selesai');

  // HANYA 2 KEPING GAMBAR untuk guru penasihat upload
  const [photo1, setPhoto1] = useState<{ url: string; kapsyen: string } | null>(null);
  const [photo2, setPhoto2] = useState<{ url: string; kapsyen: string } | null>(null);
  const [isProcessingPhoto1, setIsProcessingPhoto1] = useState<boolean>(false);
  const [isProcessingPhoto2, setIsProcessingPhoto2] = useState<boolean>(false);
  const [uploadingSlot1, setUploadingSlot1] = useState<boolean>(false);
  const [uploadingSlot2, setUploadingSlot2] = useState<boolean>(false);
  const [slot1Source, setSlot1Source] = useState<'supabase' | 'local' | null>(null);
  const [slot2Source, setSlot2Source] = useState<'supabase' | 'local' | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [storageRlsError, setStorageRlsError] = useState<boolean>(false);
  const [copiedStorageSql, setCopiedStorageSql] = useState<boolean>(false);

  const copyStorageSql = () => {
    const sql = `-- 1. Cipta bucket 'gambarpic' sebagai Public Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gambarpic', 'gambarpic', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Benarkan capaian baca fail dalam bucket gambarpic
DROP POLICY IF EXISTS "Public Read gambarpic" ON storage.objects;
CREATE POLICY "Public Read gambarpic" ON storage.objects FOR SELECT TO public USING (bucket_id = 'gambarpic');

-- 3. Benarkan muat naik gambar ke dalam bucket gambarpic
DROP POLICY IF EXISTS "Public Upload gambarpic" ON storage.objects;
CREATE POLICY "Public Upload gambarpic" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'gambarpic');

-- 4. Benarkan kemaskini gambar dalam bucket gambarpic
DROP POLICY IF EXISTS "Public Update gambarpic" ON storage.objects;
CREATE POLICY "Public Update gambarpic" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'gambarpic');`;
    navigator.clipboard.writeText(sql);
    setCopiedStorageSql(true);
    setTimeout(() => setCopiedStorageSql(false), 3000);
  };

  // Status & Maklumat Pelapor
  const [namaPelapor, setNamaPelapor] = useState<string>('');
  const [jawatanPelapor, setJawatanPelapor] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initial load or unit change
  useEffect(() => {
    if (!activeUnit) return;

    // 1. Muatkan senarai murid unit & susun mengikut Tingkatan -> Kelas -> Nama
    const existing = students.filter((s) => s.unitId === activeUnit.id);
    let effectiveStudents: MuridUnit[] = [];

    if (existing.length > 0) {
      effectiveStudents = sortStudentsByTingkatanKelasNama(existing);
    } else {
      // Sediakan murid contoh standard mengikut urutan tingkatan-kelas-nama jika unit belum ada import
      const isPPKI = activeUnit.nama.includes('PPKI');
      const isT6 = activeUnit.nama.includes('T6') || activeUnit.nama.includes('Tingkatan 6');

      if (isPPKI) {
        effectiveStudents = sortStudentsByTingkatanKelasNama([
          { id: `demo-p1`, unitId: activeUnit.id, namaMurid: 'Mohd Amirul Hafiz', tingkatanKelas: 'PPKI Al-Farabi', jantina: 'Lelaki', jawatan: 'Ketua Unit' },
          { id: `demo-p2`, unitId: activeUnit.id, namaMurid: 'Siti Sarah binti Karim', tingkatanKelas: 'PPKI Al-Biruni', jantina: 'Perempuan', jawatan: 'Penolong Ketua' },
          { id: `demo-p3`, unitId: activeUnit.id, namaMurid: 'Bryan Lee', tingkatanKelas: 'PPKI Al-Razi', jantina: 'Lelaki', jawatan: 'Setiausaha' },
          { id: `demo-p4`, unitId: activeUnit.id, namaMurid: 'Nur Aisyah Humaira', tingkatanKelas: 'PPKI Al-Farabi', jantina: 'Perempuan', jawatan: 'Ahli Aktif' },
          { id: `demo-p5`, unitId: activeUnit.id, namaMurid: 'Muhammad Danish Rayyan', tingkatanKelas: 'PPKI Al-Khawarizmi', jantina: 'Lelaki', jawatan: 'Ahli Aktif' },
        ]);
      } else if (isT6) {
        effectiveStudents = sortStudentsByTingkatanKelasNama([
          { id: `demo-t1`, unitId: activeUnit.id, namaMurid: 'Clara Evelyn Wong', tingkatanKelas: '6 Rendah Sains', jantina: 'Perempuan', jawatan: 'Bendahari' },
          { id: `demo-t2`, unitId: activeUnit.id, namaMurid: 'Muhammad Haziq bin Faizal', tingkatanKelas: '6 Rendah Sastera', jantina: 'Lelaki', jawatan: 'AJK' },
          { id: `demo-t3`, unitId: activeUnit.id, namaMurid: 'Mohamad Aidil bin Kamaruddin', tingkatanKelas: '6 Atas Sains', jantina: 'Lelaki', jawatan: 'Pengerusi' },
          { id: `demo-t4`, unitId: activeUnit.id, namaMurid: 'Nor Farah Hanim binti Dahlan', tingkatanKelas: '6 Atas Sastera 1', jantina: 'Perempuan', jawatan: 'Naib Pengerusi' },
          { id: `demo-t5`, unitId: activeUnit.id, namaMurid: 'Wan Amirul Hakim bin Wan Ramli', tingkatanKelas: '6 Atas Sastera 2', jantina: 'Lelaki', jawatan: 'Setiausaha' },
        ]);
      } else {
        effectiveStudents = sortStudentsByTingkatanKelasNama([
          { id: `demo-m1`, unitId: activeUnit.id, namaMurid: 'Muhammad Aliff Haikal bin Shahril', tingkatanKelas: '1 Cekal', jantina: 'Lelaki', jawatan: 'Ahli Aktif' },
          { id: `demo-m2`, unitId: activeUnit.id, namaMurid: 'Puteri Nur Balqis binti Mazlan', tingkatanKelas: '1 Bestari', jantina: 'Perempuan', jawatan: 'Ahli Aktif' },
          { id: `demo-m3`, unitId: activeUnit.id, namaMurid: 'Calvin Lee Wei Shen', tingkatanKelas: '2 Amanah', jantina: 'Lelaki', jawatan: 'AJK Peralatan' },
          { id: `demo-m4`, unitId: activeUnit.id, namaMurid: 'Dayang Siti Aminah binti Kassim', tingkatanKelas: '2 Dedikasi', jantina: 'Perempuan', jawatan: 'Ahli Aktif' },
          { id: `demo-m5`, unitId: activeUnit.id, namaMurid: 'Aiman Farhan bin Sukor', tingkatanKelas: '3 Arif', jantina: 'Lelaki', jawatan: 'Setiausaha' },
          { id: `demo-m6`, unitId: activeUnit.id, namaMurid: 'Nurul Huda binti Bahrin', tingkatanKelas: '3 Bestari', jantina: 'Perempuan', jawatan: 'Bendahari' },
          { id: `demo-m7`, unitId: activeUnit.id, namaMurid: 'Muhammad Adam bin Hairul', tingkatanKelas: '4 Cemerlang', jantina: 'Lelaki', jawatan: 'Pengerusi' },
          { id: `demo-m8`, unitId: activeUnit.id, namaMurid: 'Nur Damia Insyirah binti Zamri', tingkatanKelas: '4 Cemerlang', jantina: 'Perempuan', jawatan: 'Naib Pengerusi' },
          { id: `demo-m9`, unitId: activeUnit.id, namaMurid: 'Khairul Izzat bin Mansor', tingkatanKelas: '5 Gemilang', jantina: 'Lelaki', jawatan: 'AJK Disiplin' },
        ]);
      }
    }

    setUnitStudents(effectiveStudents);

    // 2. Senaraikan Guru Penasihat/Pembimbing bagi unit ini
    const initialGurus: GuruItem[] = [
      { id: 'g-1', nama: activeUnit.guruPenyelaras, peranan: 'Guru Penyelaras' },
      { id: 'g-2', nama: 'Cikgu Noor Azlina binti Mahat', peranan: 'Guru Penasihat' },
      { id: 'g-3', nama: 'Ustaz Ahmad Tarmizi bin Ismail', peranan: 'Guru Pembimbing' },
    ];
    setGuruList(initialGurus);

    // Jika sedang edit, ambil rekod asal
    if (editingRecord) {
      setTajukAktiviti(editingRecord.tajukAktiviti);
      // Validasi jenis rekod kepada salah satu daripada 3 pilihan
      if (editingRecord.jenisRekod === 'Pencapaian' || editingRecord.jenisRekod === 'Pencapaian Khas') {
        setJenisRekod('Pencapaian');
      } else if (editingRecord.jenisRekod === 'Penglibatan' || editingRecord.jenisRekod === 'Pertandingan & Kejohanan' || editingRecord.jenisRekod === 'Program / Kem / Kursus') {
        setJenisRekod('Penglibatan');
      } else {
        setJenisRekod('Perjumpaan Mingguan');
      }
      setPeringkat(editingRecord.peringkat);
      setTarikh(editingRecord.tarikh);
      setMasaMula(editingRecord.masaMula);
      setMasaTamat(editingRecord.masaTamat);
      setTempat(editingRecord.tempat);
      setObjektifList(editingRecord.objektif.length > 0 ? editingRecord.objektif : ['']);
      setRingkasanAktiviti(editingRecord.ringkasanAktiviti);
      setPencapaian(editingRecord.pencapaian || '');
      setRefleksi(
        editingRecord.refleksiKekuatan 
          ? `${editingRecord.refleksiKekuatan}\n${editingRecord.refleksiPenambahbaikan || ''}`.trim()
          : (editingRecord.ringkasanAktiviti || '')
      );
      setStatus(editingRecord.status);
      setNamaPelapor(editingRecord.namaPelapor);
      setJawatanPelapor(editingRecord.jawatanPelapor);

      // Foto (Maksima 2 keping)
      if (editingRecord.gambar && editingRecord.gambar.length > 0) {
        setPhoto1({ url: editingRecord.gambar[0].url, kapsyen: editingRecord.gambar[0].kapsyen || 'Foto Aktiviti 1' });
        if (editingRecord.gambar.length > 1) {
          setPhoto2({ url: editingRecord.gambar[1].url, kapsyen: editingRecord.gambar[1].kapsyen || 'Foto Aktiviti 2' });
        } else {
          setPhoto2(null);
        }
      } else {
        setPhoto1(null);
        setPhoto2(null);
      }

      // Tandakan murid hadir mengikut bilangan rekod
      const numHadir = editingRecord.sasaranPenglibatan.bilanganMuridHadir || effectiveStudents.length;
      setSelectedStudentIds(effectiveStudents.slice(0, numHadir).map((s) => s.id));

      // Tandakan guru hadir mengikut bilangan
      const numGuru = editingRecord.sasaranPenglibatan.bilanganGuruHadir || 2;
      setSelectedGuruIds(initialGurus.slice(0, numGuru).map((g) => g.id));
    } else {
      // Mod Tambah Rekod Baru:
      setNamaPelapor(activeUnit.guruPenyelaras);
      setJawatanPelapor(`Guru Penyelaras ${activeUnit.nama}`);
      setTempat(activeUnit.tempatBiasa || 'Kawasan Sekolah SMK Madai');
      
      const preset = KATEGORI_TEMPLATE_PRESETS[activeUnit.kategori];
      if (preset) {
        setObjektifList([...preset.objektifDefault]);
      }

      // Default: Tandakan 90% murid hadir
      const defaultHadirCount = Math.max(1, Math.floor(effectiveStudents.length * 0.9));
      setSelectedStudentIds(effectiveStudents.slice(0, defaultHadirCount).map((s) => s.id));

      // Default: Guru Penyelaras dan Guru Penasihat 1 hadir
      setSelectedGuruIds([initialGurus[0].id, initialGurus[1].id]);

      // Kosongkan gambar jika mod baharu
      setPhoto1(null);
      setPhoto2(null);
    }
  }, [editingRecord, activeUnit?.id, students]);

  // Handle unit selection change
  const handleUnitChange = (newUnitId: string) => {
    setSelectedUnitId(newUnitId);
  };

  // ==========================================
  // DYNAMIC CALCULATIONS (BERDASARKAN TANDAAN)
  // ==========================================
  // 1. Jumlah murid hadir = bilangan murid yang ditandakan
  const bilanganMuridHadir = selectedStudentIds.length;
  const jumlahAhli = unitStudents.length > 0 ? unitStudents.length : 1;
  const calculatedPercent = Math.min(100, Math.round((bilanganMuridHadir / jumlahAhli) * 100));

  // 2. Jumlah guru hadir = bilangan guru yang ditandakan
  const bilanganGuruHadir = selectedGuruIds.length;

  // Toggle satu murid
  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) => 
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  // Tandakan semua murid hadir
  const handleSelectAllStudents = () => {
    setSelectedStudentIds(unitStudents.map((s) => s.id));
  };

  // Kosongkan kehadiran murid
  const handleDeselectAllStudents = () => {
    setSelectedStudentIds([]);
  };

  // Toggle satu guru
  const toggleGuru = (guruId: string) => {
    setSelectedGuruIds((prev) => 
      prev.includes(guruId) ? prev.filter((id) => id !== guruId) : [...prev, guruId]
    );
  };

  // Tambah Guru Baharu
  const handleAddCustomGuru = () => {
    if (!newGuruNama.trim()) return;
    const newG: GuruItem = {
      id: `g-custom-${Date.now()}`,
      nama: newGuruNama.trim(),
      peranan: newGuruPeranan.trim() || 'Guru Bertugas',
    };
    setGuruList((prev) => [...prev, newG]);
    setSelectedGuruIds((prev) => [...prev, newG.id]);
    setNewGuruNama('');
    setShowAddGuruInput(false);
  };

  // Tambah Murid Baharu Inline
  const handleAddInlineStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentNama.trim()) return;

    const createdStudent: MuridUnit = {
      id: `m-inline-${Date.now()}`,
      unitId: activeUnit.id,
      namaMurid: newStudentNama.trim(),
      tingkatanKelas: newStudentKelas.trim() || '4 Cemerlang',
      noKp: newStudentNoKp.trim(),
      jantina: newStudentNama.toLowerCase().includes('binti') ? 'Perempuan' : 'Lelaki',
      jawatan: 'Ahli Aktif',
      tarikhDidaftar: new Date().toISOString(),
    };

    const updatedList = sortStudentsByTingkatanKelasNama([...unitStudents, createdStudent]);
    setUnitStudents(updatedList);
    setSelectedStudentIds((prev) => [...prev, createdStudent.id]);
    setNewStudentNama('');
    setNewStudentKelas('');
    setNewStudentNoKp('');
    setShowAddStudentModal(false);
  };

  // Filtered Students for view
  const filteredStudents = unitStudents.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      s.namaMurid.toLowerCase().includes(q) ||
      s.tingkatanKelas.toLowerCase().includes(q) ||
      (s.noKp && s.noKp.includes(q))
    );
  });

  // ==========================================
  // OBJEKTIF HANDLERS
  // ==========================================
  const handleAddObjektif = () => {
    setObjektifList([...objektifList, '']);
  };

  const handleUpdateObjektif = (index: number, val: string) => {
    const updated = [...objektifList];
    updated[index] = val;
    setObjektifList(updated);
  };

  const handleRemoveObjektif = (index: number) => {
    if (objektifList.length <= 1) {
      setObjektifList(['']);
      return;
    }
    setObjektifList(objektifList.filter((_, i) => i !== index));
  };

  // ==========================================
  // IMAGE HANDLERS (EXACTLY 2 SLOTS - SUPABASE STORAGE BUCKET 'gambarpic')
  // ==========================================
  const handleUploadSlot = async (slotNumber: 1 | 2, file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      if (slotNumber === 1) {
        setIsProcessingPhoto1(true);
        setUploadingSlot1(true);
      } else {
        setIsProcessingPhoto2(true);
        setUploadingSlot2(true);
      }

      // 1. Mampatkan imej & jana pratonton segera
      const { blob, dataUrl } = await compressImageToBlobAndDataUrl(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');

      if (slotNumber === 1) {
        setPhoto1({ url: dataUrl, kapsyen: cleanName || 'Foto Aktiviti 1' });
      } else {
        setPhoto2({ url: dataUrl, kapsyen: cleanName || 'Foto Aktiviti 2' });
      }

      // 2. Muat naik secara terus ke Supabase Storage (Bucket: 'gambarpic')
      const unitPrefix = activeUnit?.id || 'smk_madai';
      const uploadRes = await uploadImageToSupabaseStorage(blob, `${unitPrefix}_slot${slotNumber}`);

      if (uploadRes.success && uploadRes.url) {
        if (slotNumber === 1) {
          setPhoto1({ url: uploadRes.url, kapsyen: cleanName || 'Foto Aktiviti 1' });
          setSlot1Source('supabase');
        } else {
          setPhoto2({ url: uploadRes.url, kapsyen: cleanName || 'Foto Aktiviti 2' });
          setSlot2Source('supabase');
        }
        setUploadNotice(`Gambar ${slotNumber} berjaya disimpan ke Supabase Storage (bucket "gambarpic")!`);
        setTimeout(() => setUploadNotice(null), 5000);
      } else {
        // Fallback kepada dataUrl tempatan jika bucket belum sedia
        if (slotNumber === 1) {
          setSlot1Source('local');
        } else {
          setSlot2Source('local');
        }
        setStorageRlsError(true);
        console.warn(`Muat naik ke Supabase bucket gambarpic memerlukan polisi:`, uploadRes.error);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal memproses fail imej.');
    } finally {
      if (slotNumber === 1) {
        setIsProcessingPhoto1(false);
        setUploadingSlot1(false);
      } else {
        setIsProcessingPhoto2(false);
        setUploadingSlot2(false);
      }
    }
  };

  // Contoh Pantas
  const handleAutoFillSample = () => {
    if (!activeUnit) return;
    setTajukAktiviti(`Perjumpaan Mingguan & Amali Asas ${activeUnit.nama}`);
    setJenisRekod('Perjumpaan Mingguan');
    setPeringkat('Sekolah');
    setTarikh('2026-09-23');
    setMasaMula('14:30');
    setMasaTamat('16:30');
    setTempat(activeUnit.tempatBiasa || 'Dewan Perdana SMK Madai');
    setObjektifList([
      'Meningkatkan kefahaman teori dan disiplin kokurikulum SMK Madai.',
      'Menjalankan aktiviti amali berpasukan mengikut silibus standard kokurikulum.',
      'Melatih kepimpinan murid dan kerjasama berpasukan yang erat.'
    ]);
    setRefleksi(`Aktiviti berjalan dengan lancar dan berkesan. 90% ahli hadir tepat pada masanya dengan pakaian seragam yang lengkap dan berdisiplin tinggi. Murid menguasai kemahiran amali berpasukan dengan bimbingan guru penasihat.`);
    setPencapaian(`Murid berjaya menguasai kemahiran asas modul dengan cemerlang.`);
    setStatus('Selesai');

    // Gambar Contoh Pantas
    setPhoto1({
      url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      kapsyen: `Sesi latihan amali bersama ahli ${activeUnit.nama}`,
    });
    setPhoto2({
      url: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
      kapsyen: `Demonstrasi kemahiran dipimpin guru penasihat`,
    });

    handleSelectAllStudents();
    setErrorMsg(null);
  };

  // ==========================================
  // SUBMIT HANDLER
  // ==========================================
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedUnitId) {
      setErrorMsg('Sila pilih unit kokurikulum yang berkaitan.');
      return;
    }
    if (!tajukAktiviti.trim()) {
      setErrorMsg('Sila isikan tajuk aktiviti.');
      return;
    }
    if (!tempat.trim()) {
      setErrorMsg('Sila isikan tempat atau lokasi aktiviti.');
      return;
    }
    if (!refleksi.trim()) {
      setErrorMsg('Sila isikan catatan refleksi aktiviti.');
      return;
    }

    const cleanObjektif = objektifList.map((o) => o.trim()).filter((o) => o.length > 0);
    const finalObjektif = cleanObjektif.length > 0 
      ? cleanObjektif 
      : ['Menjayakan aktiviti perjumpaan kokurikulum mengikut perancangan tahunan 2026.'];

    // Sediakan senarai gambar (maksima 2 keping)
    const finalGambarList: GambarAktiviti[] = [];
    if (photo1 && photo1.url) {
      finalGambarList.push({
        id: `img-1-${Date.now()}`,
        url: photo1.url,
        kapsyen: photo1.kapsyen.trim() || 'Foto Aktiviti 1',
      });
    }
    if (photo2 && photo2.url) {
      finalGambarList.push({
        id: `img-2-${Date.now()}`,
        url: photo2.url,
        kapsyen: photo2.kapsyen.trim() || 'Foto Aktiviti 2',
      });
    }

    const recordToSave: RekodKokurikulum = {
      id: isEditing && editingRecord ? editingRecord.id : `rec_${Date.now()}`,
      unitId: selectedUnitId,
      namaUnit: activeUnit ? activeUnit.nama : 'Unit Kokurikulum',
      kategoriUnit: activeUnit ? activeUnit.kategori : 'Kelab & Persatuan',
      jenisRekod,
      tajukAktiviti: tajukAktiviti.trim(),
      tarikh,
      masaMula,
      masaTamat,
      tempat: tempat.trim(),
      peringkat,
      objektif: finalObjektif,
      sasaranPenglibatan: {
        bilanganMuridHadir,
        jumlahAhli,
        peratusKehadiran: calculatedPercent,
        bilanganGuruHadir,
        kumpulanSasaran: kumpulanSasaran.trim() || 'Semua ahli berdaftar',
      },
      ringkasanAktiviti: refleksi.trim(),
      pencapaian: pencapaian.trim(),
      refleksiKekuatan: refleksi.trim(),
      refleksiPenambahbaikan: '',
      gambar: finalGambarList,
      namaPelapor: namaPelapor.trim() || activeUnit?.guruPenyelaras || 'Guru Penyelaras',
      jawatanPelapor: jawatanPelapor.trim() || `Guru Penyelaras ${activeUnit?.nama || ''}`,
      status,
      diciptaPada: isEditing && editingRecord ? editingRecord.diciptaPada : new Date().toISOString(),
      dikemaskiniPada: new Date().toISOString(),
    };

    onSaveRecord(recordToSave);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* 1. TOP HEADER / EDIT BANNER */}
      <div className={`p-5 rounded-2xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isEditing 
          ? 'bg-amber-50 border-amber-200 text-amber-900' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              {isEditing ? 'Kemaskini Rekod Aktiviti' : 'Daftar Rekod Aktiviti Kokurikulum SMK Madai 2026'}
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isEditing ? 'bg-amber-200 text-amber-900' : 'bg-blue-100 text-blue-800'
            }`}>
              {isEditing ? 'Mod Kemaskini' : 'Borang Baharu'}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {isEditing 
              ? `Mengemas kini maklumat bagi "${editingRecord?.tajukAktiviti}".`
              : 'Isi maklumat aktiviti mengikut sub-menu (1), (2), dan (3) untuk menjana One Page Report (OPR) secara automatik.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              type="button"
              onClick={handleAutoFillSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
              title="Isi contoh lengkap aktiviti SMK Madai dalam 1 klik"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Isi Contoh Pantas</span>
            </button>
          )}

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              Batal
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ========================================================================= */}
        {/* SUB-MENU (1): MAKLUMAT PERJUMPAAN (TERMASUK OBJEKTIF) */}
        {/* ========================================================================= */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-base font-bold text-slate-800">
                (1) Maklumat Perjumpaan
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              SMK Madai • Sesi 2026
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {/* Unit Kokurikulum */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700">
                  Pilih Unit Kokurikulum <span className="text-rose-500">*</span>
                </label>
                {unitStudents.length > 0 ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {unitStudents.length} Murid Berdaftar
                  </span>
                ) : onOpenImportForUnit ? (
                  <button
                    type="button"
                    onClick={() => onOpenImportForUnit(selectedUnitId)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline"
                  >
                    + Import Senarai Murid
                  </button>
                ) : null}
              </div>
              <select
                value={selectedUnitId}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500"
              >
                <optgroup label="Unit Beruniform (11 Unit)">
                  {units.filter((u) => u.kategori === 'Unit Beruniform').map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama} ({u.kodUnit})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Kelab & Persatuan (18 Unit)">
                  {units.filter((u) => u.kategori === 'Kelab & Persatuan').map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama} ({u.kodUnit})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Sukan & Permainan (12 Unit)">
                  {units.filter((u) => u.kategori === 'Sukan & Permainan').map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama} ({u.kodUnit})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Kategori (Auto-read) */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kategori Unit
              </label>
              <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-semibold truncate">
                {activeUnit ? activeUnit.kategori : '-'}
              </div>
            </div>

            {/* Tajuk Aktiviti */}
            <div className="sm:col-span-2 md:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">
                Tajuk Aktiviti / Perjumpaan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={tajukAktiviti}
                onChange={(e) => setTajukAktiviti(e.target.value)}
                placeholder="Contoh: Perjumpaan Mingguan Ke-4: Kemahiran Asas Ikatan & Simpulan"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 bg-white font-medium"
              />
            </div>

            {/* Jenis Rekod: HANYA ADA 3: Perjumpaan Mingguan, Penglibatan, Pencapaian */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jenis Rekod <span className="text-rose-500">*</span>
              </label>
              <select
                value={jenisRekod}
                onChange={(e) => setJenisRekod(e.target.value as 'Perjumpaan Mingguan' | 'Penglibatan' | 'Pencapaian')}
                className="w-full px-3 py-2 rounded-xl border border-blue-300 text-blue-900 font-bold text-xs bg-blue-50/40 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Perjumpaan Mingguan">Perjumpaan Mingguan</option>
                <option value="Penglibatan">Penglibatan</option>
                <option value="Pencapaian">Pencapaian</option>
              </select>
            </div>

            {/* Peringkat */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Peringkat Aktiviti
              </label>
              <select
                value={peringkat}
                onChange={(e) => setPeringkat(e.target.value as PeringkatAktiviti)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs bg-white font-medium"
              >
                <option value="Sekolah">Peringkat Sekolah</option>
                <option value="Zon / Daerah">Zon / Daerah (MSSD)</option>
                <option value="Negeri">Peringkat Negeri (MSSN)</option>
                <option value="Kebangsaan">Peringkat Kebangsaan</option>
                <option value="Antarabangsa">Peringkat Antarabangsa</option>
              </select>
            </div>

            {/* Tarikh */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tarikh Aktiviti <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={tarikh}
                onChange={(e) => setTarikh(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs bg-white font-medium"
              />
            </div>

            {/* Masa Mula & Tamat */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Masa Mula
              </label>
              <input
                type="time"
                value={masaMula}
                onChange={(e) => setMasaMula(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Masa Tamat
              </label>
              <input
                type="time"
                value={masaTamat}
                onChange={(e) => setMasaTamat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs bg-white"
              />
            </div>

            {/* Tempat */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tempat / Lokasi Aktiviti <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={tempat}
                onChange={(e) => setTempat(e.target.value)}
                placeholder="Contoh: Gelanggang Bola Jaring / Makmal Komputer SMK Madai"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-xs bg-white"
              />
            </div>
          </div>

          {/* OBJEKTIF AKTIVITI (DILETAKKAN DI SUB-MENU 1) */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-800 text-xs">
                Objektif Aktiviti / Perjumpaan
              </label>
              <button
                type="button"
                onClick={handleAddObjektif}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Objektif</span>
              </button>
            </div>

            <div className="space-y-2">
              {objektifList.map((obj, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 text-center text-xs font-bold text-slate-400">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => handleUpdateObjektif(idx, e.target.value)}
                    placeholder={`Objektif ${idx + 1}`}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveObjektif(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Buang objektif ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-MENU (2): KEHADIRAN MURID & GURU */}
        {/* ========================================================================= */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-base font-bold text-slate-800">
                (2) Kehadiran Murid & Guru
              </h3>
            </div>

            {/* LIVE DISPLAY KEHADIRAN MURID & GURU */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <div className="px-3 py-1 rounded-full font-bold bg-blue-100 text-blue-900 border border-blue-200">
                Murid Hadir: <span className="text-blue-700 font-black">{bilanganMuridHadir}</span> / {jumlahAhli} ({calculatedPercent}%)
              </div>
              <div className="px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                Guru Hadir: <span className="text-emerald-700 font-black">{bilanganGuruHadir}</span> Orang
              </div>
            </div>
          </div>

          {/* BAHAGIAN A: SENARAI MURID UNTUK DITANDA KEHADIRAN (TINGKATAN-KELAS-NAMA) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Senarai Kehadiran Murid (Susunan: Tingkatan - Kelas - Nama)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Tandakan pada petak murid yang hadir. Jumlah murid hadir akan dikira secara automatik.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSelectAllStudents}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Tanda Semua Hadir
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllStudents}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-colors"
                >
                  Kosongkan
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Murid</span>
                </button>
              </div>
            </div>

            {/* Carian Pantas Senarai Murid */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Cari murid mengikut tingkatan, kelas, atau nama..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs focus:bg-white"
              />
            </div>

            {/* JADUAL SENARAI MURID (DISUSUN TINGKATAN-KELAS-NAMA) */}
            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/50">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-2 w-12 text-center">Hadir</th>
                    <th className="p-2 w-10 text-center">Bil</th>
                    <th className="p-2 w-32">Tingkatan - Kelas</th>
                    <th className="p-2">Nama Penuh Murid</th>
                    <th className="p-2 w-28">No. KP</th>
                    <th className="p-2 w-24">Jawatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400 text-xs">
                        Tiada murid yang sepadan dengan carian.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((m, idx) => {
                      const isChecked = selectedStudentIds.includes(m.id);
                      return (
                        <tr 
                          key={m.id}
                          onClick={() => toggleStudent(m.id)}
                          className={`cursor-pointer transition-colors ${
                            isChecked ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="p-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleStudent(m.id)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-2 text-center text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-2">
                            <span className="inline-block px-2 py-0.5 rounded font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                              {m.tingkatanKelas}
                            </span>
                          </td>
                          <td className="p-2 font-bold text-slate-900">
                            {m.namaMurid}
                          </td>
                          <td className="p-2 text-slate-500 font-mono text-[11px]">
                            {m.noKp || '-'}
                          </td>
                          <td className="p-2 text-slate-600 text-[11px]">
                            {m.jawatan || 'Ahli'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* BAHAGIAN B: SENARAI NAMA GURU YANG HADIR */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Senarai Guru Penasihat / Pembimbing yang Hadir</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Tandakan nama guru yang hadir bertugas. Jumlah guru hadir dipaparkan secara automatik.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddGuruInput(!showAddGuruInput)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors self-start"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Nama Guru</span>
              </button>
            </div>

            {/* Input Tambah Guru Bertugas */}
            {showAddGuruInput && (
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col sm:flex-row gap-2 animate-fadeIn text-xs">
                <input
                  type="text"
                  value={newGuruNama}
                  onChange={(e) => setNewGuruNama(e.target.value)}
                  placeholder="Nama Penuh Guru (cth: Cikgu Halimah binti Daud)"
                  className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-emerald-300 text-xs"
                />
                <input
                  type="text"
                  value={newGuruPeranan}
                  onChange={(e) => setNewGuruPeranan(e.target.value)}
                  placeholder="Peranan (cth: Guru Pembimbing)"
                  className="sm:w-44 px-3 py-1.5 bg-white rounded-lg border border-emerald-300 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddCustomGuru}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
                >
                  Simpan Guru
                </button>
              </div>
            )}

            {/* Senarai Pilihan Guru */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
              {guruList.map((g) => {
                const isChecked = selectedGuruIds.includes(g.id);
                return (
                  <label
                    key={g.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleGuru(g.id)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold">{g.nama}</div>
                      <div className="text-[11px] text-slate-500">{g.peranan}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-MENU (3): RUMUSAN DAN FOTO AKTIVITI (HANYA REFLEKSI & 2 FOTO) */}
        {/* ========================================================================= */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-base font-bold text-slate-800">
                (3) Rumusan & Foto Aktiviti
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Ruang Refleksi & 2 Keping Gambar
            </span>
          </div>

          {/* 1. RUANG REFLEKSI AKTIVITI */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Refleksi Aktiviti <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={refleksi}
                onChange={(e) => setRefleksi(e.target.value)}
                placeholder="Catat refleksi kekuatan perjumpaan, tahap penglibatan murid, dan aspek penambahbaikan untuk sesi akan datang..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 bg-white font-medium"
              />
            </div>

            {/* Pencapaian (Jika ada) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Pencapaian / Hasil Impak (Jika ada)</span>
              </label>
              <input
                type="text"
                value={pencapaian}
                onChange={(e) => setPencapaian(e.target.value)}
                placeholder="Contoh: Johan / Selesai Modul 1 / 100% murid melepasi ujian kemahiran"
                className="w-full px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-800 text-xs bg-white"
              />
            </div>
          </div>

          {/* 2. DUA (2) KEPING GAMBAR UNTUK GURU PENASIHAT UPLOAD */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span>2 Keping Gambar Aktiviti</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Bucket: gambarpic
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Gambar yang dimuat naik akan disimpan terus ke Supabase Storage (bucket <code className="text-emerald-700 font-semibold">gambarpic</code>) untuk paparan OPR.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 self-start sm:self-auto">
                {(photo1 ? 1 : 0) + (photo2 ? 1 : 0)} / 2 Gambar
              </span>
            </div>

            {/* Notis Muat Naik Supabase */}
            {uploadNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{uploadNotice}</span>
              </div>
            )}

            {/* Peringatan Polisi Keselamatan (RLS) Supabase Storage */}
            {storageRlsError && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-amber-900">Perhatian: Polisi Keselamatan (RLS) Bucket "gambarpic" Diperlukan</h5>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        Supabase menyekat muat naik fail kerana bucket <code className="font-bold bg-amber-100 px-1 rounded">gambarpic</code> belum mempunyai Polisi Row-Level Security (RLS) untuk akses muat naik awam. Sila salin skrip SQL di bawah dan jalankan di Supabase SQL Editor.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStorageRlsError(false)}
                    className="text-amber-500 hover:text-amber-800 p-1"
                    title="Tutup"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 pl-7">
                  <button
                    type="button"
                    onClick={copyStorageSql}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedStorageSql ? 'Berjaya Disalin!' : 'Salin Skrip Polisi SQL'}</span>
                  </button>
                  <a
                    href="https://supabase.com/dashboard/project/tyidfdplrirkfpjmnjoz/sql/new"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                    <span>Buka Supabase SQL Editor</span>
                  </a>
                </div>
              </div>
            )}

            {/* GRID DUA SLOT GAMBAR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* SLOT 1 */}
              <div className="p-4 rounded-2xl border border-slate-300 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 text-xs">
                      Gambar Aktiviti 1
                    </span>
                    {photo1 && (photo1.url.includes('supabase.co') || slot1Source === 'supabase') && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>gambarpic</span>
                      </span>
                    )}
                  </div>
                  {photo1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto1(null);
                        setSlot1Source(null);
                      }}
                      className="text-rose-600 hover:text-rose-800 font-semibold text-[11px] flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Padam</span>
                    </button>
                  )}
                </div>

                {photo1 ? (
                  <div className="space-y-2 relative">
                    <div className="relative h-44 rounded-xl overflow-hidden border border-slate-300 bg-black flex items-center justify-center">
                      <img
                        src={photo1.url}
                        alt="Foto 1"
                        className="w-full h-full object-cover"
                      />
                      {uploadingSlot1 && (
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white z-10 p-3 text-center">
                          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mb-1.5" />
                          <span className="text-xs font-bold">Menyimpan ke Supabase...</span>
                          <span className="text-[10px] text-emerald-200 font-mono">Bucket: gambarpic</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={photo1.kapsyen}
                      onChange={(e) => setPhoto1({ ...photo1, kapsyen: e.target.value })}
                      placeholder="Kapsyen Foto 1..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef1.current?.click()}
                    className="relative h-44 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer bg-white hover:bg-blue-50/30 transition-colors overflow-hidden"
                  >
                    <input
                      ref={fileInputRef1}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadSlot(1, file);
                      }}
                      className="hidden"
                    />
                    {uploadingSlot1 ? (
                      <div className="flex flex-col items-center justify-center text-slate-700">
                        <RefreshCw className="w-7 h-7 animate-spin text-emerald-600 mb-1.5" />
                        <p className="font-bold text-xs">Memuat naik ke Supabase...</p>
                        <p className="text-[10px] text-emerald-700">Bucket: gambarpic</p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-blue-600 mb-1" />
                        <p className="font-bold text-slate-800 text-xs">
                          {isProcessingPhoto1 ? 'Memproses fail...' : 'Pilih / Upload Gambar 1'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Disimpan terus ke bucket <span className="font-semibold text-emerald-600">gambarpic</span>
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* SLOT 2 */}
              <div className="p-4 rounded-2xl border border-slate-300 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 text-xs">
                      Gambar Aktiviti 2
                    </span>
                    {photo2 && (photo2.url.includes('supabase.co') || slot2Source === 'supabase') && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>gambarpic</span>
                      </span>
                    )}
                  </div>
                  {photo2 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto2(null);
                        setSlot2Source(null);
                      }}
                      className="text-rose-600 hover:text-rose-800 font-semibold text-[11px] flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Padam</span>
                    </button>
                  )}
                </div>

                {photo2 ? (
                  <div className="space-y-2 relative">
                    <div className="relative h-44 rounded-xl overflow-hidden border border-slate-300 bg-black flex items-center justify-center">
                      <img
                        src={photo2.url}
                        alt="Foto 2"
                        className="w-full h-full object-cover"
                      />
                      {uploadingSlot2 && (
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white z-10 p-3 text-center">
                          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mb-1.5" />
                          <span className="text-xs font-bold">Menyimpan ke Supabase...</span>
                          <span className="text-[10px] text-emerald-200 font-mono">Bucket: gambarpic</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={photo2.kapsyen}
                      onChange={(e) => setPhoto2({ ...photo2, kapsyen: e.target.value })}
                      placeholder="Kapsyen Foto 2..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef2.current?.click()}
                    className="relative h-44 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center p-4 text-center cursor-pointer bg-white hover:bg-blue-50/30 transition-colors overflow-hidden"
                  >
                    <input
                      ref={fileInputRef2}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadSlot(2, file);
                      }}
                      className="hidden"
                    />
                    {uploadingSlot2 ? (
                      <div className="flex flex-col items-center justify-center text-slate-700">
                        <RefreshCw className="w-7 h-7 animate-spin text-emerald-600 mb-1.5" />
                        <p className="font-bold text-xs">Memuat naik ke Supabase...</p>
                        <p className="text-[10px] text-emerald-700">Bucket: gambarpic</p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-blue-600 mb-1" />
                        <p className="font-bold text-slate-800 text-xs">
                          {isProcessingPhoto2 ? 'Memproses fail...' : 'Pilih / Upload Gambar 2'}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Disimpan terus ke bucket <span className="font-semibold text-emerald-600">gambarpic</span>
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* PENGESAHAN & BUTANG SIMPAN */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Guru Pelapor Dropdown Menu */}
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-700 whitespace-nowrap flex items-center gap-1">
                <span>Guru Pelapor:</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={namaPelapor || activeUnit?.guruPenyelaras}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  setNamaPelapor(selectedName);
                  const selectedG = guruList.find((g) => g.nama === selectedName);
                  if (selectedG) {
                    setJawatanPelapor(`${selectedG.peranan} ${activeUnit?.nama || ''}`);
                  }
                }}
                className="px-3 py-1.5 rounded-xl border border-blue-300 bg-blue-50/40 text-blue-950 font-bold text-xs focus:ring-2 focus:ring-blue-500"
              >
                {guruList.map((g) => (
                  <option key={g.id} value={g.nama}>
                    {g.nama} ({g.peranan})
                  </option>
                ))}
              </select>
            </div>

            <span className="hidden sm:inline text-slate-300">|</span>

            {/* Status Laporan */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 whitespace-nowrap">Status Laporan:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusLaporan)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 font-bold bg-white text-xs text-slate-800"
              >
                <option value="Selesai">Selesai (Lengkap)</option>
                <option value="Perlu Kemaskini">Perlu Kemaskini</option>
                <option value="Draf">Draf</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Kemaskini Rekod' : 'Simpan Rekod & Jana OPR'}</span>
            </button>
          </div>
        </div>

      </form>

      {/* MODAL TAMBAH MURID INLINE */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-5 space-y-3 text-xs animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                Tambah Murid Baharu — {activeUnit?.nama}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddInlineStudent} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Penuh Murid *</label>
                <input
                  type="text"
                  required
                  value={newStudentNama}
                  onChange={(e) => setNewStudentNama(e.target.value)}
                  placeholder="Contoh: Muhammad Danial bin Razak"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tingkatan / Kelas *</label>
                <input
                  type="text"
                  required
                  value={newStudentKelas}
                  onChange={(e) => setNewStudentKelas(e.target.value)}
                  placeholder="Contoh: 4 Cemerlang / PPKI Al-Farabi"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Kad Pengenalan</label>
                <input
                  type="text"
                  value={newStudentNoKp}
                  onChange={(e) => setNewStudentNoKp(e.target.value)}
                  placeholder="090514-12-XXXX"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Simpan & Tandakan Hadir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
