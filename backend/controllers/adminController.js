const db = require('../config/db');

async function getSystemSetting(key, fallbackValue) {
    try {
        const res = await db.query('SELECT setting_value FROM SystemSettings WHERE setting_key = $1', [key]);
        if (res.rows && res.rows.length > 0 && res.rows[0].setting_value !== null && res.rows[0].setting_value !== undefined) {
            return res.rows[0].setting_value;
        }
    } catch (err) {
        console.error(`Error fetching system setting ${key}:`, err);
    }
    return fallbackValue;
}

async function getAISettings() {
    const apiKey = await getSystemSetting('openrouter_api_key', process.env.OPENROUTER_API_KEY || '');
    const model = await getSystemSetting('openrouter_model', process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash');
    const questionCount = parseInt(await getSystemSetting('ai_question_count', '5')) || 5;
    return { apiKey, model, questionCount };
}

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
        const { subject_id, title, content, youtube_url } = req.body;
        if (!subject_id || !title) {
            return res.status(400).json({ error: 'subject_id and title are required' });
        }

        // Get the next order_index for this subject
        const orderResult = await db.query(
            'SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM Topics WHERE subject_id = $1',
            [subject_id]
        );
        const nextOrder = orderResult.rows[0]?.next_order || 1;

        // Normalize YouTube URL to embed format
        const normalizeYouTube = (url) => {
            if (!url) return null;
            const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
            return match ? `https://www.youtube.com/embed/${match[1]}` : url;
        };
        const embedUrl = normalizeYouTube(youtube_url);

        await db.query(
            'INSERT INTO Topics (subject_id, order_index, title, content, youtube_url) VALUES ($1, $2, $3, $4, $5)',
            [subject_id, nextOrder, title, content || '', embedUrl || null]
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
exports.getAIStatus = async (req, res) => {
    try {
        const { apiKey, model, questionCount } = await getAISettings();
        
        let maskedKey = '';
        if (apiKey) {
            if (apiKey.length > 12) {
                maskedKey = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
            } else {
                maskedKey = '••••••••';
            }
        }

        res.json({
            configured: !!apiKey,
            apiKey: maskedKey,
            model: model,
            questionCount: questionCount,
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
    } catch (error) {
        console.error('getAIStatus error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/admin/ai-settings — Updates AI configuration settings in DB
exports.updateAISettings = async (req, res) => {
    const { apiKey, model, questionCount } = req.body;
    try {
        if (apiKey !== undefined && !apiKey.includes('...')) {
            await db.query('DELETE FROM SystemSettings WHERE setting_key = $1', ['openrouter_api_key']);
            await db.query('INSERT INTO SystemSettings (setting_key, setting_value) VALUES ($1, $2)', ['openrouter_api_key', apiKey]);
        }
        if (model !== undefined) {
            await db.query('DELETE FROM SystemSettings WHERE setting_key = $1', ['openrouter_model']);
            await db.query('INSERT INTO SystemSettings (setting_key, setting_value) VALUES ($1, $2)', ['openrouter_model', model]);
        }
        if (questionCount !== undefined) {
            await db.query('DELETE FROM SystemSettings WHERE setting_key = $1', ['ai_question_count']);
            await db.query('INSERT INTO SystemSettings (setting_key, setting_value) VALUES ($1, $2)', ['ai_question_count', questionCount.toString()]);
        }
        res.json({ message: 'AI settings updated successfully!' });
    } catch (error) {
        console.error('updateAISettings error:', error);
        res.status(500).json({ error: 'Failed to update AI settings.' });
    }
};

// POST /api/admin/test-ai — Test the AI Connection
exports.testAIConnection = async (req, res) => {
    try {
        const { apiKey } = await getAISettings();
        if (!apiKey) {
            return res.status(400).json({ configured: false, error: 'OpenRouter API Key is not set on the server!' });
        }

        const model = req.body.model || (await getAISettings()).model || 'google/gemini-2.5-flash';
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
        const modelOverride = req.body.model;
        // Enforce minimum 5 questions always
        const questionCount = Math.max(5, parseInt(req.body.questionCount) || 5);

        // 1. Get topic details
        const topicResult = await db.query('SELECT title, content FROM Topics WHERE id = $1', [topicId]);
        if (topicResult.rows.length === 0) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        const topic = topicResult.rows[0];

        // 2. Setup OpenRouter call
        const { apiKey, model: dbModel } = await getAISettings();
        if (!apiKey) {
            return res.status(500).json({ error: 'OpenRouter API Key is not set on the server!' });
        }

        const model = modelOverride || dbModel || 'google/gemini-2.5-flash';
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
                max_tokens: Math.max(2500, questionCount * 500)
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

// POST /api/admin/topic/:id/generate-content — AI generates rich textbook lesson material
exports.generateLessonContent = async (req, res) => {
    try {
        const { id: topicId } = req.params;

        const topicResult = await db.query('SELECT title, content FROM Topics WHERE id = $1', [topicId]);
        if (topicResult.rows.length === 0) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        const topic = topicResult.rows[0];

        const { apiKey, model: dbModel } = await getAISettings();
        if (!apiKey) {
            return res.status(500).json({ error: 'OpenRouter API Key is not set on the server!' });
        }

        const model = req.body.model || dbModel || 'google/gemini-2.5-flash';
        console.log(`Generating lesson content for: "${topic.title}" using model: ${model}`);

        const systemPrompt = `You are an expert Nigerian secondary school curriculum writer (JSS/SSS level).
Write detailed, textbook-quality lesson material for the given topic.

Use EXACTLY these formatting markers (they will be parsed by the frontend renderer):

## Section Title        <- major section heading
### Subsection Title    <- minor subsection heading
**key term**            <- bold important words
- bullet item           <- bullet list item
1. numbered step        <- numbered/ordered step

EXAMPLE:
[write a worked example here with clear steps]
END_EXAMPLE

FORMULA:
[write the formula or equation here]
END_FORMULA

NOTE: [write a short important note or tip here]

Rules:
- Write at least 700 words of educational content
- Include: Introduction, Key Concepts, at least 2-3 fully worked Examples, Summary
- For maths/science: show every step in examples
- Use Nigerian curriculum context where relevant
- Do NOT use markdown code fences (\`\`\`)
- Only use the markers defined above`;

        const userPrompt = `Topic: ${topic.title}\n${topic.content ? `Existing notes: ${topic.content.substring(0, 300)}` : ''}`;

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
                max_tokens: 3500
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
        }

        const responseData = await response.json();
        const content = responseData.choices?.[0]?.message?.content;

        if (!content) throw new Error('Empty response from OpenRouter API');

        const cleanContent = content.trim().replace(/^```[\w]*\n?/m, '').replace(/\n?```$/m, '').trim();

        // Save updated content to DB
        await db.query('UPDATE Topics SET content = $1 WHERE id = $2', [cleanContent, topicId]);

        res.json({ message: 'Lesson content generated!', content: cleanContent, model });

    } catch (error) {
        console.error('AI Content generation error:', error);
        res.status(500).json({ error: 'Failed to generate content: ' + error.message });
    }
};

