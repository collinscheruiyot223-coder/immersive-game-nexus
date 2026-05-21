import Phaser from 'phaser';

interface GameEvents {
  onGameOver: (score: number) => void;
  onScore: (score: number) => void;
  playSfx: (key: any) => void;
}

export function createDrivingGame(container: HTMLElement, events: GameEvents) {
  class DrivingScene extends Phaser.Scene {
    private carContainer!: Phaser.GameObjects.Container;
    private obstacles!: Phaser.Physics.Arcade.Group;
    private roadLines!: Phaser.GameObjects.Group;
    private score = 0;
    private isGameOver = false;
    private gameSpeed = 8;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    
    // Realistic Physics Properties
    private velocityY = 0;
    private velocityX = 0;
    private acceleration = 0.2;
    private friction = 0.96;
    private maxSpeed = 12;
    private steeringPower = 0.05;

    constructor() {
      super('DrivingScene');
    }

    create() {
      const { width, height } = this.scale;
      this.score = 0;
      this.isGameOver = false;
      this.gameSpeed = 8;

      // Road background (Tarmac)
      this.add.rectangle(width / 2, height / 2, width * 0.8, height, 0x1e293b);
      
      // Road borders (Grass/Shoulder)
      this.add.rectangle(width * 0.1 - 5, height / 2, 10, height, 0x4ade80);
      this.add.rectangle(width * 0.9 + 5, height / 2, 10, height, 0x4ade80);
      
      // Road lines
      this.roadLines = this.add.group();
      for (let i = -1; i < 11; i++) {
        const line = this.add.rectangle(width / 2, i * 80, 8, 40, 0xf1f5f9);
        this.roadLines.add(line);
      }

      // --- CREATE REAL CAR SPRITE (COMPOSITE) ---
      this.carContainer = this.add.container(width / 2, height - 120);
      
      // Car Body
      const body = this.add.rectangle(0, 0, 44, 80, 0xef4444, 1).setStrokeStyle(2, 0x991b1b);
      // Roof/Windows
      const roof = this.add.rectangle(0, -5, 34, 30, 0x1e1e1e, 1);
      const windshield = this.add.rectangle(0, -25, 30, 8, 0x94a3b8, 0.8);
      const rearWindow = this.add.rectangle(0, 15, 30, 6, 0x94a3b8, 0.8);
      // Headlights
      const lightL = this.add.rectangle(-15, -38, 8, 4, 0xfef08a);
      const lightR = this.add.rectangle(15, -38, 8, 4, 0xfef08a);
      // Wheels
      const wFL = this.add.rectangle(-24, -25, 6, 15, 0x000000);
      const wFR = this.add.rectangle(24, -25, 6, 15, 0x000000);
      const wRL = this.add.rectangle(-24, 25, 6, 15, 0x000000);
      const wRR = this.add.rectangle(24, 25, 6, 15, 0x000000);

      this.carContainer.add([wFL, wFR, wRL, wRR, body, roof, windshield, rearWindow, lightL, lightR]);
      
      this.physics.add.existing(this.carContainer);
      const carBody = this.carContainer.body as Phaser.Physics.Arcade.Body;
      carBody.setCollideWorldBounds(true);
      carBody.setSize(44, 80);

      // Obstacles (Other Cars)
      this.obstacles = this.physics.add.group();

      // Input
      if (this.input.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys();
      }

      this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (this.isGameOver) return;
        // Direct steering via pointer
        const targetX = Phaser.Math.Clamp(pointer.x, width * 0.1 + 40, width * 0.9 - 40);
        this.velocityX = (targetX - this.carContainer.x) * 0.1;
      });

      // Collisions
      this.physics.add.overlap(this.carContainer, this.obstacles, () => this.gameOver());

      // Spawner
      this.time.addEvent({
        delay: 1200,
        callback: () => this.spawnTraffic(),
        loop: true
      });
    }

    spawnTraffic() {
      if (this.isGameOver) return;
      const { width } = this.scale;
      const x = Phaser.Math.Between(width * 0.1 + 60, width * 0.9 - 60);
      
      const trafficContainer = this.add.container(x, -100);
      const colors = [0x3b82f6, 0x10b981, 0x6366f1, 0xd946ef, 0x475569];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const tBody = this.add.rectangle(0, 0, 44, 80, color).setStrokeStyle(2, 0x000000);
      const tRoof = this.add.rectangle(0, 5, 34, 30, 0x1e1e1e);
      const tWind = this.add.rectangle(0, 25, 30, 8, 0x94a3b8, 0.6);
      
      trafficContainer.add([tBody, tRoof, tWind]);
      this.obstacles.add(trafficContainer);
      
      const body = trafficContainer.body as Phaser.Physics.Arcade.Body;
      body.setVelocityY(this.gameSpeed * 30 + Phaser.Math.Between(50, 150));
    }

    gameOver() {
      if (this.isGameOver) return;
      this.isGameOver = true;
      this.physics.pause();
      
      // Explosion effect
      const emitter = this.add.particles(this.carContainer.x, this.carContainer.y, 'flare', {
        speed: { min: -100, max: 100 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.4, end: 0 },
        blendMode: 'ADD',
        active: true,
        lifespan: 600,
        gravityY: 0
      });
      
      this.tweens.add({
        targets: this.carContainer,
        alpha: 0,
        duration: 200
      });

      events.onGameOver(Math.floor(this.score));
    }

    update() {
      if (this.isGameOver) return;

      const { width, height } = this.scale;

      // Realistic Steering Physics
      if (this.cursors) {
        if (this.cursors.left.isDown) {
          this.velocityX -= this.acceleration;
        } else if (this.cursors.right.isDown) {
          this.velocityX += this.acceleration;
        } else {
          this.velocityX *= this.friction;
        }
      }

      // Apply Velocity
      this.carContainer.x += this.velocityX;
      
      // Visual Tilt/Steer effect
      this.carContainer.setRotation(this.velocityX * 0.05);

      // Bounds check
      if (this.carContainer.x < width * 0.1 + 30) {
        this.carContainer.x = width * 0.1 + 30;
        this.velocityX = 0;
      }
      if (this.carContainer.x > width * 0.9 - 30) {
        this.carContainer.x = width * 0.9 - 30;
        this.velocityX = 0;
      }

      // Road Animation
      this.roadLines.getChildren().forEach((line: any) => {
        line.y += this.gameSpeed;
        if (line.y > height + 40) {
          line.y = -40;
        }
      });

      // Update Score & Difficulty
      this.score += (this.gameSpeed / 10);
      events.onScore(Math.floor(this.score));
      
      if (Math.floor(this.score) % 1000 === 0 && this.score > 0) {
        this.gameSpeed = Math.min(this.gameSpeed + 0.01, this.maxSpeed);
      }

      // Cleanup obstacles
      this.obstacles.getChildren().forEach((obs: any) => {
        if (obs.y > height + 200) {
          obs.destroy();
        }
      });
    }
  }

  return {
    type: Phaser.AUTO,
    parent: container,
    width: 800,
    height: 600,
    backgroundColor: '#020617',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: { debug: false }
    },
    scene: DrivingScene
  };
}