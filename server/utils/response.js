/**
 * Send standard success response
 * @param {Response} res 
 * @param {string} message 
 * @param {Object|Array} data 
 * @param {number} statusCode 
 */
const sendSuccess = (res, message = 'Operation successful', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send standard validation error response
 * @param {Response} res 
 * @param {string} message 
 * @param {Array} errors 
 * @param {number} statusCode 
 */
const sendValidationError = (res, message = 'Validation failed', errors = [], statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

/**
 * Send standard server error response
 * @param {Response} res 
 * @param {string} message 
 * @param {Error|null} error 
 * @param {number} statusCode 
 */
const sendServerError = (res, message = 'Internal server error', error = null, statusCode = 500) => {
  const responseBody = {
    success: false,
    message,
  };

  // Add stack trace/details only in development mode
  if (process.env.NODE_ENV === 'development' && error) {
    responseBody.error = error.message;
    responseBody.stack = error.stack;
  }

  return res.status(statusCode).json(responseBody);
};

module.exports = {
  sendSuccess,
  sendValidationError,
  sendServerError,
};
