import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/courses/dashboard`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center mt-10">Loading dashboard...</div>;
  if (!data) return <div className="text-center mt-10 text-red-500">Failed to load data. Ensure backend server is running.</div>;

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-t-4 border-blue-600">
        <h2 className="text-4xl font-bold text-gray-800 mb-3">Welcome back, {data.userName}</h2>
        <p className="text-gray-600 mb-10 text-lg">Your adaptive learning journey continues. Pick up where you left off or review past topics.</p>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Active Topics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.activeTopics.length === 0 ? (
                <p className="text-gray-500 italic">You have no active topics right now.</p>
            ) : data.activeTopics.map(topic => (
                <div key={topic.id} className={`border rounded-xl p-6 shadow-sm transition-transform hover:-translate-y-1 ${topic.needsReview ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                    <h3 className={`text-xl font-bold ${topic.needsReview ? 'text-red-800' : 'text-blue-800'} mb-2`}>
                        {topic.needsReview ? 'Needs Review' : topic.subject}
                    </h3>
                    <p className={`text-md mb-4 font-semibold ${topic.needsReview ? 'text-red-600' : 'text-blue-600'}`}>
                        {topic.needsReview ? `${topic.subject}: ${topic.title}` : `Current Topic: ${topic.title}`}
                    </p>
                    
                    {topic.needsReview && (
                        <p className="text-sm text-red-700 mb-6 font-semibold bg-red-100 p-3 rounded">
                            Last Score: {topic.lastScore}% (Mastery requires 65%)
                        </p>
                    )}
                    
                    <button 
                        onClick={() => navigate(`/lesson/${topic.id}`)}
                        className={`px-4 py-3 rounded-lg shadow-md transition w-full font-bold text-white mt-auto ${topic.needsReview ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {topic.needsReview ? 'Review Material' : 'Continue Lesson'}
                    </button>
                </div>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Subject Mastery Progress</h3>
        <div className="space-y-8">
            {data.subjects.map(subject => (
                <div key={subject.id}>
                    <div className="flex justify-between mb-3">
                        <span className="font-semibold text-gray-700 text-lg">{subject.name}</span>
                        <span className="font-bold text-blue-600 text-lg">{subject.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div className="bg-blue-500 h-4 rounded-full transition-all duration-1000" style={{ width: `${subject.completionRate}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
