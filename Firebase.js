// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth/react-native";
import { ref } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD1dRTvomlzi7Vse2D1ZEannMidx5OpQGA",
  authDomain: "jindagi-16073.firebaseapp.com",
  projectId: "jindagi-16073",
  storageBucket: "jindagi-16073.appspot.com",
  messagingSenderId: "1098602899367",
  appId: "1:1098602899367:web:ddbfd71c2beea8c1d4b882",
  measurementId: "G-9H9H8ZSVKD",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
// Auth
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

//export
export const Auth = auth;
export const App = app;
export const storeRef = ref;
