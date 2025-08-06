import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeaturedBook {
  id: string;
  title: string;
  author: string;
  cover_image?: string;
  available_copies: number;
  total_copies: number;
  points: number;
  description?: string;
  category: string;
}

export const useFeaturedBooks = () => {
  const [featuredBooks, setFeaturedBooks] = useState<FeaturedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedBooks();
  }, []);

  const fetchFeaturedBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('books')
        .select('id, title, author, cover_image, available_copies, total_copies, points, description, category')
        .eq('featured', true)
        .limit(6);

      if (fetchError) throw fetchError;

      setFeaturedBooks(data || []);
    } catch (err: any) {
      console.error('Error fetching featured books:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    featuredBooks,
    loading,
    error,
    refetch: fetchFeaturedBooks
  };
};