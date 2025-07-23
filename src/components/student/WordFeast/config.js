export const gameConfig = {
    choiceVolume: 1.0, 
    width: 1280,  
    height: 720, 
    worldWidth: 2560,  
    worldHeight: 1440,
    player: {
        initialSize: 'small',
        accel: 0.2,
        maxSpeed: 5,
        friction: 0.96,
        mediumScore: 50,
        largeScore: 150,
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
        targetPopulation: 16,
        respawnCooldown: 60,
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