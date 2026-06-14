import React, { useState } from 'react';
import { X, Plus, Hash } from 'lucide-react';

export const TagInput = ({ tags = [], onTagsChange }) => {
  const [inputVal, setInputVal] = useState('');

  const addTag = () => {
    const cleanTag = inputVal.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      onTagsChange([...tags, cleanTag]);
      setInputVal('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tagToRemove) => {
    onTagsChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
        Assign Tags
      </label>

      {/* Pills Container */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-sm transition-all"
          >
            <Hash className="h-3 w-3 text-indigo-400" />
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-indigo-400 hover:text-indigo-200 transition-colors p-0.5 hover:bg-indigo-500/20 rounded-md"
              title={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-center space-x-2 w-full max-w-sm">
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Hash className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Add tag (Press Enter or Comma)..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full glass-input rounded-xl py-2 pl-9 pr-3 text-sm placeholder-slate-500"
            maxLength={20}
          />
        </div>
        <button
          type="button"
          onClick={addTag}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors"
          title="Add Tag"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default TagInput;
