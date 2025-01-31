-- Drop dependent constraints first with CASCADE
ALTER TABLE IF EXISTS votes
    DROP CONSTRAINT IF EXISTS votes_verification_id_fkey CASCADE,
    DROP CONSTRAINT IF EXISTS votes_user_id_fkey CASCADE,
    DROP CONSTRAINT IF EXISTS votes_participant_id_fkey CASCADE,
    DROP CONSTRAINT IF EXISTS unique_vote CASCADE;

-- Now safe to drop voter_verifications constraints
ALTER TABLE IF EXISTS voter_verifications 
    DROP CONSTRAINT IF EXISTS voter_verifications_auth_user_id_fkey CASCADE,
    DROP CONSTRAINT IF EXISTS voter_verifications_pkey CASCADE,
    DROP CONSTRAINT IF EXISTS unique_verification CASCADE,
    DROP CONSTRAINT IF EXISTS phone_number_format CASCADE;

-- Drop indexes safely
DROP INDEX IF EXISTS idx_verifications_user CASCADE;
DROP INDEX IF EXISTS idx_verifications_phone CASCADE;
DROP INDEX IF EXISTS idx_votes_participant CASCADE;
DROP INDEX IF EXISTS idx_votes_user CASCADE;
DROP INDEX IF EXISTS idx_votes_verification CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS auth_method CASCADE;

-- Update user_profiles table
ALTER TABLE user_profiles
    DROP COLUMN IF EXISTS phone_number,
    ADD COLUMN IF NOT EXISTS first_name TEXT NOT NULL,
    ADD COLUMN IF NOT EXISTS last_name TEXT NOT NULL,
    ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Update RLS policies for user_profiles
DROP POLICY IF EXISTS "Anyone can insert a user profile" ON user_profiles;
CREATE POLICY "Anyone can insert a user profile"
    ON user_profiles FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read user profiles" ON user_profiles;
CREATE POLICY "Anyone can read user profiles"
    ON user_profiles FOR SELECT
    USING (true);

-- Update voter_verifications table
ALTER TABLE voter_verifications
    DROP COLUMN IF EXISTS auth_method CASCADE,
    ADD COLUMN IF NOT EXISTS phone_number TEXT,
    ADD COLUMN IF NOT EXISTS browser_fingerprint TEXT,
    ADD COLUMN IF NOT EXISTS is_incognito BOOLEAN DEFAULT false;

-- Add primary key to voter_verifications if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'voter_verifications_pkey' 
        AND conrelid = 'voter_verifications'::regclass
    ) THEN
        ALTER TABLE voter_verifications ADD PRIMARY KEY (id);
    END IF;
END $$;

-- Add other constraints to voter_verifications
ALTER TABLE voter_verifications
    ADD CONSTRAINT voter_verifications_phone_format CHECK (phone_number ~ '^\+[1-9]\d{1,14}$'),
    ADD CONSTRAINT unique_verification_window UNIQUE (phone_number, browser_fingerprint),
    ADD CONSTRAINT unique_ip_window UNIQUE (ip_address, phone_number);

-- Update votes table and recreate foreign key constraints
ALTER TABLE votes
    ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add foreign key constraints
ALTER TABLE votes
    ADD CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    ADD CONSTRAINT votes_verification_id_fkey FOREIGN KEY (verification_id) REFERENCES voter_verifications(id),
    ADD CONSTRAINT votes_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES participants(id),
    ADD CONSTRAINT unique_vote UNIQUE (participant_id, user_id);

-- Create rate_limits table if not exists
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    request_count INTEGER DEFAULT 1 NOT NULL,
    last_request TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_ip_phone UNIQUE (ip_address, phone_number),
    CONSTRAINT max_requests CHECK (request_count <= 5)
);

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_verifications_user ON voter_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_phone ON voter_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_votes_participant ON votes(participant_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_verification ON votes(verification_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limits_phone ON rate_limits(phone_number);

-- Create or replace the verification attempt handler function
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

-- Create or replace the cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM voter_verifications
    WHERE created_at < NOW() - INTERVAL '24 hours'
    AND id NOT IN (SELECT verification_id FROM votes);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS cleanup_verifications ON voter_verifications;
CREATE TRIGGER cleanup_verifications
    AFTER INSERT ON voter_verifications
    EXECUTE FUNCTION cleanup_expired_verifications();

-- Update existing data
UPDATE user_profiles
SET 
    first_name = COALESCE(first_name, 'Unknown'),
    last_name = COALESCE(last_name, 'Unknown')
WHERE first_name IS NULL OR last_name IS NULL;

-- Make columns NOT NULL after updating existing data
ALTER TABLE user_profiles
    ALTER COLUMN first_name SET NOT NULL,
    ALTER COLUMN last_name SET NOT NULL,
    ALTER COLUMN email SET NOT NULL; 