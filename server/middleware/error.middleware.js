const { sendServerError, sendValidationError } = require('../utils/response.js');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants.js');

const errorHandler = (err, req, res, next) => {
  // Log the full error stack in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error Handler] Path: ${req.path} | Method: ${req.method}`);
    console.error(err);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
    return sendValidationError(res, MESSAGES.VALIDATION_FAILED, errors, HTTP_STATUS.BAD_REQUEST);
  }

  // Handle Mongoose Cast Error (e.g. invalid MongoDB ObjectId format not caught by validation)
  if (err.name === 'CastError') {
    return sendValidationError(
      res,
      'Invalid resource identifier format',
      [{ field: err.path, message: `The value '${err.value}' is not a valid format for ${err.path}` }],
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Handle Syntax Error (e.g. malformed JSON body)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendValidationError(
      res,
      'Malformed JSON payload',
      [{ field: 'body', message: 'Unable to parse JSON body request' }],
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Handle Mongoose duplicate key error
  if (err && (err.code === 11000 || err.codeName === 'DuplicateKey')) {
    const duplicateFields = err.keyValue ? Object.keys(err.keyValue) : ['title', 'content'];
    const errors = duplicateFields.map((field) => ({
      field,
      message: 'A note with the same title and content already exists.',
    }));

    return sendValidationError(
      res,
      'Data is already present',
      errors,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Fallback to Server Error
  return sendServerError(
    res,
    err.message || MESSAGES.SERVER_ERROR,
    err,
    err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
};

module.exports = errorHandler;
