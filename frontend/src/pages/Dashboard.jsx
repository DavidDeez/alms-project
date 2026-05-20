import React from 'react';

export default function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Your Learning Dashboard</h2>
        <p className="text-gray-600 mb-8">Your adaptive learning journey begins here. We tailor content based on your progress.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6 bg-blue-50 border-blue-200 shadow-sm transition-transform hover:-translate-y-1">
                <h3 className="text-xl font-semibold text-blue-800">Mathematics</h3>
                <p className="text-sm text-blue-600 mb-4">Current Topic: Algebra Fundamentals</p>
                <div className="w-full bg-blue-200 rounded-full h-2.5 mb-4">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition w-full font-medium">Continue Lesson</button>
            </div>
            
            <div className="border rounded-lg p-6 bg-red-50 border-red-200 shadow-sm transition-transform hover:-translate-y-1">
                <h3 className="text-xl font-semibold text-red-800">Needs Review</h3>
                <p className="text-sm text-red-600 mb-4">Basic Science: Photosynthesis</p>
                <p className="text-xs text-red-700 mb-4 font-semibold">Score: 55% (Mastery requires 65%)</p>
                <button className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition w-full font-medium">Review Material</button>
            </div>
        </div>
      </div>
    </div>
  );
}
