-- Fix the generate_copy_isbn function to accept copy_number directly
CREATE OR REPLACE FUNCTION public.generate_copy_isbn(book_id_param uuid, copy_number_param integer)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  base_isbn TEXT;
  generated_isbn TEXT;
BEGIN
  -- Get the base ISBN from the book
  SELECT books.isbn INTO base_isbn FROM public.books WHERE books.id = book_id_param;
  
  -- If book doesn't have ISBN, use book ID prefix
  IF base_isbn IS NULL OR base_isbn = '' THEN
    base_isbn := 'BK' || SUBSTRING(book_id_param::TEXT, 1, 8);
  END IF;
  
  -- Generate ISBN: base_isbn + '-' + copy_number (padded to 3 digits)
  generated_isbn := base_isbn || '-' || LPAD(copy_number_param::TEXT, 3, '0');
  
  -- Ensure uniqueness by adding random suffix if needed
  WHILE EXISTS (SELECT 1 FROM public.book_copies WHERE book_copies.isbn = generated_isbn) LOOP
    generated_isbn := base_isbn || '-' || LPAD(copy_number_param::TEXT, 3, '0') || '-' || LPAD(FLOOR(RANDOM() * 100)::TEXT, 2, '0');
  END LOOP;
  
  RETURN generated_isbn;
END;
$function$;