-- Enable the UUID extension
create extension if not exists "uuid-ossp";

-- Create the participants table
create table participants (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  votes bigint default 0 not null,
  category_id text not null,
  image text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the votes table
create table votes (
  id uuid default uuid_generate_v4() primary key,
  participant_id uuid references participants(id) not null,
  verification_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the votes_history table
create table votes_history (
  id uuid default uuid_generate_v4() primary key,
  date date not null unique,
  total_votes bigint not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a function to update participant votes count
create or replace function increment_participant_votes()
returns trigger as $$
begin
  update participants
  set votes = votes + 1
  where id = NEW.participant_id;
  return NEW;
end;
$$ language plpgsql;

-- Create a trigger to automatically update participant votes
create trigger on_vote_added
  after insert on votes
  for each row
  execute function increment_participant_votes();

-- Enable Row Level Security (RLS)
alter table participants enable row level security;
alter table votes enable row level security;
alter table votes_history enable row level security;

-- Create policies
create policy "Allow public read access to participants"
  on participants for select
  to anon
  using (true);

create policy "Allow public read access to votes"
  on votes for select
  to anon
  using (true);

create policy "Allow public read access to votes_history"
  on votes_history for select
  to anon
  using (true);

-- Insert initial data
insert into participants (name, votes, category_id, image) values
  ('مريم بوعسيلة', 0, 'cat3', '/participants/1.jpg'),
  ('سارة حيون', 0, 'cat1', '/participants/2.jpg'),
  ('نبيل الحموتي', 0, 'cat1', '/participants/3.jpg'),
  ('فوزية كريشو', 0, 'cat1', '/images/03.jpg'),
  ('محمد بنعمر', 0, 'cat2', '/images/04.jpg'),
  ('أشرف بلحيان', 0, 'cat3', '/images/05.jpg'),
  ('حسين ترك', 0, 'cat2', '/images/06.jpg'),
  ('محمد قرقاش', 0, 'cat2', '/images/07.jpg'),
  ('وليد الحدادي', 0, 'cat3', '/images/08.jpg'),
  ('شباب غيث', 0, 'cat3', '/images/10.jpg'),
  ('منعم العبوصي', 0, 'cat2', '/images/11.jpg'),
  ('فهيم دراز & عبد الوهاب الخميري', 0, 'cat2', '/images/12.jpg');

-- Enable RLS
alter table votes enable row level security;

-- Create policy to allow users to vote
create policy "Users can vote"
  on votes
  for insert
  with check (true);

-- Create policy to allow users to view votes
create policy "Users can view votes"
  on votes
  for select
  using (true);

-- Create policy to allow users to update vote counts
create policy "Users can update vote counts"
  on participants
  for update
  using (true); 