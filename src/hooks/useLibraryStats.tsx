import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LibraryStats {
  totalBooks: number;
  availableBooks: number;
  activeStudents: number;
  booksBorrowed: number;
}

export const useLibraryStats = () => {
  const [stats, setStats] = useState<LibraryStats>({
    totalBooks: 0,
    availableBooks: 0,
    activeStudents: 0,
    booksBorrowed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch total books and sum of available copies
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('available_copies, total_copies');

      if (booksError) throw booksError;

      const totalBooks = booksData?.length || 0;
      const availableBooks = booksData?.reduce((sum, book) => sum + (book.available_copies || 0), 0) || 0;

      // Fetch active students count
      const { count: studentsCount, error: studentsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      // Fetch active borrowing records count
      const { count: borrowedCount, error: borrowedError } = await supabase
        .from('borrowing_records')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (borrowedError) throw borrowedError;

      setStats({
        totalBooks,
        availableBooks,
        activeStudents: studentsCount || 0,
        booksBorrowed: borrowedCount || 0,
      });
    } catch (error) {
      console.error('Error fetching library stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading };
};
