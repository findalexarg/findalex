// Main script file - imports all modules
console.log('Script loaded');

// Import all modules
import { gameState } from './gameState.js';
import { gameUtils } from './gameUtils.js';
import { stage1 } from './stage1.js';
import { stage2 } from './stage2.js';
import { stage3 } from './stage3.js';
import { stage4 } from './stage4.js';
import { gameUI } from './gameUI.js';
import { launchGamePopup, initializeP5Game } from './gamePopup.js';
import { verifyAndLaunchGame, triggerFinalUploadEmail } from './fileHandler.js';

// Export them for global access
window.gameState = gameState;
window.gameUtils = gameUtils;
window.stage1 = stage1;
window.stage2 = stage2;
window.stage3 = stage3;
window.stage4 = stage4;
window.gameUI = gameUI;
window.launchGamePopup = launchGamePopup;
window.initializeP5Game = initializeP5Game;
window.verifyAndLaunchGame = verifyAndLaunchGame;
window.triggerFinalUploadEmail = triggerFinalUploadEmail;

// This ensures all scripts are loaded before the game starts
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM loaded, initializing game modules...');

  // When the game popup is launched, it will use the P5 instance
  // to initialize and connect all the modules defined here.
});
