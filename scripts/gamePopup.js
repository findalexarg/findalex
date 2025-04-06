// gamePopup.js - Handles launching the game popup when evidence is submitted
import { initGame } from './games.js';

let gameInstance = null;

// Function to launch the game popup
export function launchGamePopup(message) {
  console.log("Launching game popup:", message);

  // Create game container if it doesn't exist
  let gameContainer = document.getElementById('gameContainer');
  if (!gameContainer) {
    gameContainer = document.createElement('div');
    gameContainer.id = 'gameContainer';
    gameContainer.className = 'game-popup';

    // Create hacker intrusion header
    const hackedHeader = document.createElement('div');
    hackedHeader.className = 'hacked-header';
    hackedHeader.innerHTML = '<span class="glitch-text" data-text="YOU\'VE BEEN HACKED">YOU\'VE BEEN HACKED</span>';
    gameContainer.appendChild(hackedHeader);

    // Create warning message
    const warningMessage = document.createElement('div');
    warningMessage.className = 'warning-message';
    warningMessage.innerHTML = 'COMPLETE ALL SECURITY CHALLENGES TO REGAIN ACCESS';
    gameContainer.appendChild(warningMessage);

    // Create game canvas container
    const canvasContainer = document.createElement('div');
    canvasContainer.id = 'gameCanvasContainer';
    gameContainer.appendChild(canvasContainer);

    // Create flashing elements for added effect
    for (let i = 0; i < 5; i++) {
      const flashingElement = document.createElement('div');
      flashingElement.className = 'hacker-element element-' + i;
      gameContainer.appendChild(flashingElement);
    }

    // Add some random binary streams to the background
    const binaryStream = document.createElement('div');
    binaryStream.className = 'binary-stream';
    let binaryContent = '';
    for (let i = 0; i < 500; i++) {
      binaryContent += Math.random() > 0.5 ? '1' : '0';
      if (i % 50 === 0) binaryContent += '<br>';
    }
    binaryStream.innerHTML = binaryContent;
    gameContainer.appendChild(binaryStream);

    document.body.appendChild(gameContainer);

    // Play an alarm sound
    const alarmSound = new Audio('glitch-sounds.mp3');
    alarmSound.play();

    // Add styling for the game popup
    const style = document.createElement('style');
    style.textContent = `
      .game-popup {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #000;
        background-image: 
          linear-gradient(0deg, rgba(0,20,0,0.7) 50%, transparent 50%),
          linear-gradient(90deg, rgba(0,20,0,0.7) 50%, transparent 50%);
        background-size: 4px 4px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        overflow: hidden;
        animation: backgroundPulse 4s infinite;
      }
      
      @keyframes backgroundPulse {
        0% { background-color: #000; }
        25% { background-color: #001200; }
        50% { background-color: #001800; }
        75% { background-color: #001200; }
        100% { background-color: #000; }
      }
      
      .hacked-header {
        color: #f00;
        font-family: 'Courier New', monospace;
        font-size: 48px;
        font-weight: bold;
        text-shadow: 0 0 10px #f00, 0 0 20px #f00;
        margin-bottom: 20px;
        letter-spacing: 2px;
        animation: textPulse 1s infinite;
      }
      
      @keyframes textPulse {
        0% { text-shadow: 0 0 10px #f00, 0 0 20px #f00; }
        50% { text-shadow: 0 0 20px #f00, 0 0 30px #f00, 0 0 40px #f00; }
        100% { text-shadow: 0 0 10px #f00, 0 0 20px #f00; }
      }
      
      .glitch-text {
        position: relative;
        display: inline-block;
        animation: glitch 3s infinite;
      }
      
      .glitch-text::before,
      .glitch-text::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      
      .glitch-text::before {
        left: -2px;
        text-shadow: 2px 0 #00f;
        clip: rect(44px, 450px, 56px, 0);
        animation: glitch-anim 5s infinite linear alternate-reverse;
      }
      
      .glitch-text::after {
        left: 2px;
        text-shadow: -2px 0 #f0f;
        clip: rect(44px, 450px, 56px, 0);
        animation: glitch-anim2 5s infinite linear alternate-reverse;
      }
      
      @keyframes glitch {
        0% { transform: none; opacity: 1; }
        7% { transform: skew(-0.5deg, -0.9deg); opacity: 0.75; }
        10% { transform: none; opacity: 1; }
        27% { transform: none; opacity: 1; }
        30% { transform: skew(0.8deg, -0.1deg); opacity: 0.75; }
        35% { transform: none; opacity: 1; }
        52% { transform: none; opacity: 1; }
        55% { transform: skew(-1deg, 0.2deg); opacity: 0.75; }
        50% { transform: none; opacity: 1; }
        72% { transform: none; opacity: 1; }
        75% { transform: skew(0.4deg, 1deg); opacity: 0.75; }
        80% { transform: none; opacity: 1; }
        100% { transform: none; opacity: 1; }
      }
      
      @keyframes glitch-anim {
        0% { clip: rect(77px, 9999px, 39px, 0); }
        5% { clip: rect(65px, 9999px, 36px, 0); }
        10% { clip: rect(37px, 9999px, 92px, 0); }
        15% { clip: rect(80px, 9999px, 23px, 0); }
        20% { clip: rect(94px, 9999px, 37px, 0); }
        25% { clip: rect(49px, 9999px, 10px, 0); }
        30% { clip: rect(16px, 9999px, 86px, 0); }
        35% { clip: rect(6px, 9999px, 79px, 0); }
        40% { clip: rect(96px, 9999px, 61px, 0); }
        45% { clip: rect(82px, 9999px, 83px, 0); }
        50% { clip: rect(46px, 9999px, 2px, 0); }
        55% { clip: rect(10px, 9999px, 86px, 0); }
        60% { clip: rect(54px, 9999px, 81px, 0); }
        65% { clip: rect(35px, 9999px, 44px, 0); }
        70% { clip: rect(92px, 9999px, 90px, 0); }
        75% { clip: rect(75px, 9999px, 71px, 0); }
        80% { clip: rect(7px, 9999px, 43px, 0); }
        85% { clip: rect(42px, 9999px, 4px, 0); }
        90% { clip: rect(95px, 9999px, 67px, 0); }
        95% { clip: rect(5px, 9999px, 46px, 0); }
        100% { clip: rect(29px, 9999px, 21px, 0); }
      }
      
      @keyframes glitch-anim2 {
        0% { clip: rect(85px, 9999px, 96px, 0); }
        5% { clip: rect(31px, 9999px, 54px, 0); }
        10% { clip: rect(49px, 9999px, 30px, 0); }
        15% { clip: rect(67px, 9999px, 16px, 0); }
        20% { clip: rect(26px, 9999px, 48px, 0); }
        25% { clip: rect(31px, 9999px, 71px, 0); }
        30% { clip: rect(42px, 9999px, 1px, 0); }
        35% { clip: rect(8px, 9999px, 14px, 0); }
        40% { clip: rect(83px, 9999px, 48px, 0); }
        45% { clip: rect(64px, 9999px, 77px, 0); }
        50% { clip: rect(96px, 9999px, 2px, 0); }
        55% { clip: rect(39px, 9999px, 87px, 0); }
        60% { clip: rect(21px, 9999px, 46px, 0); }
        65% { clip: rect(89px, 9999px, 40px, 0); }
        70% { clip: rect(84px, 9999px, 91px, 0); }
        75% { clip: rect(3px, 9999px, 29px, 0); }
        80% { clip: rect(35px, 9999px, 73px, 0); }
        85% { clip: rect(10px, 9999px, 93px, 0); }
        90% { clip: rect(54px, 9999px, 47px, 0); }
        95% { clip: rect(88px, 9999px, 8px, 0); }
        100% { clip: rect(97px, 9999px, 69px, 0); }
      }
      
      .warning-message {
        color: #0f0;
        font-family: 'Courier New', monospace;
        font-size: 18px;
        font-weight: bold;
        text-shadow: 0 0 5px #0f0;
        margin-bottom: 30px;
        padding: 10px;
        border: 2px solid #0f0;
        border-radius: 5px;
        background-color: rgba(0, 20, 0, 0.7);
        box-shadow: 0 0 10px #0f0;
        animation: borderPulse 2s infinite;
      }
      
      @keyframes borderPulse {
        0% { box-shadow: 0 0 10px #0f0; }
        50% { box-shadow: 0 0 20px #0f0, 0 0 30px #0f0; }
        100% { box-shadow: 0 0 10px #0f0; }
      }
      
      .hacker-element {
        position: absolute;
        background-color: rgba(0, 255, 0, 0.1);
        animation: flashRandomly 0.5s infinite;
      }
      
      .element-0 {
        top: 20%;
        left: 10%;
        width: 150px;
        height: 15px;
      }
      
      .element-1 {
        top: 40%;
        right: 10%;
        width: 80px;
        height: 150px;
      }
      
      .element-2 {
        bottom: 30%;
        left: 30%;
        width: 40px;
        height: 40px;
      }
      
      .element-3 {
        top: 70%;
        right: 30%;
        width: 100px;
        height: 25px;
      }
      
      .element-4 {
        top: 10%;
        right: 40%;
        width: 30px;
        height: 80px;
      }
      
      @keyframes flashRandomly {
        0% { opacity: 0.1; }
        50% { opacity: 0.5; }
        100% { opacity: 0.1; }
      }
      
      .binary-stream {
        position: absolute;
        color: rgba(0, 255, 0, 0.2);
        font-family: monospace;
        font-size: 10px;
        line-height: 1;
        z-index: -1;
        pointer-events: none;
      }
      
      #gameCanvasContainer {
        position: relative;
        width: 800px;
        height: 800px;
        border: 3px solid #0f0;
        box-shadow: 0 0 30px #0f0;
        background-color: rgba(0, 20, 0, 0.2);
        overflow: hidden;
      }
      
      #gameCanvasContainer:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background-color: #0f0;
        animation: scanline 10s linear infinite;
        opacity: 0.5;
        z-index: 999;
        pointer-events: none;
      }
      
      @keyframes scanline {
        0% { top: 0; }
        100% { top: 100%; }
      }
    `;
    document.head.appendChild(style);
  }

  // Make the game container visible
  gameContainer.style.display = 'flex';

  // Initialize the P5.js game
  initGame('gameCanvasContainer');
}

