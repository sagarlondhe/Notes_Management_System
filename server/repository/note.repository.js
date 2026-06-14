const Note = require('../model/note.model.js');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = {
  /** Create a new note */
  create: async (noteData) => {
    try {
      const note = new Note({
        title: noteData.title.trim(),
        content: (noteData.content || '').trim(),
        tags: noteData.tags || [],
        is_pinned: noteData.is_pinned || 0,
        is_delete: 1,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return await note.save();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  /** Find all active notes with search, tag, pagination */
  findAllActive: async ({ skip = 0, limit = 10, search = '', tag = '' } = {}) => {
    try {
      const query = { is_delete: 1 };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ];
      }

      if (tag) {
        query.tags = { $in: [tag] };
      }

      return await Note.find(query)
        .sort({ is_pinned: -1, updated_at: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  /** Count active notes matching filters */
  countActive: async ({ search = '', tag = '' } = {}) => {
    try {
      const query = { is_delete: 1 };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ];
      }

      if (tag) {
        query.tags = { $in: [tag] };
      }

      return await Note.countDocuments(query).exec();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  /** Find a single active note by ID */
  findById: async (id) => {
    try {
      return await Note.findOne({ _id: id, is_delete: 1 }).exec();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  /** Find a duplicate active note by normalized title/content */
  findDuplicate: async ({ title, content }) => {
    try {
      const normalizedTitle = title?.trim() || '';
      const normalizedContent = (content || '').trim();

      if (!normalizedTitle) {
        return null;
      }

      return await Note.findOne({
        title: { $regex: new RegExp(`^\\s*${escapeRegex(normalizedTitle)}\\s*$`, 'i') },
        content: { $regex: new RegExp(`^\\s*${escapeRegex(normalizedContent)}\\s*$`, 'i') },
        is_delete: 1,
      }).exec();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  /** Update a note */
  update: async (id, updateData) => {
    try {
      const cleanUpdate = { ...updateData, updated_at: new Date() };
      delete cleanUpdate.is_delete;

      return await Note.findOneAndUpdate(
        { _id: id, is_delete: 1 },
        { $set: cleanUpdate },
        { new: true, runValidators: true }
      ).exec();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  /** Soft delete a note by setting is_delete = 0 */
  softDelete: async (id) => {
    try {
      return await Note.findOneAndUpdate(
        { _id: id, is_delete: 1 },
        { $set: { is_delete: 0, updated_at: new Date() } },
        { new: true }
      ).exec();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
