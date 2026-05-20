import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Lesson from './pages/Lesson';
import Quiz from './pages/Quiz';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold hover:text-blue-200 transition">GradeGuide ALMS</Link>
          <div className="space-x-4">
            <span>Student Portal</span>
          </div>
        </div>
      </nav>
      
      <main className="p-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lesson/:topicId" element={<Lesson />} />
          <Route path="/quiz/:topicId" element={<Quiz />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
