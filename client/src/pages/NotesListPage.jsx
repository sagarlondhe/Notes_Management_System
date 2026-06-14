import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle, ArrowLeft, ArrowRight, Grid, List, AlertCircle, FileText, CheckCircle, Info } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce.js';
import NoteCard from '../components/NoteCard.jsx';
import { NoteGridSkeleton } from '../components/Spinner.jsx';
import DeleteConfirmModal from '../components/DeleteConfirmModal.jsx';
import MainLayout from '../layouts/MainLayout.jsx';

export const NotesListPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [selectedTag, setSelectedTag] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  
  // Pagination State
  const [pagination, setPagination] = useState({
    totalNotes: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 6,
  });

  // Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    noteId: null,
    noteTitle: '',
  });

  // Toast Notification State
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success', // success, error, info
  });

  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  // Stats
  const [stats, setStats] = useState({ total: 0, pinned: 0 });

  /**
   * Fetch notes from the API.
   * If there is a debounced search query, use the search API. Otherwise, use standard list.
   */
  const fetchNotes = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      let response;
      const params = {
        page,
        limit: pagination.limit,
      };

      if (debouncedSearch) {
        // Search API: GET /api/notes/search?q=keyword
        response = (await axios.get(`${apiBaseUrl}/notes/search`, {
          params: { q: debouncedSearch, page, limit: pagination.limit },
        })).data;
      } else {
        // List API: GET /api/notes (supports tag filtering)
        if (selectedTag) {
          params.tag = selectedTag;
        }
        response = (await axios.get(`${apiBaseUrl}/notes`, { params })).data;
      }

      if (response && response.success) {
        const { notes: fetchedNotes, pagination: pagDetails } = response.data;
        setNotes(fetchedNotes);
        setPagination(pagDetails);
      } else {
        setError(response?.message || 'Failed to fetch notes');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedTag, pagination.limit]);

  /**
   * Fetch Workspace stats & tags lists (separate call or side-effect)
   */
  const fetchMetadata = useCallback(async () => {
    try {
      // Fetch stats using unlimited list to gather tags and counts
      const res = (await axios.get(`${apiBaseUrl}/notes`, { params: { page: 1, limit: 100 } })).data;
      if (res && res.success) {
        const allNotes = res.data.notes;
        
        // Compute stats
        const total = allNotes.length;
        const pinned = allNotes.filter(n => n.is_pinned === 1).length;
        setStats({ total, pinned });

        // Gather all unique tags
        const tagsSet = new Set();
        allNotes.forEach(note => {
          if (note.tags) note.tags.forEach(tag => tagsSet.add(tag));
        });
        setAvailableTags(Array.from(tagsSet));
      }
    } catch (err) {
      console.error('Failed to load workspace metadata:', err);
    }
  }, []);

  // Sync effect for search and filter changes - return to page 1
  useEffect(() => {
    fetchNotes(1);
  }, [debouncedSearch, selectedTag, fetchNotes]);

  // General load sync
  useEffect(() => {
    fetchMetadata();
  }, [notes, fetchMetadata]);

  // Handle Note Pin State Toggle
  const handlePinToggle = async (id, currentPinStatus) => {
    try {
      const updatedStatus = currentPinStatus === 1 ? 0 : 1;
      const res = (await axios.put(`${apiBaseUrl}/notes/${id}`, {
        is_pinned: updatedStatus,
      })).data;
      if (res && res.success) {
        triggerToast(
          updatedStatus === 1 ? 'Note pinned successfully' : 'Note unpinned successfully', 
          'success'
        );
        // Refresh note feed
        fetchNotes(pagination.currentPage);
      }
    } catch (err) {
      triggerToast(err.message || 'Error updating note pin status', 'error');
    }
  };

  // Handle Soft-Delete Trigger
  const handleDeleteClick = (id, title) => {
    setDeleteModal({
      isOpen: true,
      noteId: id,
      noteTitle: title,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = (await axios.delete(`${apiBaseUrl}/notes/${deleteModal.noteId}`)).data;
      if (res && res.success) {
        triggerToast('Note moved to trash successfully', 'success');
        setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' });
        
        // If we deleted the last item on the page, go back a page
        const isLastItem = notes.length === 1;
        const targetPage = isLastItem && pagination.currentPage > 1 
          ? pagination.currentPage - 1 
          : pagination.currentPage;
        
        fetchNotes(targetPage);
      }
    } catch (err) {
      triggerToast(err.message || 'Error deleting note', 'error');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchNotes(newPage);
    }
  };

  // Segment notes into Pinned and Other for listing visual hierarchy (unless searching)
  const pinnedNotes = notes.filter(n => n.is_pinned === 1);
  const unpinnedNotes = notes.filter(n => n.is_pinned === 0);

  return (
    <MainLayout 
      stats={stats} 
      activeTag={selectedTag} 
      onTagSelect={setSelectedTag} 
      tags={availableTags}
    >
      {/* Toast Banner */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-50 animate-slide-up">
          <div className={`flex items-center space-x-3 px-5 py-3 rounded-xl border shadow-xl ${
            toast.type === 'error' 
              ? 'bg-accent-pink/10 border-accent-pink/30 text-rose-300' 
              : toast.type === 'info'
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="h-5 w-5 text-accent-pink animate-bounce" />
            ) : toast.type === 'info' ? (
              <Info className="h-5 w-5 text-blue-400" />
            ) : (
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            )}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Search Bar header card */}
      <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-900 shadow-xl">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500"
            id="note-search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>

        {debouncedSearch && (
          <div className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
            Showing results for "{debouncedSearch}"
          </div>
        )}
      </div>

      {/* Main Listing View */}
      {error && (
        <div className="bg-accent-pink/10 border border-accent-pink/20 rounded-2xl p-5 mb-8 flex items-center space-x-3 text-rose-300">
          <AlertCircle className="h-6 w-6 text-accent-pink flex-shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Server connection error</h4>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <NoteGridSkeleton count={pagination.limit} />
      ) : notes.length === 0 ? (
        <div className="glass-panel rounded-2xl py-16 px-6 text-center border border-slate-900 flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-800 mb-4 shadow-inner">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-200">No notes found</h3>
          <p className="text-slate-400 text-sm max-w-sm mt-2 leading-relaxed">
            {debouncedSearch 
              ? `We couldn't find any matches for "${debouncedSearch}". Try checking your spelling or using different keywords.`
              : selectedTag
                ? `There are no active notes tagged with #${selectedTag}.`
                : "Your note board is empty. Get started by creating your very first notes item."}
          </p>
          {!debouncedSearch && !selectedTag && (
            <button
              onClick={() => navigate('/create')}
              className="mt-6 flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transform hover:-translate-y-0.5 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Note</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Unified list or separated Pinned & Other list */}
          {/* Note: In normal views, separating pinned notes visually is an awesome UX */}
          {pinnedNotes.length > 0 && !debouncedSearch && (
            <div>
              <div className="flex items-center space-x-2 mb-4 text-xs font-bold text-purple-400 uppercase tracking-widest pl-1">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
                <span>Pinned Notes ({pinnedNotes.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onPinToggle={handlePinToggle}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}

          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && !debouncedSearch && (
                <div className="flex items-center space-x-2 mb-4 mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                  <span>Other Notes ({unpinnedNotes.length})</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unpinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onPinToggle={handlePinToggle}
                    onDeleteClick={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-900 pt-6 mt-8">
              <span className="text-xs text-slate-500">
                Showing page <span className="font-semibold text-slate-300">{pagination.currentPage}</span> of <span className="font-semibold text-slate-300">{pagination.totalPages}</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="p-2 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-900/50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`h-9 w-9 text-xs rounded-lg border font-semibold transition-all ${
                        pagination.currentPage === pNum
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                          : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="p-2 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-900/50 transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        noteTitle={deleteModal.noteTitle}
        onClose={() => setDeleteModal({ isOpen: false, noteId: null, noteTitle: '' })}
        onConfirm={handleDeleteConfirm}
      />
    </MainLayout>
  );
};

export default NotesListPage;
