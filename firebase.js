// الاتصال بـ Firebase (قاعدة البيانات المشتركة بين الموبايلات والشاشات)
// لما تلصق الإعدادات هنا، كل حاجة هتشتغل عبر الإنترنت.
// لحد ما تلصقهم، الموقع بيشتغل على نفس الجهاز بس.

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, query, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

export const FIREBASE_READY = Boolean(firebaseConfig.projectId);
const app = FIREBASE_READY ? initializeApp(firebaseConfig) : null;
const db = app ? getFirestore(app) : null;

// إرسال تهنئة جديدة للإدارة
export async function sendWish(wish) {
  if (!db) return null;
  return addDoc(collection(db, "wishes"), { ...wish, createdAt: Date.now() });
}

// متابعة التهاني لحظياً (للإدارة والشاشة)
export function watchWishes(callback) {
  if (!db) return () => {};
  const q = query(collection(db, "wishes"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

// موافقة أو رفض تهنئة
export async function setWishStatus(id, status) {
  if (!db) return;
  await updateDoc(doc(db, "wishes", id), { status });
}
