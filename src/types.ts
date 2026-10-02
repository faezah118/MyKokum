export type KategoriUnit = 'Sukan & Permainan' | 'Kelab & Persatuan' | 'Unit Beruniform';

export type PeringkatAktiviti = 
  | 'Sekolah'
  | 'Zon / Daerah'
  | 'Negeri'
  | 'Kebangsaan'
  | 'Antarabangsa';

export type JenisRekod = 
  | 'Perjumpaan Mingguan'
  | 'Penglibatan'
  | 'Pencapaian'
  | 'Pertandingan & Kejohanan'
  | 'Program / Kem / Kursus'
  | 'Pencapaian Khas';

export type StatusLaporan = 'Selesai' | 'Perlu Kemaskini' | 'Draf';

export interface MuridUnit {
  id: string;
  unitId: string;
  namaMurid: string;
  noKp?: string;
  tingkatanKelas: string;
  jantina?: 'Lelaki' | 'Perempuan';
  jawatan?: string; // Pengerusi, Naib Pengerusi, Setiausaha, Bendahari, AJK, Ahli Aktif
  tarikhDidaftar?: string;
}

export interface UnitKokurikulum {
  id: string;
  nama: string;
  kategori: KategoriUnit;
  guruPenyelaras: string;
  bilanganAhli: number;
  hariPerjumpaan: string;
  masaPerjumpaan: string;
  tempatBiasa: string;
  kodUnit: string;
  warnaTema: string;
  sasaranPerjumpaan: number; // Standard sekolah: 12 kali setahun
}

export interface GambarAktiviti {
  id: string;
  url: string;
  kapsyen: string;
}

export interface RekodKokurikulum {
  id: string;
  unitId: string;
  namaUnit: string;
  kategoriUnit: KategoriUnit;
  tajukAktiviti: string;
  jenisRekod: JenisRekod;
  peringkat: PeringkatAktiviti;
  tarikh: string; // YYYY-MM-DD
  masaMula: string;
  masaTamat: string;
  tempat: string;
  objektif: string[];
  sasaranPenglibatan: {
    bilanganMuridHadir: number;
    jumlahAhli: number;
    peratusKehadiran: number;
    bilanganGuruHadir: number;
    kumpulanSasaran: string;
  };
  ringkasanAktiviti: string;
  pencapaian: string;
  status: StatusLaporan;
  namaPelapor: string;
  jawatanPelapor: string;
  refleksiKekuatan: string;
  refleksiPenambahbaikan: string;
  gambar: GambarAktiviti[];
  diciptaPada: string;
  dikemaskiniPada: string;
}

export type ActiveTab = 'tambah' | 'laporan' | 'senarai' | 'carian' | 'analisis';
