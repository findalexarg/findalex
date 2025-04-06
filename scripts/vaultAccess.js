// Vault access functionality
const correctCode = "0xF3E-9B7C"; // change as needed
const requiredHours = 12;
const vaultKey = "vaultAccessTimestamp";

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
  } else {
    document.getElementById("pendingSection").classList.remove("hidden");
    document.getElementById("lastAccessTime").textContent = startTime.toLocaleString();
  }
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