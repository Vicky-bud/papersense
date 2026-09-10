import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Workspace from './components/reader/Workspace';
import QuizView from './components/quiz/QuizView';
import Dashboard from './components/dashboard/Dashboard';
import NotFound from './components/NotFound';
import LandingPage from './components/landing/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workspace/:paperId" element={<Workspace />} />
        <Route path="/quiz/:paperId" element={<QuizRouteWrapper />} />
        <Route path="*" element={<NotFound />} />
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
