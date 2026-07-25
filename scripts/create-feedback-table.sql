CREATE TABLE feedback (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  category TEXT NOT NULL DEFAULT 'correction',
  school_id BIGINT,
  school_name TEXT,
  message TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON feedback FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON feedback FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON feedback FOR DELETE USING (true);
