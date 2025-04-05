// Game UI elements and drawing functions
export const gameUI = function (p) {
  // Constants
  const themeColor = "#00FF00"; // Green for a "hacker" feel

  // Variables for various screens
  let startTime;
  let glitchDuration = 3000;
  let finalCode = "0xAF3E-9B7C";

  // Draw start screen
  function drawStartScreen() {
    p.background(0);
    p.textSize(32);
    p.fill(255);
    p.text("System Alert: Infiltration Detected", p.width / 2, p.height / 2 - 40);
    p.textSize(20);
    p.text("Unauthorized access in progress. Countermeasures required.", p.width / 2, p.height / 2);
    p.stroke(255);
    p.strokeWeight(2);
    p.fill(50);
    p.rectMode(p.CENTER);
    p.rect(p.width / 2, p.height / 2 + 70, 250, 60, 5);
    p.noStroke();
    p.fill(255);
    p.textSize(20);
    p.text("Initiate Protocol", p.width / 2, p.height / 2 + 70);
    p.rectMode(p.CORNER);
  }

  function drawGlitchScreen() {
    p.background(0);
    for (let i = 0; i < 15; i++) {
      p.stroke(p.random(255), p.random(255), p.random(255));
      p.strokeWeight(p.random(1, 4));
      let y = p.random(p.height);
      p.line(0, y, p.width, y);
    }
    p.textSize(48);
    p.textAlign(p.CENTER, p.CENTER);
    let glitchText = "SYSTEM INITIALIZING";
    for (let i = 0; i < 10; i++) {
      p.fill(p.random(200, 255), p.random(50, 150), 0);
      p.text(glitchText, p.width / 2 + p.random(-10, 10), p.height / 2 + p.random(-10, 10));
    }
    let secondsLeft = p.ceil((glitchDuration - (p.millis() - startTime)) / 1000);
    p.textSize(24);
    p.fill(255);
    p.text("Starting in " + secondsLeft + "...", p.width / 2, p.height / 2 + 60);
  }

  function drawFinalScreen() {
    p.background(10);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(48);
    p.fill(p.color(themeColor));
    p.text("INTRUSION NEUTRALIZED", p.width / 2, p.height / 2 - 20);
    p.textSize(32);
    p.fill(255);
    p.text("Verification Code: " + finalCode, p.width / 2, p.height / 2 + 30);

    // After game completion, we can trigger the email (optional)
    if (!window.gameCompleted) {
      window.gameCompleted = true;
      if (typeof window.triggerFinalUploadEmail === 'function') {
        window.triggerFinalUploadEmail();
      }
    }
  }

  function drawProgressBar() {
    let barWidth = 430;
    let barHeight = 20;
    let startX = p.width / 2 - barWidth / 2;
    let startY = 20;

    p.fill(50);
    p.noStroke();
    p.rect(startX, startY, barWidth, barHeight, 5);

    p.noFill();
    p.stroke(p.color(themeColor));
    p.strokeWeight(2);
    p.rect(startX, startY, barWidth, barHeight, 5);

    let currentStage = window.gameState.getCurrentStage();

    p.fill(255);
    p.textSize(16);
    p.text("GAME " + currentStage + "/4", p.width / 2, startY + barHeight / 2);
    p.noStroke();
    p.fill(p.color(themeColor));
    p.rect(startX, startY, barWidth * (currentStage / 4), barHeight, 5);
  }

  function drawTitle() {
    p.push();
    p.textAlign(p.CENTER, p.CENTER);
    p.noStroke();
    p.textSize(32);
    p.fill("#FFCB3F");
    p.text("SYSTEM ACCESS INTERFACE", p.width / 2, 90);
    p.textSize(16);
    p.text("Decryption Protocol: Rapid Cyber Breach", p.width / 2, 122);
    p.pop();
  }

  function drawQuestionBox(text) {
    let boxX = 20;
    let boxY = 175;
    let boxW = p.width - 40;
    let boxH = 60;
    p.stroke(p.color(themeColor));
    p.strokeWeight(2);
    p.fill("#1D1311");
    p.rect(boxX, boxY, boxW, boxH, 5);
    p.noStroke();
    p.fill(p.color(themeColor));
    p.textSize(16);
    p.textStyle(p.BOLD);
    p.text(text, p.width / 2, boxY + boxH / 2);
    p.textStyle(p.NORMAL);
  }

  function setStartTime(time) {
    startTime = time;
  }

  function getGlitchDuration() {
    return glitchDuration;
  }

  // Return public interface
  return {
    drawStartScreen,
    drawGlitchScreen,
    drawFinalScreen,
    drawProgressBar,
    drawTitle,
    drawQuestionBox,
    setStartTime,
    getGlitchDuration,
    startTime
  };
};