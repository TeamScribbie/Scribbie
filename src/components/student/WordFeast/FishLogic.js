import { gameConfig } from './config';
import { calculateDistance } from './gameUtils';

class FishLogic {
  constructor(fishData, width, height) {
    this.id = fishData.id;
    this.size = fishData.size;
    this.points = fishData.points;
    this.position = { ...fishData.position };
    this.velocity = { ...fishData.velocity };
    this.status = 'roaming';
    this.width = width;
    this.height = height;
    this.targetPosition = this.getNewTarget();

    this.lastAngle = 0;
    this.turnDuration = 0;
    this.turnCooldown = 0;
    this.eatDuration = 0;
    this.eatCooldown = 180;
    this.fishToEatId = null;
  }

  getNewTarget() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
    };
  }

  update(delta, playerPosition, otherFish) {
    this.fishToEatId = null;
    const fishType = gameConfig.fishTypes[this.size];
    
    this.turnDuration -= delta;
    this.turnCooldown -= delta;
    this.eatDuration -= delta;
    this.eatCooldown -= delta;

    if (this.eatDuration > 0) {
      this.status = 'eating';
      this.velocity.x *= 0.9;
    } else if (this.turnDuration > 0) {
      this.status = 'turning';
      this.velocity.x *= 0.95;
    } else {
        this.status = 'roaming';
        let target = this.targetPosition;
        let targetSize = null;

        if (this.size === 'medium') targetSize = 'small';
        if (this.size === 'large') targetSize = 'medium';

        if (targetSize && this.eatCooldown <= 0 && otherFish) {
            const prey = otherFish.find(f =>
                f.id !== this.id && f.size === targetSize && calculateDistance(this.position, f.position) < fishType.chaseRadius
            );

            if (prey) {
                this.status = 'chasing';
                target = prey.position;
                if (calculateDistance(this.position, prey.position) < 40) { // Increased distance for larger fish
                    this.eatDuration = 25;
                    this.eatCooldown = 240; // Longer cooldown
                    this.fishToEatId = prey.id;
                }
            }
        }

        if (this.status === 'roaming' && calculateDistance(this.position, this.targetPosition) < 50) { this.targetPosition = this.getNewTarget(); }
        const angleToTarget = Math.atan2(target.y - this.position.y, target.x - this.position.x);
        const angleDiff = Math.abs(angleToTarget - this.lastAngle);
        if (angleDiff > Math.PI / 1.5 && this.turnCooldown <= 0) { this.turnDuration = 30; this.turnCooldown = 90; }
        const speed = this.status === 'chasing' ? fishType.chaseSpeed : fishType.wandering.speed;
        this.velocity.x = Math.cos(angleToTarget) * speed;
        this.velocity.y = Math.sin(angleToTarget) * speed;
        this.lastAngle = angleToTarget;
    }

    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;

    this.position.x = Math.max(0, Math.min(this.width, this.position.x));
    this.position.y = Math.max(0, Math.min(this.height, this.position.y));
  }

  get state() {
    return { id: this.id, size: this.size, points: this.points, position: this.position, velocity: this.velocity, status: this.status, fishToEatId: this.fishToEatId };
  }
}

export default FishLogic;