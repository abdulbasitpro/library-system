import React from 'react';
import { Book as BookIcon, User as UserIcon, Calendar, CheckCircle, XCircle } from 'lucide-react';
import Button from '../common/Button';

const BookCard = ({ book, onIssue, isAdmin }) => {
  const isAvailable = book.availableCopies > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      {/* Book Cover Placeholder */}
      <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center p-6">
        {book.coverImageURL ? (
          <img 
            src={book.coverImageURL} 
            alt={book.title} 
            className="w-full h-full object-cover rounded-md shadow-md group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <BookIcon className="h-16 w-16 text-slate-300 dark:text-slate-700" />
        )}
        
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isAvailable 
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' 
              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30'
          }`}>
            {isAvailable ? 'Available' : 'Out of Stock'}
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <p className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider mb-1">
            {book.category}
          </p>
          <h3 className="font-bold text-slate-900 dark:text-slate-50 line-clamp-2 leading-tight h-10">
            {book.title}
          </h3>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
             By {book.author}
          </p>
        </div>

        <div className="mt-auto space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Copies Available</span>
            <span className="font-bold text-slate-900 dark:text-slate-50">{book.availableCopies} / {book.quantity}</span>
          </div>

          {!isAdmin && (
            <Button 
              className="w-full text-xs py-2" 
              variant={isAvailable ? 'primary' : 'secondary'}
              disabled={!isAvailable}
              onClick={() => onIssue(book._id)}
            >
              Request Book
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
