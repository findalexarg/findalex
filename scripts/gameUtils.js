// Utility functions for the game
export const gameUtils = function (p) {
  // Drawing utilities
  function drawGlowingText(text, x, y, color, glowAmount) {
    p.push();
    p.drawingContext.shadowBlur = glowAmount || 10;
    p.drawingContext.shadowColor = color || p.color(0, 255, 0);
    p.fill(color || p.color(0, 255, 0));
    p.text(text, x, y);
    p.pop();
  }

  function drawGlowingRect(x, y, w, h, color, glowAmount, cornerRadius) {
    p.push();
    p.drawingContext.shadowBlur = glowAmount || 10;
    p.drawingContext.shadowColor = color || p.color(0, 255, 0);
    p.stroke(color || p.color(0, 255, 0));
    p.noFill();
    p.rect(x, y, w, h, cornerRadius || 0);
    p.pop();
  }

  // Animation utilities
  function lerp(start, end, amt) {
    return start * (1 - amt) + end * amt;
  }

  function pulse(min, max, speed) {
    return min + (max - min) * (0.5 + 0.5 * Math.sin(p.millis() * (speed || 0.002)));
  }

  // Return the public interface
  return {
    drawGlowingText,
    drawGlowingRect,
    lerp,
    pulse
  };
};