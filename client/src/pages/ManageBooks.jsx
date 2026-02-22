import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import Modal from '../components/common/Modal';
import BookForm from '../components/books/BookForm';
import Button from '../components/common/Button';
import { TableRowSkeleton } from '../components/common/SkeletonLoader';

const ManageBooks = () => {
  const [books, setBooks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError]       = useState('');

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const { data } = await axiosInstance.get(`/books?search=${search}&limit=50`);
    setBooks(data.books);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchBooks, 400);
    return () => clearTimeout(t);
  }, [fetchBooks]);

  const openCreate = () => { setEditing(null); setModalOpen(true); setError(''); };
  const openEdit   = (book) => { setEditing(book); setModalOpen(true); setError(''); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await axiosInstance.put(`/books/${editing._id}`, formData);
      } else {
        await axiosInstance.post('/books', formData);
      }
      closeModal();
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save book');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    setDeleting(book._id);
    try {
      await axiosInstance.delete(`/books/${book._id}`);
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Manage Books</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mt-1">{books.length} books total</p>
        </div>
        <Button onClick={openCreate} id="add-book-btn">
          <Plus size={16} /> Add Book
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books…" className="input-field pl-9"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                {['Cover','Title','Author','Category','Qty','Available','Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {loading ? Array.from({length:5}).map((_,i)=><TableRowSkeleton key={i} cols={7}/>)
              : books.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-light dark:text-muted-dark">No books found</td></tr>
              ) : books.map((book) => (
                <tr key={book._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <img src={book.coverImageURL || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=60&q=70'} alt=""
                      className="h-10 w-8 object-cover rounded" onError={(e)=>e.target.src='https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=60&q=70'} />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200 max-w-[180px] truncate">{book.title}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{book.author}</td>
                  <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 text-[11px]">{book.category}</span></td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{book.quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${book.availableCopies > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'}`}>
                      {book.availableCopies}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(book)} className="p-1.5 rounded hover:bg-primary-50 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 transition-colors" aria-label="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(book)} disabled={deleting === book._id}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors disabled:opacity-40" aria-label="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Book' : 'Add New Book'} size="lg">
        {error && <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>}
        <BookForm initialData={editing} onSubmit={handleSubmit} onCancel={closeModal} loading={saving} />
      </Modal>
    </div>
  );
};

export default ManageBooks;
