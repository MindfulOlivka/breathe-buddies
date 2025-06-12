let duration = 600;
let remaining = duration;
let timerId = null;
let selectedCondition = "";    // QUESTION ? WHY "" makes it work but '' didn't ? 
let currentAudio = null;

const display = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const minutesInput = document.getElementById("minutes-input");
const sessionCountEl = document.getElementById("session-count");

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function loadSessions() {
  return parseInt(localStorage.getItem("sessions") || "0", 10);
}

function saveSessions(count) {
  localStorage.setItem("sessions", count);
}

sessionCountEl.textContent = loadSessions();

function updateDisplay() {
  display.textContent = formatTime(remaining);
}

function startTimer() {
  if (currentAudio && currentAudio.paused) currentAudio.play().catch(e => console.error("Audio resume failed:", e));
  if (!timerId && minutesInput.value) {
    duration = remaining = parseInt(minutesInput.value, 10) * 60;
    minutesInput.value = '';
  }
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
      const count = loadSessions() + 1;
      saveSessions(count);
      sessionCountEl.textContent = count;

      startBtn.disabled = false;
      pauseBtn.disabled = true;
    }
  }, 1000);
}


function pauseTimer()

function resetTimer() 


function selectCondition(condition) {
  const animalDisplay = document.getElementById('animal-display');
  const animalGifs = {
    anxiety: 'https://media.giphy.com/media/jUwpNzg9IcyrK/giphy.gif',    // NOT final GIFs Lol just placeholders
    adhd: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif',
    depression: 'https://media.giphy.com/media/QvBoMEcQ7DQXK/giphy.gif',
    sleep: 'https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif'
  };
  animalDisplay.innerHTML = `<img src="${animalGifs[condition]}" alt="${condition} animal listening" />`;

  selectedCondition = condition;
  document.getElementById('generate-section').style.display = 'block';
}

async function generateFreesoundSound() {
  const tags = {
    anxiety: "calm",
    adhd: "focus",
    depression: "uplifting",
    sleep: "sleep"      // needs to be connected to a different sound
  };

  const query = tags[selectedCondition] || "relaxation";
  const apiKey = 'SrVIUBsuhm4o0H69FWtmQDk0NKCCVhbsx7qmOuWB';
  const url = `https://freesound.org/apiv2/search/text/?query=${query}&filter=duration:[10 TO 120]&fields=id,name,previews&token=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      alert("No sound found for this condition.");
      return;
    }

    const track = data.results[Math.floor(Math.random() * data.results.length)];
    const audioUrl = track.previews['preview-lq-mp3'];
    
    if (currentAudio) currentAudio.pause();
    currentAudio = new Audio(audioUrl);
    currentAudio.loop = true;
    currentAudio.play().catch(e => console.error("Playback failed:", e));

    console.log("Playing:", track.name);

  } catch (err) {
    console.error("Freesound API error:", err);
    alert("Error fetching sound. Check console for details.");
  }
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
updateDisplay();
