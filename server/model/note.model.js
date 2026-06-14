const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is mandatory'],
      trim: true,
    },
    content: {
      type: String,
      trim: true,
      default: '',
    },
    is_pinned: {
      type: Number, // 0 = unpinned, 1 = pinned
      default: 0,
      enum: [0, 1],
    },
    is_delete: {
      type: Number, // 1 = active, 0 = soft-deleted
      default: 1,
      enum: [0, 1],
    },
    tags: {
      type: [String],
      default: [],
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We handle created_at/updated_at manually as per DB Model schema requirements
    versionKey: false,
  }
);

// Optimize query path for standard notes listing: filter by active status, sort by pinned first, then by latest updated
NoteSchema.index({ is_delete: 1, is_pinned: -1, updated_at: -1 });

// Optimize search queries on title and content
NoteSchema.index({ title: 1 });
NoteSchema.index({ content: 1 });

// Prevent duplicate active notes with exact title/content matches
NoteSchema.index(
  { title: 1, content: 1, is_delete: 1 },
  {
    unique: true,
    partialFilterExpression: { is_delete: 1 },
    collation: { locale: 'en', strength: 2 },
  }
);

const Note = mongoose.model('Note', NoteSchema);

module.exports = Note;
