import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Workspace from './components/reader/Workspace';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* We'll add a dashboard route later, for now redirect to a dummy workspace */}
        <Route path="/" element={<Navigate to="/workspace/dummy-uuid" />} />
        <Route path="/workspace/:paperId" element={<Workspace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
