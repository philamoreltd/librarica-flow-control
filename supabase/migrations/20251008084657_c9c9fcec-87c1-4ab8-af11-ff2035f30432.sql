-- Add copy_id to borrowing_records for precise per-copy tracking
ALTER TABLE public.borrowing_records
ADD COLUMN IF NOT EXISTS copy_id UUID;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_borrowing_records_copy_id ON public.borrowing_records (copy_id);

-- Ensure only one active (unreturned) record per copy
CREATE UNIQUE INDEX IF NOT EXISTS uniq_borrowing_records_active_copy
ON public.borrowing_records (copy_id)
WHERE status = 'active' AND returned_at IS NULL;
