-- First, drop existing tables and types if they exist
drop table if exists votes cascade;
drop table if exists votes_history cascade;
drop table if exists rate_limits cascade;
drop table if exists voter_verifications cascade;
drop table if exists participants cascade;
drop table if exists categories cascade;
drop type if exists vote_status cascade;
drop type if exists auth_method cascade;

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "citext";

-- Create custom types
create type vote_status as enum ('pending', 'verified', 'rejected');
create type auth_method as enum ('email', 'phone', 'guest');

-- Create the categories table first
create table categories (
  id text primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert categories before creating tables that reference them
insert into categories (id, name, description) values
  ('creators', 'Creators', 'Content creators and artists'),
  ('sports', 'Sports', 'Sports and athletics participants'),
  ('organizations', 'Organizations', 'Event organizations and managers');

-- Create the participants table with foreign key to categories
create table participants (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category_id text not null,
  image text not null,
  votes_count bigint default 0 not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  foreign key (category_id) references categories(id)
);

-- Create the voter_verifications table
create table voter_verifications (
  id uuid default uuid_generate_v4() primary key,
  ip_address text not null,
  browser_fingerprint text not null,
  user_agent text not null,
  is_incognito boolean default false not null,
  verification_token text unique,
  captcha_token text,
  auth_method auth_method default 'guest' not null,
  auth_user_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(ip_address, browser_fingerprint)
);

-- Create the votes table
create table votes (
  id uuid default uuid_generate_v4() primary key,
  participant_id uuid not null,
  verification_id uuid not null,
  status vote_status default 'pending' not null,
  voted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  foreign key (participant_id) references participants(id),
  foreign key (verification_id) references voter_verifications(id),
  unique(verification_id, participant_id)
);

-- Create the rate_limits table
create table rate_limits (
  id uuid default uuid_generate_v4() primary key,
  ip_address text not null,
  request_count integer default 1 not null,
  last_request timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(ip_address)
);

-- Create votes_history table
create table votes_history (
  id uuid default uuid_generate_v4() primary key,
  date date not null unique,
  total_votes bigint not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Function to update participant votes count
create or replace function update_participant_votes()
returns trigger as $$
begin
  if NEW.status = 'verified' then
    update participants
    set votes_count = votes_count + 1
    where id = NEW.participant_id;
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Function to check rate limits
create or replace function check_rate_limit(check_ip text, max_requests int default 5, window_minutes int default 1)
returns boolean as $$
declare
  current_count int;
begin
  -- Clean up old rate limit records
  delete from rate_limits
  where last_request < now() - (window_minutes || ' minutes')::interval;

  -- Get current count for IP
  select request_count into current_count
  from rate_limits
  where ip_address = check_ip;

  if current_count is null then
    -- First request from this IP
    insert into rate_limits (ip_address)
    values (check_ip);
    return true;
  elsif current_count < max_requests then
    -- Increment counter
    update rate_limits
    set request_count = request_count + 1,
        last_request = now()
    where ip_address = check_ip;
    return true;
  else
    -- Rate limit exceeded
    return false;
  end if;
end;
$$ language plpgsql;

-- Trigger to update votes count
create trigger on_vote_verified
  after insert or update of status on votes
  for each row
  execute function update_participant_votes();

-- Enable Row Level Security
alter table participants enable row level security;
alter table votes enable row level security;
alter table voter_verifications enable row level security;
alter table rate_limits enable row level security;
alter table votes_history enable row level security;

-- RLS Policies

-- Participants policies
create policy "Allow public read access to participants"
  on participants for select
  to anon
  using (true);

-- Votes policies
create policy "Allow authenticated insert to votes"
  on votes for insert
  to authenticated
  with check (
    status = 'pending' and
    exists (
      select 1 from voter_verifications v
      where v.id = verification_id
      and (v.auth_user_id = auth.uid() or v.auth_method = 'guest')
    )
  );

create policy "Allow public read access to votes"
  on votes for select
  to anon
  using (true);

-- Voter verifications policies
create policy "Allow public insert to voter_verifications"
  on voter_verifications for insert
  to anon
  with check (
    (auth_method = 'guest' and auth_user_id is null) or
    (auth_method != 'guest' and auth_user_id = auth.uid())
  );

create policy "Allow users to read their own verifications"
  on voter_verifications for select
  to anon
  using (
    auth_user_id = auth.uid() or
    (auth_method = 'guest' and auth_user_id is null)
  );

-- Insert initial participants
insert into participants (name, category_id, image) values
  ('مريم بوعسيلة', 'organizations', '/participants/2.jpg'),
  ('سارة حيون', 'creators', '/participants/1.jpg'),
  ('نبيل الحموتي', 'creators', '/participants/9.jpg'),
  ('فوزية كريشو', 'creators', '/participants/3.jpg'),
  ('محمد بنعمر', 'sports', '/participants/4.jpg'),
  ('أشرف بلحيان', 'organizations', '/participants/5.jpg'),
  ('حسين ترك', 'creators', '/participants/6.jpg'),
  ('محمد قرقاش', 'sports', '/participants/7.jpg'),
  ('وليد الحدادي', 'organizations', '/participants/8.jpg'),
  ('شباب غيث', 'organizations', '/participants/10.jpg'),
  ('منعم العبوصي', 'sports', '/participants/11.jpg'),
  ('فهيم دراز & عبد الوهاب الخميري', 'sports', '/participants/12.jpg'); 