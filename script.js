let currentLang = 'ar';

function toggleLang() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    setLanguage(currentLang);
}

function setLanguage(lang) {
    const body = document.getElementById('mainBody');
    body.className = lang;
    body.dir = (lang === 'ar') ? 'rtl' : 'ltr';

    document.querySelectorAll('.lang').forEach(el => {
        el.innerText = el.getAttribute(`data-${lang}`);
    });
}

function calculatePressure() {
    const mass = parseFloat(document.getElementById('mass').value);
    const d = parseFloat(document.getElementById('pistonD').value);
    if (!mass || !d) return;

    const area = Math.PI * Math.pow(((d / 1000) / 2), 2);
    const pressureBar = ((mass * 9.81) / area) / 100000;
    
    document.getElementById('pressureOut').innerText = pressureBar.toFixed(2);
}

function calculateEfficiency() {
    const strokes = parseFloat(document.getElementById('strokes').value);
    const hActual = parseFloat(document.getElementById('hActual').value);
    const pistonD = parseFloat(document.getElementById('pistonD').value);

    if (!strokes || !hActual || !pistonD) return;

    const volumePerStroke = 5000; // حجم ضخة اليد الافتراضي (5ml)
    const hTheoretical = (strokes * volumePerStroke) / (Math.PI * Math.pow((pistonD / 2), 2));
    let efficiency = (hActual / hTheoretical) * 100;
    if (efficiency > 100) efficiency = 100;

    const effEl = document.getElementById('effOut');
    const statusEl = document.getElementById('leakageStatus');
    const resBg = document.getElementById('resBg');

    effEl.innerText = efficiency.toFixed(1);

    // تغيير الألوان بصرياً بناءً على البحوث التي تشير للفقد الحجمي [cite: 5, 45]
    if (efficiency >= 90) {
        statusEl.innerText = currentLang === 'ar' ? "أداء مثالي (تهريب منخفض)" : "Perfect Performance (Low Leakage)";
        resBg.style.background = "#e6f4ea"; resBg.style.color = "#137333";
    } else {
        statusEl.innerText = currentLang === 'ar' ? "فقد في الكفاءة (لزوجة منخفضة أو حرارة)" : "Efficiency Loss (Low Viscosity/Temp)";
        resBg.style.background = "#fce8e6"; resBg.style.color = "#c5221f";
    }
}

function analyzeViscosity() {
    const oilBase = parseFloat(document.getElementById('oilType').value); // اللزوجة عند 40 درجة
    const temp = parseFloat(document.getElementById('tempC').value);

    if (!temp) return;

    // معادلة تقريبية لانهيار اللزوجة بناءً على ASTM D341
    // اللزوجة تقل بشكل أسي مع الحرارة
    const estimatedVisc = oilBase * Math.exp(-0.03 * (temp - 40));

    document.getElementById('viscOut').innerText = estimatedVisc.toFixed(1);

    const warningEl = document.getElementById('viscWarning');
    
    // تحليل الحالة بناءً على البحث
    if (estimatedVisc < 10) {
        warningEl.innerText = currentLang === 'ar' ? 
            "⚠️ خطر: انهيار طبقة التزييت! الزيت فقد قدرته على حماية النظام" : 
            "⚠️ Critical: Lubrication film failure! Oil lost protection capacity";
    } else if (estimatedVisc < 20) {
        warningEl.innerText = currentLang === 'ar' ? 
            "تنبيه: لزوجة منخفضة، يتوقع زيادة في التهريب الداخلي" : 
            "Warning: Low viscosity, expect increased internal leakage";
    } else {
        warningEl.innerText = currentLang === 'ar' ? 
            "اللزوجة ضمن النطاق التشغيلي الآمن" : 
            "Viscosity is within safe operating range";
    }
}

function generateFinalReport() {
    // جلب النتائج من الأدوات السابقة
    const volEff = parseFloat(document.getElementById('effOut').innerText);
    const currentVisc = parseFloat(document.getElementById('viscOut').innerText);

    if (volEff === 0 || currentVisc === 0) {
        alert("Please calculate both efficiency and viscosity before generating the report!");
        return;
    }

    // حساب الكفاءة الميكانيكية التقديرية (بناءً على احتكاك السائل)
    // كلما زادت اللزوجة عن الحد المثالي (مثلاً 46 cSt)، تزيد المقاومة وتقل الكفاءة الميكانيكية
    let mechEff = 95 - (currentVisc * 0.1); 
    if (mechEff > 98) mechEff = 98;
    if (mechEff < 60) mechEff = 60;

    // الكفاءة الكلية = الكفاءة الحجمية × الكفاءة الميكانيكية
    const overallEff = (volEff / 100) * (mechEff / 100) * 100;

    document.getElementById('overallEffOut').innerText = overallEff.toFixed(1);

    const statusBadge = document.getElementById('finalStatus');
    
    // تصنيف جودة الزيت المستخدم في التجربة
    if (overallEff >= 85) {
        statusBadge.innerText = currentLang === 'ar' ? "مثالي - Optimum" : "Optimum Selection";
        statusBadge.style.background = "#34a853"; statusBadge.style.color = "#fff";
    } else if (overallEff >= 70) {
        statusBadge.innerText = currentLang === 'ar' ? "مقبول - Acceptable" : "Acceptable";
        statusBadge.style.background = "#f4b400"; statusBadge.style.color = "#fff";
    } else {
        statusBadge.innerText = currentLang === 'ar' ? "غير فعال - Inefficient" : "Inefficient";
        statusBadge.style.background = "#d93025"; statusBadge.style.color = "#fff";
    }
}