// Modified close function to be called when game completes
export function closeGamePopup() {
  const gameContainer = document.getElementById('gameContainer');
  if (gameContainer) {
    // Show completion message
    const completionMessage = document.createElement('div');
    completionMessage.className = 'completion-message';
    completionMessage.innerHTML = '<span>SECURITY CHALLENGES COMPLETED</span><br><span>SYSTEM RECOVERY IN PROGRESS...</span>';
    gameContainer.appendChild(completionMessage);

    // Add completion message style
    const completionStyle = document.createElement('style');
    completionStyle.textContent = `
      .completion-message {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.8);
        padding: 30px;
        border: 2px solid #0f0;
        color: #0f0;
        font-family: 'Courier New', monospace;
        font-size: 24px;
        text-align: center;
        line-height: 1.5;
        box-shadow: 0 0 20px #0f0;
        z-index: 1001;
      }
    `;
    document.head.appendChild(completionStyle);

    // Save the verification code to localStorage
    localStorage.setItem('verificationCode', '0xAF3E-9B7C');

    // Dispatch an event to notify that games are completed
    const gameCompletedEvent = new CustomEvent('gamesCompleted', {
      detail: { verificationCode: '0xAF3E-9B7C' }
    });
    document.dispatchEvent(gameCompletedEvent);

    // Fade out after 3 seconds
    setTimeout(() => {
      gameContainer.style.opacity = '0';
      gameContainer.style.transition = 'opacity 2s';

      // Remove after fade out
      setTimeout(() => {
        gameContainer.remove();

        // Clean up any game resources if needed
        if (gameInstance && typeof gameInstance.remove === 'function') {
          gameInstance.remove();
        }
      }, 2000);
    }, 3000);
  }
}