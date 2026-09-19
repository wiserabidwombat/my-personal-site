-- fossils_and_minerals already exists in production (created out-of-band,
-- not through this migration system -- api/fossils.ts previously queried
-- the older `specimens` table above by mistake, a scaffolding leftover
-- that only ever had one stray row). This migration exists purely to bring
-- the schema history back in sync with reality, using IF NOT EXISTS so it's
-- a no-op against the live table and only matters for provisioning a fresh
-- database/branch. Column shape and types below match the live table
-- exactly (inspected directly via information_schema.columns).
CREATE TABLE IF NOT EXISTS fossils_and_minerals (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  date_collected DATE NOT NULL,
  location_found VARCHAR NOT NULL,
  description TEXT,
  image_url TEXT,
  -- Unused by the app (see src/lib/image.ts -- thumbnail/medium variants
  -- are generated on request from image_url via the wsrv.nl proxy rather
  -- than stored), kept here only because the live table already has them.
  image_thumbnail_url TEXT,
  image_medium_url TEXT,
  image_large_url TEXT
);
