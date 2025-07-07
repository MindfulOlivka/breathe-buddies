let duration = 600;
let remaining = duration;
let timerId = null;
let selectedCondition = "";
let currentAudio = null;

const display = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const minutesInput = document.getElementById("minutes-input");
const sessionCountEl = document.getElementById("session-count");

function formatTime(sec) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function loadSessions() {
  return parseInt(localStorage.getItem("sessions") || "0", 10);
}

function saveSessions(count) {
  localStorage.setItem("sessions", count);
}

if (sessionCountEl) sessionCountEl.textContent = loadSessions();

function updateDisplay() {
  if (display) display.textContent = formatTime(remaining);
}

function startTimer() {
  if (currentAudio && currentAudio.paused) currentAudio.play();

  const mins = minutesInput.value ? parseInt(minutesInput.value, 10) : 10;
  duration = remaining = mins * 60;
  minutesInput.value = "";

  const now = Date.now();
  const buddy = localStorage.getItem("selectedBuddy") || "unknown";
  const mood = localStorage.getItem("selectedMood") || "unknown";
  const durMs = duration * 1000;
  const prev = localStorage.getItem("bb_history") || "";
  const newRow = `${now},${buddy},${mood},${durMs}`;
  const updated = prev ? `${prev}|${newRow}` : newRow;
  localStorage.setItem("bb_history", updated);

  if (timerId) return;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;

  timerId = setInterval(() => {
    remaining--;
    updateDisplay();
    if (remaining <= 0) {
      clearInterval(timerId);
      timerId = null;
      if (currentAudio) currentAudio.pause(); // Stop music when timer ends
      const count = loadSessions() + 1;
      saveSessions(count);
      if (sessionCountEl) sessionCountEl.textContent = count;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
    }
  }, 1000);
}

function pauseTimer() {
  if (currentAudio) currentAudio.pause();
  clearInterval(timerId);
  timerId = null;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}

function resetTimer() {
  if (currentAudio) currentAudio.pause();
  clearInterval(timerId);
  timerId = null;
  remaining = duration;
  updateDisplay();
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resetBtn.disabled = true;
}

function selectCondition(condition) {
  const animalDisplay = document.getElementById("animal-display");
  const animalGifs = {
    anxiety: "https://media.giphy.com/media/jUwpNzg9IcyrK/giphy.gif",
    adhd: "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif",
    depression: "https://media.giphy.com/media/QvBoMEcQ7DQXK/giphy.gif",
    sleep: "https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif",
  };
  animalDisplay.innerHTML = `<img src="${animalGifs[condition]}" alt="${condition} animal listening" />`;
  selectedCondition = condition;
  document.getElementById("generate-section").style.display = "block";
}

async function generateFreesoundSound() {
  const tags = {
    anxiety: "calm",
    adhd: "focus",
    depression: "uplifting",
    sleep: "sleep",
  };
  const query = tags[selectedCondition] || "relaxation";
  const apiKey = "SrVIUBsuhm4o0H69FWtmQDk0NKCCVhbsx7qmOuWB";
  const url = `https://freesound.org/apiv2/search/text/?query=${query}&filter=duration:[10 TO 120]&fields=id,name,previews&token=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0)
      return alert("No sound found for this condition.");
    const track = data.results[Math.floor(Math.random() * data.results.length)];
    const audioUrl = track.previews["preview-lq-mp3"];
    if (currentAudio) currentAudio.pause();
    currentAudio = new Audio(audioUrl);
    currentAudio.loop = true;
    currentAudio.play();
  } catch (err) {
    console.error("Freesound API error:", err);
    alert("Error fetching sound.");
  }
}

if (startBtn) startBtn.addEventListener("click", startTimer);
if (pauseBtn) pauseBtn.addEventListener("click", pauseTimer);
if (resetBtn) resetBtn.addEventListener("click", resetTimer);
if (display) updateDisplay();

function selectBuddy(name) {
  localStorage.setItem("selectedBuddy", name);
  window.location.href = "mood.html";
}

function selectMood(mood) {
  localStorage.setItem("selectedMood", mood);
  window.location.href = "sound.html";
}

function loadSession() {
  const buddy = localStorage.getItem("selectedBuddy");
  const mood = localStorage.getItem("selectedMood");
  const display = document.getElementById("selected-info");
  display.innerHTML = `<p>Your buddy: <strong>${buddy}</strong> <br> Your mood: <strong>${mood}</strong></p>`;
}

function msToClock(ms) {
  const m = Math.floor(ms / 60000);
  const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${m}:${s}`;
}

window.addEventListener("load", () => {
  const tbody = document.getElementById("historyBody");
  if (tbody) {
    const hist = localStorage.getItem("bb_history") || "";
    if (!hist) return;

    const rows = hist.split("|");
    rows.forEach((r) => {
      const [ts, buddy, mood, dur] = r.split(",");
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${new Date(
        +ts
      ).toLocaleString()}</td><td>${buddy}</td><td>${mood}</td><td>${msToClock(
        +dur
      )}</td>`;
      tbody.appendChild(tr);
    });

    document.getElementById("clearBtn").addEventListener("click", () => {
      if (confirm("Delete all records?")) {
        localStorage.removeItem("bb_history");
        window.location.reload();
      }
    });
  }
});
