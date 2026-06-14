const Joi = require('joi');
const mongoose = require('mongoose');
const { sendValidationError } = require('../utils/response.js');
const { HTTP_STATUS } = require('../utils/constants.js');

/**
 * Validate MongoDB ObjectId in parameters.
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendValidationError(
        res,
        'Invalid identifier format',
        [{ field: paramName, message: `The parameter '${paramName}' must be a valid 24-character hexadecimal MongoDB ObjectId` }],
        HTTP_STATUS.BAD_REQUEST
      );
    }
    next();
  };
};

/**
 * Common middleware handler for Joi validations.
 */
const validateSchema = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true, // strip parameters not in the schema
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));
      return sendValidationError(res, 'Validation failed', errors, HTTP_STATUS.BAD_REQUEST);
    }

    req.body = value; // Replace body with sanitized/typed fields
    next();
  };
};

// Create Note validator schema
const createNoteSchema = Joi.object({
  title: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': 'Title is mandatory',
      'string.empty': 'Title cannot be empty',
    }),
  content: Joi.string().trim().allow('').default(''),
  is_pinned: Joi.number().valid(0, 1).default(0),
  tags: Joi.array().items(Joi.string().trim()).default([]),
});

// Update Note validator schema
const updateNoteSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .messages({
      'string.empty': 'Title cannot be empty',
    }),
  content: Joi.string().allow(''),
  is_pinned: Joi.number().valid(0, 1),
  tags: Joi.array().items(Joi.string().trim()),
});

const validateCreateNote = validateSchema(createNoteSchema);
const validateUpdateNote = validateSchema(updateNoteSchema);

module.exports = {
  validateObjectId,
  validateCreateNote,
  validateUpdateNote,
};
