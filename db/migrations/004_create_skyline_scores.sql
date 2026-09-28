-- Global Top 10 for the Skyline Defense Easter egg (api/scores.ts).
--
-- Every submission is kept. The board is the top 10 by score, with ties
-- going to the earlier entry, which is what the index below serves.
--
-- initials: exactly three letters A-Z (the API uppercases before insert).
-- wave: the wave the player reached.
-- ip_hash: an HMAC of the submitter's IP, used only to rate-limit
-- submissions. The API never returns it.
--
-- Scores are client-reported. See api/scores.ts for the (proportionate)
-- server-side checks.
--
-- IF NOT EXISTS keeps this safe to re-run: scripts/migrate.mjs applies
-- every migration file on each run. Note that the migrate script splits
-- each file on semicolons, so comments here must not contain any.
CREATE TABLE IF NOT EXISTS skyline_scores (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  initials CHAR(3) NOT NULL CHECK (initials ~ '^[A-Z]{3}$'),
  score INTEGER NOT NULL CHECK (score > 0),
  wave INTEGER NOT NULL CHECK (wave >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS skyline_scores_board_idx
  ON skyline_scores (score DESC, created_at ASC);

-- Serves the per-IP rate limit (recent submissions from one hashed IP).
CREATE INDEX IF NOT EXISTS skyline_scores_ip_recent_idx
  ON skyline_scores (ip_hash, created_at DESC);
