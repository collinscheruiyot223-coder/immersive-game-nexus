import Phaser from 'phaser';

interface GameEvents {
  onGameOver: (score: number) => void;
  onScore: (score: number) => void;
  playSfx: (key: any) => void;
}

export function createRunnerGame(container: HTMLElement, events: GameEvents) {
  class RunnerScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Rectangle;
    private obstacles!: Phaser.Physics.Arcade.Group;
    private score = 0;
    private isGameOver = false;
    private nextObstacleTime = 0;
    private gameSpeed = 400;

    constructor() {
      super('RunnerScene');
    }

    create() {
      const { width, height } = this.scale;
      this.score = 0;
      this.isGameOver = false;
      this.gameSpeed = 400;

      // Ground
      this.add.rectangle(0, height - 50, width, 50, 0x1e293b).setOrigin(0, 0);

      // Player
      this.player = this.add.rectangle(100, height - 100, 40, 60, 0x6366f1);
      this.physics.add.existing(this.player);
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.setGravityY(1200);
      body.setCollideWorldBounds(true);

      // Obstacles
      this.obstacles = this.physics.add.group();

      // Input
      this.input.on('pointerdown', () => this.jump());
      this.input.keyboard?.on('keydown-SPACE', () => this.jump());

      // Collisions
      this.physics.add.collider(this.player, this.obstacles, () => {
        this.gameOver();
      });

      // Trail effect
      this.time.addEvent({
        delay: 50,
        callback: () => {
          if (this.isGameOver) return;
          const trail = this.add.rectangle(this.player.x, this.player.y, this.player.width, this.player.height, 0x6366f1, 0.3);
          this.tweens.add({
            targets: trail,
            alpha: 0,
            scale: 0.8,
            duration: 400,
            onComplete: () => trail.destroy()
          });
        },
        loop: true
      });
    }

    jump() {
      if (this.isGameOver) return;
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      if (body.blocked.down || body.touching.down) {
        body.setVelocityY(-600);
        events.playSfx('jump');
      }
    }

    gameOver() {
      if (this.isGameOver) return;
      this.isGameOver = true;
      this.physics.pause();
      this.player.setFillStyle(0xef4444);
      events.onGameOver(this.score);
    }

    update(time: number) {
      if (this.isGameOver) return;

      // Spawn obstacles
      if (time > this.nextObstacleTime) {
        this.spawnObstacle();
        this.nextObstacleTime = time + Phaser.Math.Between(800, 1500);
      }

      // Cleanup obstacles & Score
      this.obstacles.getChildren().forEach((obj: any) => {
        if (obj.active && obj.x < -50) {
          obj.destroy();
          this.score += 10;
          events.onScore(this.score);
          if (this.score % 100 === 0) {
            events.playSfx('score');
            this.gameSpeed += 30;
          }
        }
      });
    }

    spawnObstacle() {
      const { width, height } = this.scale;
      const h = Phaser.Math.Between(40, 90);
      const obs = this.add.rectangle(width + 50, height - 50 - h / 2, 40, h, 0xec4899);
      this.obstacles.add(obs);
      const body = obs.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(-this.gameSpeed);
    }
  }

  return {
    type: Phaser.AUTO,
    parent: container,
    width: 800,
    height: 600,
    backgroundColor: '#0f172a',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: { debug: false }
    },
    scene: RunnerScene
  };
}