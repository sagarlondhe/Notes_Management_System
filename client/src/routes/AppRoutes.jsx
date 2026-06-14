import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NotesListPage from '../pages/NotesListPage.jsx';
import CreateNotePage from '../pages/CreateNotePage.jsx';
import EditNotePage from '../pages/EditNotePage.jsx';
import NoteDetailsPage from '../pages/NoteDetailsPage.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<NotesListPage />} />
      <Route path="/create" element={<CreateNotePage />} />
      <Route path="/edit/:id" element={<EditNotePage />} />
      <Route path="/notes/:id" element={<NoteDetailsPage />} />
      {/* Catch-all fallback path redirects users back to feed */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
