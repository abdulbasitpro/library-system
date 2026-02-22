import { useState, useEffect } from 'react';
import Button from '../common/Button';

const CATEGORIES = [
  'Fiction','Non-Fiction','Science','Technology','History',
  'Biography','Literature','Philosophy','Self-Help','Business','Children','Other',
];

const defaultForm = {
  title: '', author: '', isbn: '', category: 'Fiction',
  description: '', quantity: 1, coverImageURL: '', publishedYear: '',
};

const BookForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...defaultForm,
        ...initialData,
        quantity: initialData.quantity ?? 1,
        publishedYear: initialData.publishedYear ?? '',
      });
    } else {
      setForm(defaultForm);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      quantity: Number(form.quantity),
      publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Title *</label>
          <input name="title" value={form.title} onChange={handleChange} required className="input-field" placeholder="Book title" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Author *</label>
          <input name="author" value={form.author} onChange={handleChange} required className="input-field" placeholder="Author name" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">ISBN *</label>
          <input name="isbn" value={form.isbn} onChange={handleChange} required className="input-field" placeholder="978-…" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Category *</label>
          <select name="category" value={form.category} onChange={handleChange} required className="input-field">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Quantity *</label>
          <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Published Year</label>
          <input name="publishedYear" type="number" min="1000" max="2100" value={form.publishedYear} onChange={handleChange} className="input-field" placeholder="2024" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Cover Image URL</label>
          <input name="coverImageURL" value={form.coverImageURL} onChange={handleChange} className="input-field" placeholder="https://…" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            className="input-field resize-none" placeholder="Short description…" />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Update Book' : 'Add Book'}
        </Button>
      </div>
    </form>
  );
};

export default BookForm;
