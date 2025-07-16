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
    },
    fishSpawning: {
        targetPopulation: 16,
        respawnCooldown: 60,
    },
    fishTypes: {
        small: { points: 10 },
        medium: { 
            points: 25, 
            chaseRadius: 150,
            chaseSpeed: 1.5 
        },
        large: { 
            points: 50, 
            chaseRadius: 200, 
            chaseSpeed: 2.5 
        },
    }
};