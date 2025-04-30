let timerInterval = null;
let elapsedSeconds = 0;
let totalSeconds = 60;
let currentTally = 0;
let tallyGoal = 50;

const timeLimitInput = document.getElementById('timeLimit');
const timeUnitSelect = document.getElementById('timeUnit');
const timerProgress = document.getElementById('timerProgress');
const timerValueSpan = document.getElementById('timerValue');
const countdownDisplay = document.getElementById('timerCountdown');

const tallyGoalInput = document.getElementById('tallyGoal');
const tallyButton = document.getElementById('tallyButton');
const tallyProgress = document.getElementById('tallyProgress');
const tallyValueSpan = document.getElementById('tallyValue');

const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');

function calculateTotalSeconds() {
  const limitValue = parseInt(timeLimitInput.value, 10) || 1;
  const unit = timeUnitSelect.value;
  return Math.max(1, unit === 'minutes' ? limitValue * 60 : limitValue);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateTimerProgress() {
  const percentage = Math.min(100, (elapsedSeconds / totalSeconds) * 100);
  timerProgress.value = percentage;
  timerValueSpan.textContent = `${Math.floor(percentage)}%`;
  const remaining = Math.max(0, totalSeconds - elapsedSeconds);
  countdownDisplay.textContent = `${formatTime(remaining)} remaining`;
}

function updateTallyProgress() {
  const safeTallyGoal = Math.max(1, tallyGoal);
  const percentage = Math.min(100, (currentTally / safeTallyGoal) * 100);
  tallyProgress.value = percentage;
  tallyValueSpan.textContent = `${Math.floor(percentage)}% (${currentTally}/${safeTallyGoal})`;
}

function startTimer() {
  if (timerInterval) return;

  elapsedSeconds = 0;
  totalSeconds = calculateTotalSeconds();

  updateTimerProgress();

  // Disable UI
  startButton.disabled = true;
  startButton.classList.add('opacity-50', 'cursor-not-allowed');
  timeLimitInput.disabled = true;
  timeUnitSelect.disabled = true;

  countdownDisplay.classList.remove('timer-done-animate');

  const startTime = Date.now();

  timerInterval = setInterval(() => {
    const elapsedMs = Date.now() - startTime;
    elapsedSeconds = Math.floor(elapsedMs / 1000);

    updateTimerProgress();

    if (elapsedSeconds >= totalSeconds) {
      clearInterval(timerInterval);
      timerInterval = null;

      countdownDisplay.textContent = "00:00 done!";
      countdownDisplay.classList.add('timer-done-animate');

      startButton.disabled = false;
      startButton.classList.remove('opacity-50', 'cursor-not-allowed');
      timeLimitInput.disabled = false;
      timeUnitSelect.disabled = false;
    }
  }, 200);
}

function handleTallyClick() {
  if (currentTally < tallyGoal) {
    currentTally++;
    updateTallyProgress();
  }

  if (currentTally >= tallyGoal) {
    tallyButton.disabled = true;
    tallyButton.classList.add('opacity-50', 'cursor-not-allowed');
  }
}

function resetAll() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  elapsedSeconds = 0;
  currentTally = 0;

  totalSeconds = calculateTotalSeconds();
  tallyGoal = parseInt(tallyGoalInput.value, 10) || 50;
  if (tallyGoal < 1) tallyGoal = 1;

  updateTimerProgress();
  updateTallyProgress();

  startButton.disabled = false;
  startButton.classList.remove('opacity-50', 'cursor-not-allowed');
  timeLimitInput.disabled = false;
  timeUnitSelect.disabled = false;

  tallyButton.disabled = false;
  tallyButton.classList.remove('opacity-50', 'cursor-not-allowed');

  countdownDisplay.textContent = formatTime(totalSeconds);
  countdownDisplay.classList.remove('timer-done-animate');
}

startButton.addEventListener('click', startTimer);
tallyButton.addEventListener('click', handleTallyClick);
resetButton.addEventListener('click', resetAll);
timeLimitInput.addEventListener('change', () => { if (!timerInterval) resetAll(); });
timeUnitSelect.addEventListener('change', () => { if (!timerInterval) resetAll(); });
tallyGoalInput.addEventListener('change', resetAll);
document.addEventListener('DOMContentLoaded', resetAll);
