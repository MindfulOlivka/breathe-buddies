let duration = 600;
let remaining = duration;
let timerId = null;
let selectCondition = "";
let currentAudio = null;

const display = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const minutesInput = document.getElementById("minutes-input");
const sessionCountEl = document.getElementById("session-count");






function selectCondition(condition) {
  const animalDisplay = document.getElementById("animal-display"); // Animal gifs are not final, just placeholders for now
  const animalGifs = {
    Anxious:
      "https://tenor.com/view/cat-music-vibing-headphones-kitty-gif-20294084.gif",
    Overwhelmed:
      "https://tenor.com/view/milk-and-mocha-dj-music-lover-cute-gif-12535136.gif",
    Sad: "https://tenor.com/view/white-rabbit-music-radio-dancing-gif-14540285155726448470.gif",
    Fatigued:
      "https://tenor.com/view/tonton-yuta-listening-to-music-gif-12319402.gif",
  };
  animalDisplay.innerHTML = `<img src="${animalGifs[condition]}" alt="${condition} animal listening" />`;

  selectCondition = condition;
  document.getElementById("generate-section").style.display = "block";
}
async function generateFreesoundSound() {
  const tags = {
    anxiety: "peaceful",
    adhd: "mindfulness",
    depression: "soothing",
    sleep: "healing",
  };

  const query = tags[selectedCondition] || "relaxation";
  const apiKey = "SrVIUBsuhm4o0H69FWtmQDk0NKCCVhbsx7qmOuWB";
  const url = `https://freesound.org/apiv2/search/text/?query=${query}&filter=duration:[10 TO 120]&fields=id,name,previews&token=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      alert("No sound found for this condition.");
      return;
    }
    const track = data.results[Math.floor(Math.random() * data.results.length)];
    const audioUrl = track.previews["preview-lq-mp3"];

    if (currentAudio) currentAudio.pause();
    currentAudio = new Audio(audioUrl);
    currentAudio.loop = true;
    currentAudio.play().catch((e) => console.error("Playback failed:", e));
    console.log("Playing:", track.name);
  } catch (err) {
    console.error("Freesound API error:", err);
    alert("Error fetching sound.");
  }
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

updateDisplay();
