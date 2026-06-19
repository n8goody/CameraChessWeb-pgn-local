import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Target address of your main Chezz container inside the Docker network
const CHEZZ_API_URL = process.env.CHEZZ_API_URL || 'http://chezz:8080/api/game/live';
const CHEZZ_ACTION_URL = process.env.CHEZZ_API_URL || 'http://chezz:8080/api/game/update';

// Serve the built Vite frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Helper to generate a clean, local database-compliant timestamp (YYYY-MM-DD HH:MM:SS)
// This natively respects the TZ environment variable set in docker-compose
function getLocalTimestamp() {
    const d = new Date();
    
    // Format options matching SQLite expectations
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const localeParts = d.toLocaleString('en-US', options).split(', ');
    
    const [month, day, year] = localeParts[0].split('/');
    const time = localeParts[1];
    
    return `${year}-${month}-${day} ${time}`;
}

// Endpoint to catch the PGN from the browser and pass it directly to Chezz DB
app.post('/api/pgn', async (req, res) => {
    const { pgn } = req.body;
    if (!pgn) return res.status(400).send('Missing PGN data.');

    const payload = {
        pgn_string: pgn,
        local_timestamp: getLocalTimestamp()
    };

    try {
        const response = await fetch(CHEZZ_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            res.sendStatus(200);
        } else {
            const errText = await response.text();
            console.error('Chezz DB rejected the update:', errText);
            res.status(502).send('Chezz database update failed.');
        }
    } catch (err) {
        console.error('Failed to communicate with Chezz container:', err.message);
        res.status(500).send('Network error connecting to Chezz.');
    }
});

// Endpoint to archive the active live game via the Chezz API
app.post('/api/archive', async (req, res) => {
    // Generate an automatic default archival name based on the current localized date
    const d = new Date();
    const ds = d.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
    const autoName = `cam_archive_${ds}.pgn`;

    const payload = {
        action: 'archive_live',
        new_name: autoName
    };

    try {
        const response = await fetch(CHEZZ_ACTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`Live stream game cleanly archived to database via Chezz API.`);
            res.sendStatus(200);
        } else {
            res.status(502).send('Archival rejected by Chezz controller.');
        }
    } catch (err) {
        console.error('Error hitting Chezz archival endpoint:', err.message);
        res.status(500).send('Internal network exception.');
    }
});

app.listen(8080, () => console.log('ChessCam custom API server running on 8080'));