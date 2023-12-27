const express = require('express');
const cors = require('cors');
const FiveM = require('fivem');
const config = require('./config.json');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('.'));

const serverIP = config.serverIP;
const srv = new FiveM.Server(serverIP);

app.get('/players', async (req, res) => {
    try {
        const response = await srv.getPlayersAll();
        console.log('Data received from FiveM API:', response);
        res.json({ data: response }); // Send the data as is
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).send('Error fetching players');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});