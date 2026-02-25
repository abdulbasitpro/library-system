import React, { useState, useRef } from 'react';
import { Search, Download, BookOpen, CheckCircle, AlertCircle, Loader2, X, Plus, Minus } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const ImportBooks = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [total, setTotal] = useState(0);
  const [importing, setImporting] = useState({}); // { googleBooksId: 'loading'|'success'|'duplicate' }
  const [quantities, setQuantities] = useState({});
  const [messages, setMessages] = useState({});
  const inputRef = useRef(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 2) return;
    setSearching(true);
    setSearchError('');
    setResults([]);
    setImporting({});
    try {
      const { data } = await axiosInstance.get(`/books/google-search?q=${encodeURIComponent(query)}&maxResults=20`);
      setResults(data.books || []);
      setTotal(data.total || 0);
      // Default quantity = 1 for each
      const qty = {};
      (data.books || []).forEach(b => { qty[b.googleBooksId] = 1; });
      setQuantities(qty);
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleImport = async (book) => {
    const id = book.googleBooksId;
    setImporting(prev => ({ ...prev, [id]: 'loading' }));
    try {
      const { data } = await axiosInstance.post('/books/google-import', {
        googleBooksId: id,
        quantity: quantities[id] || 1,
      });
      if (data.success) {
        setImporting(prev => ({ ...prev, [id]: 'success' }));
        setMessages(prev => ({ ...prev, [id]: `✅ "${book.title}" added to your library!` }));
      } else {
        setImporting(prev => ({ ...prev, [id]: 'duplicate' }));
        setMessages(prev => ({ ...prev, [id]: `⚠️ Already in your library` }));
      }
    } catch (err) {
      setImporting(prev => ({ ...prev, [id]: 'error' }));
      setMessages(prev => ({ ...prev, [id]: err.response?.data?.message || 'Import failed' }));
    }
  };

  const setQty = (id, delta) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, Math.min(99, (prev[id] || 1) + delta)),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40">
          <Download className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Import from Google Books</h1>
          <p className="text-sm text-neutral-400">Search by title, author, or keyword — then import directly to your library</p>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='e.g. "Harry Potter", "Atomic Habits", "Python programming"...'
            className="w-full h-12 pl-11 pr-10 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); setTotal(0); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={searching || query.trim().length < 2}
          className="flex items-center gap-2 px-6 h-12 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors shrink-0"
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Error */}
      {searchError && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-4 text-rose-700 dark:text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {searchError}
        </div>
      )}

      {/* Results count */}
      {!searching && results.length > 0 && (
        <p className="text-sm text-neutral-400">
          Showing <span className="font-semibold text-neutral-700 dark:text-neutral-300">{results.length}</span> results
          {total > results.length && <> of ~{total.toLocaleString()} for <span className="italic">"{query}"</span></>}
        </p>
      )}

      {/* Empty state */}
      {!searching && query && results.length === 0 && !searchError && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 mb-4">
            <BookOpen className="h-7 w-7 text-neutral-300 dark:text-neutral-600" />
          </div>
          <p className="text-sm text-neutral-500">No results for "<span className="font-medium">{query}</span>"</p>
          <p className="text-xs text-neutral-400 mt-1">Try a different search term</p>
        </div>
      )}

      {/* Initial prompt */}
      {!searching && !query && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 mb-4 shadow-lg">
            <Download className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Search Google's library of millions</h3>
          <p className="text-sm text-neutral-400 max-w-xs">Type any book title, author name, or topic above and hit Search to browse & import books instantly.</p>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((book) => {
            const id = book.googleBooksId;
            const status = importing[id];
            const msg = messages[id];
            const qty = quantities[id] || 1;

            return (
              <div key={id} className="card flex flex-col overflow-hidden group">
                {/* Cover */}
                <div className="relative h-44 bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0">
                  {book.coverImageURL ? (
                    <img
                      src={book.coverImageURL}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-600">
                      <BookOpen className="h-8 w-8 text-white/80" />
                    </div>
                  )}
                  {book.publishedYear && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900/60 text-neutral-200 backdrop-blur-sm">
                      {book.publishedYear}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4 gap-2">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-snug">{book.title}</h3>
                  <p className="text-xs text-neutral-400 truncate">{book.author}</p>
                  {book.category && (
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 uppercase tracking-wide w-fit">
                      {book.category}
                    </span>
                  )}
                  {book.description && (
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">{book.description}</p>
                  )}

                  {/* Status message */}
                  {msg && (
                    <p className={`text-[11px] font-medium ${status === 'success' ? 'text-emerald-600' : status === 'duplicate' ? 'text-amber-600' : 'text-rose-500'}`}>
                      {msg}
                    </p>
                  )}

                  <div className="mt-auto pt-2 space-y-2">
                    {/* Quantity selector */}
                    {status !== 'success' && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-400 shrink-0">Copies:</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setQty(id, -1)} disabled={qty <= 1} className="h-6 w-6 flex items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 transition-colors">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 w-6 text-center">{qty}</span>
                          <button onClick={() => setQty(id, +1)} disabled={qty >= 99} className="h-6 w-6 flex items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30 transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Import button */}
                    {status === 'success' ? (
                      <div className="flex items-center gap-1.5 py-2 justify-center text-emerald-600 text-xs font-semibold">
                        <CheckCircle className="h-4 w-4" /> Imported!
                      </div>
                    ) : (
                      <button
                        onClick={() => handleImport(book)}
                        disabled={status === 'loading' || status === 'duplicate'}
                        className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors
                          ${status === 'duplicate'
                            ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 cursor-not-allowed'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60'
                          }`}
                      >
                        {status === 'loading'
                          ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Importing...</>
                          : status === 'duplicate'
                          ? 'Already in Library'
                          : <><Download className="h-3.5 w-3.5" /> Import to Library</>
                        }
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImportBooks;
