// Cyber Intrusion Countermeasure – Timed Hacking Puzzles
// Styling (glitch intro, logo, progress bar, question box) is preserved.

// Import the closeGamePopup function
import { closeGamePopup } from './gamePopup.js';

// Define p5.js sketch as module for better integration
let sketch = null;
let gameCanvas = null;

// Export initGame function to be called from gamePopup.js
export function initGame(containerId) {
  // Remove any existing canvas
  if (gameCanvas) {
    gameCanvas.remove();
  }

  // Create new p5 instance
  sketch = new p5((p) => {
    // Copy all the existing p5 functions to the instance
    p.currentStage = 1;
    p.roundCount = 0; // For stages 1-3 (each requires 5 rounds)
    p.stageStartTime = 0;
    p.roundTimeLimit = 0; // will be set per stage round
    p.timeRemaining = 0;

    p.finalScreen = false;
    p.gameCompleted = false; // Flag to track if game has been completed
    p.finalMessageTimer = 0; // Timer for final message display
    p.finalCode = "0xAF3E-9B7C";
    p.questionText = "";
    p.started = false;
    p.glitchDuration = 3000;
    p.startTime = 0;
    p.themeColor = "#00FF00"; // Changed to green for a more "hacker" feel

    // Assets
    p.logo = null;
    p.glitchSound = null;
    p.glitchButton = null;

    p.preload = function () {
      p.logo = p.loadImage("Logo_Final.png");
      p.glitchSound = p.loadSound("glitch-sounds.mp3");
      p.glitchButton = p.loadSound("glitch-button.mp3");
    };

    // Stage 1 variables
    p.stage1_gridRows = 3;
    p.stage1_gridCols = 3;
    p.stage1_path = [];       // Array of {row, col}
    p.stage1_playerInput = [];
    p.stage1_memorizeTime = 2000;  // Show arrows for 3 seconds
    p.arrowDelay = 400;  // Longer delay between showing each arrow (in ms)
    p.stage1_initialized = false;

    p.initStage1Round = function () {
      p.stage1_playerInput = [];
      p.stage1_path = [];
      let pathLength = 2; // number of cells in the path

      // Pick a random starting cell.
      let startRow = p.floor(p.random(p.stage1_gridRows));
      let startCol = p.floor(p.random(p.stage1_gridCols));
      p.stage1_path.push({ row: startRow, col: startCol });

      // Generate path: each step goes to a neighboring cell (up/down/left/right)
      for (let i = 1; i <= pathLength; i++) {
        let last = p.stage1_path[i - 1];
        let neighbors = [];
        if (last.row > 0) neighbors.push({ row: last.row - 1, col: last.col });
        if (last.row < p.stage1_gridRows - 1) neighbors.push({ row: last.row + 1, col: last.col });
        if (last.col > 0) neighbors.push({ row: last.row, col: last.col - 1 });
        if (last.col < p.stage1_gridCols - 1) neighbors.push({ row: last.row, col: last.col + 1 });

        const visitedCells = new Set();
        p.stage1_path.forEach(cell => visitedCells.add(`${cell.row},${cell.col}`));

        // Then filter using the Set for O(1) lookups
        neighbors = neighbors.filter(n => !visitedCells.has(`${n.row},${n.col}`));

        // If no valid neighbor remains, break out.
        if (neighbors.length === 0) break;

        let next = p.random(neighbors);
        p.stage1_path.push(next);
      }

      // Reset timer 
      p.stageStartTime = p.millis();
      p.stage1_initialized = true;
    };

    p.drawStage1 = function () {
      let gridSize = 300;
      let startX = p.width / 2 - gridSize / 2;
      let startY = p.height / 2 - gridSize / 2;
      let cellSize = gridSize / p.stage1_gridCols;

      // Draw grid with subtle glow
      p.push();
      p.drawingContext.shadowBlur = 10;
      p.drawingContext.shadowColor = p.color(p.themeColor);
      p.stroke(100, 255, 100);
      p.strokeWeight(2);
      for (let r = 0; r < p.stage1_gridRows; r++) {
        for (let c = 0; c < p.stage1_gridCols; c++) {
          p.noFill();
          p.rect(startX + c * cellSize, startY + r * cellSize, cellSize, cellSize);
        }
      }
      p.pop();

      // During memorize phase, show lines connecting path cells
      let elapsed = p.millis() - p.stageStartTime;
      if (elapsed < p.stage1_memorizeTime) {
        let arrowsToShow = p.min(p.stage1_path.length - 1, p.floor(elapsed / p.arrowDelay));

        // Display timer for memorization phase
        p.fill(255);
        p.textSize(24);
        p.text("Memorize: " + p.ceil((p.stage1_memorizeTime - elapsed) / 1000) + "s", p.width / 2, p.height / 2 - gridSize / 2 - 30);

        // Draw highlight on start cell
        p.fill(0, 255, 0, 100);
        p.rect(startX + p.stage1_path[0].col * cellSize, startY + p.stage1_path[0].row * cellSize, cellSize, cellSize);

        // Draw the path lines
        p.stroke(0, 255, 0, 150);
        p.strokeWeight(3);

        for (let i = 0; i < arrowsToShow; i++) {
          let a = p.stage1_path[i];
          let b = p.stage1_path[i + 1];

          // Draw connecting line
          p.line(
            startX + a.col * cellSize + cellSize / 2,
            startY + a.row * cellSize + cellSize / 2,
            startX + b.col * cellSize + cellSize / 2,
            startY + b.row * cellSize + cellSize / 2
          );
        }
      }
      // Highlight player's clicked cells
      p.noStroke();
      p.fill(255, 100, 0, 150);
      for (let cell of p.stage1_playerInput) {
        let cx = startX + cell.col * cellSize;
        let cy = startY + cell.row * cellSize;
        p.rect(cx, cy, cellSize, cellSize);
      }

      // Show time remaining
      let timeLeft = p.roundTimeLimit - (p.millis() - p.stageStartTime);
      if (timeLeft > 0) {
        p.fill(255);
        p.textSize(24);
        p.text("Time: " + p.ceil(timeLeft / 1000) + "s", p.width / 2, p.height / 2 + gridSize / 2 + 30);
      }
    };

    p.handleStage1Click = function () {
      let gridSize = 300;
      let startX = p.width / 2 - gridSize / 2;
      let startY = p.height / 2 - gridSize / 2;
      let cellSize = gridSize / p.stage1_gridCols;
      let col = p.floor((p.mouseX - startX) / cellSize);
      let row = p.floor((p.mouseY - startY) / cellSize);
      if (row >= 0 && row < p.stage1_gridRows && col >= 0 && col < p.stage1_gridCols) {
        // Only allow input after memorize phase is over.
        if (p.millis() - p.stageStartTime > p.stage1_memorizeTime) {
          // Play feedback sound
          p.glitchButton.play();

          p.stage1_playerInput.push({ row: row, col: col });
          if (p.stage1_playerInput.length === p.stage1_path.length) {
            // Check answer
            let correct = true;
            for (let i = 0; i < p.stage1_path.length; i++) {
              if (p.stage1_playerInput[i].row !== p.stage1_path[i].row ||
                p.stage1_playerInput[i].col !== p.stage1_path[i].col) {
                correct = false;
                break;
              }
            }
            if (correct) {
              p.roundCount++;
              if (p.roundCount >= 5) {
                p.nextStage();
              } else {
                p.initStage1Round();
              }
            } else {
              // Provide visual feedback for incorrect attempt
              p.fill(255, 0, 0, 150);
              let gridSize = 300;
              let startX = p.width / 2 - gridSize / 2;
              let startY = p.height / 2 - gridSize / 2;
              p.rect(startX, startY, gridSize, gridSize);

              p.roundCount = 0;
              p.initStage1Round();
            }
          }
        }
      }
    };

    // Stage 2 variables
    p.stage2_lineY = 0;
    p.stage2_markerX = 0;
    p.stage2_indicatorX = 0;
    p.stage2_direction = 1;
    p.stage2_speed = 6.0; // Slower for easier timing
    p.stage2_threshold = 30; // Wider hitbox for success
    p.stage2_pulseSize = 0;
    p.stage2_pulseDir = 1;

    p.initStage2Round = function () {
      p.stage2_lineY = p.height / 2;
      p.stage2_markerX = p.random(150, p.width - 150);
      p.stage2_indicatorX = 150;
      p.stage2_direction = 1;
      p.stage2_pulseSize = 0;
      p.stage2_pulseDir = 1;
    };

    p.drawStage2 = function () {
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
        for (let x = 100; x < p.width - 100; x += 50) {
          p.vertex(x, y + p.random(-5, 5));
        }
        p.endShape();
      }
      p.pop();

      // Highlight success zone with pulsing effect
      p.stage2_pulseSize += 0.05 * p.stage2_pulseDir;
      if (p.stage2_pulseSize > 1 || p.stage2_pulseSize < 0) p.stage2_pulseDir *= -1;

      let pulseAlpha = p.map(p.stage2_pulseSize, 0, 1, 30, 80);

      p.noStroke();
      p.fill(0, 255, 0, pulseAlpha);
      p.rect(p.stage2_markerX - p.stage2_threshold, p.stage2_lineY - 25, p.stage2_threshold * 2, 50);

      // Draw horizontal line - more cyberpunk
      p.push();
      p.drawingContext.shadowBlur = 10;
      p.drawingContext.shadowColor = p.color(0, 255, 0);
      p.stroke(0, 255, 0);
      p.strokeWeight(3);
      p.line(100, p.stage2_lineY, p.width - 100, p.stage2_lineY);
      p.pop();

      // Draw marker (target position)
      p.push();
      p.drawingContext.shadowBlur = 15;
      p.drawingContext.shadowColor = p.color(0, 255, 0);
      p.stroke(0, 255, 0);
      p.strokeWeight(5);
      p.line(p.stage2_markerX, p.stage2_lineY - 30, p.stage2_markerX, p.stage2_lineY + 30);
      p.pop();

      // Draw indicator (moving target) with a glowing effect
      p.push();
      p.drawingContext.shadowBlur = 20;
      p.drawingContext.shadowColor = p.color(255, 0, 0);
      p.fill(255, 0, 0);
      p.noStroke();
      p.ellipse(p.stage2_indicatorX, p.stage2_lineY, 20, 20);
      p.pop();

      // Display time and instructions
      p.fill(255);
      p.textSize(24);
      p.text("Press SPACE or CLICK to stop the target in the green zone", p.width / 2, p.height / 2 - 100);

      let timeLeft = p.roundTimeLimit - (p.millis() - p.stageStartTime);
      if (timeLeft > 0) {
        p.fill(255);
        p.textSize(24);
        p.text("Time: " + p.ceil(timeLeft / 1000) + "s", p.width / 2, p.height / 2 + 100);
      }
    };

    p.updateStage2 = function () {
      p.stage2_indicatorX += p.stage2_speed * p.stage2_direction;
      if (p.stage2_indicatorX > p.width - 100 || p.stage2_indicatorX < 100) {
        p.stage2_direction *= -1;
      }
    };

    p.handleStage2Stop = function () {
      let diff = p.abs(p.stage2_indicatorX - p.stage2_markerX);

      // Display visual feedback
      p.push();
      if (diff < p.stage2_threshold) {
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

      if (diff < p.stage2_threshold) {
        // Successful stop
        p.roundCount++;

        if (p.roundCount >= 5) {
          p.nextStage();
        } else {
          p.initStage2Round();
          p.stageStartTime = p.millis();
        }
      } else {
        // Missed, but don't reset completely
        p.initStage2Round();
        p.stageStartTime = p.millis();
      }
    };

    // Stage 3 variables
    p.stage3_gridRows = 4;
    p.stage3_gridCols = 4;
    p.stage3_path = [];
    p.stage3_playerInput = [];
    p.stage3_memorizeTime = 1500;  // Less time to memorize

    p.initStage3Round = function () {
      p.stage3_playerInput = [];
      p.stage3_path = [];
      let pathLength = 5; // Longer path than stage 1
      let startRow = p.floor(p.random(p.stage3_gridRows));
      let startCol = p.floor(p.random(p.stage3_gridCols));
      p.stage3_path.push({ row: startRow, col: startCol });
      for (let i = 1; i < pathLength; i++) {
        let last = p.stage3_path[i - 1];
        let neighbors = [];
        if (last.row > 0) neighbors.push({ row: last.row - 1, col: last.col });
        if (last.row < p.stage3_gridRows - 1) neighbors.push({ row: last.row + 1, col: last.col });
        if (last.col > 0) neighbors.push({ row: last.row, col: last.col - 1 });
        if (last.col < p.stage3_gridCols - 1) neighbors.push({ row: last.row, col: last.col + 1 });

        // Filter out cells already in the path
        neighbors = neighbors.filter(n => !p.stage3_path.some(p => p.row === n.row && p.col === n.col));

        if (neighbors.length === 0) break;
        let next = p.random(neighbors);
        p.stage3_path.push(next);
      }

      // Reset timer
      p.stageStartTime = p.millis();
    };

    p.drawStage3 = function () {
      let gridSize = 300;
      let startX = p.width / 2 - gridSize / 2;
      let startY = p.height / 2 - gridSize / 2;
      let cellSize = gridSize / p.stage3_gridCols;

      // Draw grid with cyberpunk effect
      p.push();
      p.drawingContext.shadowBlur = 5;
      p.drawingContext.shadowColor = p.color(p.themeColor);
      p.stroke(0, 255, 0);
      p.strokeWeight(2);
      for (let r = 0; r < p.stage3_gridRows; r++) {
        for (let c = 0; c < p.stage3_gridCols; c++) {
          p.noFill();
          p.rect(startX + c * cellSize, startY + r * cellSize, cellSize, cellSize);
        }
      }
      p.pop();

      // Show the path if within memorize time
      let elapsed = p.millis() - p.stageStartTime;
      if (elapsed < p.stage3_memorizeTime) {
        // Display timer for memorization phase
        p.fill(255);
        p.textSize(24);
        p.text("Memorize: " + p.ceil((p.stage3_memorizeTime - elapsed) / 1000) + "s", p.width / 2, p.height / 2 - gridSize / 2 - 30);

        // Highlight start cell
        p.fill(0, 255, 0, 100);
        p.rect(startX + p.stage3_path[0].col * cellSize, startY + p.stage3_path[0].row * cellSize, cellSize, cellSize);

        p.push();
        p.drawingContext.shadowBlur = 10;
        p.drawingContext.shadowColor = p.color(0, 255, 0);
        p.stroke(0, 255, 0);
        p.strokeWeight(3);
        for (let i = 0; i < p.stage3_path.length - 1; i++) {
          let a = p.stage3_path[i];
          let b = p.stage3_path[i + 1];
          let ax = startX + a.col * cellSize + cellSize / 2;
          let ay = startY + a.row * cellSize + cellSize / 2;
          let bx = startX + b.col * cellSize + cellSize / 2;
          let by = startY + b.row * cellSize + cellSize / 2;
          p.line(ax, ay, bx, by);
        }
        p.pop();
      }

      // Highlight player selections
      p.noStroke();
      p.fill(255, 100, 0, 150);
      for (let cell of p.stage3_playerInput) {
        let cx = startX + cell.col * cellSize;
        let cy = startY + cell.row * cellSize;
        p.rect(cx, cy, cellSize, cellSize);
      }

      // Show time remaining
      let timeLeft = p.roundTimeLimit - (p.millis() - p.stageStartTime);
      if (timeLeft > 0) {
        p.fill(255);
        p.textSize(24);
        p.text("Time: " + p.ceil(timeLeft / 1000) + "s", p.width / 2, p.height / 2 + gridSize / 2 + 30);
      }
    };

    p.handleStage3Click = function () {
      let gridSize = 400;
      let startX = p.width / 2 - gridSize / 2;
      let startY = p.height / 2 - gridSize / 2;
      let cellSize = gridSize / p.stage3_gridCols;
      let col = p.floor((p.mouseX - startX) / cellSize);
      let row = p.floor((p.mouseY - startY) / cellSize);
      if (row >= 0 && row < p.stage3_gridRows && col >= 0 && col < p.stage3_gridCols) {
        if (p.millis() - p.stageStartTime > p.stage3_memorizeTime) {
          // Play feedback sound
          p.glitchButton.play();

          p.stage3_playerInput.push({ row: row, col: col });
          if (p.stage3_playerInput.length === p.stage3_path.length) {
            let correct = true;
            for (let i = 0; i < p.stage3_path.length; i++) {
              if (p.stage3_playerInput[i].row !== p.stage3_path[i].row ||
                p.stage3_playerInput[i].col !== p.stage3_path[i].col) {
                correct = false;
                break;
              }
            }
            if (correct) {
              p.roundCount++;
              if (p.roundCount >= 5) {
                p.nextStage();
              } else {
                p.initStage3Round();
              }
            } else {
              // Provide visual feedback for incorrect attempt
              p.fill(255, 0, 0, 150);
              let gridSize = 400;
              let startX = p.width / 2 - gridSize / 2;
              let startY = p.height / 2 - gridSize / 2;
              p.rect(startX, startY, gridSize, gridSize);

              p.roundCount = 0;
              p.initStage3Round();
            }
          }
        }
      }
    };

    // Stage 4 variables
    p.stage4_correct = "WESEEYOU";
    p.stage4_letters = [];
    p.stage4_scrambled = [];
    p.stage4_selected = [];
    p.stage4_pulse = 0;

    p.initStage4 = function () {
      p.stage4_letters = p.stage4_correct.split("");
      p.stage4_scrambled = p.shuffleArray(p.stage4_letters.slice());
      p.stage4_selected = [];
      p.stage4_pulse = 0;
    };

    p.drawStage4 = function () {
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
      p.stage4_pulse += 0.03;
      let glow = p.sin(p.stage4_pulse) * 10 + 10;

      let boxSize = 60;
      let spacing = 15;
      let totalWidth = p.stage4_scrambled.length * (boxSize + spacing) - spacing;
      let startX = p.width / 2 - totalWidth / 2;
      let y = p.height / 2;

      // Draw scrambled letters in boxes
      for (let i = 0; i < p.stage4_scrambled.length; i++) {
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
        p.text(p.stage4_scrambled[i], startX + i * (boxSize + spacing) + boxSize / 2, y + boxSize / 2);
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
      if (p.stage4_selected.length > 0) {
        p.text(p.stage4_selected.join(""), p.width / 2, y - 110);
      } else {
        p.text("_ _ _ _ _ _ _ _ _", p.width / 2, y - 110);
      }
      p.pop();

      // Draw instructions
      p.fill(255);
      p.textSize(24);
      p.text("Unscramble the secret message", p.width / 2, y - 180);

      // Show time remaining
      let timeLeft = p.roundTimeLimit - (p.millis() - p.stageStartTime);
      if (timeLeft > 0) {
        p.fill(255);
        p.textSize(24);
        p.text("Time: " + p.ceil(timeLeft / 1000) + "s", p.width / 2, y + 150);
      }

      // If complete, check answer
      if (p.stage4_selected.join("") === p.stage4_correct) {
        p.push();
        p.drawingContext.shadowBlur = 30;
        p.drawingContext.shadowColor = p.color(0, 255, 0);
        p.fill(0, 255, 0, 100);
        p.rect(0, 0, p.width, p.height);
        p.pop();

        p.nextStage();
      } else if (p.stage4_selected.length === p.stage4_letters.length && p.stage4_selected.join("") !== p.stage4_correct) {
        // Wrong answer: flash red and reset selection
        p.push();
        p.drawingContext.shadowBlur = 30;
        p.drawingContext.shadowColor = p.color(255, 0, 0);
        p.fill(255, 0, 0, 100);
        p.rect(0, 0, p.width, p.height);
        p.pop();

        p.stage4_selected = [];
        p.stage4_scrambled = p.shuffleArray(p.stage4_letters.slice());
      }
    };

    p.handleStage4Click = function () {
      let boxSize = 60;
      let spacing = 15;
      let totalWidth = p.stage4_scrambled.length * (boxSize + spacing) - spacing;
      let startX = p.width / 2 - totalWidth / 2;
      let y = p.height / 2;
      for (let i = 0; i < p.stage4_scrambled.length; i++) {
        let x0 = startX + i * (boxSize + spacing);
        if (p.mouseX > x0 && p.mouseX < x0 + boxSize && p.mouseY > y && p.mouseY < y + boxSize) {
          // Play feedback sound
          p.glitchButton.play();

          p.stage4_selected.push(p.stage4_scrambled[i]);
          p.stage4_scrambled.splice(i, 1);
          break;
        }
      }
    };

    p.shuffleArray = function (array) {
      for (let i = array.length - 1; i > 0; i--) {
        let j = p.floor(p.random(i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    // Global stage functions
    p.initStage = function () {
      p.roundCount = 0;
      if (p.currentStage === 1) {
        p.roundTimeLimit = 10000; // Longer time for stage 1
        p.initStage1Round();
        p.questionText = "Stage 1: Memorize the path (5 rounds)";
      } else if (p.currentStage === 2) {
        p.roundTimeLimit = 5000; // More time for stage 2
        p.initStage2Round();
        p.questionText = "Stage 2: Stop the moving target (5 rounds)";
      } else if (p.currentStage === 3) {
        p.roundTimeLimit = 10000; // Longer time for the harder path
        p.initStage3Round();
        p.questionText = "Stage 3: Memorize the complex path (5 rounds)";
      } else if (p.currentStage === 4) {
        p.roundTimeLimit = 20000; // Plenty of time for word unscramble
        p.initStage4();
        p.questionText = "Stage 4: Decrypt the message";
      }
      p.stageStartTime = p.millis();
    };

    p.nextStage = function () {
      p.glitchButton.play();
      if (p.currentStage < 4) {
        p.currentStage++;
      } else {
        p.finalScreen = true;
      }
      p.roundCount = 0;
      p.initStage();
    };

    // UI functions
    p.drawStartScreen = function () {
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
    };

    p.drawGlitchScreen = function () {
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
      let secondsLeft = p.ceil((p.glitchDuration - (p.millis() - p.startTime)) / 1000);
      p.textSize(24);
      p.fill(255);
      p.text("Starting in " + secondsLeft + "...", p.width / 2, p.height / 2 + 60);
    };

    p.drawFinalScreen = function () {
      p.background(10);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(48);
      p.fill(p.color(p.themeColor));
      p.text("INTRUSION NEUTRALIZED", p.width / 2, p.height / 2 - 20);
      p.textSize(32);
      p.fill(255);
      p.text("Verification Code: " + p.finalCode, p.width / 2, p.height / 2 + 30);

      // Add countdown text for returning to website
      if (!p.gameCompleted) {
        p.finalMessageTimer = p.millis();
        p.gameCompleted = true;
      }

      // Calculate remaining time for the countdown
      let elapsedTime = p.millis() - p.finalMessageTimer;
      let remainingSeconds = Math.ceil(5 - elapsedTime / 1000);

      if (remainingSeconds > 0) {
        p.textSize(18);
        p.text("Returning to website in " + remainingSeconds + " seconds...", p.width / 2, p.height / 2 + 80);
      } else {
        // When countdown is complete, close the game popup
        closeGamePopup();
      }
    };

    p.drawProgressBar = function () {
      let barWidth = 430;
      let barHeight = 20;
      let startX = p.width / 2 - barWidth / 2;
      let startY = 20;

      p.fill(50);
      p.noStroke();
      p.rect(startX, startY, barWidth, barHeight, 5);

      p.noFill();
      p.stroke(p.color(p.themeColor));
      p.strokeWeight(2);
      p.rect(startX, startY, barWidth, barHeight, 5);

      p.fill(255);
      p.textSize(16);
      p.text("GAME " + p.currentStage + "/4", p.width / 2, startY + barHeight / 2);
      p.noStroke();
      p.fill(p.color(p.themeColor));
      p.rect(startX, startY, barWidth * (p.currentStage / 4), barHeight, 5);
    };

    p.drawTitle = function () {
      p.push();
      p.textAlign(p.CENTER, p.CENTER);
      p.noStroke();
      p.textSize(32);
      p.fill("#FFCB3F");
      p.text("SYSTEM ACCESS INTERFACE", p.width / 2, 90);
      p.textSize(16);
      p.text("Decryption Protocol: Rapid Cyber Breach", p.width / 2, 122);
      p.pop();
    };

    p.drawQuestionBox = function () {
      let boxX = 20;
      let boxY = 175;
      let boxW = p.width - 40;
      let boxH = 60;
      p.stroke(p.color(p.themeColor));
      p.strokeWeight(2);
      p.fill("#1D1311");
      p.rect(boxX, boxY, boxW, boxH, 5);
      p.noStroke();
      p.fill(p.color(p.themeColor));
      p.textSize(16);
      p.textStyle(p.BOLD);
      p.text(p.questionText, p.width / 2, boxY + boxH / 2);
      p.textStyle(p.NORMAL);
    };

    // Main p5.js functions
    p.setup = function () {
      p.createCanvas(1000, 800);
      p.textFont("Courier New");
      p.textAlign(p.CENTER, p.CENTER);
      p.currentStage = 1;
      p.initStage();
    };

    p.draw = function () {
      if (p.finalScreen) {
        p.drawFinalScreen();
        return;
      }

      if (!p.started) {
        p.drawStartScreen();
        return;
      }
      if (p.millis() - p.startTime < p.glitchDuration) {
        if (!p.glitchSound.isPlaying()) p.glitchSound.play();
        p.drawGlitchScreen();
        return;
      } else {
        if (p.glitchSound.isPlaying()) p.glitchSound.stop();

        // Add this line - make sure stage1 is properly initialized EXACTLY when glitch ends
        if (p.millis() - p.startTime < p.glitchDuration + 100) { // Small buffer to catch the transition
          p.stageStartTime = p.millis(); // Reset stage timer at exact moment glitch screen ends
        }
      }
      p.background(10);
      p.tint(255, 50);
      p.image(p.logo, 0, 60, 1000, 600);
      p.noTint();
      p.drawProgressBar();
      p.drawTitle();
      p.drawQuestionBox();

      // Check round timeout
      if (p.millis() - p.stageStartTime > p.roundTimeLimit) {
        p.roundCount = 0;
        if (p.currentStage === 1) p.initStage1Round();
        else if (p.currentStage === 2) p.initStage2Round();
        else if (p.currentStage === 3) p.initStage3Round();
        else if (p.currentStage === 4) p.initStage4();
        p.stageStartTime = p.millis();
      }

      if (p.currentStage === 1) {
        p.drawStage1();
      } else if (p.currentStage === 2) {
        p.updateStage2();
        p.drawStage2();
      } else if (p.currentStage === 3) {
        p.drawStage3();
      } else if (p.currentStage === 4) {
        p.drawStage4();
      }

      p.fill(255);
      p.textSize(18);
      if (p.currentStage < 4) p.text("    Stage " + p.currentStage + " Round " + (p.roundCount + 1) + "/5", 70, 30);
      else p.text("Stage 4", 70, 30);
    };

    p.mousePressed = function () {
      p.getAudioContext().resume();

      if (!p.started) {
        p.started = true;
        p.startTime = p.millis();
        return;
      }
      if (p.millis() - p.startTime < p.glitchDuration) return;
      if (p.finalScreen) return;

      if (p.currentStage === 1) {
        p.handleStage1Click();
      } else if (p.currentStage === 2) {
        p.handleStage2Stop();
      } else if (p.currentStage === 3) {
        p.handleStage3Click();
      } else if (p.currentStage === 4) {
        p.handleStage4Click();
      }
    };

    p.keyPressed = function () {
      if (p.finalScreen) {
        p.currentStage = 1;
        p.finalScreen = false;
        p.initStage();
        return;
      }
      // In Stage 2, allow space bar to stop the moving target.
      if (p.currentStage === 2 && p.key === ' ') {
        p.handleStage2Stop();
      }
    };

    p.windowResized = function () {
      p.resizeCanvas(1000, 800);
    };
  }, document.getElementById(containerId));

  gameCanvas = sketch;
  return sketch;
}
