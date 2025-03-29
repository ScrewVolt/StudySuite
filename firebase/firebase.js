import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDvTihcqgxSTNmDtNrT2bTm0fO-2cQPZb0",
    authDomain: "studysuitev2.firebaseapp.com",
    projectId: "studysuitev2",
    storageBucket: "studysuitev2.firebasestorage.app",
    messagingSenderId: "359876904353",
    appId: "1:359876904353:web:dfbef902c07550067737e0",
    measurementId: "G-JRD6BT8Z4N"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
