import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { TableRowSkeleton } from '../components/common/SkeletonLoader';
import Button from '../components/common/Button';
import { Plus, Search, Edit2, Trash2, Library, X } from 'lucide-react';

const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '', author: '', isbn: '', category: '', quantity: 0, coverImageURL: ''
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/books');
      setBooks(data.books || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBook) {
        await axiosInstance.put(`/books/${editingBook._id}`, formData);
      } else {
        await axiosInstance.post('/books', formData);
      }
      setModalOpen(false);
      setEditingBook(null);
      setFormData({ title: '', author: '', isbn: '', category: '', quantity: 0, coverImageURL: '' });
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving book');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await axiosInstance.delete(`/books/${id}`);
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting book');
    }
  };

  const openModal = (book = null) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category,
        quantity: book.quantity,
        coverImageURL: book.coverImageURL || ''
      });
    } else {
      setEditingBook(null);
      setFormData({ title: '', author: '', isbn: '', category: '', quantity: 0, coverImageURL: '' });
    }
    setModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Book Inventory</h2>
          <p className="text-slate-500">Add, edit, or remove books from the library.</p>
        </div>
        <Button onClick={() => openModal()} className="w-full md:w-auto">
          <Plus className="mr-2 h-5 w-5" />
          Add New Book
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 font-semibold">Book Info</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold text-center">Stock</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array(5).fill(0).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
              ) : books.map((book) => (
                <tr key={book._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center overflow-hidden">
                        {book.coverImageURL ? (
                          <img src={book.coverImageURL} className="h-full w-full object-cover" />
                        ) : (
                          <Library className="h-6 w-6 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-50">{book.title}</p>
                        <p className="text-xs text-slate-500">{book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-medium">
                      {book.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-medium">
                    {book.availableCopies} / {book.quantity}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(book)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(book._id)} className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl p-8 relative animate-in zoom-in duration-300">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h3 className="text-2xl font-bold mb-6">{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Title</label>
                <input 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Author</label>
                <input 
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({...formData, author: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">ISBN</label>
                <input 
                  required
                  value={formData.isbn}
                  onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Category</label>
                <input 
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Total Quantity</label>
                <input 
                  type="number"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Cover Image URL</label>
                <input 
                  value={formData.coverImageURL}
                  onChange={(e) => setFormData({...formData, coverImageURL: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="md:col-span-2 mt-4 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBooks;
