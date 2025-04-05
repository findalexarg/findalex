// Game Popup Module
import { gameState } from './gameState.js';
import { gameUtils } from './gameUtils.js';
import { stage1 } from './stage1.js';
import { stage2 } from './stage2.js';
import { stage3 } from './stage3.js';
import { stage4 } from './stage4.js';
import { gameUI } from './gameUI.js';

// Function to launch the p5.js game popup
export function launchGamePopup(verificationMessage = '') {
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
export function initializeP5Game() {
  // Make sure p5.js is loaded
  if (typeof p5 === 'undefined') {
    console.error('p5.js is not loaded! Add the script tag to your HTML file.');
    alert('Error: Required library not loaded. Please try again later.');
    return;
  }

  console.log('Creating p5 instance...');

  // Create a new p5 instance with your game code
  window.p5Instance = new p5(function (p) {
    // Game variables
    let started = false;
    let finalScreen = false;
    let questionText = "";

    // Game state variables - these are now managed by gameState.js
    let currentStage = 1;
    let stageStartTime = 0;

    // Stage instances
    let stage1Instance, stage2Instance, stage3Instance, stage4Instance;

    // UI component
    let uiInstance;

    // Utilities
    let utilsInstance;

    // Assets
    let logo, glitchSound, glitchButton;

    // Assign the preload function to the p5 instance
    p.preload = function () {
      logo = p.loadImage("Logo_Final.jpg");
      glitchSound = p.loadSound("glitch-sounds.mp3");
      glitchButton = p.loadSound("glitch-button.mp3");
    }

    // ============================
    // Global Stage Initialization & Transition
    // ============================
    function initStage() {
      // Reset round count
      gameState.setRoundCount(0);

      // Configure stage-specific settings
      if (currentStage === 1) {
        gameState.setRoundTimeLimit(10000); // Longer time for stage 1
        stage1Instance.initRound();
        questionText = "Stage 1: Memorize the path (5 rounds)";
      } else if (currentStage === 2) {
        gameState.setRoundTimeLimit(5000); // More time for stage 2
        stage2Instance.initRound();
        questionText = "Stage 2: Stop the moving target (5 rounds)";
      } else if (currentStage === 3) {
        gameState.setRoundTimeLimit(10000); // Longer time for the harder path
        stage3Instance.initRound();
        questionText = "Stage 3: Memorize the complex path (5 rounds)";
      } else if (currentStage === 4) {
        gameState.setRoundTimeLimit(20000); // Plenty of time for word unscramble
        stage4Instance.init();
        questionText = "Stage 4: Decrypt the message";
      }

      // Set stage start time
      gameState.setStageStartTime(p.millis());
    }

    // ============================
    // Global Draw & Interaction
    // ============================
    p.setup = function () {
      p.createCanvas(1200, 800); // Increased width from 800 to 1200 for better text display
      p.textFont("Courier New");
      p.textAlign(p.CENTER, p.CENTER);

      // Initialize gameState with the p5 instance
      gameState.initialize(p);
      gameState.loadAssets(logo, glitchSound, glitchButton);
      gameState.setCurrentStage(1);

      // Create instances of each stage module
      stage1Instance = stage1(p);
      stage2Instance = stage2(p);
      stage3Instance = stage3(p);
      stage4Instance = stage4(p);

      // Create UI instance
      uiInstance = gameUI(p);

      // Create utils instance
      utilsInstance = gameUtils(p);

      // Initialize the first stage
      initStage();
    };

    p.draw = function () {
      // Current stage from game state
      currentStage = gameState.getCurrentStage();

      // Check if game is completed
      finalScreen = gameState.completed;

      if (finalScreen) {
        uiInstance.drawFinalScreen();
        return;
      }

      if (!started) {
        uiInstance.drawStartScreen();
        return;
      }

      // Check if still in glitch phase
      let startTime = uiInstance.startTime;
      let glitchDuration = uiInstance.getGlitchDuration();
      if (p.millis() - startTime < glitchDuration) {
        // Add null check for glitchSound before calling isPlaying() and play()
        if (glitchSound && !glitchSound.isPlaying()) glitchSound.play();
        uiInstance.drawGlitchScreen();
        return;
      } else {
        // Add null check for glitchSound before calling isPlaying() and stop()
        if (glitchSound && glitchSound.isPlaying()) glitchSound.stop();

        // Make sure stage is properly initialized when glitch ends
        if (p.millis() - startTime < glitchDuration + 100) { // Small buffer to catch the transition
          gameState.setStageStartTime(p.millis()); // Reset stage timer at exact moment glitch screen ends
        }
      }

      // Main game screen
      p.background(10);
      p.tint(255, 50);
      // Add null check for logo before trying to draw it
      if (logo && logo.width > 0) {
        p.image(logo, 0, 60, 1200, 600); // Adjusted width from 800 to 1200
      }
      p.noTint();

      // Draw UI elements
      uiInstance.drawProgressBar();
      uiInstance.drawTitle();
      uiInstance.drawQuestionBox(questionText);

      // Check round timeout
      if (gameState.isTimeExpired()) {
        gameState.setRoundCount(0);

        // Reset the current stage
        if (currentStage === 1) stage1Instance.initRound();
        else if (currentStage === 2) stage2Instance.initRound();
        else if (currentStage === 3) stage3Instance.initRound();
        else if (currentStage === 4) stage4Instance.init();

        gameState.setStageStartTime(p.millis());
      }

      // Draw the current stage
      if (currentStage === 1) {
        stage1Instance.draw();
      } else if (currentStage === 2) {
        stage2Instance.update();
        stage2Instance.draw();
      } else if (currentStage === 3) {
        stage3Instance.draw();
      } else if (currentStage === 4) {
        stage4Instance.draw();
      }

      // Display round count if applicable
      p.fill(255);
      p.textSize(18);
      if (currentStage < 4) p.text("Stage " + currentStage + " Round " + (gameState.getRoundCount() + 1) + "/5", 70, 30);
      else p.text("Stage 4", 70, 30);
    };

    p.mousePressed = function () {
      p.getAudioContext().resume();

      if (!started) {
        started = true;
        uiInstance.setStartTime(p.millis());
        return;
      }

      let startTime = uiInstance.startTime;
      let glitchDuration = uiInstance.getGlitchDuration();
      if (p.millis() - startTime < glitchDuration) return;
      if (finalScreen) return;

      // Handle clicks for the current stage
      if (currentStage === 1) {
        stage1Instance.handleClick();
      } else if (currentStage === 2) {
        stage2Instance.handleStop();
      } else if (currentStage === 3) {
        stage3Instance.handleClick();
      } else if (currentStage === 4) {
        stage4Instance.handleClick();
      }
    };

    p.keyPressed = function () {
      if (finalScreen) {
        gameState.setCurrentStage(1);
        gameState.completed = false;
        finalScreen = false;
        initStage();
        return;
      }
      // In Stage 2, allow space bar to stop the moving target.
      if (currentStage === 2 && p.key === ' ') {
        stage2Instance.handleStop();
      }
    };

    p.windowResized = function () {
      p.resizeCanvas(1200, 800); // Adjusted width from 800 to 1200
    };

  }, 'gameCanvas');
}