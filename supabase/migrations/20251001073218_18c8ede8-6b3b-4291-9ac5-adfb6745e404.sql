-- Fix the generate_book_copy_barcode function to avoid ambiguous column reference
CREATE OR REPLACE FUNCTION public.generate_book_copy_barcode(book_id_param uuid, copy_number_param integer)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  barcode_prefix TEXT;
  generated_barcode TEXT;
BEGIN
  -- Generate barcode: BK + copy_number (3 digits) + random 6 digit number
  barcode_prefix := 'BK' || LPAD(copy_number_param::TEXT, 3, '0');
  generated_barcode := barcode_prefix || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  
  -- Ensure uniqueness by checking against existing barcodes
  WHILE EXISTS (SELECT 1 FROM public.book_copies WHERE book_copies.barcode = generated_barcode) LOOP
    generated_barcode := barcode_prefix || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  END LOOP;
  
  RETURN generated_barcode;
END;
$function$;