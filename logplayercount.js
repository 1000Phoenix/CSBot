const mysql = require('mysql');
const FiveM = require('fivem');
const config = require('./config.json');

// Assuming a similar database setup is required
const pool = mysql.createPool({
    connectionLimit: 10,
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
});

console.log("Connected to the database!");

// Function to log the player count
function logPlayerCount() {
    const server = new FiveM.Server(config.serverIP); // Replace with your server IP
    server.getPlayers().then(playerCount => {
        console.log(`Number of players online: ${playerCount}`);

        // Get current UTC time in MySQL DATETIME format
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Insert the player count and current time into the database
        const insertQuery = 'INSERT INTO player_counts (log_time, count) VALUES (?, ?)';
        pool.query(insertQuery, [now, playerCount], (err, results) => {
            if (err) {
                console.error('Error inserting player count into the database:', err);
                return;
            }
            console.log('Player count inserted into the database at time:', now);
        });

    }).catch(err => {
        console.error('Error getting player count:', err);
    });
}

// Call the function immediately for cron job execution
logPlayerCount();