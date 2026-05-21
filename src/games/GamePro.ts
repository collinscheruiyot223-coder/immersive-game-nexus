import Phaser from 'phaser';

interface GameEvents {
  onGameOver: (score: number) => void;
  onScore: (score: number) => void;
  playSfx: (key: any) => void;
}

export function createGamePro(container: HTMLElement, events: GameEvents) {
  class GameProScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Arc;
    private enemies!: Phaser.Physics.Arcade.Group;
    private bullets!: Phaser.Physics.Arcade.Group;
    private score = 0;
    private isGameOver = false;
    private nextSpawn = 0;
    private spawnInterval = 1000;

    constructor() {
      super('GameProScene');
    }

    create() {
      const { width, height } = this.scale;
      this.score = 0;
      this.isGameOver = false;
      this.spawnInterval = 1000;

      // Professional Cyber Grid Background
      this.add.grid(width / 2, height / 2, width * 2, height * 2, 40, 40, 0x020617, 1, 0x1e293b, 0.5);

      // Central Hub to Protect
      const hub = this.add.circle(width / 2, height / 2, 40, 0x10b981, 0.1).setStrokeStyle(2, 0x10b981);
      this.physics.add.existing(hub);

      // Player ship - Precision cursor-follower
      this.player = this.add.circle(width / 2, height / 2, 12, 0x10b981).setStrokeStyle(2, 0xffffff);
      this.physics.add.existing(this.player);

      // Particles
      this.bullets = this.physics.add.group();
      this.enemies = this.physics.add.group();

      // Input
      this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (this.isGameOver) return;
        // Ship follows mouse with "Pro" weight/delay
        this.player.x = Phaser.Math.Linear(this.player.x, pointer.x, 0.2);
        this.player.y = Phaser.Math.Linear(this.player.y, pointer.y, 0.2);
      });

      this.input.on('pointerdown', () => this.fire());

      // Collisions
      this.physics.add.overlap(this.bullets, this.enemies, (b, e) => {
        b.destroy();
        e.destroy();
        this.score += 150;
        events.onScore(this.score);
        events.playSfx('score');
        this.spawnExplosion(e as any);
      });

      this.physics.add.overlap(hub, this.enemies, () => this.gameOver());
      this.physics.add.overlap(this.player, this.enemies, () => this.gameOver());
    }

    fire() {
      if (this.isGameOver) return;
      const bullet = this.add.rectangle(this.player.x, this.player.y, 6, 6, 0xfacc15);
      this.bullets.add(bullet);
      
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.x, this.input.activePointer.y);
      this.physics.velocityFromRotation(angle, 600, (bullet.body as Phaser.Physics.Arcade.Body).velocity);
      events.playSfx('jump'); // Sound fallback
    }

    spawnEnemy() {
      if (this.isGameOver) return;
      const { width, height } = this.scale;
      
      const edge = Phaser.Math.Between(0, 3);
      let x, y;
      
      if (edge === 0) { x = Phaser.Math.Between(0, width); y = -50; }
      else if (edge === 1) { x = width + 50; y = Phaser.Math.Between(0, height); }
      else if (edge === 2) { x = Phaser.Math.Between(0, width); y = height + 50; }
      else { x = -50; y = Phaser.Math.Between(0, height); }

      const enemy = this.add.star(x, y, 5, 8, 16, 0xef4444).setStrokeStyle(1, 0xffffff);
      this.enemies.add(enemy);
      this.physics.moveTo(enemy, width / 2, height / 2, 120 + (this.score / 500));
    }

    spawnExplosion(target: any) {
      for (let i = 0; i < 8; i++) {
        const p = this.add.circle(target.x, target.y, 2, 0xef4444);
        this.physics.add.existing(p);
        const b = p.body as Phaser.Physics.Arcade.Body;
        const angle = Math.random() * Math.PI * 2;
        const speed = 100 + Math.random() * 100;
        b.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        this.tweens.add({ targets: p, alpha: 0, duration: 400, onComplete: () => p.destroy() });
      }
    }

    gameOver() {
      if (this.isGameOver) return;
      this.isGameOver = true;
      this.physics.pause();
      this.cameras.main.shake(400, 0.01);
      this.player.setFillStyle(0xff0000);
      events.onGameOver(this.score);
    }

    update(time: number) {
      if (this.isGameOver) return;

      if (time > this.nextSpawn) {
        this.spawnEnemy();
        this.spawnInterval = Math.max(300, 1000 - (this.score / 20));
        this.nextSpawn = time + this.spawnInterval;
      }

      // Rotation effect
      this.player.setRotation(this.player.rotation + 0.05);

      // Cleanup
      this.bullets.getChildren().forEach((b: any) => {
        if (b.x < -100 || b.x > this.scale.width + 100 || b.y < -100 || b.y > this.scale.height + 100) b.destroy();
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
    scene: GameProScene
  };
}