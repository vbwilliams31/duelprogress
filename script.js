// --- Get DOM Elements ---
const sessionTitleInput = document.getElementById('sessionTitle');
const timeLimitInput = document.getElementById('timeLimit');
const timeUnitSelect = document.getElementById('timeUnit');
const timerProgress = document.getElementById('timerProgress');
const timerValueSpan = document.getElementById('timerValue');
const timerTimeDisplaySpan = document.getElementById('timerTimeDisplay'); // New span for MM:SS display

const tallyGoalInput = document.getElementById('tallyGoal');
const tallyButton = document.getElementById('tallyButton');
const tallyProgress = document.getElementById('tallyProgress');
const tallyValueSpan = document.getElementById('tallyValue');

const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');

// --- State Variables ---
let timerInterval = null;
let elapsedSeconds = 0;
let totalSeconds = 60; // Default, will be calculated
let currentTally = 0;
let tallyGoal = 50;
let timerStartTime = 0; // To store the exact start time for precise timing

// --- Helper Functions ---
/**
 * Formats a given number of seconds into MM:SS string.
 * @param {number} sec - Total seconds.
 * @returns {string} Formatted time string (e.g., "01:05").
 */
function formatTime(sec) {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Calculates the total duration in seconds based on input value and selected unit.
 * @returns {number} Total time limit in seconds.
 */
function calculateTotalSeconds() {
    const limitValue = parseInt(timeLimitInput.value, 10) || 1;
    const unit = timeUnitSelect.value;
    let calculatedSeconds = 1;

    if (unit === 'minutes') {
        calculatedSeconds = limitValue * 60;
    } else { // Default to seconds
        calculatedSeconds = limitValue;
    }
    return Math.max(1, calculatedSeconds); // Ensure minimum 1 second
}

// --- Core Update Functions ---
/**
 * Updates the timer progress bar, percentage, and MM:SS display.
 */
function updateTimerProgress() {
    const safeTotalSeconds = Math.max(1, totalSeconds);
    const percentage = Math.min(100, (elapsedSeconds / safeTotalSeconds) * 100);
    
    timerProgress.value = percentage;
    timerValueSpan.textContent = `${Math.floor(percentage)}%`;
    timerTimeDisplaySpan.textContent = `${formatTime(elapsedSeconds)} / ${formatTime(safeTotalSeconds)}`;
}

/**
 * Updates the tally progress bar and its text display.
 */
function updateTallyProgress() {
    const safeTallyGoal = Math.max(1, tallyGoal);
    const percentage = Math.min(100, (currentTally / safeTallyGoal) * 100);
    tallyProgress.value = percentage;
    tallyValueSpan.textContent = `${Math.floor(percentage)}% (${currentTally}/${safeTallyGoal})`;
}

// --- Control Functions ---
/**
 * Starts the timer countdown using precise timing.
 */
function startTimer() {
    if (timerInterval) {
        console.log("Timer already running.");
        return;
    }

    totalSeconds = calculateTotalSeconds(); // Set totalSeconds based on current inputs
    elapsedSeconds = 0; // Reset elapsed time
    timerStartTime = Date.now(); // Record the precise start time

    updateTimerProgress(); // Update UI immediately to show 00:00 / TT:TT and 0%

    // Disable controls during the session
    startButton.disabled = true;
    startButton.classList.add('opacity-50', 'cursor-not-allowed');
    timeLimitInput.disabled = true;
    timeUnitSelect.disabled = true;
    sessionTitleInput.disabled = true;
    tallyGoalInput.disabled = true;

    timerInterval = setInterval(() => {
        const currentTime = Date.now();
        const elapsedMilliseconds = currentTime - timerStartTime;
        elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);

        if (elapsedSeconds >= totalSeconds) {
            elapsedSeconds = totalSeconds; // Cap elapsed time at total time
            updateTimerProgress(); // Final update to show full time
            clearInterval(timerInterval);
            timerInterval = null;
            console.log("Timer finished!");
            // Re-enable controls
            startButton.disabled = false;
            startButton.classList.remove('opacity-50', 'cursor-not-allowed');
            timeLimitInput.disabled = false;
            timeUnitSelect.disabled = false;
            sessionTitleInput.disabled = false;
            tallyGoalInput.disabled = false;
        } else {
            updateTimerProgress();
        }
    }, 250); // Update interval (e.g., 4 times a second for smoother display)
}

/**
 * Handles clicks on the tally button.
 */
function handleTallyClick() {
    if (currentTally < tallyGoal) {
         currentTally++;
         updateTallyProgress();
    } else {
         console.log("Tally goal already reached!");
    }

    if (currentTally >= tallyGoal) {
         tallyButton.disabled = true;
         tallyButton.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

/**
 * Resets the application state.
 * @param {boolean} preserveTitle - If true, the session title will not be cleared.
 * @param {boolean} fromInitialLoad - If true, indicates it's the initial page load.
 */
function resetAll(preserveTitle = false, fromInitialLoad = false) {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    elapsedSeconds = 0;
    currentTally = 0;

    if (!preserveTitle) {
        sessionTitleInput.value = '';
    }
    
    // If it's the initial load, use default values. Otherwise, use current input values.
    if (fromInitialLoad) {
        timeLimitInput.value = "60";
        timeUnitSelect.value = "seconds";
        tallyGoalInput.value = "50";
    }

    totalSeconds = calculateTotalSeconds(); 
    tallyGoal = parseInt(tallyGoalInput.value, 10) || 50;
    if (tallyGoal < 1) tallyGoal = 1;

    updateTimerProgress(); // This will now also update the MM:SS display
    updateTallyProgress();

    // Re-enable all relevant controls
    startButton.disabled = false;
    startButton.classList.remove('opacity-50', 'cursor-not-allowed');
    timeLimitInput.disabled = false;
    timeUnitSelect.disabled = false;
    sessionTitleInput.disabled = false; 
    tallyGoalInput.disabled = false;
    tallyButton.disabled = false;
    tallyButton.classList.remove('opacity-50', 'cursor-not-allowed');

    console.log("App reset. Title preserved:", preserveTitle);
}


// --- Event Listeners ---
startButton.addEventListener('click', startTimer);
tallyButton.addEventListener('click', handleTallyClick);

resetButton.addEventListener('click', () => resetAll(false)); // Reset button always clears title

// Changing parameters only resets progress, keeps title if timer is not running
timeLimitInput.addEventListener('change', () => {
    if (!timerInterval) {
        totalSeconds = calculateTotalSeconds(); // Update total seconds
        elapsedSeconds = 0; // Reset elapsed
        updateTimerProgress(); // Update display
    }
});
timeUnitSelect.addEventListener('change', () => {
     if (!timerInterval) {
        totalSeconds = calculateTotalSeconds(); // Update total seconds
        elapsedSeconds = 0; // Reset elapsed
        updateTimerProgress(); // Update display
    }
});

tallyGoalInput.addEventListener('change', () => {
    if (!timerInterval) {
        currentTally = 0; 
        tallyGoal = parseInt(tallyGoalInput.value, 10) || 50;
         if (tallyGoal < 1) tallyGoal = 1;
        updateTallyProgress();
        tallyButton.disabled = false;
        tallyButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }
});

// --- Initial Setup ---
// Initial reset on load, clears title by default and sets default input values.
document.addEventListener('DOMContentLoaded', () => resetAll(false, true));
