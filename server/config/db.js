const mongoose = require('mongoose');

/**
 * Global cache across warm lambdas in serverless environments (e.g. Vercel).
 * In a traditional server, this establishes a persistent connection.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('MongoDB connection error: MONGO_URI is not defined in environment variables.');
    throw new Error('MONGO_URI environment variable is missing.');
  }

  // If a cached connection already exists, reuse it
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection promise is in-flight, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose.connect(mongoURI, opts).then((mongooseInstance) => {
      console.log(`[MongoDB] Connected to database: ${mongooseInstance.connection.name || 'Atlas Cluster'}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('[MongoDB] Connection failed:', error.message);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
