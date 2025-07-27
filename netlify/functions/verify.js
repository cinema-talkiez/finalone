const mongoose = require('mongoose');
const path = require('path');
const User = require(path.resolve(__dirname, '../../server/models/User'));
require('dotenv').config();

let conn = null;

async function connectDB() {
  if (conn) return conn;
  conn = await mongoose.connect(process.env.MONGO_URI, {
    bufferCommands: false,
  });
  return conn;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    await connectDB(); // ✅ Connect only on demand

    const { userId, tokenVerified } = JSON.parse(event.body || '{}');

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing userId' }),
      };
    }

    const result = await User.findOneAndUpdate(
      { userId },
      { $set: { tokenVerified } },
      { upsert: true, new: true }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User verification updated.', user: result }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error' }),
    };
  }
};
