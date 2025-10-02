import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Book = Tables<'books'>;
type BookCopy = Tables<'book_copies'>;

export interface BookWithCopies extends Book {
  book_copies: BookCopy[];
}

export function useBookCopies(category?: string) {
  const [books, setBooks] = useState<BookWithCopies[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBooksByCategory = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('books')
        .select(`
          *,
          book_copies (*)
        `)
        .order('title');

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBooks(data || []);
    } catch (error: any) {
      console.error('Error fetching books with copies:', error);
      toast({
        title: "Error loading books",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooksByCategory();

    // Subscribe to real-time updates for books and book_copies
    const booksChannel = supabase
      .channel('books-copies-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'books'
        },
        () => {
          fetchBooksByCategory();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'book_copies'
        },
        () => {
          fetchBooksByCategory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(booksChannel);
    };
  }, [category]);

  return {
    books,
    loading,
    refetch: fetchBooksByCategory,
  };
}