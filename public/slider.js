const slider = document.getElementById('gameweek-slider');
const playButton = document.getElementById('slider-button');

let isPlaying = false
let interval = null

function playLoop() {
  if (isPlaying) return; // already playing
  isPlaying = true;
  playButton.textContent = 'Pause';

  interval = setInterval(() => {
    let current = Number(slider.value);
    let min = Number(slider.min);
    let max = Number(slider.max);
    let next = current + 1;

    if (next > max) {
        slider.value = min
        slider.dispatchEvent(new Event('input', { bubbles: true }))
        pauseLoop()
        return
    }

    slider.value = next;
    slider.dispatchEvent(new Event('input', { bubbles: true }))
  }, 1000);
}

function pauseLoop() {
  isPlaying = false;
  playButton.textContent = 'Play';
  clearInterval(interval);
}

playButton.addEventListener('click', () => {
  if (isPlaying) pauseLoop();
  else playLoop();
})
