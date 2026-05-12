import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot, getDocFromServer } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { type Photo, type Album } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// --- Auth Utilities ---
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create user profile in Firestore if it doesn't exist
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const now = Date.now();
    
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        createdAt: now,
      });
    }

    // Ensure default albums exist for this user - they are shared but check if they exist globally or should they be user-specific?
    // In our current rules, albums belong to a user. So they should be created if missing for this user.
    // However, the ID 'nature' is global in our rules right now. 
    // Let's make them global default IDs but ensure the userId matches the rule's expectation if we want users to "own" them.
    
    const defaultAlbums = [
      { id: 'nature', name: 'Nature Escapes', description: 'Breathtaking landscapes and wild wonders.' },
      { id: 'urban', name: 'Urban Explorer', description: 'City lights and architectural marvels.' }
    ];

    for (const album of defaultAlbums) {
      const albumRef = doc(db, 'albums', album.id);
      const albumSnap = await getDoc(albumRef);
      
      // If global album doesn't exist, create it owned by the first user who signs in (or we can just skip this and use default logic in rules)
      // Actually, my rules say: albumIdIsDefault(incoming().albumId) || exists(...) && userId == uid
      // If it IS a default ID, it passes the check! So we don't even NEED the document for default ones.
      // But for the UI to list them, we need them or have them hardcoded.
      
      if (!albumSnap.exists()) {
        await setDoc(albumRef, {
          ...album,
          userId: user.uid, // First person to sign in "owns" the default albums? Or we could make userId 'system'
          photoCount: 0,
          createdAt: now,
          coverUrl: album.id === 'nature' 
            ? 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000'
            : 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1000'
        });
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export function signOut() {
  return auth.signOut();
}

// --- Connection Test ---
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// --- Firestore Error Handler ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Data Services ---

export async function getUserPhotos(userId: string): Promise<Photo[]> {
  const path = 'photos';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Photo));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function getUserAlbums(userId: string): Promise<Album[]> {
  const path = 'albums';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Album));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function addPhoto(photoData: Omit<Photo, 'id' | 'createdAt'>) {
  const path = 'photos';
  try {
    const photoId = doc(collection(db, path)).id;
    const createdAt = Date.now();
    
    await setDoc(doc(db, path, photoId), {
      ...photoData,
      id: photoId,
      createdAt,
    });
    
    return photoId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function uploadFileWithProgress(
  file: File, 
  path: string, 
  onProgress: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        }, 
        (error) => {
          console.error('Storage Upload Error:', error);
          reject(new Error('Storage upload failed. Please check your connection or storage permissions.'));
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Storage Upload Error:', error);
    throw new Error('Storage upload failed. Please check your connection or storage permissions.');
  }
}

export async function deletePhoto(photoId: string) {
  const path = `photos/${photoId}`;
  try {
    const docRef = doc(db, 'photos', photoId);
    await setDoc(docRef, { deleted: true }, { merge: true }); // Or full delete
    // For this app, let's just delete the doc
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
