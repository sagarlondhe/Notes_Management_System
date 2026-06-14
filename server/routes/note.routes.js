const { Router } = require('express');
const NoteController = require('../controller/note.controller.js');
const {
  validateCreateNote,
  validateUpdateNote,
  validateObjectId,
} = require('../middleware/validate.middleware.js');

const router = Router();

// Create a new note
router.post('/', validateCreateNote, NoteController.createNote);

// Get list of active notes (with pagination and sorting)
router.get('/', NoteController.getNotes);

// Search notes (Must be placed before /:id path to prevent routing overlap)
router.get('/search', NoteController.searchNotes);

// Get a single note by ID
router.get('/:id', validateObjectId('id'), NoteController.getNoteById);

// Update an existing note
router.put('/:id', validateObjectId('id'), validateUpdateNote, NoteController.updateNote);

// Soft-delete a note
router.delete('/:id', validateObjectId('id'), NoteController.deleteNote);

module.exports = router;
