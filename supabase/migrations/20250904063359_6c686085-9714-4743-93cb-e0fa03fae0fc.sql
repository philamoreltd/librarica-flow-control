-- Fix the search path for the generate_book_copy_barcode function
CREATE OR REPLACE FUNCTION public.generate_book_copy_barcode(book_id_param UUID, copy_number_param INTEGER)
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  barcode_prefix TEXT;
  barcode TEXT;
BEGIN
  -- Get book details for barcode generation
  SELECT CONCAT('BK', LPAD(copy_number_param::TEXT, 3, '0')) INTO barcode_prefix;
  
  -- Generate barcode: BK + copy_number (3 digits) + random 6 digit number
  barcode := barcode_prefix || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.book_copies WHERE barcode = barcode) LOOP
    barcode := barcode_prefix || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  END LOOP;
  
  RETURN barcode;
END;
$$;