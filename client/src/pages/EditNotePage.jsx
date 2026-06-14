import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Pin, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { useAutoSave } from '../hooks/useAutoSave.js';
import TagInput from '../components/TagInput.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import Spinner from '../components/Spinner.jsx';

export const EditNotePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

  // Form Fields State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(0);
  const [tags, setTags] = useState([]);

  // Control States
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Autosave Status: 'idle' | 'saving' | 'saved' | 'error'
  const [saveStatus, setSaveStatus] = useState('idle');
  const [lastSavedTime, setLastSavedTime] = useState('');

  // Keep reference of initial data to prevent redundant autosaves on initial load
  const initialDataLoaded = useRef(false);

  /**
   * Load note details on mount
   */
  const loadNote = useCallback(async () => {
    setFetching(true);
    setLoadError('');
    try {
      const res = (await axios.get(`${apiBaseUrl}/notes/${id}`)).data;
      if (res && res.success) {
        const note = res.data;
        setTitle(note.title || '');
        setContent(note.content || '');
        setIsPinned(note.is_pinned || 0);
        setTags(note.tags || []);
        
        // Timeout to set initialDataLoaded = true AFTER state bindings flush
        setTimeout(() => {
          initialDataLoaded.current = true;
        }, 100);
      }
    } catch (err) {
      setLoadError(err.message || 'Failed to retrieve note details');
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  /**
   * Background Auto Save function
   */
  const performAutoSave = async (currentState) => {
    // Only auto-save if title is non-empty (avoid validation errors in background)
    if (!currentState.title.trim()) {
      setSaveStatus('error');
      setValidationError('Autosave paused: Title cannot be empty');
      return;
    }

    setSaveStatus('saving');
    setValidationError('');

    try {
      const res = (await axios.put(`${apiBaseUrl}/notes/${id}`, {
        title: currentState.title.trim(),
        content: currentState.content.trim(),
        is_pinned: currentState.isPinned,
        tags: currentState.tags,
      })).data;

      if (res && res.success) {
        setSaveStatus('saved');
        const now = new Date();
        setLastSavedTime(
          now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      }
    } catch (err) {
      setSaveStatus('error');
      console.error('Autosave error:', err);
    }
  };

  // Compile values to watch for auto save
  const watchValues = { title, content, isPinned, tags };

  // Trigger autosave when watched values edit
  // Skip hook triggers if initial load hasn't completed
  useAutoSave(
    watchValues, 
    performAutoSave, 
    1800, // Debounce 1.8 seconds after user stops typing
    !initialDataLoaded.current || fetching || submitting
  );

  // Manual save for explicit clicks
  const handleManualSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Title cannot be empty');
      return;
    }

    setSubmitting(true);
    setValidationError('');

    try {
      const res = (await axios.put(`${apiBaseUrl}/notes/${id}`, {
        title: title.trim(),
        content: content.trim(),
        is_pinned: isPinned,
        tags,
      })).data;

      if (res && res.success) {
        navigate('/');
      }
    } catch (err) {
      setValidationError(err.message || 'Error saving changes');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      {/* Back navigation link */}
      <div className="mb-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-1 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Feed</span>
        </Link>

        {/* Auto Save State indicators */}
        {!fetching && !loadError && (
          <div className="flex items-center space-x-2 text-xs">
            {saveStatus === 'saving' && (
              <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/25">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving draft...</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/25">
                <Cloud className="h-3.5 w-3.5" />
                <span>Saved {lastSavedTime ? `at ${lastSavedTime}` : ''}</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center space-x-1.5 text-accent-pink font-semibold bg-accent-pink/10 px-2.5 py-1 rounded-lg border border-accent-pink/25">
                <CloudOff className="h-3.5 w-3.5" />
                <span>Autosave Paused</span>
              </div>
            )}
            {saveStatus === 'idle' && (
              <div className="flex items-center space-x-1.5 text-slate-500 font-medium px-2.5 py-1">
                <span>Draft sync active</span>
              </div>
            )}
          </div>
        )}
      </div>

      {fetching ? (
        <div className="glass-panel py-24 rounded-2xl flex items-center justify-center border border-slate-900 shadow-xl">
          <Spinner size="lg" />
        </div>
      ) : loadError ? (
        <div className="glass-panel p-8 rounded-2xl border border-slate-900 text-center flex flex-col items-center justify-center">
          <CloudOff className="h-12 w-12 text-accent-pink mb-4" />
          <h3 className="text-xl font-bold text-slate-200">Failed to load note</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-sm">{loadError}</p>
          <Link
            to="/"
            className="mt-6 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-all"
          >
            Return to Feed
          </Link>
        </div>
      ) : (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-900 shadow-2xl relative overflow-hidden">
          
          {/* Top border decoration */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Editor Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-900">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-100">
                Edit Note Details
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Type changes naturally; edits are saved in the background.
              </p>
            </div>

            {/* Toggle pin on edit */}
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
              <span>{isPinned === 1 ? 'Pinned first' : 'Pin Note'}</span>
            </button>
          </div>

          {validationError && (
            <div className="mb-6 p-4 rounded-xl border border-accent-pink/20 bg-accent-pink/10 text-rose-300 text-xs font-semibold leading-relaxed">
              {validationError}
            </div>
          )}

          <form onSubmit={handleManualSave} className="space-y-6">
            {/* Title field */}
            <div className="space-y-2">
              <label htmlFor="edit-title" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Note Title <span className="text-accent-pink">*</span>
              </label>
              <input
                type="text"
                id="edit-title"
                placeholder="Title must not be empty..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm placeholder-slate-500"
                disabled={submitting}
              />
            </div>

            {/* Content body */}
            <div className="space-y-2">
              <label htmlFor="edit-content" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Note Body Content
              </label>
              <textarea
                id="edit-content"
                placeholder="Type your markdown content or raw drafts here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm placeholder-slate-500 h-64 resize-y leading-relaxed"
                disabled={submitting}
              />
            </div>

            {/* Tags selector */}
            <TagInput tags={tags} onTagsChange={setTags} />

            {/* Control action buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-900 mt-8">
              <span className="text-xs text-slate-500 italic">
                {saveStatus === 'saved' ? 'All changes saved.' : 'Unsaved changes pending...'}
              </span>

              <div className="flex items-center space-x-3">
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
                  <span>{submitting ? 'Saving...' : 'Save & Close'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </MainLayout>
  );
};

export default EditNotePage;
