import React from 'react';
import { Link } from 'react-router-dom';
import { Pin, Calendar, Edit2, Trash2, Eye } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters.js';

export const NoteCard = ({ note, onPinToggle, onDeleteClick }) => {
  const { id, title, content, is_pinned, tags, updated_at } = note;

  // Render a clean preview of content without HTML code tags if any
  const displayContent = content || 'No content provided.';

  return (
    <div 
      className={`group relative flex flex-col justify-between rounded-2xl p-5 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-xl ${
        is_pinned 
          ? 'note-glow-pin bg-gradient-to-br from-indigo-950/40 to-slate-900/60' 
          : 'glass-panel hover:border-slate-700/60 hover:bg-slate-900/40'
      }`}
    >
      {/* Glow highlight on hover */}
      <div className="absolute -inset-[1px] bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm pointer-events-none" style={{ opacity: 0, groupHover: { opacity: 0.15 } }} />

      <div>
        {/* Card Header */}
        <div className="flex justify-between items-start gap-4 mb-3">
          <Link to={`/notes/${id}`} className="hover:text-indigo-400 transition-colors flex-grow">
            <h3 className="font-bold text-lg tracking-tight line-clamp-1 text-slate-100 group-hover:text-indigo-300 transition-colors">
              {title || 'Untitled Note'}
            </h3>
          </Link>

          {/* Pin Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onPinToggle(id, is_pinned);
            }}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              is_pinned 
                ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' 
                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={is_pinned ? 'Unpin Note' : 'Pin Note'}
          >
            <Pin className={`h-4.5 w-4.5 transform transition-transform duration-300 ${is_pinned ? 'rotate-45 fill-current' : 'group-hover:scale-110'}`} />
          </button>
        </div>

        {/* Tags list (under header) */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.map((tag) => (
              <span 
                key={tag} 
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/40 hover:bg-indigo-950/40 hover:text-indigo-300 transition-all cursor-default"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Card Content Snippet */}
        <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3 whitespace-pre-line">
          {displayContent}
        </p>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 mt-auto text-xs text-slate-500">
        {/* Updated Timestamp */}
        <div className="flex items-center space-x-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatRelativeTime(updated_at)}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Link
            to={`/notes/${id}`}
            className="p-1.5 rounded-lg hover:bg-indigo-950/30 hover:text-indigo-400 text-slate-500 transition-all"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            to={`/edit/${id}`}
            className="p-1.5 rounded-lg hover:bg-amber-950/30 hover:text-amber-400 text-slate-500 transition-all"
            title="Edit Note"
          >
            <Edit2 className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => onDeleteClick(id, title)}
            className="p-1.5 rounded-lg hover:bg-red-950/30 hover:text-accent-pink text-slate-500 transition-all"
            title="Delete Note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
