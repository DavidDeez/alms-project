const db = require('../config/db');

// GET /api/admin/dashboard
exports.getAdminDashboard = async (req, res) => {
    try {
        const subjectsResult = await db.query('SELECT * FROM Subjects ORDER BY id', []);
        const subjects = [];

        for (const subject of subjectsResult.rows) {
            const topicsResult = await db.query(
                'SELECT t.id, t.title, t.order_index, (SELECT COUNT(*) FROM Quizzes q WHERE q.topic_id = t.id) as quiz_count FROM Topics t WHERE t.subject_id = $1 ORDER BY t.order_index',
                [subject.id]
            );
            subjects.push({
                id: subject.id,
                name: subject.name,
                topics: topicsResult.rows
            });
        }

        // Total student count
        const userCountResult = await db.query("SELECT COUNT(*) as count FROM Users WHERE role = 'student'", []);
        const studentCount = parseInt(userCountResult.rows[0]?.count || 0);

        res.json({ subjects, studentCount });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/admin/subject
exports.createSubject = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Subject name is required' });

        await db.query('INSERT INTO Subjects (name) VALUES ($1)', [name]);
        res.status(201).json({ message: 'Subject created successfully' });
    } catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/admin/topic
exports.createTopic = async (req, res) => {
    try {
        const { subject_id, title, content } = req.body;
        if (!subject_id || !title) {
            return res.status(400).json({ error: 'subject_id and title are required' });
        }

        // Get the next order_index for this subject
        const orderResult = await db.query(
            'SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM Topics WHERE subject_id = $1',
            [subject_id]
        );
        const nextOrder = orderResult.rows[0]?.next_order || 1;

        await db.query(
            'INSERT INTO Topics (subject_id, order_index, title, content) VALUES ($1, $2, $3, $4)',
            [subject_id, nextOrder, title, content || '']
        );

        res.status(201).json({ message: 'Topic created successfully' });
    } catch (error) {
        console.error('Create topic error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/admin/topic/:id/quiz — Manual quiz question creation
exports.createQuizQuestion = async (req, res) => {
    try {
        const { id: topicId } = req.params;
        const { question, options, correct_answer } = req.body;

        if (!question || !options || !correct_answer) {
            return res.status(400).json({ error: 'question, options (array), and correct_answer are required' });
        }

        await db.query(
            'INSERT INTO Quizzes (topic_id, question, options, correct_answer) VALUES ($1, $2, $3, $4)',
            [topicId, question, JSON.stringify(options), correct_answer]
        );

        res.status(201).json({ message: 'Quiz question added successfully' });
    } catch (error) {
        console.error('Create quiz error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// DELETE /api/admin/topic/:id
exports.deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM Quizzes WHERE topic_id = $1', [id]);
        await db.query('DELETE FROM ProgressTracking WHERE topic_id = $1', [id]);
        await db.query('DELETE FROM QuizAttempts WHERE topic_id = $1', [id]);
        await db.query('DELETE FROM Topics WHERE id = $1', [id]);
        res.json({ message: 'Topic deleted' });
    } catch (error) {
        console.error('Delete topic error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/admin/topic/:id/generate-quiz — AI generation via OpenRouter
exports.generateQuiz = async (req, res) => {
    try {
        const { id: topicId } = req.params;

        // 1. Get topic details
        const topicResult = await db.query('SELECT title, content FROM Topics WHERE id = $1', [topicId]);
        if (topicResult.rows.length === 0) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        const topic = topicResult.rows[0];

        // 2. Setup OpenRouter call
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'OpenRouter API Key (OPENROUTER_API_KEY) is not set on the server!' });
        }

        const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
        console.log(`Generating quiz for topic: ${topic.title} using model: ${model}`);

        const systemPrompt = `You are an expert educator. Generate 5 multiple-choice questions for the following lesson content. 
Return the output ONLY as a valid JSON array. Each object in the array MUST have the exact keys: "question", "options", and "correct_answer".
"options" must be an array of exactly 4 strings. 
"correct_answer" must be a string that matches exactly one of the options.
Do not include any markdown format tags like \`\`\`json or explanations. Only return raw JSON.`;

        const userPrompt = `Topic Title: ${topic.title}
Lesson Content: ${topic.content || 'Introduce the topic and test general knowledge about it.'}`;

        const fetchFn = globalThis.fetch || require('node-fetch'); // Fallback just in case
        const response = await fetchFn('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://alms-project.onrender.com',
                'X-Title': 'GradeGuide'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
        }

        const responseData = await response.json();
        const content = responseData.choices?.[0]?.message?.content;
        
        if (!content) {
            throw new Error('Empty response from OpenRouter API');
        }

        // Parse JSON output
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
        }

        let questions;
        try {
            questions = JSON.parse(cleanContent);
        } catch (e) {
            console.error('Failed to parse model output:', cleanContent);
            throw new Error('Generated quiz content is not valid JSON: ' + e.message);
        }

        if (!Array.isArray(questions)) {
            throw new Error('Generated quiz is not an array');
        }

        // 3. Insert generated quizzes into database
        for (const q of questions) {
            const opts = q.options || [];
            const correctAns = q.correct_answer || '';
            await db.query(
                'INSERT INTO Quizzes (topic_id, question, options, correct_answer) VALUES ($1, $2, $3, $4)',
                [topicId, q.question, JSON.stringify(opts), correctAns]
            );
        }

        res.json({ message: 'AI Quiz generated successfully!', count: questions.length });

    } catch (error) {
        console.error('AI Quiz generation error:', error);
        res.status(500).json({ error: 'Failed to generate quiz: ' + error.message });
    }
};
