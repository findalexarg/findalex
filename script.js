// File handling and p5.js game popup functionality

document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('fileInput');
  const selectedFilesDiv = document.getElementById('selectedFiles');

  // Track uploaded files
  let uploadedFiles = [];

  if (fileInput) {
    fileInput.addEventListener('change', function (event) {
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
        }
        selectedFilesDiv.appendChild(filesList);

        // Add submit button if files are selected
        if (!document.getElementById('submitButton')) {
          const submitBtn = document.createElement('button');
          submitBtn.id = 'submitButton';
          submitBtn.className = 'submit-button';
          submitBtn.textContent = 'Submit Evidence';
          submitBtn.onclick = function () {
            verifyAndLaunchGame(uploadedFiles);
          };
          selectedFilesDiv.appendChild(submitBtn);
        }
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
    if (validFileTypes.includes(file.type)) {
      hasValidFile = true;

      // For demonstration, we'll check specific file names or types that might 
      // trigger different mini-games or stages
      if (file.name.toLowerCase().includes('evidence') ||
        file.type.startsWith('image/')) {
        fileTypeMessage = '';
      } else if (file.type === 'application/pdf' ||
        file.type.includes('document')) {
        fileTypeMessage = '';
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

  // Create header without close button
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

  // No close button

  gameHeader.appendChild(gameTitle);

  // Canvas for p5.js game
  const gameCanvas = document.createElement('div');
  gameCanvas.id = 'gameCanvas';

  // Add all elements to the DOM
  gameContainer.appendChild(gameHeader);
  gameContainer.appendChild(gameCanvas);
  popupOverlay.appendChild(gameContainer);
  document.body.appendChild(popupOverlay);

  // Initialize p5.js game
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

  // Create a new p5 instance
  window.p5Instance = new p5(function (p) {
    // Your p5.js game code here
    let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let numColumns;        // For slot games; set in initGame()
    let numRows = 5;       // letters per column (fixed for slot games)
    let columns = [];      // For slot games

    // For slot games:
    let answer = [];       // Array of letters; set in initGame()

    // For nodes games:
    let nodes = [];
    let selectedSequence = []; // Array of objects: {nodeId, letter}
    let nodeDiameter = 60;
    let nodesGameSubmitted = false;
    let nodesResultMessage = "";
    let nodesAnswer = "";  // Correct answer string for nodes game

    // Common interface variables:
    let questionText = ""; // Question to display; set in initGame()
    let themeColor = "#FF0000"; // pure red theme
    let logo;  // Removed glitchSound, glitchButton

    // Game management:
    let currentStage = 1;  // 1: slot, 2: nodes, 3: slot, 4: nodes
    let gameType = "";     // "slot" or "nodes"
    let progressFraction = 0; // Will be set to currentStage/4 when solved
    let submitted = false; // For slot games
    let resultMessage = ""; // For slot games

    // Final screen management:
    let finalScreen = false; // True when final screen is reached.
    let finalCode = "0xF3E-9B7C"; // Code to provide once all stages are complete.

    // Start & glitch intro management:
    let started = false;   // Has user clicked to start?
    let glitchDuration = 3000; // Reduced from 5000 to 3000 ms
    let startTime;

    p.preload = function () {
      try {
        // Only try to load the logo image, skip sound filesmage to the DOM
        logo = p.createGraphics(400, 300);
        logo.background(10);
        logo.fill(255, 0, 0);
        logo.textSize(32);
        logo.textAlign(p.CENTER, p.CENTER);
        logo.text("ALEX VALEGRO", 400, 300);
      } catch (e) {
        console.warn("Could not create logo:", e);
        logo = null; // Set to null if creation fails
      }
    };

    p.setup = function () {
      console.log('p5 setup running...');

      // Calculate canvas size to fit the container while maintaining aspect ratio
      const container = document.getElementById('gameCanvas');
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Base size is 800x600, scale to fit container while preserving aspect ratio
      let canvasWidth = 800;
      let canvasHeight = 600;

      // Calculate scale factor based on container size
      const scaleX = containerWidth / canvasWidth;
      const scaleY = containerHeight / canvasHeight;
      const scale = Math.min(scaleX, scaleY) * 0.9; // 90% of available space

      canvasWidth = Math.floor(canvasWidth * scale);
      canvasHeight = Math.floor(canvasHeight * scale);

      let canvas = p.createCanvas(canvasWidth, canvasHeight);
      canvas.parent('gameCanvas');

      p.textFont("Courier New");
      p.textAlign(p.CENTER, p.CENTER);

      // Start with stage 1
      currentStage = 1;
      initGame();

      // Auto-start the game (skip waiting for a click)
      started = true;
      startTime = p.millis();
    };

    p.draw = function () {
      // If final screen is active, draw it and exit.
      if (finalScreen) {
        drawFinalScreen();
        return;
      }
      // Start screen - SKIPPED, we auto-start now
      if (!started) {
        drawStartScreen();
        return;
      }

      // Glitch intro.
      if (p.millis() - startTime < glitchDuration) {
        // Removed glitchSound play
        drawGlitchScreen();
        return;
      } else {
        // Removed glitchSound stop
      }

      // Draw background and common interface.
      p.background(10);
      if (logo) {
        p.push(); // Save current drawing state
        p.tint(255, 50);
        p.imageMode(p.CORNER);
        p.image(logo, 0, 60, p.width, p.height - 60);
        p.noTint();
        p.pop(); // Restore drawing state
      }
      drawProgressBar();
      drawTitle();
      drawQuestionBox();

      // Draw game-specific part.
      if (gameType === "slot") {
        drawSlotGame();
      } else if (gameType === "nodes") {
        drawNodesGame();
      }

      // Draw submit button.
      let buttonLabel = "SUBMIT";
      if ((gameType === "slot" && submitted) || (gameType === "nodes" && nodesGameSubmitted)) {
        if (gameType === "slot") {
          buttonLabel = (resultMessage === "ACCESS GRANTED") ? "NEXT GAME" : "TRY AGAIN";
        } else {
          buttonLabel = (nodesResultMessage === "ACCESS GRANTED") ? "NEXT GAME" : "TRY AGAIN";
        }
      }

      // For final stage, we do not show "NEXT GAME" – the button will not be drawn.
      if (!finalScreen) {
        drawButton(buttonLabel, p.width / 2, p.height - 100, 120, 40);
      }

      // Draw result message if submitted.
      if (gameType === "slot" && submitted) {
        drawResultMessage(resultMessage);
      } else if (gameType === "nodes" && nodesGameSubmitted) {
        drawResultMessage(nodesResultMessage);
      }
    };

    // Game initialization and mechanics
    function initGame() {
      // Reset common flags.
      submitted = false;
      resultMessage = "";
      nodesGameSubmitted = false;
      selectedSequence = [];
      finalScreen = false;

      // Set game parameters based on currentStage.
      if (currentStage === 1) {
        gameType = "slot";
        numColumns = 4;
        answer = ["C", "F", "W", "C"];
        questionText = "What conference does Alex reference in her article about storytelling?";
        initColumns();
      } else if (currentStage === 2) {
        gameType = "nodes";
        nodesAnswer = "LIBRARY";
        questionText = "Where is the club meeting located?";
        initNodes(9);
      } else if (currentStage === 3) {
        gameType = "slot";
        numColumns = 5;
        answer = ["T", "R", "U", "T", "H"];
        questionText = "What is the club motto?";
        initColumns();
      } else if (currentStage === 4) {
        gameType = "nodes";
        nodesAnswer = "CONTROL";  // You can change this answer as needed.
        questionText = "What is the secret access code?";
        initNodes(9);
      }
    }

    function initColumns() {
      columns = [];
      for (let i = 0; i < numColumns; i++) {
        let col = [];
        for (let j = 0; j < numRows - 1; j++) {
          col.push(letters[Math.floor(p.random(letters.length))]);
        }
        let insertIndex = Math.floor(p.random(numRows));
        col.splice(insertIndex, 0, answer[i]);
        col = col.slice(0, numRows);
        columns.push(col);
      }
    }

    function initNodes(totalNodes) {
      nodes = [];
      selectedSequence = [];
      let minDist = nodeDiameter + 10;
      let attempts = 0;
      let maxAttempts = 1000;
      while (nodes.length < totalNodes && attempts < maxAttempts) {
        let x = p.random(100, p.width - 100);
        let y = p.random(300, 600);
        let valid = true;
        for (let i = 0; i < nodes.length; i++) {
          if (p.dist(x, y, nodes[i].x, nodes[i].y) < minDist) {
            valid = false;
            break;
          }
        }
        if (valid) {
          nodes.push({ x: x, y: y, letter: "", selected: false });
        }
        attempts++;
      }
      // Force the first nodesAnswer.length nodes to have the correct letters.
      let req = nodesAnswer.split("");
      for (let i = 0; i < req.length; i++) {
        nodes[i].letter = req[i];
      }
      // For remaining nodes, assign a random letter.
      for (let i = req.length; i < nodes.length; i++) {
        nodes[i].letter = letters[Math.floor(p.random(letters.length))];
      }
      nodes = shuffleArray(nodes);
    }

    function shuffleArray(array) {
      let shuffled = array.slice();
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(p.random(i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    // Drawing functions
    function drawStartScreen() {
      p.background(0);
      p.textAlign(p.CENTER, p.CENTER);
      p.fill(255);
      p.textSize(32);
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
      let secondsLeft = Math.ceil((glitchDuration - (p.millis() - startTime)) / 1000);
      p.textSize(24);
      p.fill(255);
      p.text("Starting in " + secondsLeft + "...", p.width / 2, p.height / 2 + 60);
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

      p.textSize(16);
      p.noStroke();
      p.fill(255);
      let gameLabel = "GAME " + currentStage + "/4";
      p.text(gameLabel, p.width / 2, startY + barHeight / 2);

      p.noStroke();
      p.fill(p.color(themeColor));
      p.rect(startX, startY, barWidth * progressFraction, barHeight, 5);
    }

    function drawTitle() {
      p.push();
      p.textAlign(p.CENTER, p.CENTER);
      p.noStroke();
      p.textSize(32);
      p.fill("#FFCB3F");
      let titleLine1Y = 90;
      p.text("SYSTEM ACCESS INTERFACE", p.width / 2, titleLine1Y);
      p.textSize(16);
      p.text("Decryption Protocol: " + (gameType === "slot" ? "Slot Cypher" : "Node Matrix"), p.width / 2, titleLine1Y + 32);
      p.pop();
    }

    function drawQuestionBox() {
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
      p.textAlign(p.CENTER, p.CENTER);
      p.textStyle(p.BOLD);
      p.text(questionText, p.width / 2, boxY + boxH / 2);
      p.textStyle(p.NORMAL);
    }

    function drawSlotGame() {
      let colSpacing = p.width / (numColumns + 1);
      let centerY = p.height / 2 + 50;
      for (let i = 0; i < numColumns; i++) {
        let colX = colSpacing * (i + 1);
        for (let j = 0; j < numRows; j++) {
          let y = centerY + (j - 2) * 50;
          if (j === 2) {
            p.stroke(p.color(themeColor));
            p.strokeWeight(2);
            p.fill(255, 77, 0, 50);
            p.rectMode(p.CENTER);
            p.rect(colX, y, 80, 50, 10);
            p.noStroke();
            p.fill(p.color(themeColor));
            p.textSize(36);
            p.text(columns[i][j], colX, y);
            p.textSize(32);
          } else {
            p.textSize(32);
            p.noStroke();
            p.fill(200);
            p.text(columns[i][j], colX, y);
          }
        }
        let upY = centerY - 2 * 50 - 30;
        drawArrow(colX, upY, 20, "up");
        let downY = centerY + 2 * 50 + 30;
        drawArrow(colX, downY, 20, "down");
      }
    }

    function drawNodesGame() {
      for (let i = 0; i < nodes.length; i++) {
        let n = nodes[i];
        p.stroke(p.color(themeColor));
        p.strokeWeight(2);
        if (n.selected) {
          p.fill(255, 77, 0);
        } else {
          p.fill(50);
        }
        p.ellipse(n.x, n.y, nodeDiameter, nodeDiameter);
        p.noStroke();
        p.fill(255);
        p.textSize(24);
        p.text(n.letter, n.x, n.y);
      }
      drawSelectedSequence();
    }

    function drawSelectedSequence() {
      p.fill(255);
      p.textSize(28);
      let seqStr = selectedSequence.map(obj => obj.letter).join("");
      p.text("Selected: " + seqStr, p.width / 2, p.height - 200);
    }

    function drawArrow(x, y, size, direction) {
      p.fill(p.color(themeColor));
      p.noStroke();
      if (direction === "up") {
        p.triangle(x - size, y + size / 2, x + size, y + size / 2, x, y - size);
      } else {
        p.triangle(x - size, y - size / 2, x + size, y - size / 2, x, y + size);
      }
    }

    function drawButton(label, centerX, y, w, h) {
      p.stroke(p.color(themeColor));
      p.strokeWeight(2);
      p.fill(50);
      p.rectMode(p.CENTER);
      p.rect(centerX, y + h / 2, w, h, 5);
      p.noStroke();
      p.fill(p.color(themeColor));
      p.textSize(20);
      p.text(label, centerX, y + h / 2);
      p.rectMode(p.CORNER);
    }

    function drawResultMessage(msg) {
      p.textSize(48);
      p.fill(p.color(themeColor));
      p.textAlign(p.CENTER, p.CENTER);
      p.text(msg, p.width / 2, p.height - 40);
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

      // Add option to return to main page
      drawButton("RETURN TO UPLOAD PAGE", p.width / 2, p.height / 2 + 100, 300, 50);
    }

    p.mousePressed = function () {
      // Skip audio context resume

      // Skip start screen handling since we auto-start

      // If final screen is showing, check for button click to return
      if (finalScreen) {
        let btnCenterX = p.width / 2;
        let btnLeft = btnCenterX - 150;
        let btnRight = btnCenterX + 150;
        let btnTop = p.height / 2 + 100 - 25;
        let btnBottom = p.height / 2 + 100 + 25;

        if (p.mouseX > btnLeft && p.mouseX < btnRight &&
          p.mouseY > btnTop && p.mouseY < btnBottom) {
          // Close the game and return to upload page
          document.body.removeChild(document.querySelector('.popup-overlay'));
          if (window.p5Instance) {
            window.p5Instance.remove();
            window.p5Instance = null;
          }

          // Show success message on the upload page
          const successMsg = document.createElement('div');
          successMsg.className = 'evidence-verified';
          successMsg.innerHTML = '<h3>Evidence Accepted</h3><p>Code: ' + finalCode + '</p>';
          document.querySelector('.upload-screen').appendChild(successMsg);
        }
        return;
      }

      // Slot game controls
      if (gameType === "slot") {
        let colSpacing = p.width / (numColumns + 1);
        let centerY = p.height / 2 + 50;
        for (let i = 0; i < numColumns; i++) {
          let colX = colSpacing * (i + 1);
          let upY = centerY - 2 * 50 - 30;
          let downY = centerY + 2 * 50 + 30;
          let arrowRadius = 20;
          if (p.dist(p.mouseX, p.mouseY, colX, upY) < arrowRadius) {
            let col = columns[i];
            let last = col.pop();
            col.unshift(last);
            return;
          } else if (p.dist(p.mouseX, p.mouseY, colX, downY) < arrowRadius) {
            let col = columns[i];
            let first = col.shift();
            col.push(first);
            return;
          }
        }
      }

      // Nodes game controls
      if (gameType === "nodes") {
        for (let i = 0; i < nodes.length; i++) {
          let n = nodes[i];
          let d = p.dist(p.mouseX, p.mouseY, n.x, n.y);
          if (d < nodeDiameter / 2) {
            if (!n.selected) {
              n.selected = true;
              selectedSequence.push({ nodeId: i, letter: n.letter });
            } else {
              n.selected = false;
              selectedSequence = selectedSequence.filter(obj => obj.nodeId !== i);
            }
            return;
          }
        }
      }

      // Check for submit/next button click
      let btnCenterX = p.width / 2;
      let btnLeft = btnCenterX - 60;
      let btnRight = btnCenterX + 60;
      let btnTop = p.height - 100 - 20;
      let btnBottom = p.height - 100 + 20;

      if (p.mouseX > btnLeft && p.mouseX < btnRight &&
        p.mouseY > btnTop && p.mouseY < btnBottom) {
        // Removed glitchButton.play() 

        if (gameType === "slot") {
          if (!submitted) {
            submitted = true;
            let correctCount = 0;
            for (let i = 0; i < numColumns; i++) {
              if (columns[i][2] === answer[i]) {
                correctCount++;
              }
            }
            if (correctCount === numColumns) {
              resultMessage = "ACCESS GRANTED";
              progressFraction = currentStage / 4;
            } else {
              resultMessage = "ACCESS DENIED";
            }
          } else {
            if (resultMessage === "ACCESS GRANTED") {
              if (currentStage < 4) {
                currentStage++;
                initGame();
              } else {
                finalScreen = true;
                progressFraction = 1;
              }
            } else {
              submitted = false;
              resultMessage = "";
            }
          }
        } else if (gameType === "nodes") {
          if (!nodesGameSubmitted) {
            nodesGameSubmitted = true;
            let selectedStr = selectedSequence.map(obj => obj.letter).join("");
            if (selectedStr === nodesAnswer) {
              nodesResultMessage = "ACCESS GRANTED";
              progressFraction = currentStage / 4;
            } else {
              nodesResultMessage = "ACCESS DENIED";
            }
          } else {
            if (nodesResultMessage === "ACCESS GRANTED") {
              if (currentStage < 4) {
                currentStage++;
                initGame();
              } else {
                finalScreen = true;
                progressFraction = 1;
              }
            } else {
              nodesGameSubmitted = false;
              nodesResultMessage = "";
              for (let i = 0; i < nodes.length; i++) {
                nodes[i].selected = false;
              }
              selectedSequence = [];
            }
          }
        }
      }
    };
  }, 'gameCanvas');
}