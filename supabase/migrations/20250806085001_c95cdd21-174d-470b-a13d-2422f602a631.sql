-- Add featured field to books table
ALTER TABLE public.books ADD COLUMN featured BOOLEAN NOT NULL DEFAULT false;

-- Create index for better performance when querying featured books
CREATE INDEX idx_books_featured ON public.books(featured) WHERE featured = true;