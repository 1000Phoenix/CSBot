const mysql = require('mysql');
const FiveM = require('fivem');
const config = require('./config.json');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    charset: 'utf8mb4'
});

console.log("Connected to the database!");

const createTableQuery = `
CREATE TABLE IF NOT EXISTS players (
    name VARCHAR(255) DEFAULT NULL,
    steam VARCHAR(255) NOT NULL,
    license VARCHAR(255) DEFAULT NULL,
    license2 VARCHAR(255) DEFAULT NULL,
    xbl VARCHAR(255) DEFAULT NULL,
    live VARCHAR(255) DEFAULT NULL,
    discord VARCHAR(255) DEFAULT NULL,
    fivem VARCHAR(255) DEFAULT NULL,
    timestamp TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (steam)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// Promisify the pool query for use with async/await
const poolQuery = (sql, params) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

// Async function to log identifiers to database
async function logIdentifiersToDatabase() {
    try {
        // Ensure table exists
        await poolQuery(createTableQuery);

        const srv = new FiveM.Server(config.serverIP);
        const players = await srv.getPlayersAll();

        for (let player of players) {
            const identifiers = player.identifiers;
            const identifierMapping = {
                name: null,
                steam: null,
                license: null,
                license2: null,
                xbl: null,
                live: null,
                discord: null,
                fivem: null
            };

            identifierMapping.name = player.name;

            for (let identifier of identifiers) {
                for (let key in identifierMapping) {
                    if (identifier.includes(key)) {
                        identifierMapping[key] = identifier.split(":")[1];
                    }
                }
            }

            if (identifierMapping.steam) {
                const insertOrUpdateQuery = `
                INSERT INTO players (name, steam, license, license2, xbl, live, discord, fivem) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE 
                license=VALUES(license), license2=VALUES(license2), xbl=VALUES(xbl),
                live=VALUES(live), discord=VALUES(discord), fivem=VALUES(fivem), name=VALUES(name);
                `;

                await poolQuery(insertOrUpdateQuery, [
                    identifierMapping.name,
                    identifierMapping.steam,
                    identifierMapping.license,
                    identifierMapping.license2,
                    identifierMapping.xbl,
                    identifierMapping.live,
                    identifierMapping.discord,
                    identifierMapping.fivem
                ]);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

logIdentifiersToDatabase().then(() => {
    console.log("All asynchronous operations complete.");
    pool.end((err) => {
        if (err) {
            console.error("Database error:", err);
        }
        console.log("Database connection closed.");
    });
}).catch((error) => {
    console.error("Error occurred:", error);
});

module.exports = { logIdentifiersToDatabase };