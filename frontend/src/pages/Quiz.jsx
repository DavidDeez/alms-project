import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Quiz() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        axios.get(`${API_URL}/api/courses/topic/${topicId}/quiz`)
            .then(res => {
                setQuestions(res.data.questions);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [topicId]);

    const handleOptionChange = (questionId, option) => {
        setAnswers({ ...answers, [questionId]: option });
    };

    const submitQuiz = () => {
        setSubmitting(true);
        
        let correctCount = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correct_answer) {
                correctCount++;
            }
        });
        
        const score = (correctCount / questions.length) * 100; 

        axios.post(`${API_URL}/api/courses/quiz/submit`, {
            topicId: parseInt(topicId),
            score: score
        })
        .then(res => {
            setResult(res.data.recommendation);
            setSubmitting(false);
        })
        .catch(err => {
            console.error(err);
            setSubmitting(false);
        });
    };

    if (loading) return <div className="text-center mt-10">Loading quiz...</div>;

    if (result) {
        return (
            <div className="max-w-3xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-10 text-center border-t-4 border-blue-600">
                <div className="mb-6">
                    {result.action === 'advance' ? (
                        <div className="text-6xl mx-auto text-green-500 mb-4">🏆</div>
                    ) : (
                        <div className="text-6xl mx-auto text-yellow-500 mb-4">📖</div>
                    )}
                </div>
                <h2 className={`text-4xl font-bold mb-4 ${result.action === 'advance' ? 'text-green-600' : 'text-red-600'}`}>
                    {result.action === 'advance' ? 'Mastery Achieved!' : 'Needs Review'}
                </h2>
                <p className="text-gray-700 mb-8 text-xl leading-relaxed">{result.message}</p>
                
                {result.action === 'revise' && (
                    <div className="bg-red-50 p-6 rounded-lg mb-8 border border-red-100 text-left">
                        <h3 className="font-bold text-red-800 mb-4">Recommended Materials:</h3>
                        <ul className="space-y-3">
                            {result.suggestedMaterials?.map((mat, i) => (
                                <li key={i} className="flex items-center text-red-700 bg-white p-3 rounded shadow-sm">
                                    <span className="mr-3 text-xl">{mat.type === 'video' ? '📺' : '📝'}</span>
                                    {mat.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <button 
                    onClick={() => navigate('/')}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 transition font-bold text-lg"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-600">
            <Link to={`/lesson/${topicId}`} className="text-blue-500 hover:underline mb-6 inline-block font-semibold">&larr; Back to Lesson</Link>
            <div className="flex justify-between items-center mb-8 pb-4 border-b">
                <h2 className="text-3xl font-bold text-gray-800">Knowledge Check</h2>
                <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-bold">Pass mark: 65%</span>
            </div>
            
            <div className="space-y-8 mb-8">
                {questions.map((q, index) => (
                    <div key={q.id} className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="font-semibold text-xl text-gray-800 mb-6">{index + 1}. {q.question}</p>
                        <div className="space-y-3">
                            {q.options.map((opt, i) => (
                                <label key={i} className={`flex items-center space-x-4 p-4 bg-white rounded-lg border-2 cursor-pointer transition ${answers[q.id] === opt ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                    <input 
                                        type="radio" 
                                        name={`question-${q.id}`} 
                                        value={opt}
                                        checked={answers[q.id] === opt}
                                        onChange={() => handleOptionChange(q.id, opt)}
                                        className="h-5 w-5 text-blue-600"
                                    />
                                    <span className="text-gray-700 text-lg">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            <button 
                onClick={submitQuiz}
                disabled={submitting || Object.keys(answers).length < questions.length}
                className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl shadow-md hover:bg-blue-700 transition font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {submitting ? 'Evaluating...' : 'Submit Quiz'}
            </button>
            {Object.keys(answers).length < questions.length && (
                <p className="text-center text-red-500 mt-4 font-semibold">Please answer all questions before submitting.</p>
            )}
        </div>
    );
}
