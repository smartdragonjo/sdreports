// Auth & Firebase Synchronization Engine for Competitor Report

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getFirestore,
    doc,
    setDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


// =====================================================
// 1. Firebase Configuration
// =====================================================

const firebaseConfig = {
    apiKey: "AIzaSyDg8ucMi4nGaY-yhmVReMukCCW7g7kOx0Q",
    authDomain: "daily-report-e1f6d.firebaseapp.com",
    projectId: "daily-report-e1f6d",
    storageBucket: "daily-report-e1f6d.firebasestorage.app",
    messagingSenderId: "423773202485",
    appId: "1:423773202485:web:d736c1d4c132b27ca5697c"
};


// =====================================================
// 2. Initialize Firebase
// =====================================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();


// =====================================================
// إعدادات الدخول
// =====================================================

// كلمة السر تسمح بالمشاهدة فقط
const VIEW_PASSWORD = "868755";

// حساب الإدارة الوحيد
const ADMIN_EMAIL = "smartdragonjordan@gmail.com";

// حالة المستخدم
let isAdmin = false;


// =====================================================
// Firestore Document
// =====================================================

const reportDocRef = doc(
    db,
    "reports",
    "competitor_latest"
);


// =====================================================
// 3. إنشاء شاشة الدخول
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const modalHTML = `
        <div id="auth-modal"
             style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(15, 23, 42, 0.96);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                direction: rtl;
                font-family: 'Cairo', 'Tajawal', sans-serif;
             ">

            <div style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                text-align: center;
                max-width: 420px;
                width: 90%;
                box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);
            ">

                <h2 style="
                    margin-bottom: 10px;
                    color: #0f172a;
                    font-weight: 700;
                ">
                    التقرير محمي
                </h2>

                <p style="
                    margin-bottom: 20px;
                    color: #64748b;
                    font-size: 0.95rem;
                ">
                    أدخل كلمة المرور لعرض التقرير
                </p>


                <!-- دخول المشاهدة -->

                <input
                    type="password"
                    id="password-input"
                    placeholder="كلمة المرور"
                    style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #e2e8f0;
                        border-radius: 6px;
                        margin-bottom: 12px;
                        text-align: center;
                        font-size: 1.1rem;
                        font-family: inherit;
                    "
                >

                <button
                    id="auth-btn"
                    style="
                        background-color: #f97316;
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        width: 100%;
                        border-radius: 6px;
                        font-size: 1rem;
                        font-weight: 700;
                        cursor: pointer;
                        font-family: inherit;
                    "
                >
                    دخول للمشاهدة
                </button>


                <div
                    id="error-message"
                    style="
                        color: #dc2626;
                        margin-top: 10px;
                        font-size: 0.85rem;
                        display: none;
                    "
                >
                    كلمة المرور غير صحيحة، حاول مرة أخرى.
                </div>


                <!-- فاصل -->

                <div style="
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin: 22px 0;
                    color: #94a3b8;
                    font-size: 0.85rem;
                ">
                    <div style="height:1px;background:#e2e8f0;flex:1;"></div>
                    أو
                    <div style="height:1px;background:#e2e8f0;flex:1;"></div>
                </div>


                <!-- دخول الإدارة -->

                <button
                    id="google-login-btn"
                    style="
                        background: #ffffff;
                        color: #334155;
                        border: 1px solid #cbd5e1;
                        padding: 12px 20px;
                        width: 100%;
                        border-radius: 6px;
                        font-size: 0.95rem;
                        font-weight: 700;
                        cursor: pointer;
                        font-family: inherit;
                    "
                >
                    🔐 دخول الإدارة بحساب Google
                </button>


                <div
                    id="google-error"
                    style="
                        color: #dc2626;
                        margin-top: 10px;
                        font-size: 0.85rem;
                        display: none;
                    "
                ></div>

            </div>
        </div>
    `;


    document.body.insertAdjacentHTML(
        "afterbegin",
        modalHTML
    );


    // =================================================
    // إخفاء محتوى الموقع حتى يتم الدخول
    // =================================================

    const bodyChildren =
        Array.from(document.body.children)
        .filter(el => el.id !== "auth-modal");


    const wrapper =
        document.createElement("div");

    wrapper.id = "protected-content";
    wrapper.style.display = "none";


    bodyChildren.forEach(el =>
        wrapper.appendChild(el)
    );


    document.body.appendChild(wrapper);


    // =================================================
    // دخول كلمة المرور - مشاهدة فقط
    // =================================================

    function verifyPassword() {

        const inputVal =
            document.getElementById("password-input").value;

        const errorMsg =
            document.getElementById("error-message");


        if (inputVal === VIEW_PASSWORD) {

            isAdmin = false;

            openReport();

            hideAdminButtons();

            listenToLiveReport();

        } else {

            errorMsg.style.display = "block";

            document.getElementById(
                "password-input"
            ).value = "";
        }
    }


    document
        .getElementById("auth-btn")
        .addEventListener(
            "click",
            verifyPassword
        );


    document
        .getElementById("password-input")
        .addEventListener(
            "keypress",
            function (e) {

                if (e.key === "Enter") {
                    verifyPassword();
                }

            }
        );


    // =================================================
    // دخول Google للإدارة
    // =================================================

    document
        .getElementById("google-login-btn")
        .addEventListener(
            "click",
            async function () {

                const errorBox =
                    document.getElementById("google-error");

                errorBox.style.display = "none";


                try {

                    const result =
                        await signInWithPopup(
                            auth,
                            googleProvider
                        );


                    const user = result.user;


                    if (
                        user.email &&
                        user.email.toLowerCase()
                        === ADMIN_EMAIL.toLowerCase()
                    ) {

                        isAdmin = true;

                        openReport();

                        showAdminButtons();

                        listenToLiveReport();

                    } else {

                        isAdmin = false;

                        await signOut(auth);

                        errorBox.textContent =
                            "هذا الحساب غير مصرح له بإدارة التقرير.";

                        errorBox.style.display =
                            "block";
                    }


                } catch (error) {

                    console.error(
                        "Google login error:",
                        error
                    );

                    errorBox.textContent =
                        "تعذر تسجيل الدخول بحساب Google.";

                    errorBox.style.display =
                        "block";
                }

            }
        );


    // =================================================
    // مراقبة حالة Firebase Authentication
    // =================================================

    onAuthStateChanged(
        auth,
        function (user) {

            if (
                user &&
                user.email &&
                user.email.toLowerCase()
                === ADMIN_EMAIL.toLowerCase()
            ) {

                isAdmin = true;

                openReport();

                showAdminButtons();

                listenToLiveReport();
            }

        }
    );

});


