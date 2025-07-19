// src/components/student/WordFeast/FishLogic.js
import { gameConfig } from './config';

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
  }

  getNewTarget() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
    };
  }

  update(delta, playerPosition) {
    const fishType = gameConfig.fishTypes[this.size];
    const distanceToTarget = Math.sqrt(
      Math.pow(this.targetPosition.x - this.position.x, 2) +
      Math.pow(this.targetPosition.y - this.position.y, 2)
    );

    if (distanceToTarget < 50) {
      this.targetPosition = this.getNewTarget();
    }

    const angleToTarget = Math.atan2(
      this.targetPosition.y - this.position.y,
      this.targetPosition.x - this.position.x
    );

    this.velocity.x = Math.cos(angleToTarget) * fishType.wandering.speed;
    this.velocity.y = Math.sin(angleToTarget) * fishType.wandering.speed;

    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;

    this.position.x = Math.max(0, Math.min(this.width, this.position.x));
    this.position.y = Math.max(0, Math.min(this.height, this.position.y));
  }

  get state() {
    return {
      id: this.id,
      size: this.size,
      points: this.points, 
      position: this.position,
      velocity: this.velocity,
      status: this.status,
    };
  }
}

export default FishLogic;