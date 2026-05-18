const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

function readState() {
  try {
    if (!fs.existsSync(DATA_FILE)) return {};
    const txt = fs.readFileSync(DATA_FILE, 'utf8');
    return txt ? JSON.parse(txt) : {};
  } catch (err) {
    console.error('readState error', err);
    return {};
  }
}

function writeState(obj) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('writeState error', err);
    return false;
  }
}

app.get('/api/state', (req, res) => {
  const state = readState();
  res.json(state);
});

app.post('/api/state', (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Invalid body' });
  const ok = writeState(body);
  if (!ok) return res.status(500).json({ error: 'Failed to write state' });
  res.status(204).end();
});

app.get('/', (req, res) => res.json({ uptime: process.uptime() }));

app.listen(PORT, () => console.log(`Saako backend listening on port ${PORT}`));
