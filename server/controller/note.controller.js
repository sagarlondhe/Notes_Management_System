const NoteRepository = require('../repository/note.repository.js');
const { sendSuccess, sendValidationError } = require('../utils/response.js');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants.js');

module.exports = {
  createNote: async (req, res, next) => {
    try {
      const { title, content, is_pinned, tags } = req.body;
      const duplicate = await NoteRepository.findDuplicate({ title, content });

      if (duplicate) {
        return sendValidationError(
          res,
          'Data is already present',
          [{ field: 'title', message: 'A note with the same title and content already exists.' }],
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const note = await NoteRepository.create({ title, content, is_pinned, tags });

      return sendSuccess(res, MESSAGES.CREATE_SUCCESS, note, HTTP_STATUS.CREATED);
    } catch (error) {
      if (error && (error.code === 11000 || error.codeName === 'DuplicateKey')) {
        return sendValidationError(
          res,
          'Data is already present',
          [{ field: 'title', message: 'A note with the same title and content already exists.' }],
          HTTP_STATUS.BAD_REQUEST
        );
      }
      next(error);
    }
  },

  /**
   * Get list of active notes with pagination, sorting, and optional tag filter.
   */
  getNotes: async (req, res, next) => {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const skip = (page - 1) * limit;
      const tag = req.query.tag || '';

      const notes = await NoteRepository.findAllActive({ skip, limit, tag });
      const totalNotes = await NoteRepository.countActive({ tag });
      const totalPages = Math.ceil(totalNotes / limit);

      const mappedNotes = notes.map((note) => ({
        id: note._id,
        title: note.title,
        content: note.content,
        contentPreview: note.content.length > 150 ? `${note.content.substring(0, 150)}...` : note.content,
        is_pinned: note.is_pinned,
        tags: note.tags,
        created_at: note.created_at,
        updated_at: note.updated_at,
      }));

      return sendSuccess(res, MESSAGES.SUCCESS, {
        notes: mappedNotes,
        pagination: {
          totalNotes,
          currentPage: page,
          totalPages,
          limit,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get single note by ID.
   */
  getNoteById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const note = await NoteRepository.findById(id);

      if (!note) {
        return sendValidationError(
          res,
          MESSAGES.NOTE_NOT_FOUND,
          [{ field: 'id', message: `No active note found matching ID '${id}'` }],
          HTTP_STATUS.NOT_FOUND
        );
      }

      const mappedNote = {
        id: note._id,
        title: note.title,
        content: note.content,
        is_pinned: note.is_pinned,
        tags: note.tags,
        created_at: note.created_at,
        updated_at: note.updated_at,
      };

      return sendSuccess(res, MESSAGES.SUCCESS, mappedNote);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update note by ID.
   */
  updateNote: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedNote = await NoteRepository.update(id, req.body);

      if (!updatedNote) {
        return sendValidationError(
          res,
          MESSAGES.NOTE_NOT_FOUND,
          [{ field: 'id', message: `No active note found matching ID '${id}' to update` }],
          HTTP_STATUS.NOT_FOUND
        );
      }

      const mappedNote = {
        id: updatedNote._id,
        title: updatedNote.title,
        content: updatedNote.content,
        is_pinned: updatedNote.is_pinned,
        tags: updatedNote.tags,
        created_at: updatedNote.created_at,
        updated_at: updatedNote.updated_at,
      };

      return sendSuccess(res, MESSAGES.UPDATE_SUCCESS, mappedNote);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Soft delete note by ID.
   */
  deleteNote: async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedNote = await NoteRepository.softDelete(id);

      if (!deletedNote) {
        return sendValidationError(
          res,
          MESSAGES.NOTE_NOT_FOUND,
          [{ field: 'id', message: `No active note found matching ID '${id}' to delete` }],
          HTTP_STATUS.NOT_FOUND
        );
      }

      return sendSuccess(res, MESSAGES.DELETE_SUCCESS, { id: deletedNote._id });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Search notes by title/content using regular expressions (case-insensitive) with pagination.
   */
  searchNotes: async (req, res, next) => {
    try {
      const keyword = req.query.q || '';
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
      const skip = (page - 1) * limit;

      const notes = await NoteRepository.findAllActive({ skip, limit, search: keyword });
      const totalNotes = await NoteRepository.countActive({ search: keyword });
      const totalPages = Math.ceil(totalNotes / limit);

      const mappedNotes = notes.map((note) => ({
        id: note._id,
        title: note.title,
        content: note.content,
        contentPreview: note.content.length > 150 ? `${note.content.substring(0, 150)}...` : note.content,
        is_pinned: note.is_pinned,
        tags: note.tags,
        created_at: note.created_at,
        updated_at: note.updated_at,
      }));

      return sendSuccess(res, MESSAGES.SUCCESS, {
        notes: mappedNotes,
        pagination: {
          totalNotes,
          currentPage: page,
          totalPages,
          limit,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