// وظيفة إضافة البيانات للجدول
function addToLog() {
    // جلب البيانات من الأدوات السابقة
    const oilType = "ISO VG " + document.getElementById('oilType').value;
    const temp = document.getElementById('tempC').value || "---";
    const mass = document.getElementById('mass').value || "---";
    const pressure = document.getElementById('pressureOut').innerText;
    const viscosity = document.getElementById('viscOut').innerText;
    const volEff = document.getElementById('effOut').innerText;
    const overallEff = document.getElementById('overallEffOut').innerText;

    // التأكد من وجود نتائج قبل الإضافة
    if (pressure === "0" || volEff === "0") {
        alert("Calculate pressure and efficiency before adding to log!");
        return;
    }

    const tableBody = document.getElementById('tableBody');
    const newRow = tableBody.insertRow();

    newRow.innerHTML = `
        <td>${oilType}</td>
        <td>${temp}</td>
        <td>${mass}</td>
        <td>${pressure}</td>
        <td>${viscosity}</td>
        <td>${volEff}%</td>
        <td>${overallEff}%</td>
    `;
}

// وظيفة التصدير للاكسل (CSV)
function exportToExcel() {
    // نحدد الجدول (سواء في الرئيسية أو المتقدمة)
    const table = document.getElementById("resultsTable") || document.getElementById("mainLogTable");
    
    if (!table || table.rows.length <= 1) {
        alert("sorry, no data to export! Please add some measurements to the log first.");
        return;
    }

    let csv = [];
    for (let i = 0; i < table.rows.length; i++) {
        let row = [];
        let cols = table.rows[i].querySelectorAll("td, th");
        for (let j = 0; j < cols.length; j++) {
            // تنظيف النص وتغليفه عشان ما يتلخبط الإكسل
            let data = cols[j].innerText.trim().replace(/,/g, "."); 
            row.push(data);
        }
        csv.push(row.join(",")); 
    }

    // إضافة الـ BOM لضمان ظهور اللغة العربية صح (\uFEFF)
    const csvContent = "\uFEFF" + csv.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "MMET472_Lab_Results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function copyToClipboard() {
    const table = document.getElementById("resultsTable") || document.getElementById("mainLogTable");
    const range = document.createRange();
    range.selectNode(table);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    
    try {
        document.execCommand("copy");
        alert("copied to clipboard! You can now paste it into Excel or any text editor.");
    } catch (err) {
        alert("sorry, copying failed. Please try copying manually.");
    }
    window.getSelection().removeAllRanges();
}

// HOME PAGE SCRIPTS
let startTime, timerInterval;
let elapsedTime = 0;
let strokeCount = 0;

// --- نظام المؤقت ---
function startTimer() {
    if (!timerInterval) {
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(updateTimerDisplay, 10); // تحديث كل 10 مللي ثانية
    }
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    stopTimer();
    elapsedTime = 0;
    document.getElementById('timerDisplay').innerText = "00:00.00";
}

function updateTimerDisplay() {
    const timeNow = Date.now();
    elapsedTime = timeNow - startTime;
    
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    const centiseconds = Math.floor((elapsedTime % 1000) / 10);

    document.getElementById('timerDisplay').innerText = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}

// --- نظام العداد ---
function addStroke() {
    strokeCount++;
    document.getElementById('strokeDisplay').innerText = strokeCount;
}

function resetCounter() {
    strokeCount = 0;
    document.getElementById('strokeDisplay').innerText = "0";
}

// --- حفظ البيانات وتصديرها ---
function saveToLog() {
    const oil = document.getElementById('oilType').value;
    const temp = document.getElementById('currentTemp').value;
    const timeStr = document.getElementById('timerDisplay').innerText;
    const totalSeconds = elapsedTime / 1000;
    const flowRate = totalSeconds > 0 ? (strokeCount / totalSeconds).toFixed(2) : 0;

    const tableBody = document.getElementById('logBody');
    const row = tableBody.insertRow(0);

    row.innerHTML = `
        <td>${oil}</td>
        <td>${strokeCount}</td>
        <td>${timeStr}</td>
        <td>${temp}°C</td>
        <td>${flowRate} str/s</td>
    `;
}

function exportToExcel() {
    let csv = "\uFEFF"; // لدعم العربي في الإكسل
    const rows = document.querySelectorAll("table tr");
    
    rows.forEach(row => {
        const cols = row.querySelectorAll("td, th");
        const rowData = Array.from(cols).map(c => c.innerText).join(",");
        csv += rowData + "\n";
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Lab_Data_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function toggleLang() {
    const htmlTag = document.documentElement;
    const langBtn = document.getElementById('lang-btn');
    const langElements = document.querySelectorAll('.lang');
    
    // تحديد اللغة الجديدة
    const newLang = htmlTag.dir === 'rtl' ? 'en' : 'ar';
    
    // 1. تغيير اتجاه الصفحة (RTL/LTR)
    htmlTag.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    htmlTag.lang = newLang;

    // 2. تحديث نص زر اللغة
    langBtn.innerText = newLang === 'ar' ? 'EN' : 'AR';

    // 3. تغيير كل النصوص اللي عندها كلاس lang في الموقع كامل
    langElements.forEach(el => {
        const text = el.getAttribute(`data-${newLang}`);
        if (text) {
            el.innerText = text;
        }
    });
}

// تشغيل المنيو (الهمبرغر)
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('mobile-menu');
    const navList = document.getElementById('nav-list');
    if (menuBtn && navList) {
        menuBtn.addEventListener('click', () => {
            navList.classList.toggle('active');
        });
    }
});