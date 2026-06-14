import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, PlusCircle, BookOpen, Layers, CheckSquare } from 'lucide-react';

export const MainLayout = ({ children, stats = {}, activeTag = '', onTagSelect = () => { }, tags = [] }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-900 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <FileText className="h-5.5 w-5.5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-indigo-100 to-purple-300">
                 Notes Management System
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col lg:flex-row gap-8 py-8">

        {/* Sidebar Left (Only active/visible on listing, but shown as structure) */}
        <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-6">
          {/* Menu Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-900 shadow-xl">
            <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-4">
              Navigation
            </h4>
            <nav className="space-y-1.5">
              <Link
                to="/"
                className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${currentPath === '/'
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
              >
                <BookOpen className="h-4.5 w-4.5" />
                <span>Notes Feed</span>
              </Link>
              <Link
                to="/create"
                className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${currentPath === '/create'
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
              >
                <PlusCircle className="h-4.5 w-4.5" />
                <span>New Note</span>
              </Link>
            </nav>
          </div>

          {/* Stats Widget */}
          {stats && (stats.total !== undefined) && (
            <div className="glass-panel p-5 rounded-2xl border border-slate-900 shadow-xl">
              <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-4">
                Workspace Stats
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/40">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Notes</span>
                  <div className="text-2xl font-bold text-slate-100">{stats.total}</div>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/40">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Pinned</span>
                  <div className="text-2xl font-bold text-purple-400">{stats.pinned}</div>
                </div>
              </div>
            </div>
          )}

          {/* Tags Filter Widget */}
          {tags && tags.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl border border-slate-900 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Filter by Tag
                </h4>
                {activeTag && (
                  <button
                    onClick={() => onTagSelect('')}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const isSelected = activeTag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => onTagSelect(isSelected ? '' : tag)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${isSelected
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 font-semibold'
                        : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                        }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Content Container */}
        <main className="flex-grow flex flex-col min-w-0">
          {children}
        </main>
      </div>

      {/* Standard Footer */}
      <footer className="mt-auto border-t border-slate-900/60 glass-panel py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026  Notes Management System.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
