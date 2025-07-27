const mongoose = require('mongoose');
const User = require('../../server/models/User'); // adjust if your path is different

const MONGO_URI = process.env.MONGO_URI;

let isConnected = false;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    const { userId, tokenVerified } = JSON.parse(event.body || '{}');

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing userId' })
      };
    }

    if (!isConnected) {
      await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      isConnected = true;
    }

    const user = await User.findOneAndUpdate(
      { userId },
      { tokenVerified: !!tokenVerified },
      { new: true, upsert: true }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User verified', user })
    };
  } catch (err) {
    console.error('❌ VERIFY ERROR:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
