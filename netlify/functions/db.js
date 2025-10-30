import { mongooseConnect } from "../../lib/mongoose.js";

export const handler = async () => {
  try {
    // Pass your second connection string manually
    await mongooseConnect(process.env.MONGODB_URI);

    console.log("✅ Connected to MongoDB using second string");

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Connected to MongoDB using serverless URI!",
      }),
    };
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
