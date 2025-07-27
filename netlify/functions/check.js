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
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    await connectDB(); // ✅ connect during request handling

    const userId = event.path.split('/check/')[1];

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing userId' }),
      };
    }

    const user = await User.findOne({ userId });

    return {
      statusCode: 200,
      body: JSON.stringify({
        exists: !!user,
        tokenVerified: user ? user.tokenVerified : false,
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error' }),
    };
  }
};
