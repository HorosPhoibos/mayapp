// 1. JAM REAL-TIME
function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString('id-ID', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

// 2. LOGIKA KERJA
function updateWorkTimer() {
    const now = new Date();
    const day = now.getDay(); 
    const hour = now.getHours();
    const timerElement = document.getElementById('countdown');

    if (day === 0 || (day === 6 && hour >= 12)) {
        timerElement.innerText = "WEEKEND! 🥂";
        return;
    }

    const start = new Date(); start.setHours(8, 0, 0, 0);
    const end = new Date(); end.setHours(17, 30, 0, 0); 

    if (now >= start && now <= end) {
        let diff = end - now;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        timerElement.innerText = `${h}:${m} LAGI`;
    } else {
        timerElement.innerText = now > end ? "ISTIRAHAT 🌙" : "KOPI DULU ☕";
    }
}
setInterval(updateWorkTimer, 60000);
updateWorkTimer();

// 3. FIX: AYAT ALKITAB RANDOM DARI JSON
async function fetchRandomVerse() {
    const verseEl = document.getElementById('daily-verse');
    try {
        // Cache-busting agar selalu acak saat refresh
        const response = await fetch('alkitab.json?t=' + Date.now());
        const versesList = await response.json();
        
        if (versesList && versesList.length > 0) {
            const randomIndex = Math.floor(Math.random() * versesList.length);
            verseEl.innerText = `"${versesList[randomIndex]}" ✨`;
        }
    } catch (error) {
        console.error("Gagal memuat JSON:", error);
        // Fallback jika file tidak ditemukan atau limit
        verseEl.innerText = `"Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku. - Filipi 4:13" ✨`;
    }
}
fetchRandomVerse();

// 4. NAVIGASI (Lokasi Kantor Setu)
function setupCommute() {
    const navBtn = document.getElementById('nav-btn');
    const destLat = -6.331238; 
    const destLng = 106.677815;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            navBtn.href = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${destLat},${destLng}&travelmode=driving`;
        }, () => {
            navBtn.href = `https://www.google.com/maps/search/?api=1&query=${destLat},${destLng}`;
        });
    }
}
setupCommute();

// 5. TIPS CUACA & UPDATE SUHU
async function fetchWeatherAdvice() {
    const adviceEl = document.getElementById('weather-advice');
    const tempEl = document.getElementById('current-temp');
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.20&longitude=106.84&current_weather=true&daily=weathercode,temperature_2m_max&timezone=Asia%2FJakarta');
        const data = await res.json();
        
        tempEl.innerText = `${Math.round(data.current_weather.temperature)}° 🌤️`;

        const tomorrowCode = data.daily.weathercode[1];
        const maxTemp = data.daily.temperature_2m_max[1];
        
        let message = "Besok cuaca bagus, tetap semangat ya May! ✨";
        if (tomorrowCode > 3) {
            message = "Besok bakal hujan, jangan lupa sedia payung ya May! ☔";
        } else if (maxTemp > 33) {
            message = "Besok panas sekalii, pakai sunscreen ya biar kulit aman! ☀️";
        }
        adviceEl.innerText = message;
    } catch (e) { adviceEl.innerText = "Cek cuaca besok ya May! ✨"; }
}
fetchWeatherAdvice();

// 6. FIX BERITA (Dengan Fallback Jika Limit Tercapai)
async function fetchNews() {
    const container = document.getElementById('newsContainer');
    try {
        const apikey = '330c4524949a323d82659df746a05672'; 
        const url = `https://gnews.io/api/v4/top-headlines?category=general&lang=id&country=id&max=3&apikey=${apikey}`;

        const res = await fetch(url);
        const data = await res.json();
        
        if (data.articles && data.articles.length > 0) {
            container.innerHTML = data.articles.map(n => `
                <div style="margin-bottom:8px;">
                    <a href="${n.url}" target="_blank" style="text-decoration:none; color:#333;">• ${n.title}</a>
                </div>
            `).join('');
        } else {
            throw new Error('Limit reached or empty articles');
        }
    } catch (e) {
        console.warn("Berita limit, menampilkan pesan cadangan.");
        container.innerHTML = "<p style='color:#8B7D84;'>Berita sedang istirahat sebentar (API Limit). Cek lagi nanti ya May! 📰</p>";
    }
}
fetchNews();