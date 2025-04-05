// Game state management
export const gameState = {
  // State variables
  initialized: false,
  completed: false,
  currentStage: 1,
  roundCount: 0,
  stageStartTime: 0,
  roundTimeLimit: 0,

  // Asset references
  logo: null,
  glitchSound: null,
  glitchButton: null,

  // Methods
  initialize(p5Instance) {
    this.p5 = p5Instance;
    this.initialized = true;
  },

  loadAssets(logo, glitchSound, glitchButton) {
    this.logo = logo;
    this.glitchSound = glitchSound;
    this.glitchButton = glitchButton;
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