import React, { useState, useEffect } from 'react';
import { Plus, X, Search, Library, Edit3, Trash2, BookOpen } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import Button from '../components/common/Button';
import { SkeletonRow } from '../components/common/SkeletonLoader';

const CATEGORIES = ['Fiction','Non-Fiction','Science','Technology','History','Biography','Literature','Philosophy','Self-Help','Business','Children','Other'];
const EMPTY_FORM = { title: '', author: '', category: 'Fiction', isbn: '', quantity: 1, description: '', coverImageURL: '', publishedYear: '' };

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBooks = async (q = '') => {
    setLoading(true);
    try {
      const params = q ? `?search=${q}` : '';
      const { data } = await axiosInstance.get(`/books${params}`);
      setBooks(data.books || data || []);
    } catch { setBooks([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchBooks(); }, []);

  let timer;
  const handleSearch = (e) => {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(timer);
    timer = setTimeout(() => fetchBooks(v), 400);
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (book) => {
    setForm({
      title: book.title, author: book.author, category: book.category || 'Fiction',
      isbn: book.isbn || '', quantity: book.quantity ?? book.totalCopies ?? 1,
      description: book.description || '', coverImageURL: book.coverImageURL || '',
      publishedYear: book.publishedYear || '',
    });
    setEditId(book._id);
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditId(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await axiosInstance.put(`/books/${editId}`, form);
        showToast('Book updated successfully!');
      } else {
        await axiosInstance.post('/books', form);
        showToast('Book added successfully!');
      }
      closeForm();
      fetchBooks(query);
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed.', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book? This action cannot be undone.')) return;
    setDeleting(id);
    try {
      await axiosInstance.delete(`/books/${id}`);
      showToast('Book deleted.');
      setBooks(books.filter(b => b._id !== id));
    } catch { showToast('Delete failed.', 'error'); }
    finally { setDeleting(null); }
  };

  const set = (f) => (e) => setForm(v => ({ ...v, [f]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-card-hover text-sm font-medium animate-slide-in-up
          ${toast.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Manage Books</h1>
          <p className="text-sm text-neutral-400 mt-1">Add, edit, or remove books from your library</p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Book
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
        <input type="text" value={query} onChange={handleSearch} placeholder="Search books..." className="input-field pl-10 w-full" />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title & Author</th>
                <th>Category</th>
                <th>ISBN</th>
                <th>Copies</th>
                <th>Available</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-neutral-300 dark:text-neutral-600" />
                      </div>
                      <p className="text-sm text-neutral-400">No books found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                books.map(book => (
                  <tr key={book._id}>
                    <td>
                      <p className="font-medium text-neutral-800 dark:text-neutral-100">{book.title}</p>
                      <p className="text-xs text-neutral-400">{book.author}</p>
                    </td>
                    <td>
                      {book.category && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          {book.category}
                        </span>
                      )}
                    </td>
                    <td className="text-xs text-neutral-400 font-mono">{book.isbn || '—'}</td>
                    <td>{book.quantity ?? book.totalCopies ?? '—'}</td>
                    <td>
                      <span className={`font-semibold ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {book.availableCopies}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(book)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-600 transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(book._id)}
                          disabled={deleting === book._id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-in form drawer */}
      {showForm && (
        <>
          <div className="fixed inset-0 z-40 bg-neutral-950/40 backdrop-blur-sm animate-fade-in" onClick={closeForm} />
          <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-card-hover flex flex-col animate-slide-in-left" style={{ animationName: 'slideInRight' }}>
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                  {editId ? 'Edit Book' : 'Add New Book'}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {editId ? 'Update book information' : 'Fill in the details below'}
                </p>
              </div>
              <button onClick={closeForm} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {[
                { label: 'Title', field: 'title', placeholder: 'The Great Gatsby', required: true },
                { label: 'Author', field: 'author', placeholder: 'F. Scott Fitzgerald', required: true },
                { label: 'ISBN', field: 'isbn', placeholder: '978-3-16-148410-0', required: true },
                { label: 'Cover Image URL', field: 'coverImageURL', placeholder: 'https://...' },
              ].map(({ label, field, placeholder, required }) => (
                <div key={field} className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">{label}</label>
                  <input
                    type="text"
                    required={required}
                    value={form[field]}
                    onChange={set(field)}
                    placeholder={placeholder}
                    className="input-field"
                  />
                </div>
              ))}

              {/* Category dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Category</label>
                <select required value={form.category} onChange={set('category')} className="input-field">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Quantity</label>
                  <input type="number" required min={1} value={form.quantity} onChange={set('quantity')} className="input-field" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Published Year</label>
                  <input type="number" min={1000} max={new Date().getFullYear()} value={form.publishedYear} onChange={set('publishedYear')} className="input-field" placeholder="2024" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Brief summary..."
                  className="input-field resize-none"
                />
              </div>
            </form>

            {/* Drawer footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 dark:border-neutral-800">
              <Button variant="outline" size="md" className="flex-1" onClick={closeForm}>Cancel</Button>
              <Button variant="primary" size="md" className="flex-1" loading={saving} onClick={handleSave}>
                {editId ? 'Update Book' : 'Add Book'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageBooks;
