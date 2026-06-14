import React from 'react';

/**
 * Modern glowing spinner.
 */
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-2',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-indigo-500 border-r-indigo-500 border-b-transparent border-l-transparent ${sizeClasses[size] || sizeClasses.md}`}
        style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.4))' }}
      ></div>
    </div>
  );
};

/**
 * Premium Note Card skeleton loader for page loads.
 */
export const NoteCardSkeleton = () => {
  return (
    <div className="glass-panel p-5 rounded-2xl relative border border-slate-800 animate-pulse flex flex-col justify-between h-48">
      <div>
        <div className="flex justify-between items-start mb-4">
          {/* Title bar */}
          <div className="h-6 bg-slate-800 rounded-lg w-2/3"></div>
          {/* Pinned circle */}
          <div className="h-6 bg-slate-800 rounded-full w-6"></div>
        </div>
        
        {/* Content lines */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-slate-800 rounded-lg w-full"></div>
          <div className="h-4 bg-slate-800 rounded-lg w-5/6"></div>
          <div className="h-4 bg-slate-800 rounded-lg w-4/6"></div>
        </div>
      </div>

      {/* Footer info */}
      <div className="flex justify-between items-center border-t border-slate-800 pt-3">
        <div className="h-3 bg-slate-800 rounded-lg w-1/4"></div>
        <div className="flex space-x-2">
          <div className="h-6 bg-slate-800 rounded-md w-12"></div>
          <div className="h-6 bg-slate-800 rounded-md w-12"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Grid layout of card skeletons.
 */
export const NoteGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <NoteCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default Spinner;
