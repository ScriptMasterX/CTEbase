import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDX9-WFMPV1BRpFxjOgsoLuQTmlCI2-1uY",
  authDomain: "database-af05d.firebaseapp.com",
  projectId: "database-af05d",
  storageBucket: "database-af05d.appspot.com",
  messagingSenderId: "664259745744",
  appId: "1:664259745744:web:b8242f8e5e426f5c424bd5",
  measurementId: "G-63B3W15GPM"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export { app, db }