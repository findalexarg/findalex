// Stage 4: Word Unscrambler
import { gameState } from './gameState.js';

export const stage4 = function (p) {
  // Private variables
  let correct = "WESEEYOU";
  let letters = [];
  let scrambled = [];
  let selected = [];
  let pulse = 0;

  // Initialize stage
  function init() {
    letters = correct.split("");
    scrambled = shuffleArray(letters.slice());
    selected = [];
    pulse = 0;
  }

  function draw() {
    p.background(10);

    // Cyber background
    p.push();
    p.stroke(0, 100, 0, 30);
    for (let i = 0; i < p.width; i += 40) {
      p.line(i, 0, i, p.height);
    }
    for (let i = 0; i < p.height; i += 40) {
      p.line(0, i, p.width, i);
    }
    p.pop();

    // Flashing binary in the background
    p.push();
    p.textSize(16);
    p.fill(0, 255, 0, 20);
    for (let i = 0; i < 20; i++) {
      let x = p.random(p.width);
      let y = p.random(p.height);
      p.text(p.random() > 0.5 ? "1" : "0", x, y);
    }
    p.pop();

    // Pulsing effect
    pulse += 0.03;
    let glow = p.sin(pulse) * 10 + 10;

    let boxSize = 60;
    let spacing = 15;
    let totalWidth = scrambled.length * (boxSize + spacing) - spacing;
    let startX = p.width / 2 - totalWidth / 2;
    let y = p.height / 2;

    // Draw scrambled letters in boxes
    for (let i = 0; i < scrambled.length; i++) {
      p.push();
      p.drawingContext.shadowBlur = glow;
      p.drawingContext.shadowColor = p.color(0, 255, 0);
      p.fill(20, 40, 20);
      p.stroke(0, 255, 0);
      p.strokeWeight(2);
      p.rect(startX + i * (boxSize + spacing), y, boxSize, boxSize, 5);
      p.fill(0, 255, 0);
      p.noStroke();
      p.textSize(32);
      p.text(scrambled[i], startX + i * (boxSize + spacing) + boxSize / 2, y + boxSize / 2);
      p.pop();
    }

    // Draw selected letters above with terminal style
    p.push();
    p.fill(0, 0, 0, 200);
    p.stroke(0, 255, 0);
    p.strokeWeight(2);
    p.rect(p.width / 2 - 250, y - 150, 500, 80, 5);

    p.fill(0, 255, 0);
    p.textSize(32);
    if (selected.length > 0) {
      p.text(selected.join(""), p.width / 2, y - 110);
    } else {
      p.text("_ _ _ _ _ _ _ _ _", p.width / 2, y - 110);
    }
    p.pop();

    // Draw instructions
    p.fill(255);
    p.textSize(24);
    p.text("Unscramble the secret message", p.width / 2, y - 180);

    // Show time remaining
    let timeLeft = gameState.getRoundTimeLimit() - (p.millis() - gameState.getStageStartTime());
    if (timeLeft > 0) {
      p.fill(255);
      p.textSize(24);
      p.text("Time: " + p.ceil(timeLeft / 1000) + "s", p.width / 2, y + 150);
    }

    // If complete, check answer
    if (selected.join("") === correct) {
      p.push();
      p.drawingContext.shadowBlur = 30;
      p.drawingContext.shadowColor = p.color(0, 255, 0);
      p.fill(0, 255, 0, 100);
      p.rect(0, 0, p.width, p.height);
      p.pop();

      gameState.nextStage();
    } else if (selected.length === letters.length && selected.join("") !== correct) {
      // Wrong answer: flash red and reset selection
      p.push();
      p.drawingContext.shadowBlur = 30;
      p.drawingContext.shadowColor = p.color(255, 0, 0);
      p.fill(255, 0, 0, 100);
      p.rect(0, 0, p.width, p.height);
      p.pop();

      selected = [];
      scrambled = shuffleArray(letters.slice());
    }
  }

  function handleClick() {
    let boxSize = 60;
    let spacing = 15;
    let totalWidth = scrambled.length * (boxSize + spacing) - spacing;
    let startX = p.width / 2 - totalWidth / 2;
    let y = p.height / 2;

    for (let i = 0; i < scrambled.length; i++) {
      let x0 = startX + i * (boxSize + spacing);
      if (p.mouseX > x0 && p.mouseX < x0 + boxSize && p.mouseY > y && p.mouseY < y + boxSize) {
        // Play feedback sound
        gameState.glitchButton.play();

        selected.push(scrambled[i]);
        scrambled.splice(i, 1);
        break;
      }
    }
  }

  // Helper function to shuffle arrays
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = p.floor(p.random(i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Return public interface
  return {
    init,
    draw,
    handleClick
  };
};