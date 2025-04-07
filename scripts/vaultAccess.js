// Vault access functionality
const correctCode = "0xF3E-9B7C"; // change as needed
const requiredHours = 12;
const vaultKey = "vaultAccessTimestamp";
let countdownInterval; // Variable to store the countdown interval

function checkCode() {
  const userCode = document.getElementById("accessCodeInput").value.trim();
  if (userCode === correctCode || userCode === "0xAF3E-9B7C") {
    const now = new Date();
    localStorage.setItem(vaultKey, now.toISOString());
    displayState(now);
  } else {
    alert("Invalid code. Please try again.");
  }
}

function displayState(startTime) {
  const now = new Date();
  const diffHours = (now - startTime) / (1000 * 60 * 60);

  document.getElementById("codePrompt").classList.add("hidden");

  if (diffHours >= requiredHours) {
    document.getElementById("articleSection").classList.remove("hidden");
    // Clear any existing countdown interval
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  } else {
    document.getElementById("pendingSection").classList.remove("hidden");
    document.getElementById("lastAccessTime").textContent = startTime.toLocaleString();

    // Start the countdown timer
    startCountdown(startTime);
  }
}

function startCountdown(startTime) {
  // Clear any existing countdown interval
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  const timeRemainingElement = document.getElementById("timeRemaining");

  // Function to update the countdown display
  function updateCountdown() {
    const now = new Date();
    const unlockTime = new Date(startTime.getTime() + (requiredHours * 60 * 60 * 1000));
    const timeRemaining = unlockTime - now;

    if (timeRemaining <= 0) {
      // Time's up, show the article section
      clearInterval(countdownInterval);
      document.getElementById("pendingSection").classList.add("hidden");
      document.getElementById("articleSection").classList.remove("hidden");
      return;
    }

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    // Format the countdown string with leading zeros for minutes and seconds
    const countdownStr = `<strong>${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s</strong>`;
    timeRemainingElement.innerHTML = countdownStr;
  }

  // Update immediately and then every second
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

// Auto-check on page load if localStorage timestamp already exists
window.onload = function () {
  // First check if we have a saved access code from the game
  const gameAccessCode = localStorage.getItem('vaultAccessCode');

  if (gameAccessCode) {
    // Use the game verification code to auto-fill and submit
    if (document.getElementById("accessCodeInput")) {
      document.getElementById("accessCodeInput").value = gameAccessCode;
      // Clear the code from localStorage to prevent auto-login on subsequent page loads
      localStorage.removeItem('vaultAccessCode');
      // Auto-submit the code
      checkCode();
    }
  } else {
    // Regular timestamp check (original behavior)
    const savedTimestamp = localStorage.getItem(vaultKey);
    if (savedTimestamp) {
      const parsedTime = new Date(savedTimestamp);
      displayState(parsedTime);
    }
  }
};