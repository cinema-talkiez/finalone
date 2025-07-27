const mongoose = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  tokenVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 86400 },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

exports.handler = async (event) => {
  const userId = event.path.split("/").pop();

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing userId" }),
    };
  }

  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(MONGODB_URI, { dbName: "userDB" });
    }

    const user = await User.findOne({ userId });

    if (!user) {
      return {
        statusCode: 200,
        body: JSON.stringify({ tokenVerified: false }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ tokenVerified: user.tokenVerified }),
    };
  } catch (err) {
    console.error("DB error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error", error: err.message }),
    };
  }
};
