-- First drop all policies to avoid dependency issues
DROP POLICY IF EXISTS "Anyone can insert a user profile" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can read user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can insert a vote" ON votes;
DROP POLICY IF EXISTS "Anyone can read votes" ON votes;

-- Drop existing tables and types
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS voter_verifications CASCADE;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_profiles_email_unique UNIQUE (email)
);

-- Create voter_verifications table to track voting attempts
CREATE TABLE IF NOT EXISTS voter_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_profile_id UUID NOT NULL REFERENCES user_profiles(id),
    ip_address TEXT,
    browser_fingerprint TEXT,
    is_incognito BOOLEAN DEFAULT false,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_vote UNIQUE (user_profile_id),
    CONSTRAINT unique_ip_fingerprint UNIQUE (ip_address, browser_fingerprint),
    -- Prevent incognito mode
    CONSTRAINT no_incognito_voting CHECK (is_incognito = false)
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID NOT NULL,
    voter_profile_id UUID NOT NULL REFERENCES user_profiles(id),
    verification_id UUID NOT NULL REFERENCES voter_verifications(id),
    status TEXT DEFAULT 'verified',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_participant_voter UNIQUE (participant_id, voter_profile_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_votes_participant ON votes(participant_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_verifications_user ON voter_verifications(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_verifications_ip_fingerprint ON voter_verifications(ip_address, browser_fingerprint);
CREATE INDEX IF NOT EXISTS idx_verifications_incognito ON voter_verifications(is_incognito);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert a user profile"
    ON user_profiles FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can read user profiles"
    ON user_profiles FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert a verification"
    ON voter_verifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can read verifications"
    ON voter_verifications FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert a vote"
    ON votes FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can read votes"
    ON votes FOR SELECT
    USING (true);

-- Create function to get total votes for a participant
CREATE OR REPLACE FUNCTION get_participant_votes(participant_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM votes
        WHERE votes.participant_id = $1
        AND status = 'verified'
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to check if a user can vote
CREATE OR REPLACE FUNCTION can_user_vote(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1
        FROM voter_verifications
        WHERE user_profile_id = user_id
    );
END;
$$ LANGUAGE plpgsql; 