// =====================================================
// فتح التقرير
// =====================================================

function openReport() {

    const modal =
        document.getElementById("auth-modal");

    const content =
        document.getElementById("protected-content");


    if (modal) {
        modal.style.display = "none";
    }


    if (content) {
        content.style.display = "block";
    }
}


// =====================================================
// إخفاء أزرار الإدارة
// =====================================================

function hideAdminButtons() {

    const actions =
        document.querySelector(".actions-wrapper");

    if (actions) {
        actions.style.display = "none";
    }
}


// =====================================================
// إظهار أزرار الإدارة
// =====================================================

function showAdminButtons() {

    const actions =
        document.querySelector(".actions-wrapper");

    if (actions) {
        actions.style.display = "flex";
    }
}


// =====================================================
// 4. المزامنة اللحظية مع Firebase
// =====================================================

let reportListenerStarted = false;

function listenToLiveReport() {

    // منع إنشاء أكثر من Listener
    if (reportListenerStarted) {
        return;
    }

    reportListenerStarted = true;


    onSnapshot(
        reportDocRef,
        (docSnap) => {

            if (docSnap.exists()) {

                const data =
                    docSnap.data();


                if (
                    data.rawMD &&
                    typeof window.parseMDAndRender
                    === "function"
                ) {

                    window.rawMDContent =
                        data.rawMD;


                    window.parseMDAndRender(
                        data.rawMD
                    );
                }
            }

        },
        (error) => {

            console.error(
                "Firestore read error:",
                error
            );

        }
    );
}


// =====================================================
// 5. رفع تقرير جديد
// الإدارة فقط
// =====================================================

window.uploadAndSyncMD =
async function (mdContent) {

    if (!isAdmin) {

        alert(
            "غير مصرح لك برفع أو تعديل التقرير."
        );

        return;
    }


    const user = auth.currentUser;


    if (
        !user ||
        !user.email ||
        user.email.toLowerCase()
        !== ADMIN_EMAIL.toLowerCase()
    ) {

        alert(
            "يجب تسجيل الدخول بحساب الإدارة."
        );

        return;
    }


    try {

        await setDoc(
            reportDocRef,
            {
                rawMD: mdContent,
                updatedAt:
                    new Date().toISOString()
            }
        );


        alert(
            "تم رفع التقرير وتحديثه بنجاح على جميع الأجهزة!"
        );


    } catch (e) {

        console.error(
            "Error updating document:",
            e
        );


        alert(
            "حدث خطأ أثناء رفع التقرير إلى Firebase."
        );
    }
};


// =====================================================
// 6. تنزيل نسخة MD
// الإدارة فقط
// =====================================================

window.downloadMDBackup =
function () {

    if (!isAdmin) {

        alert(
            "تنزيل النسخة متاح لحساب الإدارة فقط."
        );

        return;
    }


    const user = auth.currentUser;


    if (
        !user ||
        !user.email ||
        user.email.toLowerCase()
        !== ADMIN_EMAIL.toLowerCase()
    ) {

        alert(
            "يجب تسجيل الدخول بحساب الإدارة."
        );

        return;
    }


    if (!window.rawMDContent) {

        alert(
            "لا يوجد تقرير حالي لتنزيله."
        );

        return;
    }


    const blob =
        new Blob(
            [window.rawMDContent],
            {
                type:
                "text/markdown;charset=utf-8;"
            }
        );


    const link =
        document.createElement("a");


    const url =
        URL.createObjectURL(blob);


    link.setAttribute(
        "href",
        url
    );


    link.setAttribute(
        "download",
        `تقرير_المنافسين_${
            new Date()
            .toISOString()
            .slice(0,10)
        }.md`
    );


    link.style.visibility =
        "hidden";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(url);
};