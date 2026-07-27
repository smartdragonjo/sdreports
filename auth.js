// Auth & Firebase Synchronization Engine for Competitor Report
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDg8ucMi4nGaY-yhmVReMukCCW7g7kOx0Q",
    authDomain: "daily-report-e1f6d.firebaseapp.com",
    projectId: "daily-report-e1f6d",
    storageBucket: "daily-report-e1f6d.firebasestorage.app",
    messagingSenderId: "423773202485",
    appId: "1:423773202485:web:d736c1d4c132b27ca5697c"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Document reference for real-time synchronization
const reportDocRef = doc(db, "reports", "competitor_latest");

document.addEventListener("DOMContentLoaded", function () {
    const correctPassword = "868755";

    const modalHTML = `
        <div id="auth-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.95); display: flex; justify-content: center; align-items: center; z-index: 9999; direction: rtl; font-family: 'Cairo', 'Tajawal', sans-serif;">
            <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; max-width: 400px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
                <h2 style="margin-bottom: 15px; color: #0f172a; font-weight: 700;">التقرير محمي</h2>
                <p style="margin-bottom: 20px; color: #64748b; font-size: 0.95rem;">الرجاء إدخال كلمة المرور لعرض محتوى التقرير وترقية البيانات:</p>
                <input type="password" id="password-input" placeholder="كلمة المرور" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 15px; text-align: center; font-size: 1.1rem; font-family: inherit;">
                <button id="auth-btn" style="background-color: #f97316; color: white; border: none; padding: 12px 20px; width: 100%; border-radius: 6px; font-size: 1rem; font-weight: 700; cursor: pointer; font-family: inherit;">دخول</button>
                <div id="error-message" style="color: #dc2626; margin-top: 10px; font-size: 0.85rem; display: none;">كلمة المرور غير صحيحة، حاول مرة أخرى.</div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', modalHTML);

    const bodyChildren = Array.from(document.body.children).filter(el => el.id !== 'auth-modal');
    const wrapper = document.createElement('div');
    wrapper.id = 'protected-content';
    wrapper.style.display = 'none';

    bodyChildren.forEach(el => wrapper.appendChild(el));
    document.body.appendChild(wrapper);

    function verifyPassword() {
        const inputVal = document.getElementById('password-input').value;
        const errorMsg = document.getElementById('error-message');
        const modal = document.getElementById('auth-modal');
        const content = document.getElementById('protected-content');

        if (inputVal === correctPassword) {
            modal.style.display = 'none';
            content.style.display = 'block';
            
            // البدء بالاستماع المباشر للتغييرات عبر الأجهزة عند النجاح
            listenToLiveReport();
        } else {
            errorMsg.style.display = 'block';
            document.getElementById('password-input').value = '';
        }
    }

    document.getElementById('auth-btn').addEventListener('click', verifyPassword);
    document.getElementById('password-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') verifyPassword();
    });
});

// 2. المزامنة اللحظية مع Firebase Firestore
function listenToLiveReport() {
    onSnapshot(reportDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.rawMD && typeof window.parseMDAndRender === 'function') {
                window.rawMDContent = data.rawMD; // الاحتفاظ بالمحتوى الخام للتحميل
                window.parseMDAndRender(data.rawMD);
            }
        }
    });
}

// 3. رفع ملف جديد واستبدال القديم فوراً في Firestore
window.uploadAndSyncMD = async function(mdContent) {
    try {
        await setDoc(reportDocRef, {
            rawMD: mdContent,
            updatedAt: new Date().toISOString()
        });
        alert('تم رفع التقرير وتحديثه بنجاح على جميع الأجهزة!');
    } catch (e) {
        console.error("Error updating document: ", e);
        alert('حدث خطأ أثناء رفع التقرير إلى Firebase.');
    }
};

// 4. حفظ وتنزيل ملف .md أوفلاين (لتسهيل رفعه على Google Drive أو السيرفر)
window.downloadMDBackup = function() {
    if (!window.rawMDContent) {
        alert('لا يوجد تقرير حالي لتنزيله.');
        return;
    }
    const blob = new Blob([window.rawMDContent], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `تقرير_المنافسين_${new Date().toISOString().slice(0,10)}.md`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};