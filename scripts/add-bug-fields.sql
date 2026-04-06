ALTER TABLE bugs
  ADD COLUMN IF NOT EXISTS steps text[],
  ADD COLUMN IF NOT EXISTS expected_result text,
  ADD COLUMN IF NOT EXISTS actual_result text,
  ADD COLUMN IF NOT EXISTS suite_id integer REFERENCES test_suites(id) ON DELETE SET NULL;
