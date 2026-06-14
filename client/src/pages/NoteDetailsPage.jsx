import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Calendar, Clock, Pin, Hash, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/formatters.js';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import Spinner from '../components/Spinner.jsx';

export const NoteDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete modal state
  const [deleteOpen, setDeleteOpen] = useState(false);

  /**
   * Load note data from backend
   */
  const loadNoteDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = (await axios.get(`${apiBaseUrl}/notes/${id}`)).data;
      if (res && res.success) {
        setNote(res.data);
      }
    } catch (err) {
      setError(err.message || 'Note details could not be found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadNoteDetails();
  }, [loadNoteDetails]);

  // Handle Pin change on details page
  const togglePin = async () => {
    if (!note) return;
    try {
      const updatedPin = note.is_pinned === 1 ? 0 : 1;
      const res = (await axios.put(`${apiBaseUrl}/notes/${id}`, { is_pinned: updatedPin })).data;
      if (res && res.success) {
        setNote((prev) => ({ ...prev, is_pinned: updatedPin }));
      }
    } catch (err) {
      console.error('Failed to toggle pin state:', err);
    }
  };

  const handleDelete = async () => {
    try {
      const res = (await axios.delete(`${apiBaseUrl}/notes/${id}`)).data;
      if (res && res.success) {
        setDeleteOpen(false);
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  return (
    <MainLayout>
      {/* Page header navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-1 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Feed</span>
        </Link>
      </div>

      {loading ? (
        <div className="glass-panel py-24 rounded-2xl flex items-center justify-center border border-slate-900 shadow-xl">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="glass-panel p-8 rounded-2xl border border-slate-900 text-center flex flex-col items-center justify-center">
          <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500 mb-4 border border-slate-800">
            <Trash2 className="h-6 w-6 text-accent-pink" />
          </div>
          <h3 className="text-xl font-bold text-slate-200">Note not found</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm">{error}</p>
          <Link
            to="/"
            className="mt-6 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-all"
          >
            Return to Feed
          </Link>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-900 shadow-2xl relative overflow-hidden flex flex-col">
          
          {/* Accent decoration background blur */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Details header block */}
          <div className="p-6 sm:p-8 border-b border-slate-900/60 bg-slate-900/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Note meta tags and pins */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                  {note.is_pinned === 1 && (
                    <span className="flex items-center space-x-1 text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                      <Pin className="h-3 w-3 fill-current" />
                      <span>Pinned</span>
                    </span>
                  )}
                  {note.tags && note.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="flex items-center space-x-0.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/40"
                    >
                      <Hash className="h-2.5 w-2.5 text-slate-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 leading-tight">
                  {note.title || 'Untitled Note'}
                </h1>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center space-x-2.5 sm:self-start flex-shrink-0">
                <button
                  onClick={togglePin}
                  className={`p-2.5 rounded-xl border transition-all ${
                    note.is_pinned === 1
                      ? 'bg-purple-500/15 border-purple-500/30 text-purple-400 hover:bg-purple-500/25'
                      : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                  title={note.is_pinned === 1 ? 'Unpin Note' : 'Pin Note'}
                >
                  <Pin className={`h-4.5 w-4.5 ${note.is_pinned === 1 ? 'fill-current rotate-45' : ''}`} />
                </button>
                <Link
                  to={`/edit/${id}`}
                  className="flex items-center space-x-1.5 px-4.5 py-2.5 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-200 text-sm font-semibold transition-all"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit Note</span>
                </Link>
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 hover:border-red-500/20 hover:text-accent-pink text-slate-500 transition-all hover:bg-red-500/5"
                  title="Delete Note"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Date Details Bar */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-xs text-slate-400 border-t border-slate-900/60 pt-4">
              <div className="flex items-center space-x-1.5">
                <Calendar className="h-4 w-4 text-indigo-400" />
                <span>Created {formatDate(note.created_at)}</span>
              </div>
              {note.updated_at && note.updated_at !== note.created_at && (
                <div className="flex items-center space-x-1.5">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span>Last Updated {formatDate(note.updated_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Details note content */}
          <div className="p-6 sm:p-8 flex-grow">
            <article className="prose prose-invert max-w-none">
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                {note.content || <span className="text-slate-500 italic">No notes body content was provided.</span>}
              </p>
            </article>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        isOpen={deleteOpen}
        noteTitle={note?.title}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </MainLayout>
  );
};

export default NoteDetailsPage;
