-- Enable realtime for books table
ALTER TABLE public.books REPLICA IDENTITY FULL;

-- Add books table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.books;

-- Enable realtime for book_copies table
ALTER TABLE public.book_copies REPLICA IDENTITY FULL;

-- Add book_copies table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.book_copies;