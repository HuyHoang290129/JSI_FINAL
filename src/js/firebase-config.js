import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Cấu hình Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB-DV2mxc1MfS15DhQz82iOACK216O6fYE",
    authDomain: "cuoikhoa-746fc.firebaseapp.com",
    projectId: "cuoikhoa-746fc",
    storageBucket: "cuoikhoa-746fc.firebasestorage.app",
    messagingSenderId: "1005446322596",
    appId: "1:1005446322596:web:61f284803480ab6f5dc931",
    measurementId: "G-CMQW7LTL1J"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Xuất các biến để sử dụng ở file khác
export { app, auth, db };