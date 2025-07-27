const express = require('express');
const next = require('next');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: path.join(__dirname, '../') });
const handle = app.getRequestHandler();

const server = express();
server.use(cors());
server.use(express.json());

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// ✅ Verification update endpoint
server.post('/api/verify', async (req, res) => {
  const { userId, tokenVerified } = req.body;
  if (!userId) return res.status(400).json({ message: 'Missing userId' });

  try {
    const result = await User.findOneAndUpdate(
      { userId },
      { $set: { tokenVerified } },
      { upsert: true, new: true }
    );
    res.json({ message: 'User verification updated.', user: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Token status check endpoint
server.get('/api/check/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ userId });
    if (!user) return res.json({ exists: false, tokenVerified: false });

    res.json({ exists: true, tokenVerified: user.tokenVerified });
  } catch (err) {
    res.status(500).json({ message: 'Error checking user' });
  }
});

server.all('*', (req, res) => {
  return handle(req, res);
});

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 App running at http://localhost:${PORT}`);
  });
});
