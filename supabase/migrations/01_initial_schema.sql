-- Create custom types
CREATE TYPE vote_status AS ENUM ('pending', 'verified', 'rejected');

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create user_profiles table with name validation
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    first_name TEXT NOT NULL CHECK (char_length(first_name) >= 2),
    last_name TEXT NOT NULL CHECK (char_length(last_name) >= 2),
    phone_number TEXT NOT NULL UNIQUE,
    email TEXT CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email IS NULL),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT phone_number_format CHECK (phone_number ~ '^\+[1-9]\d{1,14}$')
);

-- Create participants table
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) NOT NULL,
    votes_count INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create voter_verifications table with enhanced security
CREATE TABLE voter_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    phone_number TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    browser_fingerprint TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    is_incognito BOOLEAN DEFAULT false NOT NULL,
    verification_token TEXT,
    captcha_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    -- Prevent multiple verifications from same device/phone within 24 hours
    CONSTRAINT unique_verification_window UNIQUE (phone_number, browser_fingerprint),
    CONSTRAINT unique_ip_window UNIQUE (ip_address, phone_number),
    CONSTRAINT phone_number_format CHECK (phone_number ~ '^\+[1-9]\d{1,14}$')
);

-- Create votes table
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID REFERENCES participants(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    verification_id UUID REFERENCES voter_verifications(id) NOT NULL,
    status vote_status DEFAULT 'pending' NOT NULL,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_vote UNIQUE (participant_id, user_id)
);

-- Create votes_history table
CREATE TABLE votes_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    total_votes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_date UNIQUE (date)
);

-- Create rate_limits table with stricter limits
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    request_count INTEGER DEFAULT 1 NOT NULL,
    last_request TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_ip_phone UNIQUE (ip_address, phone_number),
    CONSTRAINT max_requests CHECK (request_count <= 5) -- Max 5 attempts per IP/phone combination
);

-- Create indexes for better query performance
CREATE INDEX idx_participants_category ON participants(category_id);
CREATE INDEX idx_participants_votes ON participants(votes_count DESC);
CREATE INDEX idx_votes_participant ON votes(participant_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_votes_verification ON votes(verification_id);
CREATE INDEX idx_verifications_user ON voter_verifications(user_id);
CREATE INDEX idx_verifications_phone ON voter_verifications(phone_number);
CREATE INDEX idx_rate_limits_ip ON rate_limits(ip_address);
CREATE INDEX idx_rate_limits_phone ON rate_limits(phone_number);
CREATE INDEX idx_votes_history_date ON votes_history(date DESC);

-- Create function to clean up expired verifications (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM voter_verifications
    WHERE created_at < NOW() - INTERVAL '24 hours'
    AND id NOT IN (SELECT verification_id FROM votes);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to cleanup expired verifications
CREATE TRIGGER cleanup_verifications
AFTER INSERT ON voter_verifications
EXECUTE FUNCTION cleanup_expired_verifications();

-- Create function to update votes_count
CREATE OR REPLACE FUNCTION update_participant_votes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'verified' THEN
        UPDATE participants
        SET votes_count = votes_count + 1
        WHERE id = NEW.participant_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'verified' AND NEW.status = 'verified' THEN
        UPDATE participants
        SET votes_count = votes_count + 1
        WHERE id = NEW.participant_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'verified' AND NEW.status != 'verified' THEN
        UPDATE participants
        SET votes_count = votes_count - 1
        WHERE id = NEW.participant_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for votes_count updates
CREATE TRIGGER update_votes_count
AFTER INSERT OR UPDATE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_participant_votes_count();

-- Create function to update votes_history
CREATE OR REPLACE FUNCTION update_votes_history()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO votes_history (date, total_votes)
    VALUES (CURRENT_DATE, (SELECT COUNT(*) FROM votes WHERE status = 'verified'))
    ON CONFLICT (date)
    DO UPDATE SET total_votes = (SELECT COUNT(*) FROM votes WHERE status = 'verified');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for votes_history updates
CREATE TRIGGER update_history
AFTER INSERT OR UPDATE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_votes_history();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
CREATE POLICY "Users can read their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- RLS policies for participants
CREATE POLICY "Anyone can read participants"
    ON participants FOR SELECT
    TO authenticated, anon
    USING (true);

-- RLS policies for votes
CREATE POLICY "Users can read their own votes"
    ON votes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own votes"
    ON votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS policies for voter_verifications
CREATE POLICY "Users can read their own verifications"
    ON voter_verifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verifications"
    ON voter_verifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS policies for votes_history
CREATE POLICY "Anyone can read votes history"
    ON votes_history FOR SELECT
    TO authenticated, anon
    USING (true);

-- RLS policies for categories
CREATE POLICY "Anyone can read categories"
    ON categories FOR SELECT
    TO authenticated, anon
    USING (true);

-- Create function to handle phone number verification attempts
CREATE OR REPLACE FUNCTION handle_verification_attempt(phone_number TEXT, ip_address TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    attempt_count INTEGER;
BEGIN
    -- Insert or update rate limit record
    INSERT INTO rate_limits (ip_address, phone_number, request_count)
    VALUES (ip_address, phone_number, 1)
    ON CONFLICT (ip_address, phone_number)
    DO UPDATE SET 
        request_count = rate_limits.request_count + 1,
        last_request = NOW()
    WHERE rate_limits.last_request > NOW() - INTERVAL '1 hour'
    RETURNING request_count INTO attempt_count;

    -- Reset count if last attempt was more than 1 hour ago
    IF attempt_count IS NULL THEN
        UPDATE rate_limits
        SET request_count = 1, last_request = NOW()
        WHERE ip_address = handle_verification_attempt.ip_address
        AND phone_number = handle_verification_attempt.phone_number;
        RETURN TRUE;
    END IF;

    -- Return false if too many attempts
    RETURN attempt_count <= 5;
END;
$$ LANGUAGE plpgsql; 