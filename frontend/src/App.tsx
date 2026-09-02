import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Workspace from './components/reader/Workspace';
import QuizView from './components/quiz/QuizView';
import Dashboard from './components/dashboard/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/workspace/:paperId" element={<Workspace />} />
        <Route path="/quiz/:paperId" element={<QuizRouteWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

import { useParams } from 'react-router-dom';
function QuizRouteWrapper() {
  const { paperId } = useParams<{ paperId: string }>();
  return <QuizView paperId={paperId || ''} />;
}

export default App;
