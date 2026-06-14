const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const noteRoutes = require('./routes/note.routes.js');
const errorHandler = require('./middleware/error.middleware.js');
const { HTTP_STATUS } = require('./utils/constants.js');

const app = express();

// Security Middlewares
app.use(helmet());

// CORS Configuration for API routes only
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:5173', 'http://localhost:3000'];
const allowAllOrigins = process.env.ALLOW_ALL_CORS === 'true';
app.use('/api', (req, res, next) => {
  const serverOrigin = `${req.protocol}://${req.get('host')}`;
  const origins = [...allowedOrigins, serverOrigin];

  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        return callback(null, true);
      }
      if (allowAllOrigins || origins.indexOf(origin) !== -1 || origins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy: Request origin not allowed'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })(req, res, next);
});

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Routes Hookup
app.use('/api/notes', noteRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Server health status: UP',
    timestamp: new Date(),
  });
});

// Serve React build assets when the client build exists
const clientBuildPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl === '/health') {
      return next();
    }

    const indexHtml = path.join(clientBuildPath, 'index.html');
    if (fs.existsSync(indexHtml)) {
      return res.sendFile(indexHtml);
    }

    return next();
  });
}

// Fallback for Unknown API Endpoints (404 Routing)
app.use('/api/*', (req, res, next) => {
  const err = new Error(`Cannot find requested route ${req.originalUrl} on this server`);
  err.status = HTTP_STATUS.NOT_FOUND;
  next(err);
});

app.use('*', (req, res, next) => {
  const err = new Error(`Cannot find requested route ${req.originalUrl} on this server`);
  err.status = HTTP_STATUS.NOT_FOUND;
  next(err);
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
