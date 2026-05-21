import Phaser from 'phaser';

interface GameEvents {
  onGameOver: (score: number) => void;
  onScore: (score: number) => void;
  playSfx: (key: any) => void;
}

export function createShooterGame(container: HTMLElement, events: GameEvents) {
  class ShooterScene extends Phaser.Scene {
    private player!: Phaser.GameObjects.Triangle;
    private enemies!: Phaser.Physics.Arcade.Group;
    private bullets!: Phaser.Physics.Arcade.Group;
    private score = 0;
    private isGameOver = false;

    constructor() {
      super('ShooterScene');
    }

    create() {
      const { width, height } = this.scale;
      this.score = 0;
      this.isGameOver = false;

      // Ship
      this.player = this.add.triangle(width / 2, height - 80, 0, 40, 25, 0, 50, 40, 0x8b5cf6);
      this.physics.add.existing(this.player);
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.setCollideWorldBounds(true);

      this.enemies = this.physics.add.group();
      this.bullets = this.physics.add.group();

      // Control: Drag or Move
      this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
        if (this.isGameOver) return;
        this.player.x = p.x;
      });

      this.input.on('pointerdown', () => this.fire());

      // Collisions
      this.physics.add.overlap(this.bullets, this.enemies, (b, e) => {
        b.destroy();
        e.destroy();
        this.score += 25;
        events.onScore(this.score);
        events.playSfx('score');
        this.explode(e as any);
      });

      this.physics.add.overlap(this.player, this.enemies, () => this.gameOver());

      // Spawner
      this.time.addEvent({
        delay: 1000,
        callback: () => this.spawn(),
        loop: true
      });
    }

    fire() {
      if (this.isGameOver) return;
      const b = this.add.rectangle(this.player.x, this.player.y - 30, 6, 20, 0x06b6d4);
      this.bullets.add(b);
      (b.body as Phaser.Physics.Arcade.Body).setVelocityY(-700);
      events.playSfx('jump');
    }

    spawn() {
      if (this.isGameOver) return;
      const x = Phaser.Math.Between(50, this.scale.width - 50);
      const e = this.add.circle(x, -50, 18, 0xf43f5e);
      this.enemies.add(e);
      (e.body as Phaser.Physics.Arcade.Body).setVelocityY(Phaser.Math.Between(150, 350));
    }

    explode(target: any) {
      for (let i = 0; i < 10; i++) {
        const p = this.add.circle(target.x, target.y, 4, 0xf43f5e);
        this.physics.add.existing(p);
        const b = p.body as Phaser.Physics.Arcade.Body;
        const angle = Math.random() * Math.PI * 2;
        const s = 150 + Math.random() * 150;
        b.setVelocity(Math.cos(angle) * s, Math.sin(angle) * s);
        this.tweens.add({ targets: p, alpha: 0, duration: 500, onComplete: () => p.destroy() });
      }
    }

    gameOver() {
      if (this.isGameOver) return;
      this.isGameOver = true;
      this.physics.pause();
      this.player.setFillStyle(0xef4444);
      events.onGameOver(this.score);
    }

    update() {
      if (this.isGameOver) return;
      this.bullets.getChildren().forEach((b: any) => { if (b.y < -50) b.destroy(); });
      this.enemies.getChildren().forEach((e: any) => { if (e.y > this.scale.height + 50) e.destroy(); });
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
    scene: ShooterScene
  };
}