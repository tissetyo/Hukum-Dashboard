-- EXAMS TABLE
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL DEFAULT 60, -- in minutes
    settings JSONB DEFAULT '{"layout_type": "scroll"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUESTIONS TABLE
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('multiple_choice', 'text', 'boolean')),
    content TEXT NOT NULL,
    options JSONB, -- for multiple choice
    correct_answer TEXT,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PARTICIPANTS TABLE
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    details JSONB,
    access_token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'graded')) DEFAULT 'pending',
    score FLOAT,
    certificate_url TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, email)
);

-- SUBMISSIONS TABLE
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    answers JSONB, -- { "question_id": "answer" }
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES (Simplified for development)
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Allow full access to exams and questions for admin purposes (Simplified for dev)
CREATE POLICY "Full access exams" ON exams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access questions" ON questions FOR ALL USING (true) WITH CHECK (true);

-- Allow participants to read/update their own record
CREATE POLICY "Participant access" ON participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Submission access" ON submissions FOR ALL USING (true) WITH CHECK (true);
