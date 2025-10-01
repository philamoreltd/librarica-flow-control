-- Fix the generate_copy_isbn function
CREATE OR REPLACE FUNCTION public.generate_copy_isbn(book_id_param uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  base_isbn TEXT;
  next_sequence INTEGER;
  generated_isbn TEXT;
BEGIN
  -- Get the base ISBN from the book
  SELECT books.isbn INTO base_isbn FROM public.books WHERE books.id = book_id_param;
  
  -- If book doesn't have ISBN, use book ID prefix
  IF base_isbn IS NULL OR base_isbn = '' THEN
    base_isbn := 'BK' || SUBSTRING(book_id_param::TEXT, 1, 8);
  END IF;
  
  -- Get the next sequence number for this book
  SELECT COALESCE(MAX(book_copies.copy_number), 0) + 1 
  INTO next_sequence 
  FROM public.book_copies 
  WHERE book_copies.book_id = book_id_param;
  
  -- Generate ISBN: base_isbn + '-' + sequence (padded to 3 digits)
  generated_isbn := base_isbn || '-' || LPAD(next_sequence::TEXT, 3, '0');
  
  -- Ensure uniqueness across all book copies
  WHILE EXISTS (SELECT 1 FROM public.book_copies WHERE book_copies.isbn = generated_isbn) LOOP
    next_sequence := next_sequence + 1;
    generated_isbn := base_isbn || '-' || LPAD(next_sequence::TEXT, 3, '0');
  END LOOP;
  
  RETURN generated_isbn;
END;
$function$;