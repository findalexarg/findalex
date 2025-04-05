// Stage 2: Moving Target
import { gameState } from './gameState.js';

export const stage2 = function (p) {
  // Private variables
  let lineY = p.height ? p.height / 2 : 400; // Default value in case p.height is not available yet
  let markerX = p.width ? p.random(250, p.width - 250) : 600; // Adjusted for wider canvas
  let indicatorX = 250; // Initial position adjusted for wider canvas
  let direction = 1;
  let speed = 6.0; // Slower for easier timing
  let threshold = 30; // Wider hitbox for success
  let pulseSize = 0;
  let pulseDir = 1;

  // Initialize a new round
  function initRound() {
    lineY = p.height / 2;
    markerX = p.random(250, p.width - 250); // Adjusted for wider canvas
    indicatorX = 250; // Adjusted for wider canvas
    direction = 1;
    pulseSize = 0;
    pulseDir = 1;
  }

  function update() {
    indicatorX += speed * direction;
    if (indicatorX > p.width - 200 || indicatorX < 200) { // Adjusted margin for wider canvas
      direction *= -1;
    }
  }

  function draw() {
    p.background(10); // Keep it clean

    // Draw terminal-like grid background
    p.push();
    p.stroke(0, 100, 0, 30);
    for (let x = 0; x < p.width; x += 20) {
      p.line(x, 0, x, p.height);
    }
    for (let y = 0; y < p.height; y += 20) {
      p.line(0, y, p.width, y);
    }
    p.pop();

    // Draw circuit-like decorations
    p.push();
    p.stroke(0, 150, 0, 100);
    p.strokeWeight(1);
    p.noFill();
    for (let i = 0; i < 5; i++) {
      let y = p.map(i, 0, 4, p.height / 2 - 100, p.height / 2 + 100);
      p.beginShape();
      for (let x = 200; x < p.width - 200; x += 50) { // Adjusted for wider canvas
        p.vertex(x, y + p.random(-5, 5));
      }
      p.endShape();
    }
    p.pop();

    // Highlight success zone with pulsing effect
    pulseSize += 0.05 * pulseDir;
    if (pulseSize > 1 || pulseSize < 0) pulseDir *= -1;

    let pulseAlpha = p.map(pulseSize, 0, 1, 30, 80);

    p.noStroke();
    p.fill(0, 255, 0, pulseAlpha);
    p.rect(markerX - threshold, lineY - 25, threshold * 2, 50);

    // Draw horizontal line - more cyberpunk
    p.push();
    p.drawingContext.shadowBlur = 10;
    p.drawingContext.shadowColor = p.color(0, 255, 0);
    p.stroke(0, 255, 0);
    p.strokeWeight(3);
    p.line(200, lineY, p.width - 200, lineY); // Adjusted for wider canvas
    p.pop();

    // Draw marker (target position)
    p.push();
    p.drawingContext.shadowBlur = 15;
    p.drawingContext.shadowColor = p.color(0, 255, 0);
    p.stroke(0, 255, 0);
    p.strokeWeight(5);
    p.line(markerX, lineY - 30, markerX, lineY + 30);
    p.pop();

    // Draw indicator (moving target) with a glowing effect
    p.push();
    p.drawingContext.shadowBlur = 20;
    p.drawingContext.shadowColor = p.color(255, 0, 0);
    p.fill(255, 0, 0);
    p.noStroke();
    p.ellipse(indicatorX, lineY, 20, 20);
    p.pop();

    // Display time and instructions
    p.fill(255);
    p.textSize(24);
    p.text("Press SPACE or CLICK to stop the target in the green zone", p.width / 2, p.height / 2 - 100);

    let timeLeft = gameState.getRoundTimeLimit() - (p.millis() - gameState.getStageStartTime());
    if (timeLeft > 0) {
      p.fill(255);
      p.textSize(24);
      p.text("Time: " + p.ceil(timeLeft / 1000) + "s", p.width / 2, p.height / 2 + 100);
    }
  }

  function handleStop() {
    let diff = p.abs(indicatorX - markerX);

    // Display visual feedback
    p.push();
    if (diff < threshold) {
      // Success flash
      p.drawingContext.shadowBlur = 30;
      p.drawingContext.shadowColor = p.color(0, 255, 0);
      p.fill(0, 255, 0, 100);
      p.rect(0, 0, p.width, p.height);
    } else {
      // Failure flash
      p.drawingContext.shadowBlur = 30;
      p.drawingContext.shadowColor = p.color(255, 0, 0);
      p.fill(255, 0, 0, 100);
      p.rect(0, 0, p.width, p.height);
    }
    p.pop();

    if (diff < threshold) {
      // Successful stop
      let roundCount = gameState.getRoundCount() + 1;
      gameState.setRoundCount(roundCount);

      if (roundCount >= 5) {
        gameState.nextStage();
      } else {
        initRound();
        gameState.setStageStartTime(p.millis());
      }
    } else {
      // Missed, but don't reset completely
      initRound();
      gameState.setStageStartTime(p.millis());
    }
  }

  // Return public interface
  return {
    initRound,
    update,
    draw,
    handleStop
  };
};