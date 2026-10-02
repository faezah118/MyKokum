import { createClient } from '@supabase/supabase-js';
import { RekodKokurikulum, UnitKokurikulum, MuridUnit } from '../types';

// Konfigurasi Supabase projek faezah118 (MyKokum SMK Madai)
const DEFAULT_SUPABASE_URL = 'https://tyidfdplrirkfpjmnjoz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5aWRmZHBscmlya2Zwam1uam96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NDMzNTQsImV4cCI6MjEwNjUxOTM1NH0.KUqaMo_nJwOfqLdZZjlLVBTuri5AZfJQRIu8JEDAp1k';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
  },
});

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

// ==========================================
// PENGURUSAN REKOD AKTIVITI (SUPABASE)
// ==========================================
export const fetchRecordsFromSupabase = async (): Promise<RekodKokurikulum[] | null> => {
  try {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .order('tarikh', { ascending: false });

    if (error) {
      console.warn('Perhatian Supabase fetch records:', error.message);
      return null;
    }

    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      id: item.id,
      unitId: item.unit_id || item.unitId,
      namaUnit: item.nama_unit || item.namaUnit,
      kategoriUnit: item.kategori_unit || item.kategoriUnit,
      tajukAktiviti: item.tajuk_aktiviti || item.tajukAktiviti || 'Aktiviti Kokurikulum',
      jenisRekod: item.jenis_rekod || item.jenisRekod || 'Perjumpaan Mingguan',
      peringkat: item.peringkat || 'Sekolah',
      tarikh: item.tarikh,
      masaMula: item.masa_mula || item.masaMula || '14:00',
      masaTamat: item.masa_tamat || item.masaTamat || '16:00',
      tempat: item.tempat || 'Bilik Kokurikulum',
      objektif: Array.isArray(item.objektif) ? item.objektif : (item.objektif ? [item.objektif] : []),
      sasaranPenglibatan: item.sasaran_penglibatan || item.sasaranPenglibatan || {
        bilanganMuridHadir: 0,
        jumlahAhli: 0,
        peratusKehadiran: 0,
        bilanganGuruHadir: 1,
        kumpulanSasaran: 'Semua Ahli'
      },
      ringkasanAktiviti: item.ringkasan_aktiviti || item.ringkasanAktiviti || '',
      pencapaian: item.pencapaian || '',
      status: item.status || 'Draf',
      namaPelapor: item.nama_pelapor || item.namaPelapor || 'Guru Penasihat',
      jawatanPelapor: item.jawatan_pelapor || item.jawatanPelapor || 'Guru Penasihat',
      refleksiKekuatan: item.refleksi_kekuatan || item.refleksiKekuatan || '',
      refleksiPenambahbaikan: item.refleksi_penambahbaikan || item.refleksiPenambahbaikan || '',
      gambar: Array.isArray(item.gambar) ? item.gambar : [],
      diciptaPada: item.dicipta_pada || item.diciptaPada || new Date().toISOString(),
      dikemaskiniPada: item.dikemaskini_pada || item.dikemaskiniPada || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Ralat fetching rekod Supabase:', err);
    return null;
  }
};

export const syncRecordToSupabase = async (record: RekodKokurikulum): Promise<boolean> => {
  try {
    const payload = {
      id: record.id,
      unit_id: record.unitId,
      nama_unit: record.namaUnit,
      kategori_unit: record.kategoriUnit,
      tajuk_aktiviti: record.tajukAktiviti,
      jenis_rekod: record.jenisRekod,
      peringkat: record.peringkat,
      tarikh: record.tarikh,
      masa_mula: record.masaMula,
      masa_tamat: record.masaTamat,
      tempat: record.tempat,
      objektif: record.objektif,
      sasaran_penglibatan: record.sasaranPenglibatan,
      ringkasan_aktiviti: record.ringkasanAktiviti,
      pencapaian: record.pencapaian,
      status: record.status,
      nama_pelapor: record.namaPelapor,
      jawatan_pelapor: record.jawatanPelapor,
      refleksi_kekuatan: record.refleksiKekuatan,
      refleksi_penambahbaikan: record.refleksiPenambahbaikan,
      gambar: record.gambar,
      dicipta_pada: record.diciptaPada,
      dikemaskini_pada: record.dikemaskiniPada || new Date().toISOString(),
    };

    const { error } = await supabase.from('records').upsert(payload);
    if (error) {
      console.warn('Gagal upsert rekod ke Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Ralat menyegerak rekod ke Supabase:', err);
    return false;
  }
};

export const deleteRecordFromSupabase = async (recordId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('records').delete().eq('id', recordId);
    if (error) {
      console.warn('Gagal memadam rekod di Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Ralat memadam rekod di Supabase:', err);
    return false;
  }
};

// ==========================================
// PENGURUSAN SENARAI MURID (SUPABASE)
// ==========================================
export const fetchStudentsFromSupabase = async (): Promise<MuridUnit[] | null> => {
  try {
    const { data, error } = await supabase.from('students').select('*');
    if (error) {
      console.warn('Perhatian Supabase fetch students:', error.message);
      return null;
    }

    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      id: item.id,
      unitId: item.unit_id || item.unitId,
      namaMurid: item.nama_murid || item.namaMurid,
      noKp: item.no_kp || item.noKp || '',
      tingkatanKelas: item.tingkatan_kelas || item.tingkatanKelas || 'Tingkatan 1',
      jantina: item.jantina || 'Lelaki',
      jawatan: item.jawatan || 'Ahli Aktif',
      tarikhDidaftar: item.tarikh_didaftar || item.tarikhDidaftar || '',
    }));
  } catch (err) {
    console.error('Ralat fetch murid dari Supabase:', err);
    return null;
  }
};

