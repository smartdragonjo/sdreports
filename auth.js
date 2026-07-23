document.addEventListener("DOMContentLoaded", function () {
    // كلمة المرور المطلوبة
    const correctPassword = "868755";

    // إنشاء وتصميم نافذة إدخال كلمة السر وإضافتها لصفحة الـ HTML برمجياً
    const modalHTML = `
        <div id="auth-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.95); display: flex; justify-content: center; align-items: center; z-index: 9999; direction: rtl; font-family: 'Tajawal', sans-serif;">
            <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; max-width: 400px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
                <h2 style="margin-bottom: 15px; color: #0f172a; font-weight: 700;">التقرير محمي</h2>
                <p style="margin-bottom: 20px; color: #64748b; font-size: 0.95rem;">الرجاء إدخال كلمة المرور لعرض محتوى التقرير:</p>
                <input type="password" id="password-input" placeholder="كلمة المرور" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 15px; text-align: center; font-size: 1.1rem; font-family: 'Tajawal', sans-serif;">
                <button id="auth-btn" style="background-color: #f97316; color: white; border: none; padding: 12px 20px; width: 100%; border-radius: 6px; font-size: 1rem; font-weight: 700; cursor: pointer; font-family: 'Tajawal', sans-serif;">دخول</button>
                <div id="error-message" style="color: #dc2626; margin-top: 10px; font-size: 0.85rem; display: none;">كلمة المرور غير صحيحة، حاول مرة أخرى.</div>
            </div>
        </div>
    `;

    // حقن النافذة في بداية الصفحة وإخفاء محتوى التقرير الأصلي مؤقتاً
    document.body.insertAdjacentHTML('afterbegin', modalHTML);
    
    // حفظ محتويات الـ body وتغليفها لتكون مخفية حتى يتم إدخال كلمة المرور الصحيحة
    const bodyChildren = Array.from(document.body.children).filter(el => el.id !== 'auth-modal');
    
    const wrapper = document.createElement('div');
    wrapper.id = 'protected-content';
    wrapper.style.display = 'none';
    
    bodyChildren.forEach(el => wrapper.appendChild(el));
    document.body.appendChild(wrapper);

    // دالة التحقق من كلمة المرور
    function verifyPassword() {
        const inputVal = document.getElementById('password-input').value;
        const errorMsg = document.getElementById('error-message');
        const modal = document.getElementById('auth-modal');
        const content = document.getElementById('protected-content');

        if (inputVal === correctPassword) {
            modal.style.display = 'none';
            content.style.display = 'block';
        } else {
            errorMsg.style.display = 'block';
            document.getElementById('password-input').value = '';
        }
    }

    // ربط الأحداث للأزرار ومدخلات لوحة المفاتيح
    document.getElementById('auth-btn').addEventListener('click', verifyPassword);
    document.getElementById('password-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            verifyPassword();
        }
    });
});