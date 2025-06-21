-- Delib Queue System Migration
-- Execute this SQL in the Supabase Dashboard SQL Editor

-- Create the delib_queue table
CREATE TABLE delib_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    queue_type VARCHAR(20) NOT NULL CHECK (queue_type IN ('positive', 'negative', 'comment')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'speaking', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    position INTEGER,
    session_id UUID
);

-- Create indexes for performance
CREATE INDEX idx_delib_queue_status ON delib_queue(status);
CREATE INDEX idx_delib_queue_created_at ON delib_queue(created_at);
CREATE INDEX idx_delib_queue_user_id ON delib_queue(user_id);
CREATE INDEX idx_delib_queue_session_id ON delib_queue(session_id);

-- Enable Row Level Security
ALTER TABLE delib_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
-- Actives can read all queue entries and insert their own
CREATE POLICY "Actives can view queue" ON delib_queue
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_active = true
        )
    );

-- Actives can insert their own queue entries
CREATE POLICY "Actives can join queue" ON delib_queue
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_active = true
        )
    );

-- PICs can update and delete queue entries
CREATE POLICY "PICs can manage queue" ON delib_queue
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_pic = true
        )
    );

-- Enable realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE delib_queue;