export const syncStudentToSupabase = async (student: MuridUnit): Promise<boolean> => {
  try {
    const payload = {
      id: student.id,
      unit_id: student.unitId,
      nama_murid: student.namaMurid,
      no_kp: student.noKp,
      tingkatan_kelas: student.tingkatanKelas,
      jantina: student.jantina,
      jawatan: student.jawatan,
      tarikh_didaftar: student.tarikhDidaftar,
    };
    const { error } = await supabase.from('students').upsert(payload);
    if (error) {
      console.warn('Gagal upsert murid ke Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Ralat sync murid ke Supabase:', err);
    return false;
  }
};

export const deleteStudentFromSupabase = async (studentId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('students').delete().eq('id', studentId);
    if (error) {
      console.warn('Gagal memadam murid di Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Ralat memadam murid di Supabase:', err);
    return false;
  }
};

// ==========================================
// PENGURUSAN UNIT KOKURIKULUM (SUPABASE)
// ==========================================
export const fetchUnitsFromSupabase = async (): Promise<UnitKokurikulum[] | null> => {
  try {
    const { data, error } = await supabase.from('units').select('*');
    if (error) {
      console.warn('Perhatian Supabase fetch units:', error.message);
      return null;
    }
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      id: item.id,
      nama: item.nama,
      kategori: item.kategori,
      guruPenyelaras: item.guru_penyelaras || item.guruPenyelaras || 'Penyelaras Unit',
      bilanganAhli: item.bilangan_ahli ?? item.bilanganAhli ?? 0,
      hariPerjumpaan: item.hari_perjumpaan || item.hariPerjumpaan || 'Rabu',
      masaPerjumpaan: item.masa_perjumpaan || item.masaPerjumpaan || '2.00 - 4.00 Petang',
      tempatBiasa: item.tempat_biasa || item.tempatBiasa || 'Kawasan Sekolah',
      kodUnit: item.kod_unit || item.kodUnit || item.id,
      warnaTema: item.warna_tema || item.warnaTema || 'blue',
      sasaranPerjumpaan: item.sasaran_perjumpaan ?? item.sasaranPerjumpaan ?? 12,
    }));
  } catch (err) {
    console.error('Ralat fetch units dari Supabase:', err);
    return null;
  }
};

