// Game state management
export const gameState = {
  // State variables
  initialized: false,
  completed: false,
  currentStage: 1,
  roundCount: 0,
  stageStartTime: 0,
  roundTimeLimit: 0,

  // Asset references with actual file paths
  assetPaths: {
    logoPath: "Logo_Final.jpg",
    glitchSoundPath: "glitch-sounds.mp3",
    glitchButtonPath: "glitch-button.mp3"
  },
  logo: null,
  glitchSound: null,
  glitchButton: null,

  // Methods
  initialize(p5Instance) {
    this.p5 = p5Instance;
    this.initialized = true;
  },

  loadAssets(logo, glitchSound, glitchButton) {
    // Store the loaded assets passed from p5's preload
    this.logo = logo;
    this.glitchSound = glitchSound;
    this.glitchButton = glitchButton;

    console.log("Assets loaded into gameState:",
      this.logo ? "Logo loaded" : "Logo missing",
      this.glitchSound ? "Glitch sound loaded" : "Glitch sound missing",
      this.glitchButton ? "Glitch button loaded" : "Glitch button missing");
  },

  // Helper method to play sounds safely
  playSound(sound) {
    if (sound && typeof sound.play === 'function' && !sound.isPlaying()) {
      sound.play();
    }
  },

  // Helper method to stop sounds safely
  stopSound(sound) {
    if (sound && typeof sound.stop === 'function' && sound.isPlaying()) {
      sound.stop();
    }
  },

  getCurrentStage() {
    return this.currentStage;
  },

  setCurrentStage(stage) {
    this.currentStage = stage;
  },

  getRoundCount() {
    return this.roundCount;
  },

  setRoundCount(count) {
    this.roundCount = count;
  },

  getStageStartTime() {
    return this.stageStartTime;
  },

  setStageStartTime(time) {
    this.stageStartTime = time;
  },

  getRoundTimeLimit() {
    return this.roundTimeLimit;
  },

  setRoundTimeLimit(limit) {
    this.roundTimeLimit = limit;
  },

  nextStage() {
    if (this.currentStage < 4) {
      this.currentStage++;
    } else {
      this.completed = true;
    }
    this.roundCount = 0;
    return this.currentStage;
  },

  isTimeExpired() {
    return this.p5.millis() - this.stageStartTime > this.roundTimeLimit;
  }
};