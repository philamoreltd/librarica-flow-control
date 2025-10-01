-- Create function to sync available copies count
CREATE OR REPLACE FUNCTION sync_book_available_copies()
RETURNS TRIGGER AS $$
DECLARE
  available_count INTEGER;
  total_count INTEGER;
BEGIN
  -- Determine which book_id to update based on the operation
  IF TG_OP = 'DELETE' THEN
    -- Count available and total copies for the deleted book
    SELECT 
      COUNT(*) FILTER (WHERE status = 'available'),
      COUNT(*)
    INTO available_count, total_count
    FROM book_copies
    WHERE book_id = OLD.book_id;
    
    -- Update the books table
    UPDATE books
    SET 
      available_copies = available_count,
      total_copies = total_count,
      updated_at = now()
    WHERE id = OLD.book_id;
  ELSE
    -- Count available and total copies for the new/updated book
    SELECT 
      COUNT(*) FILTER (WHERE status = 'available'),
      COUNT(*)
    INTO available_count, total_count
    FROM book_copies
    WHERE book_id = NEW.book_id;
    
    -- Update the books table
    UPDATE books
    SET 
      available_copies = available_count,
      total_copies = total_count,
      updated_at = now()
    WHERE id = NEW.book_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to sync on INSERT, UPDATE, DELETE
DROP TRIGGER IF EXISTS sync_book_copies_trigger ON book_copies;
CREATE TRIGGER sync_book_copies_trigger
AFTER INSERT OR UPDATE OR DELETE ON book_copies
FOR EACH ROW
EXECUTE FUNCTION sync_book_available_copies();

-- Initial sync for all existing books
UPDATE books b
SET 
  available_copies = (
    SELECT COUNT(*) 
    FROM book_copies bc 
    WHERE bc.book_id = b.id AND bc.status = 'available'
  ),
  total_copies = (
    SELECT COUNT(*) 
    FROM book_copies bc 
    WHERE bc.book_id = b.id
  ),
  updated_at = now();