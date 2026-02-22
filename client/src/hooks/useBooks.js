import { useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../utils/axiosInstance';

const useBooksHook = (initialSearch = '', initialCategory = 'All') => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef(null);

  const fetchBooks = useCallback(async (q, cat, pg) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      if (cat && cat !== 'All') params.set('category', cat);
      params.set('page', pg);
      params.set('limit', 12);

      const { data } = await axiosInstance.get(`/books?${params.toString()}`);
      setBooks(data.books);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchBooks(search, category, 1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search, category, fetchBooks]);

  // Re-fetch when page changes (no debounce needed)
  useEffect(() => {
    fetchBooks(search, category, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const refetch = () => fetchBooks(search, category, page);

  return {
    books,
    loading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    page,
    setPage,
    totalPages,
    total,
    refetch,
  };
};

export default useBooksHook;
