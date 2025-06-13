CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open',
  time_commitment TEXT,
  duration TEXT,
  location TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  volunteer_name TEXT NOT NULL,
  volunteer_email TEXT NOT NULL,
  volunteer_phone TEXT,
  motivation TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
); 