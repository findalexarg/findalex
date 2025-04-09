// Cyber Intrusion Countermeasure – Timed Hacking Puzzles
// Styling (glitch intro, logo, progress bar, question box) is preserved.

// Import the closeGamePopup function
import { closeGamePopup } from './gamePopup.js';

// Define p5.js sketch as module for better integration
let sketch = null;
let gameCanvas = null;

// Export initGame function to be called from gamePopup.js
export function initGame(containerId) {
  console.log("Game initialization started for container:", containerId);

  // Check if the container element exists
  const container = document.getElementById(containerId);
  if (!container) {
    console.error("Container not found:", containerId);
    return null;
  }

  // Remove any existing canvas
  if (gameCanvas) {
    console.log("Removing existing game canvas");
    gameCanvas.remove();
  }

  // Create new p5 instance
  try {
    console.log("Creating new p5 instance");
    sketch = new p5((p) => {
      console.log("P5 sketch function started");

      // Copy all the existing p5 functions to the instance
      p.currentStage = 1;
      p.roundCount = 0; // For stages 1-3 (each requires 5 rounds)
      p.stageStartTime = 0;
      p.roundTimeLimit = 0; // will be set per stage round
      p.timeRemaining = 0;
      p.lives = 3; // Add lives counter - player gets 3 chances

      p.finalScreen = false;
      p.gameCompleted = false; // Flag to track if game has been completed
      p.finalMessageTimer = 0; // Timer for final message display
      p.finalCode = "0xAF3E-9B7C";
      p.questionText = "";
      p.started = false;
      p.glitchDuration = 3000;
      p.startTime = 0;
      p.themeColor = "#00FF00"; // Changed to green for a more "hacker" feel
      p.loseScreen = false; // New variable to track lose state
      p.loseScreenTimer = 0; // Timer for lose screen display
      p.loseScreenDuration = 3000; // Display lose screen for 3 seconds

      // Assets
      p.logo = null;
      p.glitchSound = null;
      p.glitchButton = null;
      p.loseImage = null; // Static image loaded via loadImage
      p.loseGif = null;   // Animated GIF element created via createImg
      p.playingSound = null; // Background music during gameplay
      p.gameOverSound = null; // Sound effect when game over
      p.gameOverVoice = null; // Voice announcement for game over
      p.soundsPlaying = false; // Track if game over sounds have played

      p.preload = function () {
        console.log("Preload function started");
        try {
          p.logo = p.loadImage("Logo_Final.png");
          console.log("Logo loaded successfully");
        } catch (e) {
          console.error("Error loading logo:", e);
        }

        // Load real sounds files properly
        try {
          p.glitchSound = {
            _playing: false,
            play: function () {
              console.log("Playing glitch sound");
              this._playing = true;
            },
            stop: function () {
              console.log("Stopping glitch sound");
              this._playing = false;
            },
            isPlaying: function () { return this._playing; }
          };
        } catch (e) {
          console.error("Error with glitch sound:", e);
        }

        // Create other audio objects with proper playing state tracking
        p.glitchButton = {
          play: function () { console.log("Playing button sound"); },
          isPlaying: function () { return false; }
        };

        p.playingSound = {
          _playing: false,
          play: function () {
            console.log("Playing background music");
            this._playing = true;
          },
          stop: function () {
            console.log("Stopping background music");
            this._playing = false;
          },
          loop: function () {
            console.log("Looping background music");
            this._playing = true;
          },
          setVolume: function () { },
          isPlaying: function () { return this._playing; }
        };

        p.gameOverSound = {
          play: function () { console.log("Playing game over sound"); }
        };

        p.gameOverVoice = {
          play: function () { console.log("Playing game over voice"); }
        };

        // Create a proper GIF element for game over screen
        try {
          // First load static image as fallback
          p.loseImage = p.loadImage("youLose.gif");

          // Create the animated GIF element properly
          p.loseGif = document.createElement('div');
          p.loseGif.style.position = 'fixed'; // Use fixed instead of absolute for better positioning
          p.loseGif.style.display = 'none';
          p.loseGif.style.zIndex = '1000';
          p.loseGif.style.overflow = 'hidden';
          p.loseGif.style.backgroundColor = 'black';
          p.loseGif.style.textAlign = 'center'; // Center content
          p.loseGif.style.display = 'flex';
          p.loseGif.style.justifyContent = 'center'; // Center horizontally
          p.loseGif.style.alignItems = 'center'; // Center vertically

          // Create an actual image element for the GIF
          const gifImg = document.createElement('img');
          gifImg.src = "youLose.gif";
          gifImg.style.maxWidth = '80%'; // Limit width to 80% of container
          gifImg.style.maxHeight = '80%'; // Limit height to 80% of container
          gifImg.style.margin = 'auto'; // Center the image
          p.loseGif.appendChild(gifImg);

          // Add container to the DOM
          container.appendChild(p.loseGif);

          // Add helper methods
          p.loseGif.position = function (x, y) {
            // Make sure we set top and left to the proper position relative to viewport
            this.style.top = '0px';
            this.style.left = '0px';
            this.style.width = '100%';
            this.style.height = '100%';
          };

          p.loseGif.size = function (w, h) {
            // Intentionally not setting width/height directly to ensure full coverage
          };

          p.loseGif.show = function () {
            console.log("Showing game over GIF");
            this.style.display = 'block';
          };

          p.loseGif.hide = function () {
            this.style.display = 'none';
          };

          p.loseGif.setMessage = function (message) {
            // Instead of modifying the text overlay inside the GIF,
            // we'll draw this message on the canvas itself
          };

          p.loseGif.hide();
          console.log("Game over GIF element created successfully");
        } catch (e) {
          console.error("Error creating game over GIF element:", e);

          // Create a simple fallback if GIF loading fails
          p.loseGif = {
            position: function () { },
            size: function () { },
            show: function () { console.log("Would show game over GIF if element existed"); },
            hide: function () { },
            setMessage: function () { }
          };
        }

        console.log("Preload function completed");
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
          if (last.col > 0) neighbors.push({ row: last.col - 1, col: last.row });
          if (last.col < p.stage1_gridCols - 1) neighbors.push({ row: last.col + 1, col: last.row });

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

                p.lives--; // Decrease lives on incorrect input
                p.roundCount = 0;

                if (p.lives <= 0) {
                  // If no lives left, show game over screen
                  p.loseScreen = true;
                  p.loseScreenTimer = p.millis();
                } else {
                  // Otherwise restart the current round
                  p.initStage1Round();
                }
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
  p.textAlign(p.CENTER, p.CENTER);
  p.text("Press SPACE or CLICK to stop the target in the green zone", p.width / 2, p.height / 2 - 100);
  
  let timeLeft = p.roundTimeLimit - (p.millis() - p.stageStartTime);
  if (timeLeft > 0) {
    p.fill(255);
    p.textSize(24);
    p.text("Time: " + p.ceil(timeLeft / 1000) + "s", p.width / 2, p.height / 2 + 100);
  }

  // Display lives indicator on the right side of the canvas
  p.fill(255);
  p.textAlign(p.RIGHT, p.CENTER);
  // Adjust the x coordinate using p.width to position on the right side.
  p.text("LIVES:", p.width - 50, 50);
  for (let i = 0; i < p.lives; i++) {
    p.fill(255, 50, 50);
    p.noStroke();
    // Each heart is drawn moving leftward from the right edge.
    p.text("♥", p.width - 50 - (i + 1) * 15, 50);
  }
  // Reset text alignment if needed
  p.textAlign(p.CENTER, p.CENTER);
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
    // Successful stop: increment round count and advance stage if applicable
    p.roundCount++;
    if (p.roundCount >= 5) {
      p.nextStage();
    } else {
      p.initStage2Round();
      p.stageStartTime = p.millis();
    }
  } else {
    // Failed stop: reduce a life and restart the round.
    p.lives--;
    if (p.lives <= 0) {
      // If no lives left, show game over screen
      p.loseScreen = true;
      p.loseScreenTimer = p.millis();
    } else {
      // Otherwise, just restart the round.
      p.initStage2Round();
      p.stageStartTime = p.millis();
    }
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
          if (last.col > 0) neighbors.push({ row: last.col - 1, col: last.row });
          if (last.col < p.stage3_gridCols - 1) neighbors.push({ row: last.col + 1, col: last.row });

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
        let gridSize = 300; // Changed from 400 to 300 to match drawStage3
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
                let gridSize = 300; // Changed from 400 to 300 to match the drawing
                let startX = p.width / 2 - gridSize / 2;
                let startY = p.height / 2 - gridSize / 2;
                p.rect(startX, startY, gridSize, gridSize);

                p.lives--; // Decrease lives on incorrect input
                p.roundCount = 0;

                if (p.lives <= 0) {
                  // If no lives left, show game over screen
                  p.loseScreen = true;
                  p.loseScreenTimer = p.millis();
                } else {
                  // Otherwise restart the current round
                  p.initStage3Round();
                }
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

          p.lives--; // Decrease lives on incorrect word

          if (p.lives <= 0) {
            // If no lives left, show game over screen
            p.loseScreen = true;
            p.loseScreenTimer = p.millis();
          } else {
            // Otherwise shuffle and try again
            p.stage4_selected = [];
            p.stage4_scrambled = p.shuffleArray(p.stage4_letters.slice());
          }
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

        // Start background music if it exists and isn't playing
        if (p.playingSound && typeof p.playingSound.isPlaying === 'function' &&
          !p.playingSound.isPlaying()) {
          try {
            p.playingSound.loop();  // Loop the background music
            p.playingSound.setVolume(0.5); // Set to half volume
          } catch (e) {
            console.warn("Error playing background music:", e);
          }
        }

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
          // Stop background music when game completes
          if (p.playingSound.isPlaying()) {
            p.playingSound.stop();
          }
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

      // Draw lives indicator in the progress bar area
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

        // Draw progress bar fill
        p.noStroke();
        p.fill(p.color(p.themeColor));
        p.rect(startX, startY, barWidth * (p.currentStage / 4), barHeight, 5);

        // Add lives display to the right side of the progress bar
        p.textAlign(p.LEFT, p.CENTER);
        p.fill(255);
        // Position text right after the progress bar
        p.text("LIVES: ", startX + barWidth + 15, startY + barHeight / 2);

        // Draw heart icons for lives
        for (let i = 0; i < p.lives; i++) {
          p.fill(255, 50, 50);
          p.noStroke();
          // Position hearts after the "LIVES:" text
          p.text("♥", startX + barWidth + 65 + i * 15, startY + barHeight / 2);
        }

        // Reset text alignment to center
        p.textAlign(p.CENTER, p.CENTER);
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

      // Show lose screen when time runs out
      p.showLoseScreen = function () {
        // Clear background
        p.background(0);
        console.log("Showing lose screen");

        // Stop background music when showing lose screen
        if (p.playingSound && typeof p.playingSound.isPlaying === 'function' &&
          p.playingSound.isPlaying()) {
          p.playingSound.stop();
        }

        // Play game over sounds once
        if (!p.soundsPlaying) {
          if (p.gameOverSound) p.gameOverSound.play();
          if (p.gameOverVoice) p.gameOverVoice.play();
          p.soundsPlaying = true;
        }

        // Position and show the GIF
        let canvas = p.canvas || document.querySelector('canvas');
        if (canvas && p.loseGif) {
          // Don't try to position relative to canvas - use the whole viewport
          p.loseGif.position(); // No args needed with our new implementation

          // Add debug logging to understand positioning issues
          console.log("Canvas position:", canvas.getBoundingClientRect());
          console.log("Showing game over GIF");

          p.loseGif.show();

          // Draw text messages on the canvas instead of overlaying on the GIF
          // This way the text won't interfere with the GIF
        } else {
          // Fallback if element creation failed - draw directly on canvas
          p.fill(255, 0, 0, 100);
          p.rect(0, 0, p.width, p.height);
        }

        // Display message and countdown at the bottom of the screen
        // so it doesn't interfere with the centered GIF
        p.fill(0, 0, 0, 180); // Semi-transparent black background
        p.rect(0, p.height * 0.85, p.width, p.height * 0.15); // Bottom bar

        p.fill(255);
        p.textSize(24);
        p.textAlign(p.CENTER, p.CENTER);

        // Draw appropriate message
        p.textSize(32);
        p.text(p.lives <= 0 ? "GAME OVER" : "TIME'S UP!", p.width / 2, p.height * 0.1);

        // Display countdown info
        p.textSize(24);
        let remainingTime = Math.ceil((p.loseScreenDuration - (p.millis() - p.loseScreenTimer)) / 1000);

        if (remainingTime > 0) {
          if (p.lives <= 0) {
            p.text("Restarting game in " + remainingTime + "...", p.width / 2, p.height * 0.93);
          } else {
            p.text("Lives remaining: " + p.lives + " - Continuing in " + remainingTime + "...", p.width / 2, p.height * 0.93);
          }
        } else {
          p.text("Click anywhere to continue", p.width / 2, p.height * 0.93);
        }
      };

      // Reset game to initial state
      p.resetGame = function () {
        p.loseGif.hide(); // Hide the GIF when resetting
        p.loseScreen = false;
        p.currentStage = 1;
        p.roundCount = 0;
        p.soundsPlaying = false; // Reset sounds played flag

        // Only reset lives to 3 if player has run out of lives
        if (p.lives <= 0) {
          p.lives = 3;
        }

        p.initStage();
      };

      // Main p5.js functions
      p.setup = function () {
        console.log("Setup function started");
        try {
          p.createCanvas(1000, 800);
          console.log("Canvas created successfully");
          p.textFont("Courier New");
          p.textAlign(p.CENTER, p.CENTER);
          p.currentStage = 1;
          p.initStage();
          console.log("Setup function completed");
        } catch (e) {
          console.error("Error in setup function:", e);
        }
      };

      // Modify the draw function to ensure glitch sound stops
      p.draw = function () {
        if (p.finalScreen) {
          p.loseGif.hide(); // Ensure GIF is hidden on final screen
          p.drawFinalScreen();
          return;
        }

        if (p.loseScreen) {
          p.showLoseScreen();
          return;
        } else {
          p.loseGif.hide(); // Hide GIF when not on lose screen
          p.soundsPlaying = false; // Reset sounds played flag when not on lose screen
        }

        if (!p.started) {
          p.drawStartScreen();
          return;
        }

        // Glitch intro screen
        if (p.millis() - p.startTime < p.glitchDuration) {
          if (!p.glitchSound.isPlaying()) {
            p.glitchSound.play();
          }
          p.drawGlitchScreen();
          return;
        }
        // When exiting glitch screen, ensure we stop the sound
        else if (p.glitchSound.isPlaying()) {
          console.log("Explicitly stopping glitch sound as we exit intro");
          p.glitchSound.stop();

          // Start gameplay music once glitch ends
          if (!p.playingSound.isPlaying()) {
            p.playingSound.loop();
          }

          // Make sure stage timer is reset exactly when glitch ends
          p.stageStartTime = p.millis();
        }

        // Normal gameplay
        p.background(10);
        p.tint(255, 50);
        p.image(p.logo, 0, 60, 1000, 600);
        p.noTint();
        p.drawProgressBar();
        p.drawTitle();
        p.drawQuestionBox();

        // Check round timeout
        if (p.millis() - p.stageStartTime > p.roundTimeLimit) {
          console.log("Time's up! Showing lose screen");
          p.lives--; // Decrease lives when time runs out
          p.loseScreen = true;
          p.loseScreenTimer = p.millis();
          return; // Don't continue with game rendering
        }

        // Draw current stage
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

      // Modify mousePressed to handle the lose screen
      p.mousePressed = function () {
        console.log("Mouse pressed at:", p.mouseX, p.mouseY);
        try {
          p.getAudioContext().resume();
        } catch (e) {
          console.warn("Audio context could not be resumed:", e);
        }

        if (p.loseScreen) {
          // Only allow click reset after timer expires
          if (p.millis() - p.loseScreenTimer > p.loseScreenDuration) {
            p.resetGame();
          }
          return;
        }

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
    }, containerId);

    console.log("P5 instance created successfully");
    gameCanvas = sketch;
    return sketch;

  } catch (e) {
    console.error("Error creating p5 instance:", e);
    return null;
  }
}
