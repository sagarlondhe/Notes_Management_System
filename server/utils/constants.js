const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
};

const MESSAGES = {
  NOTE_NOT_FOUND: 'Note not found',
  VALIDATION_FAILED: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
  SUCCESS: 'Operation successful',
  CREATE_SUCCESS: 'Note created successfully',
  UPDATE_SUCCESS: 'Note updated successfully',
  DELETE_SUCCESS: 'Note deleted successfully',
  PIN_TOGGLED: 'Note pin status updated successfully',
};

module.exports = {
  HTTP_STATUS,
  PAGINATION,
  MESSAGES,
};
