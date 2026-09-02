import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Workspace from './components/reader/Workspace';
import QuizView from './components/quiz/QuizView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/workspace/dummy-uuid" />} />
        <Route path="/workspace/:paperId" element={<Workspace />} />
        {/* We use a wrapper for QuizView since it expects paperId as prop for now, or we can use useParams inside it. Let's use an inline render */}
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
