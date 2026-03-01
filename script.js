// ASET GAMBAR
const birdImg = new Image();
birdImg.src = 'flappymay.png'; 

// 1. JAM REAL-TIME
function updateClock() {
    const clock = document.getElementById('clock');
    if (clock) clock.innerText = new Date().toLocaleTimeString('id-ID', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

// 2. LOGIKA KERJA
function updateWorkTimer() {
    const now = new Date();
    const timer = document.getElementById('countdown');
    if (!timer) return;
    if (now.getDay() === 0 || (now.getDay() === 6 && now.getHours() >= 12)) {
        timer.innerText = "WAKTU WEEKEND 🥂"; return;
    }
    const end = new Date(); end.setHours(17, 30, 0, 0);
    const start = new Date(); start.setHours(8, 0, 0, 0);
    if (now >= start && now <= end) {
        let diff = end - now;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        timer.innerText = `${h}:${m}:${s}`;
    } else { timer.innerText = now > end ? "WAKTUNYA ISTIRAHAT 🌙" : "BELUM JAM KERJA ☕"; }
}
setInterval(updateWorkTimer, 1000);
updateWorkTimer();

// 3. AYAT ALKITAB RANDOM
async function fetchRandomVerse() {
    const verseEl = document.getElementById('daily-verse');
    try {
        const response = await fetch('alkitab.json?v=' + Date.now());
        const versesList = await response.json();
        if (versesList.length > 0) {
            verseEl.innerText = `"${versesList[Math.floor(Math.random() * versesList.length)]}" ✨`;
        }
    } catch (e) {
        verseEl.innerText = `"Segala perkara dapat kutanggung di dalam Dia yang memberi kekuatan kepadaku. - Filipi 4:13" ✨`;
    }
}
fetchRandomVerse();

// 4. GAME FLAPPY MAY
const canvas = document.getElementById('flappyCanvas');
const ctx = canvas.getContext('2d');
let birdY = 200, birdV = 0, pipes = [], frame = 0, score = 0, isGameOver = false;

function drawBird() { ctx.drawImage(birdImg, 50, birdY, 30, 30); }

function updateGame() {
    if (isGameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#70c5ce'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    birdV += 0.4; birdY += birdV;
    if (birdY > canvas.height - 30 || birdY < 0) endGame();
    if (frame % 100 === 0) {
        let gap = 120, top = Math.random() * (canvas.height - gap - 100) + 50;
        pipes.push({ x: canvas.width, top: top, bottom: canvas.height - top - gap });
    }
    pipes.forEach(p => {
        p.x -= 2;
        ctx.fillStyle = '#FFB7C5';
        ctx.fillRect(p.x, 0, 40, p.top);
        ctx.fillRect(p.x, canvas.height - p.bottom, 40, p.bottom);
        if (p.x < 80 && p.x > 20 && (birdY < p.top || birdY > canvas.height - p.bottom)) endGame();
        if (p.x === 50) score++;
    });
    pipes = pipes.filter(p => p.x > -40);
    drawBird();
    ctx.fillStyle = '#000'; ctx.fillText("SKOR: " + score, 10, 25);
    frame++; requestAnimationFrame(updateGame);
}

function jump() { if (!isGameOver) birdV = -6; }
function endGame() { isGameOver = true; document.getElementById('game-over-overlay').style.display = 'block'; document.getElementById('final-score').innerText = score; }
function resetGame() { birdY = 200; birdV = 0; pipes = []; score = 0; frame = 0; isGameOver = false; document.getElementById('game-over-overlay').style.display = 'none'; updateGame(); }
canvas.addEventListener('mousedown', jump);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });

// 5. CUACA & NAVIGASI
async function fetchWeather() {
    const adviceEl = document.getElementById('weather-advice');
    const tempEl = document.getElementById('current-temp');
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.20&longitude=106.84&current_weather=true&daily=weathercode,temperature_2m_max&timezone=Asia%2FJakarta');
        const data = await res.json();
        tempEl.innerText = `${Math.round(data.current_weather.temperature)}° 🌤️`;
        const code = data.daily.weathercode[1];
        adviceEl.innerText = code > 3 ? "Besok bakal hujan, jangan lupa bawa payung ya May! ☔" : "Besok cuaca bagus, tetap semangat ya May! ✨";
    } catch (e) { adviceEl.innerText = "Cek cuaca besok ya May! ✨"; }
}
fetchWeather();

const destLat = -6.3312, destLng = 106.6778; // Alamat kantor baru Setu
document.getElementById('nav-btn').href = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;

// 6. BERITA
async function fetchNews() {
    const container = document.getElementById('newsContainer');
    try {
        const url = `https://gnews.io/api/v4/top-headlines?category=general&lang=id&country=id&max=3&apikey=330c4524949a323d82659df746a05672`;
        const res = await fetch(url);
        const data = await res.json();
        if(data.articles) { container.innerHTML = data.articles.map(n => `<div style="margin-bottom:8px;">• ${n.title}</div>`).join(''); }
    } catch (e) { container.innerHTML = "Gagal memuat berita."; }
}
fetchNews();
updateGame();