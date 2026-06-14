require('dotenv').config();
const app = require('./app.js');
const connectDB = require('./config/db.js');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(() => {
  // Start Express Server
  const server = app.listen(PORT, () => {
    console.log(`Server running in [${process.env.NODE_ENV || 'development'}] mode on port ${PORT}`);
  });

  // Handle Graceful Shutdown
  const shutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down server gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      const mongoose = require('mongoose');
      mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
});

// Capture unexpected runtime errors outside Express pipeline
process.on('uncaughtException', (err) => {
  console.error('CRITICAL UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION AT:', promise, 'REASON:', reason);
  process.exit(1);
});
