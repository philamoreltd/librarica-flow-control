
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Book = Tables<'books'>;

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');

      if (error) throw error;
      setBooks(data || []);
    } catch (error: any) {
      console.error('Error fetching books:', error);
      toast({
        title: "Error loading books",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const borrowBook = async (bookId: string, userId: string) => {
    try {
      // Calculate due date (2 weeks from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // Create borrowing record
      const { error: borrowError } = await supabase
        .from('borrowing_records')
        .insert({
          user_id: userId,
          book_id: bookId,
          due_date: dueDate.toISOString(),
        });

      if (borrowError) throw borrowError;

      // Update book availability
      const { error: updateError } = await supabase
        .from('books')
        .update({ available_copies: books.find(b => b.id === bookId)!.available_copies! - 1 })
        .eq('id', bookId);

      if (updateError) throw updateError;

      toast({
        title: "Book borrowed successfully",
        description: "The book has been added to your borrowed books.",
      });

      // Refresh books list
      fetchBooks();
    } catch (error: any) {
      console.error('Error borrowing book:', error);
      toast({
        title: "Error borrowing book",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const reserveBook = async (bookId: string, userId: string) => {
    try {
      // Set expiration date to 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('reservations')
        .insert({
          user_id: userId,
          book_id: bookId,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Book reserved successfully",
        description: "You'll be notified when the book becomes available.",
      });
    } catch (error: any) {
      console.error('Error reserving book:', error);
      toast({
        title: "Error reserving book",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBooks();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('books-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'books'
        },
        () => {
          fetchBooks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    books,
    loading,
    borrowBook,
    reserveBook,
    refetch: fetchBooks,
  };
}
