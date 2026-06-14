const mongoose = require('mongoose');

const connectDB = async () => {
  const connUri = process.env.MONGODB_URI;
  if (!connUri) {
    console.error('Error: MONGODB_URI is not defined in the environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(connUri, {
      autoIndex: true, // Build indexes in development/production
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Log Mongoose connection events
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection runtime error: ${err}`);
});

module.exports = connectDB;
