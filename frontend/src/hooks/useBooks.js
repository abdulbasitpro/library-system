import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';

export const useBooks = (searchQuery = '') => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/books?search=${searchQuery}`);
      setBooks(data.books || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching books');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [fetchBooks]);

  return { books, loading, error, refetch: fetchBooks };
};
