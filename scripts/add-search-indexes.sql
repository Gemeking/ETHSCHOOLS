-- Enables fast substring/fuzzy search (e.g. "camb" matching "Cambridge Academy"
-- anywhere in the name) at scale. Without this, ILIKE '%text%' on a 70,000+ row
-- table does a full table scan on every keystroke.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_schools_name_trgm ON schools USING GIN (name_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_schools_curriculum_trgm ON schools USING GIN (curriculum gin_trgm_ops);

-- Speeds up the type/city/fee filters and pagination ordering.
CREATE INDEX IF NOT EXISTS idx_schools_sub_city ON schools (sub_city);
CREATE INDEX IF NOT EXISTS idx_schools_school_type ON schools (school_type);
CREATE INDEX IF NOT EXISTS idx_schools_fee_min ON schools (fee_min);
CREATE INDEX IF NOT EXISTS idx_schools_verified ON schools (verified);
CREATE INDEX IF NOT EXISTS idx_schools_id ON schools (id);

-- Lets the location-filter sheet get per-city counts in one fast query
-- instead of fetching every row to count them client-side.
CREATE OR REPLACE VIEW school_city_counts AS
  SELECT sub_city, COUNT(*) AS count
  FROM schools
  WHERE sub_city IS NOT NULL
  GROUP BY sub_city;
