import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Lesson() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_URL}/api/courses/topic/${topicId}`)
            .then(res => {
                setTopic(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [topicId]);

    if (loading) return <div className="text-center mt-10">Loading lesson...</div>;
    if (!topic) return <div className="text-center mt-10 text-red-500">Lesson not found.</div>;

    return (
        <div className="max-w-4xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-600">
            <Link to="/" className="text-blue-500 hover:underline mb-4 inline-block font-semibold">&larr; Back to Dashboard</Link>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">{topic.title}</h2>
            
            <div className="prose max-w-none text-gray-700 mb-8 p-6 bg-blue-50 rounded-lg border border-blue-100 shadow-inner text-lg leading-relaxed">
                <p>{topic.content}</p>
                <div className="mt-8 p-4 bg-white rounded shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-2">Video Lesson Placeholder</h3>
                    <div className="bg-gray-200 w-full h-64 rounded flex items-center justify-center text-gray-500">
                        ▶ Play Video
                    </div>
                </div>
            </div>
            
            <div className="flex justify-between items-center border-t pt-6">
                <p className="text-gray-500 italic">Please review the material above before proceeding to the quiz.</p>
                <button 
                    onClick={() => navigate(`/quiz/${topic.id}`)}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-green-700 transition font-bold text-lg"
                >
                    Take Quiz
                </button>
            </div>
        </div>
    );
}
