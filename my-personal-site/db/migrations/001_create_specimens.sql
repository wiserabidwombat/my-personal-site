CREATE TABLE IF NOT EXISTS specimens (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mineral', 'fossil')),
  date_collected DATE,
  location_found TEXT,
  description TEXT,
  image_url TEXT
);

CREATE INDEX IF NOT EXISTS specimens_type_idx ON specimens (type);
