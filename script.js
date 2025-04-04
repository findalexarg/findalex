// File handling and p5.js game popup functionality

document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('fileInput');
  const selectedFilesDiv = document.getElementById('selectedFiles');
  const uploadButton = document.getElementById('upload-button');

  // Track uploaded files
  let uploadedFiles = [];

  if (fileInput && selectedFilesDiv) {
    fileInput.addEventListener('change', function (event) {
      console.log("File input changed."); // Debug log
      const fileList = event.target.files;
      selectedFilesDiv.innerHTML = '';
      uploadedFiles = Array.from(fileList); // Store files in array for verification

      if (fileList.length > 0) {
        const fileNames = document.createElement('p');
        fileNames.textContent = 'Selected files: ';
        selectedFilesDiv.appendChild(fileNames);

        const filesList = document.createElement('ul');
        for (let i = 0; i < fileList.length; i++) {
          const fileItem = document.createElement('li');
          fileItem.textContent = fileList[i].name;
          filesList.appendChild(fileItem);
          // Log the MIME type for debugging
          console.log(`File ${i}: ${fileList[i].name} with type: ${fileList[i].type}`);
        }
        selectedFilesDiv.appendChild(filesList);

        // Add submit button if files are selected
        if (!document.getElementById('submitButton')) {
          const submitBtn = document.createElement('button');
          submitBtn.id = 'submitButton';
          submitBtn.className = 'submit-button';
          submitBtn.textContent = 'Submit Evidence';
          submitBtn.onclick = function () {
            console.log("Submit button clicked."); // Debug log
            verifyAndLaunchGame(uploadedFiles);
          };
          selectedFilesDiv.appendChild(submitBtn);
        }
      }
    });
  } else {
    console.error("File input or selectedFiles element not found in the DOM.");
  }

  // Add email trigger to the original upload button (only needed for the final stage)
  if (uploadButton) {
    uploadButton.addEventListener('click', function(e) {
      // This prevents the click from both uploading a file and sending an email
      // The main purpose is to trigger the file dialog
      if (e.target === uploadButton) {
        // Do not trigger email here, just open file dialog
        // The actual email trigger will happen after game completion
      }
    });
  }
});

// Function to verify files and launch game if valid
function verifyAndLaunchGame(files) {
  // Check if any files were uploaded
  if (files.length === 0) {
    alert('Please select at least one file to upload');
    return;
  }

  // Verify file types (images, documents, etc.)
  const validFileTypes = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  let hasValidFile = false;
  let fileTypeMessage = '';

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // Log the file type for debugging
    console.log("Verifying file type:", file.type);
    if (validFileTypes.includes(file.type)) {
      hasValidFile = true;

      // You can customize fileTypeMessage based on file name/type if needed.
      // (Currently, we leave it as an empty string.)
      if (file.name.toLowerCase().includes('evidence') || file.type.startsWith('image/')) {
        fileTypeMessage = 'Image evidence detected';
      } else if (file.type === 'application/pdf' || file.type.includes('document')) {
        fileTypeMessage = 'Document evidence detected';
      }
    }
  }

  if (!hasValidFile) {
    alert('Please upload valid evidence files (images, PDFs, or documents)');
    return;
  }

  // If we reach here, we have valid files - launch the game
  console.log('Verification successful:', fileTypeMessage);
  launchGamePopup(fileTypeMessage);
}

// Function to launch the p5.js game popup
function launchGamePopup(verificationMessage = '') {
  // Create the popup container - make it fullscreen
  const popupOverlay = document.createElement('div');
  popupOverlay.className = 'popup-overlay';

  // Create the game container
  const gameContainer = document.createElement('div');
  gameContainer.className = 'game-container';

  // Create header without close button (for this version)
  const gameHeader = document.createElement('div');
  gameHeader.className = 'game-header';

  const gameTitle = document.createElement('h3');
  gameTitle.textContent = 'YOU HAVE BEEN HACKED';

  // If we have a verification message, show it
  if (verificationMessage) {
    const verificationDiv = document.createElement('div');
    verificationDiv.className = 'verification-message';
    verificationDiv.textContent = verificationMessage;
    gameHeader.appendChild(verificationDiv);
  }

  gameHeader.appendChild(gameTitle);

  // Canvas for p5.js game
  const gameCanvas = document.createElement('div');
  gameCanvas.id = 'gameCanvas';

  // Add all elements to the DOM
  gameContainer.appendChild(gameHeader);
  gameContainer.appendChild(gameCanvas);
  popupOverlay.appendChild(gameContainer);
  document.body.appendChild(popupOverlay);

  // IMPORTANT: Make sure p5.js library is loaded and asset paths are correct!
  initializeP5Game();
}

