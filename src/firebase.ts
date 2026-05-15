/*----*/

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAOkrktAccw7GWV_Dq-6pbHWdi6gedK0hk",
    authDomain: "kanaan-6f856.firebaseapp.com",
    databaseURL: "https://kanaan-6f856-default-rtdb.firebaseio.com",
    projectId: "kanaan-6f856",
    storageBucket: "kanaan-6f856.firebasestorage.app",
    messagingSenderId: "199720329470",
    appId: "1:199720329470:web:023ac0eef56e7f8d3145af"
};
const app = initializeApp(firebaseConfig);

// 👇 هذا هو المهم
export const db = getDatabase(app);
export const auth = getAuth(app);
