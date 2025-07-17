export const gameConfig = {
    width: 800,
    height: 600,
    player: {
        initialSize: 'small',
        accel: 0.08,
        maxSpeed: 5,
        friction: 0.96,
        mediumScore: 50,
        largeScore: 150,
        dash: {
            speed: 12,
            duration: 15,
            cooldown: 120,
        }
    },
    fishSpawning: {
        targetPopulation: 16,
        respawnCooldown: 60,
    },
    fishTypes: {
        small: { 
            points: 10,
            wandering: { 
                speed: 1.2, 
                turnStrength: 0.1 // How sharply it turns while wandering
            } 
        },
        medium: { 
            points: 25, 
            chaseRadius: 150,
            chaseSpeed: 1.5,
            wandering: { 
                speed: 0.8, 
                turnStrength: 0.05 
            }
        },
        large: { 
            points: 50, 
            chaseRadius: 200, 
            chaseSpeed: 2.5,
            wandering: { 
                speed: 0.6, 
                turnStrength: 0.03
            } 
        },
    }
};