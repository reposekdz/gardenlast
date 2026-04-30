-- Fix discipline_records missing columns
-- These columns are required by the resolveDisciplineRecord and appeal decision functionality

ALTER TABLE discipline_records
  ADD COLUMN resolved_by INT(11) DEFAULT NULL COMMENT 'User ID who resolved the record',
  ADD COLUMN resolved_at TIMESTAMP NULL DEFAULT NULL COMMENT 'When the record was resolved',
  ADD COLUMN resolution_date DATE DEFAULT NULL COMMENT 'Date of resolution',
  ADD COLUMN resolution_notes TEXT DEFAULT NULL COMMENT 'Notes about the resolution',
  ADD INDEX idx_resolved_by (resolved_by),
  ADD INDEX idx_resolved_at (resolved_at),
  ADD INDEX idx_status (status);

-- Foreign key constraint (optional, ensures referential integrity)
-- ALTER TABLE discipline_records ADD CONSTRAINT fk_discipline_resolver 
--   FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL;
