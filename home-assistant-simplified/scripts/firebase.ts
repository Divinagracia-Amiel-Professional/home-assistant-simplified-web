import { initializeApp } from 'firebase/app';
import { getFirestore } from '@firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBObia-5aSJCi-LYG8hLP6bA98bT40j_Fw',
  authDomain: 'home-assistant-simplifie-d154a.firebaseapp.com',
  projectId: 'home-assistant-simplifie-d154a',
  storageBucket: 'home-assistant-simplifie-d154a.appspot.com',
  messagingSenderId: '888365227334',
  appId: '1:888365227334:web:5a8e5a757bc0a0a09f9947',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { app, firestore, firebaseConfig };
