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
app.post('/api/archive', (req, res) => {
    const livePath = '/data/live.pgn';
    
    // Check if there is actually a game to save
    if (fs.existsSync(livePath)) {
        // Generates a clean timestamp like "2026-06-14_14-30-00"
        const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
        const archivePath = `/data/game_${timestamp}.pgn`;
        
        // fs.rename moves the file, effectively clearing live.pgn for the next game
        fs.rename(livePath, archivePath, (err) => {
            if (err) {
                console.error('Failed to archive game:', err);
                return res.status(500).send('Archive failed');
            }
            console.log(`Game saved to ${archivePath}`);
            res.sendStatus(200);
        });
    } else {
        res.status(404).send('No live game found to archive.');
    }
});

app.listen(8080, () => console.log('ChessCam custom server running on 8080'));