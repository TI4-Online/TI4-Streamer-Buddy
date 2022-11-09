// Fill in the template values for heartbeat.

const HISTORY_SECONDS = 60 * 10;
const BUCKET_SECONDS = 5;

class HeartBeatFill {
  constructor() {
    this._history = [];
  }

  addNow() {
    const now = Date.now() / 1000;

    // Strip old.
    const ageLimit = now - HISTORY_SECONDS;
    while (this._history.length > 0 && this._history[0] <= ageLimit) {
      this._history.shift();
    }

    // Add new.
    this._history.push(now);
  }

  getTemplateData() {
    const now = Date.now() / 1000;
    const ageLimit = now - HISTORY_SECONDS;
    const deltaX = now - ageLimit;
    const beatX = BUCKET_SECONDS / HISTORY_SECONDS / 2;

    // Seed with left edge.
    const points = [{ x: 0, y: 0 }];

    for (const entry of this._history) {
      // Beat.
      const u = (entry - ageLimit) / deltaX;
      if (u < 0 || u > 1) {
        continue;
      }
      points.push({ x: u, y: 1 });
      points.push({ x: u + beatX, y: 0 });
    }

    // Finish with right edge.
    points.push({ x: 1, y: 0 });
  }
}
