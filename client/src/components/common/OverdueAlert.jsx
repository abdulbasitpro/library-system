import { AlertTriangle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const OverdueAlert = ({ overdueTransactions }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !overdueTransactions?.length) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-4 mb-6 flex items-start gap-3 animate-fade-in">
      <AlertTriangle size={20} className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-red-700 dark:text-red-300 text-sm">
          ⚠️ You have {overdueTransactions.length} overdue book{overdueTransactions.length > 1 ? 's' : ''}!
        </p>
        <p className="text-red-600 dark:text-red-400 text-xs mt-1">
          Please return them immediately to avoid further penalties.{' '}
          <Link to="/transactions" className="underline hover:no-underline font-medium">
            View details →
          </Link>
        </p>
        <ul className="mt-2 space-y-1">
          {overdueTransactions.slice(0, 3).map((t) => (
            <li key={t._id} className="text-xs text-red-600 dark:text-red-400">
              • <span className="font-medium">{t.book?.title}</span> — due{' '}
              {new Date(t.dueDate).toLocaleDateString()}
            </li>
          ))}
          {overdueTransactions.length > 3 && (
            <li className="text-xs text-red-500 dark:text-red-400 italic">
              +{overdueTransactions.length - 3} more…
            </li>
          )}
        </ul>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 p-1 rounded text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
        aria-label="Dismiss alert"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default OverdueAlert;
