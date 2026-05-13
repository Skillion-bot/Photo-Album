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
      try {
        const albumSnap = await getDoc(albumRef);
        if (!albumSnap.exists()) {
          console.log(`Initializing default album: ${album.id}`);
          await setDoc(albumRef, {
            ...album,
            userId: user.uid,
            photoCount: 0,
            createdAt: now,
            coverUrl: album.id === 'nature' 
              ? 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000'
              : 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1000'
          });
        }
      } catch (err) {
        console.warn(`Could not verify/create default album ${album.id}:`, err);
        // We continue anyway as the rules allow uploading to these IDs without the doc existing
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error in signInWithGoogle:', error);
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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
  console.error('Firestore Error Detailed: ', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

// --- Data Services ---

export async function getUserPhotos(userId: string, albumId: string): Promise<Photo[]> {
  const path = 'photos';
  try {
    // Robust filter as requested
    const q = query(
      collection(db, path), 
      where('userId', '==', userId),
      where('albumId', '==', albumId)
    );
    
    const snapshot = await getDocs(q);
    const photos = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Photo));
    
    // In-memory sort to avoid requiring manual indexes
    return photos.sort((a, b) => b.createdAt - a.createdAt);
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

export async function deletePhoto(photoId: string) {
  const path = `photos/${photoId}`;
  try {
    const docRef = doc(db, 'photos', photoId);
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
