// Stage 1: Path Memorization (Easy)
import { gameState } from './gameState.js';

export const stage1 = function (p) {
  // Private variables
  let gridRows = 3, gridCols = 3;
  let path = [];       // Array of {row, col}
  let playerInput = [];
  let memorizeTime = 2000;  // Show arrows for 3 seconds
  let arrowDelay = 400;  // Longer delay between showing each arrow (in ms)
  let initialized = false;

  // Initialize a new round
  function initRound() {
    playerInput = [];
    path = [];
    let pathLength = 2; // number of cells in the path

    // Pick a random starting cell
    let startRow = p.floor(p.random(gridRows));
    let startCol = p.floor(p.random(gridCols));
    path.push({ row: startRow, col: startCol });

    // Generate path: each step goes to a neighboring cell (up/down/left/right)
    for (let i = 1; i <= pathLength; i++) {
      let last = path[i - 1];
      let neighbors = [];
      if (last.row > 0) neighbors.push({ row: last.row - 1, col: last.col });
      if (last.row < gridRows - 1) neighbors.push({ row: last.row + 1, col: last.col });
      if (last.col > 0) neighbors.push({ row: last.row, col: last.col - 1 });
      if (last.col < gridCols - 1) neighbors.push({ row: last.row, col: last.col + 1 });

      const visitedCells = new Set();
      path.forEach(cell => visitedCells.add(`${cell.row},${cell.col}`));

      // Then filter using the Set for O(1) lookups
      neighbors = neighbors.filter(n => !visitedCells.has(`${n.row},${n.col}`));

      // If no valid neighbor remains, break out.
      if (neighbors.length === 0) break;

      let next = p.random(neighbors);
      path.push(next);
    }

    // Reset timer 
    gameState.setStageStartTime(p.millis());
    initialized = true;
  }

  function draw() {
    let gridSize = 350; // Made grid a bit larger for better visibility
    let startX = p.width / 2 - gridSize / 2;
    let startY = p.height / 2 - gridSize / 2;
    let cellSize = gridSize / gridCols;

    // Draw grid with subtle glow
    p.push();
    p.drawingContext.shadowBlur = 10;
    p.drawingContext.shadowColor = p.color(0, 255, 0);
    p.stroke(100, 255, 100);
    p.strokeWeight(2);
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        p.noFill();
        p.rect(startX + c * cellSize, startY + r * cellSize, cellSize, cellSize);
      }
    }
    p.pop();

    // During memorize phase, show lines connecting path cells
    let elapsed = p.millis() - gameState.getStageStartTime();
    if (elapsed < memorizeTime) {
      let arrowsToShow = p.min(path.length - 1, p.floor(elapsed / arrowDelay));

      // Display timer for memorization phase
      p.fill(255);
      p.textSize(24);
      p.text("Memorize: " + p.ceil((memorizeTime - elapsed) / 1000) + "s", p.width / 2, p.height / 2 - gridSize / 2 - 40);

      // Draw highlight on start cell
      p.fill(0, 255, 0, 100);
      p.rect(startX + path[0].col * cellSize, startY + path[0].row * cellSize, cellSize, cellSize);

      // Draw the path lines
      p.stroke(0, 255, 0, 150);
      p.strokeWeight(3);

      for (let i = 0; i < arrowsToShow; i++) {
        let a = path[i];
        let b = path[i + 1];

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
    for (let cell of playerInput) {
      let cx = startX + cell.col * cellSize;
      let cy = startY + cell.row * cellSize;
      p.rect(cx, cy, cellSize, cellSize);
    }

    // Show time remaining
    let timeLeft = gameState.getRoundTimeLimit() - (p.millis() - gameState.getStageStartTime());
    if (timeLeft > 0) {
      p.fill(255);
      p.textSize(24);
      p.text("Time: " + p.ceil(timeLeft / 1000) + "s", p.width / 2, p.height / 2 + gridSize / 2 + 50);
    }
  }

  function handleClick() {
    let gridSize = 350; // Match the increased grid size
    let startX = p.width / 2 - gridSize / 2;
    let startY = p.height / 2 - gridSize / 2;
    let cellSize = gridSize / gridCols;
    let col = p.floor((p.mouseX - startX) / cellSize);
    let row = p.floor((p.mouseY - startY) / cellSize);
    if (row >= 0 && row < gridRows && col >= 0 && col < gridCols) {
      // Only allow input after memorize phase is over.
      if (p.millis() - gameState.getStageStartTime() > memorizeTime) {
        // Play feedback sound
        gameState.glitchButton.play();

        playerInput.push({ row: row, col: col });
        if (playerInput.length === path.length) {
          // Check answer
          let correct = true;
          for (let i = 0; i < path.length; i++) {
            if (playerInput[i].row !== path[i].row ||
              playerInput[i].col !== path[i].col) {
              correct = false;
              break;
            }
          }
          if (correct) {
            let roundCount = gameState.getRoundCount() + 1;
            gameState.setRoundCount(roundCount);
            if (roundCount >= 5) {
              gameState.nextStage();
            } else {
              initRound();
            }
          } else {
            // Provide visual feedback for incorrect attempt
            p.fill(255, 0, 0, 150);
            p.rect(startX, startY, gridSize, gridSize);

            gameState.setRoundCount(0);
            initRound();
          }
        }
      }
    }
  }

  // Return public interface
  return {
    initRound,
    draw,
    handleClick
  };
};