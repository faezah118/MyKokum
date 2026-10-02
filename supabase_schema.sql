-- ============================================================
-- SKRIP STRUKTUR JADUAL SUPABASE UNTUK MYKOKUM+ SMK MADAI 2026
-- Buka Supabase Dashboard -> SQL Editor -> Tampal skrip ini & klik RUN
-- ============================================================

-- 1. Jadual Unit Kokurikulum (41 Unit)
CREATE TABLE IF NOT EXISTS units (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL,
  guru_penyelaras TEXT,
  bilangan_ahli INTEGER DEFAULT 0,
  hari_perjumpaan TEXT DEFAULT 'Rabu',
  masa_perjumpaan TEXT DEFAULT '2.00 - 4.00 Petang',
  tempat_biasa TEXT DEFAULT 'Kawasan Sekolah',
  kod_unit TEXT,
  warna_tema TEXT DEFAULT 'blue',
  sasaran_perjumpaan INTEGER DEFAULT 12,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Jadual Senarai Murid Unit
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL,
  nama_murid TEXT NOT NULL,
  no_kp TEXT,
  tingkatan_kelas TEXT,
  jantina TEXT,
  jawatan TEXT,
  tarikh_didaftar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Jadual Rekod Aktiviti Kokurikulum & OPR
CREATE TABLE IF NOT EXISTS records (
  id TEXT PRIMARY KEY,
  unit_id TEXT NOT NULL,
  nama_unit TEXT NOT NULL,
  kategori_unit TEXT,
  tajuk_aktiviti TEXT NOT NULL,
  jenis_rekod TEXT NOT NULL,
  peringkat TEXT DEFAULT 'Sekolah',
  tarikh TEXT NOT NULL,
  masa_mula TEXT,
  masa_tamat TEXT,
  tempat TEXT,
  objektif JSONB DEFAULT '[]'::jsonb,
  sasaran_penglibatan JSONB,
  ringkasan_aktiviti TEXT,
  pencapaian TEXT,
  status TEXT DEFAULT 'Draf',
  nama_pelapor TEXT,
  jawatan_pelapor TEXT,
  refleksi_kekuatan TEXT,
  refleksi_penambahbaikan TEXT,
  gambar JSONB DEFAULT '[]'::jsonb,
  dicipta_pada TEXT,
  dikemaskini_pada TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Polisi Keselamatan (Row Level Security - RLS)
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- Benarkan capaian baca & tulis untuk guru-guru
DROP POLICY IF EXISTS "Akses Penuh Units" ON units;
CREATE POLICY "Akses Penuh Units" ON units FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Akses Penuh Students" ON students;
CREATE POLICY "Akses Penuh Students" ON students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Akses Penuh Records" ON records;
CREATE POLICY "Akses Penuh Records" ON records FOR ALL USING (true) WITH CHECK (true);
