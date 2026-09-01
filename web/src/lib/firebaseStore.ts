import { getFirestore, collection, doc, setDoc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { app } from './firebase';
import { Property } from '../types';

export const firestoreDb = getFirestore(app);

export const firestoreProperties = {
  /** Save or update custom property in Firebase Firestore cloud store */
  async saveProperty(property: Property): Promise<void> {
    try {
      const docRef = doc(firestoreDb, 'rc_custom_properties', property.id);
      await setDoc(docRef, property, { merge: true });
    } catch (e) {
      console.warn('Firestore cloud save error (falling back to local cache):', e);
    }
  },

  /** Fetch all pending review properties across all users/browsers */
  async getPendingProperties(): Promise<Property[]> {
    try {
      const q = query(collection(firestoreDb, 'rc_custom_properties'), where('status', '==', 'pending_review'));
      const snapshot = await getDocs(q);
      const list: Property[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Property;
        if (data && data.id) list.push(data);
      });
      return list;
    } catch (e) {
      console.warn('Firestore cloud fetch error (falling back to local cache):', e);
      return [];
    }
  },

  /** Update property status in Firebase Firestore cloud store */
  async updatePropertyStatus(propertyId: string, status: 'published' | 'rejected' | 'suspended', reason?: string): Promise<void> {
    try {
      const docRef = doc(firestoreDb, 'rc_custom_properties', propertyId);
      await updateDoc(docRef, {
        status,
        rejection_reason: reason || null,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore cloud status update error:', e);
    }
  },

  /** Fetch all custom properties stored in cloud */
  async getAllCustomProperties(): Promise<Property[]> {
    try {
      const snapshot = await getDocs(collection(firestoreDb, 'rc_custom_properties'));
      const list: Property[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Property;
        if (data && data.id) list.push(data);
      });
      return list;
    } catch (e) {
      console.warn('Firestore cloud fetch all error:', e);
      return [];
    }
  },
};
