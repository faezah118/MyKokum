import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { RekodKokurikulum, UnitKokurikulum, MuridUnit } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: true,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const FIREBASE_CONFIG_KEY = 'mykokum_firebase_config_v1';

export const getStoredFirebaseConfig = (): FirebaseConfig | null => {
  try {
    // 1. Check environment variables first
    const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (envApiKey && envProjectId) {
      return {
        apiKey: envApiKey,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
        projectId: envProjectId,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      };
    }

    // 2. Check localStorage
    const saved = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Ralat membaca konfigurasi Firebase:', err);
  }
  return null;
};

export const saveStoredFirebaseConfig = (config: FirebaseConfig | null): void => {
  if (!config) {
    localStorage.removeItem(FIREBASE_CONFIG_KEY);
  } else {
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
  }
};

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;

export const getFirebaseServices = (): { app: FirebaseApp | null; db: Firestore | null } => {
  const config = getStoredFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return { app: null, db: null };
  }

  try {
    if (!cachedApp) {
      if (getApps().length > 0) {
        cachedApp = getApp();
      } else {
        cachedApp = initializeApp(config);
      }
    }
    if (!cachedDb && cachedApp) {
      cachedDb = getFirestore(cachedApp);
    }
    return { app: cachedApp, db: cachedDb };
  } catch (err) {
    console.error('Gagal memulakan perkhidmatan Firebase:', err);
    return { app: null, db: null };
  }
};

export const isFirebaseConfigured = (): boolean => {
  const { db } = getFirebaseServices();
  return db !== null;
};

// ==========================================
// OPERASI REKOD KOKURIKULUM
// ==========================================
export const syncRecordToFirestore = async (record: RekodKokurikulum): Promise<void> => {
  const { db } = getFirebaseServices();
  if (!db) return;
  const path = `records/${record.id}`;
  try {
    await setDoc(doc(db, 'records', record.id), record);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteRecordFromFirestore = async (recordId: string): Promise<void> => {
  const { db } = getFirebaseServices();
  if (!db) return;
  const path = `records/${recordId}`;
  try {
    await deleteDoc(doc(db, 'records', recordId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

export const listenToRecordsFromFirestore = (
  onRecordsUpdate: (records: RekodKokurikulum[]) => void
): (() => void) => {
  const { db } = getFirebaseServices();
  if (!db) return () => {};

  return onSnapshot(
    collection(db, 'records'),
    (snapshot) => {
      const records: RekodKokurikulum[] = [];
      snapshot.forEach((d) => {
        records.push(d.data() as RekodKokurikulum);
      });
      // Susun mengikut tarikh terkini
      records.sort((a, b) => new Date(b.tarikh).getTime() - new Date(a.tarikh).getTime());
      if (records.length > 0) {
        onRecordsUpdate(records);
      }
    },
    (err) => {
      console.warn('Perhatian pendengar Firestore Rekod:', err.message);
    }
  );
};

// ==========================================
// OPERASI SENARAI MURID
// ==========================================
export const syncStudentToFirestore = async (student: MuridUnit): Promise<void> => {
  const { db } = getFirebaseServices();
  if (!db) return;
  const path = `students/${student.id}`;
  try {
    await setDoc(doc(db, 'students', student.id), student);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteStudentFromFirestore = async (studentId: string): Promise<void> => {
  const { db } = getFirebaseServices();
  if (!db) return;
  const path = `students/${studentId}`;
  try {
    await deleteDoc(doc(db, 'students', studentId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

export const listenToStudentsFromFirestore = (
  onStudentsUpdate: (students: MuridUnit[]) => void
): (() => void) => {
  const { db } = getFirebaseServices();
  if (!db) return () => {};

  return onSnapshot(
    collection(db, 'students'),
    (snapshot) => {
      const students: MuridUnit[] = [];
      snapshot.forEach((d) => {
        students.push(d.data() as MuridUnit);
      });
      if (students.length > 0) {
        onStudentsUpdate(students);
      }
    },
    (err) => {
      console.warn('Perhatian pendengar Firestore Murid:', err.message);
    }
  );
};

// ==========================================
// SEGERAK SEMUA DATA TEMPATAN KE CLOUD
// ==========================================
export const batchUploadLocalToFirestore = async (
  records: RekodKokurikulum[],
  students: MuridUnit[],
  units: UnitKokurikulum[]
): Promise<{ success: boolean; count: number; error?: string }> => {
  const { db } = getFirebaseServices();
  if (!db) {
    return { success: false, count: 0, error: 'Firebase belum dikonfigurasi.' };
  }

  try {
    const batch = writeBatch(db);
    let count = 0;

    // Masukkan rekod (sehingga 400 dokumen dalam 1 batch)
    for (const rec of records.slice(0, 200)) {
      batch.set(doc(db, 'records', rec.id), rec);
      count++;
    }

    for (const std of students.slice(0, 150)) {
      batch.set(doc(db, 'students', std.id), std);
      count++;
    }

    for (const u of units.slice(0, 50)) {
      batch.set(doc(db, 'units', u.id), u);
      count++;
    }

    await batch.commit();
    return { success: true, count };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Ralat segerak pukal ke Firestore:', errorMsg);
    return { success: false, count: 0, error: errorMsg };
  }
};
