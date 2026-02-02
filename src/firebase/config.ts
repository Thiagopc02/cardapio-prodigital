import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAy4iAWVSc3QZkZb0DyEtqrI_29Wnq8",
  authDomain: "cardapio-prodigital.firebaseapp.com",
  projectId: "cardapio-prodigital",
  storageBucket: "cardapio-prodigital.appspot.com",
  messagingSenderId: "116283840464",
  appId: "1:116283840464:web:235e661ebc45a74eb0c85",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
