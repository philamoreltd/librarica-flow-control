-- Add ISBN field to book_copies table
ALTER TABLE public.book_copies 
ADD COLUMN isbn TEXT UNIQUE;

-- Create function to generate sequential ISBN for book copies
CREATE OR REPLACE FUNCTION public.generate_copy_isbn(book_id_param uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  base_isbn TEXT;
  next_sequence INTEGER;
  generated_isbn TEXT;
BEGIN
  -- Get the base ISBN from the book
  SELECT isbn INTO base_isbn FROM public.books WHERE id = book_id_param;
  
  -- If book doesn't have ISBN, use book ID prefix
  IF base_isbn IS NULL OR base_isbn = '' THEN
    base_isbn := 'BK' || SUBSTRING(book_id_param::TEXT, 1, 8);
  END IF;
  
  -- Get the next sequence number for this book
  SELECT COALESCE(MAX(copy_number), 0) + 1 
  INTO next_sequence 
  FROM public.book_copies 
  WHERE book_id = book_id_param;
  
  -- Generate ISBN: base_isbn + '-' + sequence (padded to 3 digits)
  generated_isbn := base_isbn || '-' || LPAD(next_sequence::TEXT, 3, '0');
  
  -- Ensure uniqueness across all book copies
  WHILE EXISTS (SELECT 1 FROM public.book_copies WHERE isbn = generated_isbn) LOOP
    next_sequence := next_sequence + 1;
    generated_isbn := base_isbn || '-' || LPAD(next_sequence::TEXT, 3, '0');
  END LOOP;
  
  RETURN generated_isbn;
END;
$$;