export const syncUnitToSupabase = async (unit: UnitKokurikulum): Promise<boolean> => {
  try {
    const payload = {
      id: unit.id,
      nama: unit.nama,
      kategori: unit.kategori,
      guru_penyelaras: unit.guruPenyelaras,
      bilangan_ahli: unit.bilanganAhli,
      hari_perjumpaan: unit.hariPerjumpaan,
      masa_perjumpaan: unit.masaPerjumpaan,
      tempat_biasa: unit.tempatBiasa,
      kod_unit: unit.kodUnit,
      warna_tema: unit.warnaTema,
      sasaran_perjumpaan: unit.sasaranPerjumpaan,
    };
    const { error } = await supabase.from('units').upsert(payload);
    if (error) {
      console.warn('Gagal upsert unit ke Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Ralat sync unit ke Supabase:', err);
    return false;
  }
};

// ==========================================
// MUAT NAIK PUKAL DARI TEMPATAN KE SUPABASE
// ==========================================
export const batchUploadLocalToSupabase = async (
  records: RekodKokurikulum[],
  students: MuridUnit[],
  units: UnitKokurikulum[]
): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    let count = 0;

    // 1. Upload Units
    if (units.length > 0) {
      const unitsPayload = units.map((u) => ({
        id: u.id,
        nama: u.nama,
        kategori: u.kategori,
        guru_penyelaras: u.guruPenyelaras,
        bilangan_ahli: u.bilanganAhli,
        hari_perjumpaan: u.hariPerjumpaan,
        masa_perjumpaan: u.masaPerjumpaan,
        tempat_biasa: u.tempatBiasa,
        kod_unit: u.kodUnit,
        warna_tema: u.warnaTema,
        sasaran_perjumpaan: u.sasaranPerjumpaan,
      }));
      const { error: uErr } = await supabase.from('units').upsert(unitsPayload);
      if (uErr) throw new Error(`Ralat jadual units: ${uErr.message}`);
      count += units.length;
    }

    // 2. Upload Students
    if (students.length > 0) {
      const studentsPayload = students.map((s) => ({
        id: s.id,
        unit_id: s.unitId,
        nama_murid: s.namaMurid,
        no_kp: s.noKp,
        tingkatan_kelas: s.tingkatanKelas,
        jantina: s.jantina,
        jawatan: s.jawatan,
        tarikh_didaftar: s.tarikhDidaftar,
      }));
      const { error: sErr } = await supabase.from('students').upsert(studentsPayload);
      if (sErr) throw new Error(`Ralat jadual students: ${sErr.message}`);
      count += students.length;
    }

    // 3. Upload Records
    if (records.length > 0) {
      const recordsPayload = records.map((r) => ({
        id: r.id,
        unit_id: r.unitId,
        nama_unit: r.namaUnit,
        kategori_unit: r.kategoriUnit,
        tajuk_aktiviti: r.tajukAktiviti,
        jenis_rekod: r.jenisRekod,
        peringkat: r.peringkat,
        tarikh: r.tarikh,
        masa_mula: r.masaMula,
        masa_tamat: r.masaTamat,
        tempat: r.tempat,
        objektif: r.objektif,
        sasaran_penglibatan: r.sasaranPenglibatan,
        ringkasan_aktiviti: r.ringkasanAktiviti,
        pencapaian: r.pencapaian,
        status: r.status,
        nama_pelapor: r.namaPelapor,
        jawatan_pelapor: r.jawatanPelapor,
        refleksi_kekuatan: r.refleksiKekuatan,
        refleksi_penambahbaikan: r.refleksiPenambahbaikan,
        gambar: r.gambar,
        dicipta_pada: r.diciptaPada,
        dikemaskini_pada: r.dikemaskiniPada,
      }));
      const { error: rErr } = await supabase.from('records').upsert(recordsPayload);
      if (rErr) throw new Error(`Ralat jadual records: ${rErr.message}`);
      count += records.length;
    }

    return { success: true, count };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, count: 0, error: msg };
  }
};

// ============================================================
// PENGURUSAN MUAT NAIK GAMBAR KE BUCKET SUPABASE ('gambarpic')
// ============================================================
export const SUPABASE_STORAGE_BUCKET = 'gambarpic';

export const uploadImageToSupabaseStorage = async (
  fileOrBlob: File | Blob,
  fileNamePrefix: string = 'aktiviti'
): Promise<{ success: boolean; url: string; error?: string }> => {
  try {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = fileOrBlob instanceof File 
      ? (fileOrBlob.name.split('.').pop() || 'jpg').toLowerCase()
      : 'jpg';
    
    // Format nama fail bersih untuk bucket gambarpic
    const safePrefix = fileNamePrefix.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const filePath = `rekod/${safePrefix}_${timestamp}_${randomStr}.${extension}`;

    const { data, error } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(filePath, fileOrBlob, {
        cacheControl: '3600',
        upsert: true,
        contentType: fileOrBlob.type || 'image/jpeg',
      });

    if (error) {
      console.warn('Ralat muat naik Supabase Storage (gambarpic):', error.message);
      return { success: false, url: '', error: error.message };
    }

    // Dapatkan Public URL daripada bucket
    const { data: publicUrlData } = supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(data.path);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      return { success: false, url: '', error: 'Gagal menjana URL awam dari Supabase Storage.' };
    }

    return { success: true, url: publicUrlData.publicUrl };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Pengecualian muat naik ke Supabase Storage (gambarpic):', msg);
    return { success: false, url: '', error: msg };
  }
};

