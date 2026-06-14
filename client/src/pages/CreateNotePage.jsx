import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Pin, Trash2, X } from 'lucide-react';
import TagInput from '../components/TagInput.jsx';
import MainLayout from '../layouts/MainLayout.jsx';

export const CreateNotePage = () => {
  const navigate = useNavigate();

  // Form States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(0);
  const [tags, setTags] = useState([]);
  
  // Validation / Loading States
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [draftExists, setDraftExists] = useState(false);

  // Check for local storage drafts on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(' Notes_Management_System_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title || parsed.content || (parsed.tags && parsed.tags.length > 0)) {
          setDraftExists(true);
        }
      } catch (err) {
        console.error('Failed to parse local draft:', err);
      }
    }
  }, []);

  // Save draft to LocalStorage when inputs change
  useEffect(() => {
    if (title || content || tags.length > 0 || isPinned) {
      const draft = { title, content, tags, is_pinned: isPinned };
      localStorage.setItem(' Notes_Management_System_draft', JSON.stringify(draft));
    }
  }, [title, content, tags, isPinned]);

  // Restore draft handler
  const restoreDraft = () => {
    try {
      const savedDraft = localStorage.getItem(' Notes_Management_System_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setTitle(parsed.title || '');
        setContent(parsed.content || '');
        setTags(parsed.tags || []);
        setIsPinned(parsed.is_pinned || 0);
      }
      setDraftExists(false);
    } catch (err) {
      console.error('Failed to restore draft:', err);
    }
  };

  // Discard draft handler
  const discardDraft = () => {
    localStorage.removeItem(' Notes_Management_System_draft');
    setDraftExists(false);
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!title.trim()) {
      errors.title = 'Title is mandatory';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setBackendError('');

    try {
      const response = await axios.post(
        `${apiBaseUrl}/notes`,
        {
          title: title.trim(),
          content: content.trim(),
          is_pinned: isPinned,
          tags,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const res = response.data;

      if (res && res.success) {
        // Clear local draft upon successful database save
        localStorage.removeItem(' Notes_Management_System_draft');
        navigate('/');
        return;
      }

      const duplicateNoteMessage = 'A note with the same title and content already exists.';
      const backendMessage = res?.message || 'An unexpected error occurred during note creation';
      setBackendError(backendMessage);

      if (backendMessage === 'Data is already present') {
        setFieldErrors({
          title: duplicateNoteMessage,
          content: duplicateNoteMessage,
        });
      } else if (res?.errors) {
        const valErrors = {};
        res.errors.forEach((errorItem) => {
          valErrors[errorItem.field] = errorItem.message;
        });
        setFieldErrors(valErrors);
      }
    } catch (err) {
      const backendMessage = err?.response?.data?.message || err.message || 'An unexpected error occurred during note creation';
      setBackendError(backendMessage);

      if (backendMessage === 'Data is already present') {
        setFieldErrors({
          title: 'A note with the same title and content already exists.',
          content: 'A note with the same title and content already exists.',
        });
      } else if (err?.response?.data?.errors) {
        const valErrors = {};
        err.response.data.errors.forEach((errorItem) => {
          valErrors[errorItem.field] = errorItem.message;
        });
        setFieldErrors(valErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      {/* Back button link */}
      <div className="mb-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-1 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Feed</span>
        </Link>
      </div>

      {/* Main Content Editor Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-900 shadow-2xl relative overflow-hidden">
        
        {/* Glow corner overlay */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-900">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-100">
              Create New Note
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Add details, set pin flags, and write tags below.
            </p>
          </div>

          {/* Inline Pin toggler */}
          <button
            type="button"
            onClick={() => setIsPinned(isPinned === 1 ? 0 : 1)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isPinned === 1
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pin className={`h-3.5 w-3.5 ${isPinned === 1 ? 'fill-current' : ''}`} />
            <span>{isPinned === 1 ? 'Pinned First' : 'Pin Note'}</span>
          </button>
        </div>

        {backendError && (
          <div className="mb-6 p-4 rounded-xl border border-accent-pink/20 bg-accent-pink/10 text-rose-300 text-xs font-semibold leading-relaxed flex items-start justify-between">
            <div className="mr-4 flex-1">{backendError}</div>
            <button
              type="button"
              aria-label="Dismiss error"
              onClick={() => {
                setBackendError('');
                setFieldErrors({});
              }}
              className="ml-4 p-1 rounded-md text-rose-200 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Note Title Input */}
          <div className="space-y-2">
            <label htmlFor="note-title" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Note Title <span className="text-accent-pink">*</span>
            </label>
            <input
              type="text"
              id="note-title"
              placeholder="e.g. Weekly Standup Notes"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) {
                  setFieldErrors((prev) => ({ ...prev, title: null }));
                }
              }}
              className={`w-full glass-input rounded-xl px-4 py-3 text-sm placeholder-slate-500 ${
                fieldErrors.title ? 'border-accent-pink/60 focus:border-accent-pink/80 focus:shadow-accent-pink/10' : ''
              }`}
              disabled={submitting}
            />
            {fieldErrors.title && (
              <span className="text-xs font-medium text-accent-pink block mt-1">
                {fieldErrors.title}
              </span>
            )}
          </div>

          {/* Note Content Input */}
          <div className="space-y-2">
            <label htmlFor="note-content" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Note Body Content
            </label>
            <textarea
              id="note-content"
              placeholder="Type your markdown content or raw drafts here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-3 text-sm placeholder-slate-500 h-64 resize-y leading-relaxed"
              disabled={submitting}
            />
          </div>

          {/* Tags Selector Input */}
          <TagInput tags={tags} onTagsChange={setTags} />

          {/* Action Row */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-900">
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 text-sm font-semibold transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:translate-y-0"
            >
              <Save className="h-4 w-4" />
              <span>{submitting ? 'Creating...' : 'Create Note'}</span>
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateNotePage;
