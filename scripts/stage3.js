// Stage 3: Path Memorization (Hard)
import { gameState } from './gameState.js';

export const stage3 = function (p) {
  // Private variables
  let gridRows = 4, gridCols = 4;
  let path = [];
  let playerInput = [];
  let memorizeTime = 1500;  // Less time to memorize

  // Initialize a new round
  function initRound() {
    playerInput = [];
    path = [];
    let pathLength = 5; // Longer path than stage 1

    let startRow = p.floor(p.random(gridRows));
    let startCol = p.floor(p.random(gridCols));
    path.push({ row: startRow, col: startCol });

    for (let i = 1; i < pathLength; i++) {
      let last = path[i - 1];
      let neighbors = [];
      if (last.row > 0) neighbors.push({ row: last.row - 1, col: last.col });
      if (last.row < gridRows - 1) neighbors.push({ row: last.row + 1, col: last.col });
      if (last.col > 0) neighbors.push({ row: last.row, col: last.col - 1 });
      if (last.col < gridCols - 1) neighbors.push({ row: last.row, col: last.col + 1 });

      // Filter out cells already in the path
      neighbors = neighbors.filter(n => !path.some(p => p.row === n.row && p.col === n.col));

      if (neighbors.length === 0) break;
      let next = p.random(neighbors);
      path.push(next);
    }

    // Reset timer
    gameState.setStageStartTime(p.millis());
  }

  function draw() {
    let gridSize = 350; // Made grid a bit larger
    let startX = p.width / 2 - gridSize / 2;
    let startY = p.height / 2 - gridSize / 2;
    let cellSize = gridSize / gridCols;

    // Draw grid with cyberpunk effect
    p.push();
    p.drawingContext.shadowBlur = 5;
    p.drawingContext.shadowColor = p.color(0, 255, 0);
    p.stroke(0, 255, 0);
    p.strokeWeight(2);
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        p.noFill();
        p.rect(startX + c * cellSize, startY + r * cellSize, cellSize, cellSize);
      }
    }
    p.pop();

    // Show the path if within memorize time
    let elapsed = p.millis() - gameState.getStageStartTime();
    if (elapsed < memorizeTime && path.length > 0) {
      // Display timer for memorization phase
      p.fill(255);
      p.textSize(24);
      p.text("Memorize: " + p.ceil((memorizeTime - elapsed) / 1000) + "s", p.width / 2, p.height / 2 - gridSize / 2 - 40);

      // Highlight start cell
      p.fill(0, 255, 0, 100);
      p.rect(startX + path[0].col * cellSize, startY + path[0].row * cellSize, cellSize, cellSize);

      p.push();
      p.drawingContext.shadowBlur = 10;
      p.drawingContext.shadowColor = p.color(0, 255, 0);
      p.stroke(0, 255, 0);
      p.strokeWeight(3);
      for (let i = 0; i < path.length - 1; i++) {
        let a = path[i];
        let b = path[i + 1];
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
    let gridSize = 350; // Match the updated grid size
    let startX = p.width / 2 - gridSize / 2;
    let startY = p.height / 2 - gridSize / 2;
    let cellSize = gridSize / gridCols;
    let col = p.floor((p.mouseX - startX) / cellSize);
    let row = p.floor((p.mouseY - startY) / cellSize);

    if (row >= 0 && row < gridRows && col >= 0 && col < gridCols) {
      if (p.millis() - gameState.getStageStartTime() > memorizeTime) {
        // Play feedback sound
        gameState.glitchButton.play();

        playerInput.push({ row: row, col: col });
        if (playerInput.length === path.length) {
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