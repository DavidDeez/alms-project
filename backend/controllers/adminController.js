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

// GET /api/admin/ai-status — Returns AI configuration status
exports.getAIStatus = (req, res) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
    res.json({
        configured: !!apiKey,
        model: model,
        available_models: [
            { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash (Recommended)' },
            { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash' },
            { id: 'meta-llama/llama-3.1-8b-instruct:free', label: 'LLaMA 3.1 8B (Free)' },
            { id: 'meta-llama/llama-3.3-70b-instruct', label: 'LLaMA 3.3 70B' },
            { id: 'mistralai/mistral-7b-instruct:free', label: 'Mistral 7B (Free)' },
            { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
            { id: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku' },
        ]
    });
};

// POST /api/admin/test-ai — Test the AI Connection
exports.testAIConnection = async (req, res) => {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return res.status(400).json({ configured: false, error: 'OpenRouter API Key (OPENROUTER_API_KEY) is not set on the server!' });
        }

        const model = req.body.model || process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
        const fetchFn = globalThis.fetch;
        
        const response = await fetchFn('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://alms-project.onrender.com',
                'X-Title': 'LearnSync ALMS'
            },
            body: JSON.stringify({
                model,
                messages: [{ role: 'user', content: 'Respond with the word "Connected" and nothing else.' }],
                max_tokens: 10
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).json({ configured: true, ok: false, error: errText });
        }

        const responseData = await response.json();
        const messageContent = responseData.choices?.[0]?.message?.content?.trim();

        res.json({ configured: true, ok: true, message: messageContent || 'Connected' });
    } catch (error) {
        console.error('AI test connection error:', error);
        res.status(500).json({ error: 'Connection failed: ' + error.message });
    }
};

// POST /api/admin/topic/:id/generate-quiz — AI generation via OpenRouter
exports.generateQuiz = async (req, res) => {
    try {
        const { id: topicId } = req.params;
        // Allow frontend to override model and question count
        const modelOverride = req.body.model;
        const questionCount = parseInt(req.body.questionCount) || 5;

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

        const model = modelOverride || process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
        console.log(`Generating ${questionCount} quiz questions for: "${topic.title}" using model: ${model}`);

        const systemPrompt = `You are an expert educator for Nigerian secondary school students. Generate ${questionCount} multiple-choice questions for the following lesson content.
Return the output ONLY as a valid JSON array. Each object in the array MUST have the exact keys: "question", "options", and "correct_answer".
"options" must be an array of exactly 4 strings.
"correct_answer" must be a string that matches exactly one of the options.
Make questions clear, age-appropriate, and progressively challenging.
Do not include any markdown format tags like \`\`\`json or explanations. Only return raw JSON.`;

        const userPrompt = `Topic Title: ${topic.title}\nLesson Content: ${topic.content || 'Introduce the topic and test general knowledge about it.'}`;

        const fetchFn = globalThis.fetch;
        const response = await fetchFn('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://alms-project.onrender.com',
                'X-Title': 'LearnSync ALMS'
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: 1500 // Limit output size to prevent 402 credit reservation errors on low-balance OpenRouter accounts
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
        }

        const responseData = await response.json();
        const content = responseData.choices?.[0]?.message?.content;

        if (!content) throw new Error('Empty response from OpenRouter API');

        // Strip markdown fences if model returned them anyway
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        }

        let questions;
        try {
            questions = JSON.parse(cleanContent);
        } catch (e) {
            console.error('Failed to parse model output:', cleanContent);
            throw new Error('Generated quiz content is not valid JSON: ' + e.message);
        }

        if (!Array.isArray(questions)) throw new Error('Generated quiz is not an array');

        // 3. Insert generated quizzes into database
        for (const q of questions) {
            await db.query(
                'INSERT INTO Quizzes (topic_id, question, options, correct_answer) VALUES ($1, $2, $3, $4)',
                [topicId, q.question, JSON.stringify(q.options || []), q.correct_answer || '']
            );
        }

        res.json({ message: `${questions.length} AI quiz questions generated successfully!`, count: questions.length, model });

    } catch (error) {
        console.error('AI Quiz generation error:', error);
        res.status(500).json({ error: 'Failed to generate quiz: ' + error.message });
    }
};
