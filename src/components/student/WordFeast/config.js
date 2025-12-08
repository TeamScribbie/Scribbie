export const gameConfig = {
    width: 1600,  
    height: 900, 
    worldWidth: 3200,  
    worldHeight: 1800,
    player: {
        initialSize: 'small',
        accel: 0.5,
        maxSpeed: 5,
        friction: 0.96,
        mediumScore: 200,  // Slowed down further: was 100
        largeScore: 500,   // Slowed down further: was 300
        dash: {
            speed: 12,
            duration: 15,
            cooldown: 1.2,
        },
        boost: { 
            speedMultiplier: 2.5,
            duration: 20,      
            cooldown: 90,     
        }
    },
    fishSpawning: {
        targetPopulation: 60,
        respawnCooldown: 10,
    },
    fishTypes: {
        small: {
            points: 10,
            wandering: {
                speed: 1.2,
                turnStrength: 0.1 
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