// Function to initialize the p5.js game
function initializeP5Game() {
  // Make sure p5.js is loaded
  if (typeof p5 === 'undefined') {
    console.error('p5.js is not loaded! Add the script tag to your HTML file.');
    alert('Error: Required library not loaded. Please try again later.');
    return;
  }

  console.log('Creating p5 instance...');

  // Create a new p5 instance with your game code
  window.p5Instance = new p5(function (p) {
    // Your p5.js game code here

// Cyber Intrusion Countermeasure – Timed Hacking Puzzles
// Styling (glitch intro, logo, progress bar, question box) is preserved.

let currentStage = 1;
let roundCount = 0; // For stages 1-3 (each requires 5 rounds)
let stageStartTime = 0;
let roundTimeLimit = 0; // will be set per stage round
let timeRemaining = 0;

let finalScreen = false;
let finalCode = "0xAF3E-9B7C";
let questionText = "";
let started = false;
let glitchDuration = 3000;
let startTime;
let themeColor = "#00FF00"; // Changed to green for a more "hacker" feel

// Assets
let logo, glitchSound, glitchButton;

function preload() {
  logo = loadImage("Logo_Final.png");
  glitchSound = loadSound("glitch-sounds.mp3");
  glitchButton = loadSound("glitch-button.mp3");
}

// ============================
// Stage 1: Path Memorization (Easy)
// ============================
let stage1_gridRows = 3, stage1_gridCols = 3;
let stage1_path = [];       // Array of {row, col}
let stage1_playerInput = [];
let stage1_memorizeTime = 2000;  // Show arrows for 3 seconds
let arrowDelay = 400;  // Longer delay between showing each arrow (in ms)
let stage1_initialized = false;

function initStage1Round() {
  stage1_playerInput = [];
  stage1_path = [];
  let pathLength = 2; // number of cells in the path
  
  // Pick a random starting cell.
  let startRow = floor(random(stage1_gridRows));
  let startCol = floor(random(stage1_gridCols));
  stage1_path.push({row: startRow, col: startCol});
  
  // Generate path: each step goes to a neighboring cell (up/down/left/right)
  for (let i = 1; i <= pathLength; i++) {
    let last = stage1_path[i-1];
    let neighbors = [];
    if (last.row > 0) neighbors.push({row: last.row - 1, col: last.col});
    if (last.row < stage1_gridRows - 1) neighbors.push({row: last.row + 1, col: last.col});
    if (last.col > 0) neighbors.push({row: last.row, col: last.col - 1});
    if (last.col < stage1_gridCols - 1) neighbors.push({row: last.row, col: last.col + 1});
    
    const visitedCells = new Set();
stage1_path.forEach(cell => visitedCells.add(`${cell.row},${cell.col}`));

// Then filter using the Set for O(1) lookups
neighbors = neighbors.filter(n => !visitedCells.has(`${n.row},${n.col}`));
    
    // If no valid neighbor remains, break out.
    if (neighbors.length === 0) break;
    
    let next = random(neighbors);
    stage1_path.push(next);
  }
  
  // Reset timer 
  stageStartTime = millis();
  stage1_initialized = true;
}

function drawStage1() {
  let gridSize = 300;
  let startX = width / 2 - gridSize / 2;
  let startY = height / 2 - gridSize / 2;
  let cellSize = gridSize / stage1_gridCols;
  
  // Draw grid with subtle glow
  push();
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = color(themeColor);
  stroke(100, 255, 100);
  strokeWeight(2);
  for (let r = 0; r < stage1_gridRows; r++) {
    for (let c = 0; c < stage1_gridCols; c++) {
      noFill();
      rect(startX + c * cellSize, startY + r * cellSize, cellSize, cellSize);
    }
  }
  pop();
  
  // During memorize phase, show lines connecting path cells
  let elapsed = millis() - stageStartTime;
  if (elapsed < stage1_memorizeTime) {
    let arrowsToShow = min(stage1_path.length - 1, floor(elapsed / arrowDelay));
    
    // Display timer for memorization phase
    fill(255);
    textSize(24);
    text("Memorize: " + ceil((stage1_memorizeTime - elapsed) / 1000) + "s", width/2, height/2 - gridSize/2 - 30);
    
    // Draw highlight on start cell
    fill(0, 255, 0, 100);
    rect(startX + stage1_path[0].col * cellSize, startY + stage1_path[0].row * cellSize, cellSize, cellSize);
    
    // Draw the path lines
    stroke(0, 255, 0, 150);
    strokeWeight(3);
    
    for (let i = 0; i < arrowsToShow; i++) {
      let a = stage1_path[i];
      let b = stage1_path[i + 1];
      
      // Draw connecting line
      line(
        startX + a.col * cellSize + cellSize/2,
        startY + a.row * cellSize + cellSize/2,
        startX + b.col * cellSize + cellSize/2,
        startY + b.row * cellSize + cellSize/2
      );
    }
  }
  // Highlight player's clicked cells
  noStroke();
  fill(255, 100, 0, 150);
  for (let cell of stage1_playerInput) {
    let cx = startX + cell.col * cellSize;
    let cy = startY + cell.row * cellSize;
    rect(cx, cy, cellSize, cellSize);
  }
  
  // Show time remaining
  let timeLeft = roundTimeLimit - (millis() - stageStartTime);
  if (timeLeft > 0) {
    fill(255);
    textSize(24);
    text("Time: " + ceil(timeLeft / 1000) + "s", width/2, height/2 + gridSize/2 + 30);
  }
}

function handleStage1Click() {
  let gridSize = 300;
  let startX = width / 2 - gridSize / 2;
  let startY = height / 2 - gridSize / 2;
  let cellSize = gridSize / stage1_gridCols;
  let col = floor((mouseX - startX) / cellSize);
  let row = floor((mouseY - startY) / cellSize);
  if (row >= 0 && row < stage1_gridRows && col >= 0 && col < stage1_gridCols) {
    // Only allow input after memorize phase is over.
    if (millis() - stageStartTime > stage1_memorizeTime) {
      // Play feedback sound
      glitchButton.play();
      
      stage1_playerInput.push({row: row, col: col});
      if (stage1_playerInput.length === stage1_path.length) {
        // Check answer
        let correct = true;
        for (let i = 0; i < stage1_path.length; i++) {
          if (stage1_playerInput[i].row !== stage1_path[i].row ||
              stage1_playerInput[i].col !== stage1_path[i].col) {
            correct = false;
            break;
          }
        }
        if (correct) {
          roundCount++;
          if (roundCount >= 5) {
            nextStage();
          } else {
            initStage1Round();
          }
        } else {
          // Provide visual feedback for incorrect attempt
          fill(255, 0, 0, 150);
          let gridSize = 300;
          let startX = width / 2 - gridSize / 2;
          let startY = height / 2 - gridSize / 2;
          rect(startX, startY, gridSize, gridSize);
          
          roundCount = 0;
          initStage1Round();
        }
      }
    }
  }
}

// ============================
// Stage 2: Moving Target (Easier Version)
// ============================
let stage2_lineY;
let stage2_markerX;
let stage2_indicatorX;
let stage2_direction;
let stage2_speed = 6.0; // Slower for easier timing
let stage2_threshold = 30; // Wider hitbox for success
let stage2_pulseSize = 0;
let stage2_pulseDir = 1;

function initStage2Round() {
  stage2_lineY = height / 2;
  stage2_markerX = random(150, width - 150);
  stage2_indicatorX = 150;
  stage2_direction = 1;
  stage2_pulseSize = 0;
  stage2_pulseDir = 1;
}

function drawStage2() {
  background(10); // Keep it clean
  
  // Draw terminal-like grid background
  push();
  stroke(0, 100, 0, 30);
  for (let x = 0; x < width; x += 20) {
    line(x, 0, x, height);
  }
  for (let y = 0; y < height; y += 20) {
    line(0, y, width, y);
  }
  pop();
  
  // Draw circuit-like decorations
  push();
  stroke(0, 150, 0, 100);
  strokeWeight(1);
  noFill();
  for (let i = 0; i < 5; i++) {
    let y = map(i, 0, 4, height/2 - 100, height/2 + 100);
    beginShape();
    for (let x = 100; x < width-100; x += 50) {
      vertex(x, y + random(-5, 5));
    }
    endShape();
  }
  pop();

  // Highlight success zone with pulsing effect
  stage2_pulseSize += 0.05 * stage2_pulseDir;
  if (stage2_pulseSize > 1 || stage2_pulseSize < 0) stage2_pulseDir *= -1;
  
  let pulseAlpha = map(stage2_pulseSize, 0, 1, 30, 80);
  
  noStroke();
  fill(0, 255, 0, pulseAlpha);
  rect(stage2_markerX - stage2_threshold, stage2_lineY - 25, stage2_threshold * 2, 50);

  // Draw horizontal line - more cyberpunk
  push();
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = color(0, 255, 0);
  stroke(0, 255, 0);
  strokeWeight(3);
  line(100, stage2_lineY, width - 100, stage2_lineY);
  pop();

  // Draw marker (target position)
  push();
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = color(0, 255, 0);
  stroke(0, 255, 0);
  strokeWeight(5);
  line(stage2_markerX, stage2_lineY - 30, stage2_markerX, stage2_lineY + 30);
  pop();

  // Draw indicator (moving target) with a glowing effect
  push();
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = color(255, 0, 0);
  fill(255, 0, 0);
  noStroke();
  ellipse(stage2_indicatorX, stage2_lineY, 20, 20);
  pop();
  
  // Display time and instructions
  fill(255);
  textSize(24);
  text("Press SPACE or CLICK to stop the target in the green zone", width/2, height/2 - 100);
  
  let timeLeft = roundTimeLimit - (millis() - stageStartTime);
  if (timeLeft > 0) {
    fill(255);
    textSize(24);
    text("Time: " + ceil(timeLeft / 1000) + "s", width/2, height/2 + 100);
  }
}

function updateStage2() {
  stage2_indicatorX += stage2_speed * stage2_direction;
  if (stage2_indicatorX > width - 100 || stage2_indicatorX < 100) {
    stage2_direction *= -1;
  }
}

function handleStage2Stop() {
  let diff = abs(stage2_indicatorX - stage2_markerX);
  
  // Display visual feedback
  push();
  if (diff < stage2_threshold) {
    // Success flash
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = color(0, 255, 0);
    fill(0, 255, 0, 100);
    rect(0, 0, width, height);
  } else {
    // Failure flash
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = color(255, 0, 0);
    fill(255, 0, 0, 100);
    rect(0, 0, width, height);
  }
  pop();
  
  if (diff < stage2_threshold) {
    // Successful stop
    roundCount++;
    
    if (roundCount >= 5) {
      nextStage();
    } else {
      initStage2Round();
      stageStartTime = millis();
    }
  } else {
    // Missed, but don't reset completely
    initStage2Round();
    stageStartTime = millis();
  }
}


// ============================
// Stage 3: Path Memorization (Hard)
// ============================
let stage3_gridRows = 4, stage3_gridCols = 4;
let stage3_path = [];
let stage3_playerInput = [];
let stage3_memorizeTime = 1500;  // Less time to memorize

function initStage3Round() {
  stage3_playerInput = [];
  stage3_path = [];
  let pathLength = 5; // Longer path than stage 1
  let startRow = floor(random(stage3_gridRows));
  let startCol = floor(random(stage3_gridCols));
  stage3_path.push({row: startRow, col: startCol});
  for (let i = 1; i < pathLength; i++){
    let last = stage3_path[i-1];
    let neighbors = [];
    if (last.row > 0) neighbors.push({row: last.row - 1, col: last.col});
    if (last.row < stage3_gridRows - 1) neighbors.push({row: last.row + 1, col: last.col});
    if (last.col > 0) neighbors.push({row: last.row, col: last.col - 1});
    if (last.col < stage3_gridCols - 1) neighbors.push({row: last.row, col: last.col + 1});
    
    // Filter out cells already in the path
    neighbors = neighbors.filter(n => !stage3_path.some(p => p.row === n.row && p.col === n.col));
    
    if (neighbors.length === 0) break;
    let next = random(neighbors);
    stage3_path.push(next);
  }
  
  // Reset timer
  stageStartTime = millis();
}

function drawStage3() {
  let gridSize = 300;
  let startX = width/2 - gridSize/2;
  let startY = height/2 - gridSize/2;
  let cellSize = gridSize / stage3_gridCols;
  
  // Draw grid with cyberpunk effect
  push();
  drawingContext.shadowBlur = 5;
  drawingContext.shadowColor = color(themeColor);
  stroke(0, 255, 0);
  strokeWeight(2);
  for (let r = 0; r < stage3_gridRows; r++){
    for (let c = 0; c < stage3_gridCols; c++){
      noFill();
      rect(startX + c*cellSize, startY + r*cellSize, cellSize, cellSize);
    }
  }
  pop();
  
  // Show the path if within memorize time
  let elapsed = millis() - stageStartTime;
  if (elapsed < stage3_memorizeTime) {
    // Display timer for memorization phase
    fill(255);
    textSize(24);
    text("Memorize: " + ceil((stage3_memorizeTime - elapsed) / 1000) + "s", width/2, height/2 - gridSize/2 - 30);
    
    // Highlight start cell
    fill(0, 255, 0, 100);
    rect(startX + stage3_path[0].col * cellSize, startY + stage3_path[0].row * cellSize, cellSize, cellSize);
    
    push();
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = color(0, 255, 0);
    stroke(0, 255, 0);
    strokeWeight(3);
    for (let i = 0; i < stage3_path.length - 1; i++){
      let a = stage3_path[i];
      let b = stage3_path[i+1];
      let ax = startX + a.col*cellSize + cellSize/2;
      let ay = startY + a.row*cellSize + cellSize/2;
      let bx = startX + b.col*cellSize + cellSize/2;
      let by = startY + b.row*cellSize + cellSize/2;
      line(ax, ay, bx, by);
    }
    pop();
  } 
  
  // Highlight player selections
  noStroke();
  fill(255, 100, 0, 150);
  for (let cell of stage3_playerInput) {
    let cx = startX + cell.col * cellSize;
    let cy = startY + cell.row * cellSize;
    rect(cx, cy, cellSize, cellSize);
  }
  
  // Show time remaining
  let timeLeft = roundTimeLimit - (millis() - stageStartTime);
  if (timeLeft > 0) {
    fill(255);
    textSize(24);
    text("Time: " + ceil(timeLeft / 1000) + "s", width/2, height/2 + gridSize/2 + 30);
  }
}

function handleStage3Click() {
  let gridSize = 400;
  let startX = width/2 - gridSize/2;
  let startY = height/2 - gridSize/2;
  let cellSize = gridSize / stage3_gridCols;
  let col = floor((mouseX - startX) / cellSize);
  let row = floor((mouseY - startY) / cellSize);
  if (row >= 0 && row < stage3_gridRows && col >= 0 && col < stage3_gridCols) {
    if (millis() - stageStartTime > stage3_memorizeTime) {
      // Play feedback sound
      glitchButton.play();
      
      stage3_playerInput.push({row: row, col: col});
      if (stage3_playerInput.length === stage3_path.length) {
        let correct = true;
        for (let i = 0; i < stage3_path.length; i++){
          if (stage3_playerInput[i].row !== stage3_path[i].row ||
              stage3_playerInput[i].col !== stage3_path[i].col) {
            correct = false;
            break;
          }
        }
        if (correct) {
          roundCount++;
          if (roundCount >= 5) {
            nextStage();
          } else {
            initStage3Round();
          }
        } else {
          // Provide visual feedback for incorrect attempt
          fill(255, 0, 0, 150);
          let gridSize = 400;
          let startX = width/2 - gridSize/2;
          let startY = height/2 - gridSize/2;
          rect(startX, startY, gridSize, gridSize);
          
          roundCount = 0;
          initStage3Round();
        }
      }
    }
  }
}

// ============================
// Stage 4: Word Unscrambler
// ============================
let stage4_correct = "WESEEYOU";
let stage4_letters = [];
let stage4_scrambled = [];
let stage4_selected = [];
let stage4_pulse = 0;

function initStage4() {
  stage4_letters = stage4_correct.split("");
  stage4_scrambled = shuffleArray(stage4_letters.slice());
  stage4_selected = [];
  stage4_pulse = 0;
}

function drawStage4() {
  background(10);
  
  // Cyber background
  push();
  stroke(0, 100, 0, 30);
  for (let i = 0; i < width; i += 40) {
    line(i, 0, i, height);
  }
  for (let i = 0; i < height; i += 40) {
    line(0, i, width, i);
  }
  pop();
  
  // Flashing binary in the background
  push();
  textSize(16);
  fill(0, 255, 0, 20);
  for (let i = 0; i < 20; i++) {
    let x = random(width);
    let y = random(height);
    text(random() > 0.5 ? "1" : "0", x, y);
  }
  pop();
  
  // Pulsing effect
  stage4_pulse += 0.03;
  let glow = sin(stage4_pulse) * 10 + 10;
  
  let boxSize = 60;
  let spacing = 15;
  let totalWidth = stage4_scrambled.length * (boxSize + spacing) - spacing;
  let startX = width/2 - totalWidth/2;
  let y = height/2;
  
  // Draw scrambled letters in boxes
  for (let i = 0; i < stage4_scrambled.length; i++){
    push();
    drawingContext.shadowBlur = glow;
    drawingContext.shadowColor = color(0, 255, 0);
    fill(20, 40, 20);
    stroke(0, 255, 0);
    strokeWeight(2);
    rect(startX + i*(boxSize+spacing), y, boxSize, boxSize, 5);
    fill(0, 255, 0);
    noStroke();
    textSize(32);
    text(stage4_scrambled[i], startX + i*(boxSize+spacing) + boxSize/2, y + boxSize/2);
    pop();
  }
  
  // Draw selected letters above with terminal style
  push();
  fill(0, 0, 0, 200);
  stroke(0, 255, 0);
  strokeWeight(2);
  rect(width/2 - 250, y - 150, 500, 80, 5);
  
  fill(0, 255, 0);
  textSize(32);
  if (stage4_selected.length > 0) {
    text(stage4_selected.join(""), width/2, y - 110);
  } else {
    text("_ _ _ _ _ _ _ _ _", width/2, y - 110);
  }
  pop();
  
  // Draw instructions
  fill(255);
  textSize(24);
  text("Unscramble the secret message", width/2, y - 180);
  
  // Show time remaining
  let timeLeft = roundTimeLimit - (millis() - stageStartTime);
  if (timeLeft > 0) {
    fill(255);
    textSize(24);
    text("Time: " + ceil(timeLeft / 1000) + "s", width/2, y + 150);
  }
  
  // If complete, check answer
  if (stage4_selected.join("") === stage4_correct) {
    push();
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = color(0, 255, 0);
    fill(0, 255, 0, 100);
    rect(0, 0, width, height);
    pop();
    
    nextStage();
  } else if (stage4_selected.length === stage4_letters.length && stage4_selected.join("") !== stage4_correct) {
    // Wrong answer: flash red and reset selection
    push();
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = color(255, 0, 0);
    fill(255, 0, 0, 100);
    rect(0, 0, width, height);
    pop();
    
    stage4_selected = [];
    stage4_scrambled = shuffleArray(stage4_letters.slice());
  }
}

function handleStage4Click() {
  let boxSize = 60;
  let spacing = 15;
  let totalWidth = stage4_scrambled.length * (boxSize+spacing) - spacing;
  let startX = width/2 - totalWidth/2;
  let y = height/2;
  for (let i = 0; i < stage4_scrambled.length; i++){
    let x0 = startX + i*(boxSize+spacing);
    if (mouseX > x0 && mouseX < x0+boxSize && mouseY > y && mouseY < y+boxSize) {
      // Play feedback sound
      glitchButton.play();
      
      stage4_selected.push(stage4_scrambled[i]);
      stage4_scrambled.splice(i,1);
      break;
    }
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = floor(random(i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ============================
// Global Stage Initialization & Transition
// ============================
function initStage() {
  roundCount = 0;
  if (currentStage === 1) {
    roundTimeLimit = 10000; // Longer time for stage 1
    initStage1Round();
    questionText = "Stage 1: Memorize the path (5 rounds)";
  } else if (currentStage === 2) {
    roundTimeLimit = 5000; // More time for stage 2
    initStage2Round();
    questionText = "Stage 2: Stop the moving target (5 rounds)";
  } else if (currentStage === 3) {
    roundTimeLimit = 10000; // Longer time for the harder path
    initStage3Round();
    questionText = "Stage 3: Memorize the complex path (5 rounds)";
  } else if (currentStage === 4) {
    roundTimeLimit = 20000; // Plenty of time for word unscramble
    initStage4();
    questionText = "Stage 4: Decrypt the message";
  }
  stageStartTime = millis();
}

function nextStage() {
  glitchButton.play();
  if (currentStage < 4) {
    currentStage++;
  } else {
    finalScreen = true;
  }
  roundCount = 0;
  initStage();
}


// ============================
// Global UI Functions (Styling preserved)
// ============================
function drawStartScreen() {
  background(0);
  textSize(32);
  fill(255);
  text("System Alert: Infiltration Detected", width/2, height/2 - 40);
  textSize(20);
  text("Unauthorized access in progress. Countermeasures required.", width/2, height/2);
  stroke(255);
  strokeWeight(2);
  fill(50);
  rectMode(CENTER);
  rect(width/2, height/2 + 70, 250, 60, 5);
  noStroke();
  fill(255);
  textSize(20);
  text("Initiate Protocol", width/2, height/2 + 70);
  rectMode(CORNER);
}

function drawGlitchScreen() {
  background(0);
  for (let i = 0; i < 15; i++) {
    stroke(random(255), random(255), random(255));
    strokeWeight(random(1,4));
    let y = random(height);
    line(0, y, width, y);
  }
  textSize(48);
  textAlign(CENTER, CENTER);
  let glitchText = "SYSTEM INITIALIZING";
  for (let i = 0; i < 10; i++) {
    fill(random(200,255), random(50,150), 0);
    text(glitchText, width/2 + random(-10,10), height/2 + random(-10,10));
  }
  let secondsLeft = ceil((glitchDuration - (millis()-startTime)) / 1000);
  textSize(24);
  fill(255);
  text("Starting in " + secondsLeft + "...", width/2, height/2 + 60);
}

function drawFinalScreen() {
  background(10);
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(color(themeColor));
  text("INTRUSION NEUTRALIZED", width/2, height/2 - 20);
  textSize(32);
  fill(255);
  text("Verification Code: " + finalCode, width/2, height/2 + 30);
}

function drawProgressBar() {
  let barWidth = 430;
  let barHeight = 20;
  let startX = width/2 - barWidth/2;
  let startY = 20;
  
  fill(50);
  noStroke();
  rect(startX, startY, barWidth, barHeight, 5);
  
  noFill();
  stroke(color(themeColor));
  strokeWeight(2);
  rect(startX, startY, barWidth, barHeight, 5);
  
  fill(255);
  textSize(16);
  text("GAME " + currentStage + "/4", width/2, startY + barHeight/2);
  noStroke();
  fill(color(themeColor));
  rect(startX, startY, barWidth * (currentStage/4), barHeight, 5);
}

function drawTitle() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();
  textSize(32);
  fill("#FFCB3F");
  text("SYSTEM ACCESS INTERFACE", width/2, 90);
  textSize(16);
  text("Decryption Protocol: Rapid Cyber Breach", width/2, 122);
  pop();
}

function drawQuestionBox() {
  let boxX = 20;
  let boxY = 175;
  let boxW = width - 40;
  let boxH = 60;
  stroke(color(themeColor));
  strokeWeight(2);
  fill("#1D1311");
  rect(boxX, boxY, boxW, boxH, 5);
  noStroke();
  fill(color(themeColor));
  textSize(16);
  textStyle(BOLD);
  text(questionText, width/2, boxY + boxH/2);
  textStyle(NORMAL);
}

// ============================
// Global Draw & Interaction
// ============================
function setup() {
  createCanvas(800, 800);
  textFont("Courier New");
  textAlign(CENTER, CENTER);
  currentStage = 1;
  initStage();
}

function draw() {
  if (finalScreen) {
    drawFinalScreen();
    return;
  }
  
  if (!started) {
    drawStartScreen();
    return;
  }
  if (millis() - startTime < glitchDuration) {
  if (!glitchSound.isPlaying()) glitchSound.play();
  drawGlitchScreen();
  return;
} else {
  if (glitchSound.isPlaying()) glitchSound.stop();
  
  // Add this line - make sure stage1 is properly initialized EXACTLY when glitch ends
  if (millis() - startTime < glitchDuration + 100) { // Small buffer to catch the transition
    stageStartTime = millis(); // Reset stage timer at exact moment glitch screen ends
  }
}
  background(10);
  tint(255, 50);
  image(logo, 0, 60, 800, 600);
  noTint();
  drawProgressBar();
  drawTitle();
  drawQuestionBox();
  
  // Check round timeout
  if (millis() - stageStartTime > roundTimeLimit) {
    roundCount = 0;
    if (currentStage === 1) initStage1Round();
    else if (currentStage === 2) initStage2Round();
    else if (currentStage === 3) initStage3Round();
    else if (currentStage === 4) initStage4();
    stageStartTime = millis();
  }
  
  if (currentStage === 1) {
    drawStage1();
  } else if (currentStage === 2) {
    updateStage2();
    drawStage2();
  } else if (currentStage === 3) {
    drawStage3();
  } else if (currentStage === 4) {
    drawStage4();
  }
  
  fill(255);
  textSize(18);
  if (currentStage < 4) text("Stage " + currentStage + " Round " + (roundCount+1) + "/5", 70, 30);
  else text("Stage 4", 70, 30);
}

function mousePressed() {
  getAudioContext().resume();
  
  if (!started) {
    started = true;
    startTime = millis();
    return;
  }
  if (millis() - startTime < glitchDuration) return;
  if (finalScreen) return;
  
  if (currentStage === 1) {
    handleStage1Click();
  } else if (currentStage === 2) {
    handleStage2Stop();
  } else if (currentStage === 3) {
    handleStage3Click();
  } else if (currentStage === 4) {
    handleStage4Click();
  }
}

function keyPressed() {
  if (finalScreen) {
    currentStage = 1;
    finalScreen = false;
    initStage();
    return;
  }
  // In Stage 2, allow space bar to stop the moving target.
  if (currentStage === 2 && key === ' ') {
    handleStage2Stop();
  }
}
  
function windowResized() {
  resizeCanvas(800, 800);
}

            }
          }
        }
      }
    };
  }, 'gameCanvas');
}

// Email trigger function
function triggerFinalUploadEmail() {
  var playerId = localStorage.getItem("argPlayerId");
  var email = localStorage.getItem("playerEmail");

  var params = "";
  if (playerId) {
    params = "pid=" + encodeURIComponent(playerId);
  } else if (email) {
    params = "email=" + encodeURIComponent(email);
  } else {
    console.error("No player info found in localStorage!");
    return;
  }

  var scriptURL = "https://script.google.com/macros/s/AKfycbyf1ApsCNdUv_-NMI5Tc1ljuMldxmil0ZkvnF7vpt-KOgIqExhow36xzVNYGL7q6COJaA/exec";
  var url = scriptURL + "?" + params + "&trigger=finalUpload&source=upload";

  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log("Final email triggered:", data);
    })
    .catch(error => {
      console.error("Error triggering final email:", error);
    });
}
