const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://yakubuhakeem-cell.github.io';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;

let twilioClient;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  const twilio = require('twilio');
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

app.use(cors({ origin: ALLOWED_ORIGIN }));
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
  const state = req.body || {};
  const success = writeState(state);
  if (!success) {
    return res.status(500).json({ error: 'Failed to write state' });
  }
  res.json({ success: true });
});

app.post('/api/send-sms', async (req, res) => {
  if (!twilioClient) {
    return res.status(500).json({ error: 'SMS service is not configured' });
  }

  const { to, message, channel = 'sms' } = req.body || {};
  if (!to || !message) {
    return res.status(400).json({ error: 'Missing to or message' });
  }

  let sendFrom = TWILIO_FROM;
  let sendTo = to;

  if (channel === 'whatsapp') {
    if (!TWILIO_WHATSAPP_FROM) {
      return res.status(500).json({ error: 'WhatsApp sender is not configured' });
    }
    sendFrom = TWILIO_WHATSAPP_FROM.replace(/^whatsapp:/, '');
    sendTo = to.replace(/^whatsapp:/, '');
    sendFrom = `whatsapp:${sendFrom}`;
    sendTo = `whatsapp:${sendTo}`;
  }

  try {
    const sent = await twilioClient.messages.create({
      from: sendFrom,
      to: sendTo,
      body: message,
    });
    res.json({ success: true, sid: sent.sid, channel });
  } catch (err) {
    console.error('sendSms error', err);
    res.status(500).json({ error: 'Failed to send message', details: err.message });
  }
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
