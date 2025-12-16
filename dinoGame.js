const defaultConfig = {
  width: 600,
  height: 150,
  groundPadding: 10,
  gravity: 0.0021, // px per ms^2
  jumpVelocity: -1.05, // px per ms
  baseSpeed: 0.45, // px per ms
  maxSpeedBonus: 0.35,
  speedBonusPerScore: 0.0005,
  obstacleSpawnInterval: [650, 1400], // ms
  obstacleSizeRange: [20, 38], // px
  obstacleHeightRange: [28, 60], // px
  obstacleSpawnOffsetRange: [40, 120], // px from the right edge
  maxObstacles: 3,
  scorePerMs: 0.01,
  scorePerObstacle: 25,
  dinoWidth: 44,
  dinoHeight: 48,
  dinoStartX: 50,
};

const defaultCallbacks = {
  onScoreChange() {},
  onStateChange() {},
  onFrame() {},
};

const perfNow =
  typeof performance !== "undefined" && typeof performance.now === "function"
    ? () => performance.now()
    : () => Date.now();

const hasNativeRAF = typeof window !== "undefined" && typeof window.requestAnimationFrame === "function";
const hasNativeCAF = typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function";

const defaultRequestFrame = hasNativeRAF
  ? window.requestAnimationFrame.bind(window)
  : (cb) => setTimeout(() => cb(perfNow()), 16);

const defaultCancelFrame = hasNativeCAF
  ? window.cancelAnimationFrame.bind(window)
  : (handle) => clearTimeout(handle);

class DinoGame {
  constructor(options = {}) {
    const { config = {}, callbacks = {}, autoStart = false } = options;
    this.config = { ...defaultConfig, ...config };
    this.callbacks = { ...defaultCallbacks, ...callbacks };
    this._requestFrame = this.config.requestFrame || defaultRequestFrame;
    this._cancelFrame = this.config.cancelFrame || defaultCancelFrame;

    this.highScore = 0;
    this.state = "idle";
    this._loopHandle = null;
    this._boundLoop = (ts) => this._loop(ts);

    this._setupRound();

    if (autoStart) {
      this.start();
    }
  }

  /** 게임 라운드 상태 초기화 */
  _setupRound() {
    this.score = 0;
    this.groundY = this.config.height - this.config.groundPadding;
    const baseY = this.groundY - this.config.dinoHeight;
    this.dino = {
      width: this.config.dinoWidth,
      height: this.config.dinoHeight,
      x: this.config.dinoStartX,
      y: baseY,
      vy: 0,
      isJumping: false,
    };

    this.obstacles = [];
    this.spawnTimer = this._randomInRange(this.config.obstacleSpawnInterval);
    this.lastTick = null;
    this._currentSpeed = this.config.baseSpeed;

    this.callbacks.onFrame(this.getSnapshot());
    this.callbacks.onScoreChange(0, this.highScore);
  }

  /** 게임 시작 */
  start() {
    this._setupRound();
    this.state = "running";
    this.callbacks.onStateChange(this.state, { reason: "start" });
    this._startLoop();
  }

  /** 일시정지 */
  pause() {
    if (this.state !== "running") {
      return;
    }
    this.state = "paused";
    this._stopLoop();
    this.callbacks.onStateChange(this.state, { reason: "pause" });
  }

  /** 일시정지 해제 */
  resume() {
    if (this.state !== "paused") {
      return;
    }
    this.state = "running";
    this.callbacks.onStateChange(this.state, { reason: "resume" });
    this._startLoop();
  }

  /** 수동 종료 */
  stop() {
    if (this.state === "idle") {
      return;
    }
    this._finalizeRound("manual-stop");
  }

  /** 점프 입력 처리 */
  jump() {
    if (this.state !== "running") {
      return;
    }
    if (this.dino.isJumping) {
      return;
    }
    this.dino.vy = this.config.jumpVelocity;
    this.dino.isJumping = true;
  }

  /** 외부 루프 대신 수동으로 물리 업데이트를 호출하고 싶을 때 사용 */
  tick(deltaMs) {
    if (this.state !== "running") {
      return;
    }
    const delta = Math.min(deltaMs, 50); // 탭 전환 등으로 과도하게 커지는 것을 방지
    this._updatePhysics(delta);
  }

  /** 현재 게임 상태 스냅샷 제공 */
  getSnapshot() {
    return {
      state: this.state,
      score: Math.floor(this.score),
      highScore: this.highScore,
      dino: { ...this.dino },
      obstacles: this.obstacles.map((obs) => ({ ...obs })),
      groundY: this.groundY,
      speed: this._currentSpeed,
    };
  }

