import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, noteTitle }) => {
  // Disable body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div 
        className="glass-panel-heavy rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl border border-slate-800 animate-slide-up transform"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 transition-colors p-1.5 rounded-lg hover:bg-slate-900"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 text-accent-pink mb-4">
          <div className="p-2 bg-accent-pink/10 rounded-xl">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-100">
            Confirm Deletion
          </h3>
        </div>

        {/* Modal Body */}
        <div className="mb-6">
          <p className="text-slate-300 text-sm leading-relaxed">
            Are you sure you want to delete the note <span className="font-semibold text-indigo-400">"{noteTitle || 'Untitled Note'}"</span>? 
            This note will be moved to the archive and will no longer appear in your active workspace feed.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-300 hover:bg-slate-900 hover:text-slate-100 border border-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-accent-pink to-rose-600 hover:from-rose-500 hover:to-rose-700 text-white shadow-lg shadow-accent-pink/20 hover:shadow-accent-pink/30 transform hover:-translate-y-0.5 transition-all"
          >
            Delete Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
