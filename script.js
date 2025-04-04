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

    let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let numColumns;
    let numRows = 5;
    let columns = [];
    let answer = [];
    let nodes = [];
    let selectedSequence = [];
    let nodeDiameter = 60;
    let nodesGameSubmitted = false;
    let nodesResultMessage = "";
    let nodesAnswer = "";

    let questionText = "";
    let themeColor = "#FF0000";
    let logo; // Will be created in preload()

    let currentStage = 1;
    let gameType = "";
    let progressFraction = 0;
    let submitted = false;
    let resultMessage = "";

    let finalScreen = false;
    let finalCode = "0xF3E-9B7C";

    let started = false;
    let glitchDuration = 3000; // Reduced duration
    let startTime;

    p.preload = function () {
      try {
        // Try loading the logo image
        // NOTE: Double-check that the asset path is correct!
        logo = p.loadImage("assets/Logo_Final.png", 
          () => { console.log("Logo loaded successfully."); },
          (err) => { console.error("Error loading logo image:", err); }
        );
      } catch (e) {
        console.warn("Could not load logo image, using fallback graphics:", e);
        logo = p.createGraphics(400, 300);
        logo.background(10);
        logo.fill(255, 0, 0);
        logo.textSize(32);
        logo.textAlign(p.CENTER, p.CENTER);
        logo.text("ALEX VALEGRO", 200, 150);
      }
    };

    p.setup = function () {
      console.log('p5 setup running...');
      let canvas = p.createCanvas(800, 600);
      canvas.parent('gameCanvas');
      p.textFont("Courier New");
      p.textAlign(p.CENTER, p.CENTER);

      currentStage = 1;
      initGame();

      // Auto-start the game (skip waiting for a click)
      started = true;
      startTime = p.millis();
    };

    p.draw = function () {
      if (finalScreen) {
        drawFinalScreen();
        return;
      }
      if (!started) {
        drawStartScreen();
        return;
      }
      if (p.millis() - startTime < glitchDuration) {
        drawGlitchScreen();
        return;
      }
      p.background(10);
      if (logo) {
        p.push();
        p.tint(255, 50);
        p.imageMode(p.CORNER);
        p.image(logo, 0, 60, p.width, p.height - 60);
        p.noTint();
        p.pop();
      }
      drawProgressBar();
      drawTitle();
      drawQuestionBox();

      if (gameType === "slot") {
        drawSlotGame();
      } else if (gameType === "nodes") {
        drawNodesGame();
      }

      let buttonLabel = "SUBMIT";
      if ((gameType === "slot" && submitted) || (gameType === "nodes" && nodesGameSubmitted)) {
        if (gameType === "slot") {
          buttonLabel = (resultMessage === "ACCESS GRANTED") ? "NEXT GAME" : "TRY AGAIN";
        } else {
          buttonLabel = (nodesResultMessage === "ACCESS GRANTED") ? "NEXT GAME" : "TRY AGAIN";
        }
      }
      if (!finalScreen) {
        drawButton(buttonLabel, p.width / 2, p.height - 100, 120, 40);
      }
      if (gameType === "slot" && submitted) {
        drawResultMessage(resultMessage);
      } else if (gameType === "nodes" && nodesGameSubmitted) {
        drawResultMessage(nodesResultMessage);
      }
    };

    function initGame() {
      submitted = false;
      resultMessage = "";
      nodesGameSubmitted = false;
      selectedSequence = [];
      finalScreen = false;
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
        nodesAnswer = "CONTROL";
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
      let req = nodesAnswer.split("");
      for (let i = 0; i < req.length; i++) {
        nodes[i].letter = req[i];
      }
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

    // Add placeholder functions for drawing functions
    function drawStartScreen() {
      p.background(0);
      p.fill(255, 0, 0);
      p.textSize(32);
      p.text("CLICK TO START", p.width/2, p.height/2);
    }
    
    function drawGlitchScreen() {
      p.background(0);
      for (let i = 0; i < 50; i++) {
        p.fill(p.random(255), p.random(255), p.random(255));
        p.rect(p.random(p.width), p.random(p.height), p.random(100), p.random(100));
      }
      p.fill(255);
      p.textSize(32);
      p.text("SYSTEM COMPROMISED", p.width/2, p.height/2);
    }
    
    function drawProgressBar() {
      p.fill(100);
      p.rect(50, 40, p.width - 100, 10);
      p.fill(255, 0, 0);
      p.rect(50, 40, (p.width - 100) * progressFraction, 10);
    }
    
    function drawTitle() {
      p.fill(255, 0, 0);
      p.textSize(24);
      p.text("SECURITY BYPASS MODULE", p.width/2, 25);
    }
    
    function drawQuestionBox() {
      p.fill(30);
      p.rect(50, 60, p.width - 100, 80, 5);
      p.fill(255);
      p.textSize(16);
      p.text(questionText, p.width/2, 100);
    }
    
    function drawSlotGame() {
      let colSpacing = p.width / (numColumns + 1);
      let centerY = p.height / 2 + 50;
      p.textSize(40);
      
      for (let i = 0; i < numColumns; i++) {
        let colX = colSpacing * (i + 1);
        p.fill(40);
        p.rect(colX - 40, centerY - 160, 80, 320, 5);
        
        for (let j = 0; j < numRows; j++) {
          let letterY = centerY + (j - 2) * 50;
          p.fill(j === 2 ? 255 : 150);
          p.text(columns[i][j], colX, letterY);
        }
        
        drawArrow(colX, centerY - 2 * 50 - 30, 20, -1);
        drawArrow(colX, centerY + 2 * 50 + 30, 20, 1);
      }
    }
    
    function drawNodesGame() {
      for (let i = 0; i < nodes.length; i++) {
        let n = nodes[i];
        p.fill(n.selected ? themeColor : 50);
        p.ellipse(n.x, n.y, nodeDiameter);
        p.fill(255);
        p.textSize(24);
        p.text(n.letter, n.x, n.y);
      }
      
      drawSelectedSequence();
    }
    
    function drawSelectedSequence() {
      p.fill(30);
      p.rect(p.width/2 - 150, 170, 300, 60, 5);
      p.fill(255);
      p.textSize(32);
      let seqStr = selectedSequence.map(obj => obj.letter).join("");
      p.text(seqStr, p.width/2, 200);
    }
    
    function drawArrow(x, y, size, direction) {
      p.fill(200);
      p.noStroke();
      p.triangle(
        x, y + direction * size,
        x + size * 0.7, y - direction * size * 0.5,
        x - size * 0.7, y - direction * size * 0.5
      );
    }
    
    function drawButton(label, centerX, y, w, h) {
      p.fill(40);
      p.rect(centerX - w/2, y - h/2, w, h, 5);
      p.fill(255);
      p.textSize(16);
      p.text(label, centerX, y);
    }
    
    function drawResultMessage(msg) {
      p.fill(msg === "ACCESS GRANTED" ? color(0, 255, 0, 150) : color(255, 0, 0, 150));
      p.rect(0, p.height/2 - 30, p.width, 60);
      p.fill(255);
      p.textSize(28);
      p.text(msg, p.width/2, p.height/2);
    }
    
    function drawFinalScreen() {
      p.background(0);
      p.fill(0, 255, 0);
      p.textSize(36);
      p.text("SECURITY BREACHED", p.width/2, p.height/2 - 80);
      p.fill(255);
      p.textSize(24);
      p.text("CODE EXTRACTED:", p.width/2, p.height/2 - 20);
      p.textSize(32);
      p.fill(255, 255, 0);
      p.text(finalCode, p.width/2, p.height/2 + 30);
      
      drawButton("RETURN TO SYSTEM", p.width/2, p.height/2 + 100, 300, 50);
    }

    function color(r, g, b, a) {
      return p.color(r, g, b, a);
    }

    p.mousePressed = function () {
      if (finalScreen) {
        let btnCenterX = p.width / 2;
        let btnLeft = btnCenterX - 150;
        let btnRight = btnCenterX + 150;
        let btnTop = p.height / 2 + 100 - 25;
        let btnBottom = p.height / 2 + 100 + 25;

        if (p.mouseX > btnLeft && p.mouseX < btnRight &&
            p.mouseY > btnTop && p.mouseY < btnBottom) {
          document.body.removeChild(document.querySelector('.popup-overlay'));
          if (window.p5Instance) {
            window.p5Instance.remove();
            window.p5Instance = null;
          }
          const successMsg = document.createElement('div');
          successMsg.className = 'evidence-verified';
          successMsg.innerHTML = `
            <h3>Evidence Accepted</h3>
            <p>Code: ${finalCode}</p>
            <button onclick="window.location.href='vault.html'" class="reload-btn">🔓 Reload Content?</button>
          `;
          document.querySelector('.upload-screen').appendChild(successMsg);
          
          // Automatically trigger the email notification here
          triggerFinalUploadEmail();
          
          return;
        }
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
      alert("Final confirmation email sent! Please check your inbox (and spam folder).");
    })
    .catch(error => {
      console.error("Error triggering final email:", error);
      alert("There was an error triggering the final email. Please try again.");
    });
}