  /** 내부 루프 시작 */
  _startLoop() {
    if (this._loopHandle) {
      return;
    }
    this.lastTick = null;
    this._loopHandle = this._requestFrame(this._boundLoop);
  }

  /** 루프 중단 */
  _stopLoop() {
    if (!this._loopHandle) {
      return;
    }
    this._cancelFrame(this._loopHandle);
    this._loopHandle = null;
  }

  /** requestAnimationFrame 기반 루프 */
  _loop(timestamp) {
    if (this.state !== "running") {
      this._loopHandle = null;
      return;
    }
    if (this.lastTick == null) {
      this.lastTick = timestamp;
    }
    const delta = Math.min(timestamp - this.lastTick, 50);
    this.lastTick = timestamp;
    this._updatePhysics(delta);
    if (this.state === "running") {
      this._loopHandle = this._requestFrame(this._boundLoop);
    } else {
      this._loopHandle = null;
    }
  }

  /** 중력, 장애물, 점수 등을 모두 갱신 */
  _updatePhysics(delta) {
    this._applyGravity(delta);
    this._updateObstacles(delta);
    this._updateSpawnTimer(delta);
    this._incrementScore(delta * this.config.scorePerMs);
    this.callbacks.onFrame(this.getSnapshot());
  }

  _applyGravity(delta) {
    this.dino.vy += this.config.gravity * delta;
    this.dino.y += this.dino.vy * delta;
    const groundTop = this.groundY - this.dino.height;
    if (this.dino.y >= groundTop) {
      this.dino.y = groundTop;
      this.dino.vy = 0;
      this.dino.isJumping = false;
    }
  }

  _updateObstacles(delta) {
    const speedBonus = Math.min(this.score * this.config.speedBonusPerScore, this.config.maxSpeedBonus);
    this._currentSpeed = this.config.baseSpeed + speedBonus;
    for (let i = this.obstacles.length - 1; i >= 0; i -= 1) {
      const obstacle = this.obstacles[i];
      obstacle.x -= this._currentSpeed * delta;

      if (!obstacle.passed && obstacle.x + obstacle.width < this.dino.x) {
        obstacle.passed = true;
        this._incrementScore(this.config.scorePerObstacle);
      }

      if (obstacle.x + obstacle.width < 0) {
        this.obstacles.splice(i, 1);
        continue;
      }

      if (this._isColliding(this.dino, obstacle)) {
        this._finalizeRound("crash");
        return;
      }
    }
  }

  _updateSpawnTimer(delta) {
    if (this.obstacles.length >= this.config.maxObstacles) {
      return;
    }
    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0) {
      this._spawnObstacle();
      this.spawnTimer = this._randomInRange(this.config.obstacleSpawnInterval);
    }
  }

  _spawnObstacle() {
    const width = Math.round(this._randomInRange(this.config.obstacleSizeRange));
    const height = Math.round(this._randomInRange(this.config.obstacleHeightRange));
    const offset = this._randomInRange(this.config.obstacleSpawnOffsetRange);
    const obstacle = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      width,
      height,
      x: this.config.width + offset,
      y: this.groundY - height,
      passed: false,
    };
    this.obstacles.push(obstacle);
  }

  _isColliding(dino, obstacle) {
    const dinoRight = dino.x + dino.width;
    const dinoBottom = dino.y + dino.height;
    const obstacleRight = obstacle.x + obstacle.width;
    const obstacleBottom = obstacle.y + obstacle.height;

    return (
      dino.x < obstacleRight &&
      dinoRight > obstacle.x &&
      dino.y < obstacleBottom &&
      dinoBottom > obstacle.y
    );
  }

  _incrementScore(amount) {
    const previous = Math.floor(this.score);
    this.score += amount;
    const current = Math.floor(this.score);
    if (current !== previous) {
      if (current > this.highScore) {
        this.highScore = current;
      }
      this.callbacks.onScoreChange(current, this.highScore);
    }
  }

  _finalizeRound(reason) {
    this._stopLoop();
    const finalScore = Math.floor(this.score);
    if (finalScore > this.highScore) {
      this.highScore = finalScore;
    }
    this.state = reason === "crash" ? "gameover" : "stopped";
    this.callbacks.onStateChange(this.state, { reason, score: finalScore });
    this.callbacks.onFrame(this.getSnapshot());
  }

  _randomInRange(range) {
    if (Array.isArray(range)) {
      const [min, max] = range;
      return min + Math.random() * (max - min);
    }
    return range;
  }
}

// 브라우저/Node 양쪽에서 사용할 수 있도록 export 처리
if (typeof module !== "undefined" && module.exports) {
  module.exports = { DinoGame };
}
if (typeof window !== "undefined") {
  window.DinoGame = DinoGame;
}
