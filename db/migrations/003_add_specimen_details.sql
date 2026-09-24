-- Specimen detail columns for the Minerals & Fossils page. Every column is
-- nullable and left empty: values are filled in by hand, and the page hides
-- any field that has no value.
--
-- notes: a real specimen description, shown in the detail dialog. The
-- existing description column holds image captions and is now used only
-- as image alt text.
-- scientific_name: the binomial (or genus) part of name to italicize, for
-- example Phacops speculator for the name Phacops speculator (pair), so
-- only that part renders in italics and not a descriptor like (pair).
--
-- IF NOT EXISTS keeps this safe to re-run: scripts/migrate.mjs applies
-- every migration file on each run.
ALTER TABLE fossils_and_minerals
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS scientific_name TEXT,
  ADD COLUMN IF NOT EXISTS geologic_period TEXT,
  ADD COLUMN IF NOT EXISTS approximate_age TEXT,
  ADD COLUMN IF NOT EXISTS formation TEXT,
  ADD COLUMN IF NOT EXISTS dimensions TEXT,
  ADD COLUMN IF NOT EXISTS acquired DATE;
