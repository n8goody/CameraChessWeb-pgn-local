import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve the built Vite frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Endpoint to catch the PGN from the browser
app.post('/api/pgn', (req, res) => {
    const { pgn } = req.body;
    if (pgn) {
        // Write to the Portainer mapped volume
        fs.writeFile('/data/live.pgn', pgn, (err) => {
            if (err) console.error('Failed to write PGN:', err);
        });
    }
    res.sendStatus(200);
});

app.listen(8080, () => console.log('ChessCam custom server running on 8080'));