-- Create a table for individual book copies with unique barcodes
CREATE TABLE public.book_copies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  barcode TEXT NOT NULL UNIQUE,
  copy_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'borrowed', 'damaged', 'lost')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(book_id, copy_number)
);

-- Enable Row Level Security
ALTER TABLE public.book_copies ENABLE ROW LEVEL SECURITY;

-- Create policies for book_copies
CREATE POLICY "Anyone can view book copies in their department" 
ON public.book_copies 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.books 
    WHERE books.id = book_copies.book_id 
    AND (books.department_id = get_current_user_department() OR is_super_admin())
  )
);

CREATE POLICY "Staff can manage department book copies" 
ON public.book_copies 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.books 
    WHERE books.id = book_copies.book_id 
    AND books.department_id = get_current_user_department() 
    AND get_current_user_role() = ANY (ARRAY['librarian'::text, 'admin'::text])
  )
);

CREATE POLICY "Department admins can manage department book copies" 
ON public.book_copies 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.books 
    WHERE books.id = book_copies.book_id 
    AND is_department_admin(books.department_id)
  )
);

CREATE POLICY "Super admins can manage all book copies" 
ON public.book_copies 
FOR ALL 
USING (is_super_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_book_copies_updated_at
BEFORE UPDATE ON public.book_copies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique barcode for book copy
CREATE OR REPLACE FUNCTION public.generate_book_copy_barcode(book_id_param UUID, copy_number_param INTEGER)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;