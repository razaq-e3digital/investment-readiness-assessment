'use client';

import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

type Props = {
  isOpen: boolean;
  assessmentId: string;
  founderName: string;
  onClose: () => void;
  onDeleted: () => void;
};

export default function DeleteConfirmDialog({
  isOpen,
  assessmentId,
  founderName,
  onClose,
  onDeleted,
}: Props) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  async function handleDelete() {
    if (confirmText !== 'DELETE') {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/assessments/${assessmentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const body = await res.json() as { error?: string };
        setError(body.error ?? 'Deletion failed. Please try again.');
        setLoading(false);
        return;
      }

      setLoading(false);
      onDeleted();
      onClose();
      setConfirmText('');
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) {
      return;
    }
    setConfirmText('');
    setError(null);
    onClose();
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        {/* Icon + title */}
        <div className="mb-4 flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-score-red-bg">
            <AlertTriangle className="size-5 text-score-red" />
          </div>
          <div>
            <h2 id="delete-dialog-title" className="text-base font-semibold text-text-primary">
              Delete assessment
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              This action
              {' '}
              <strong>cannot be undone</strong>
              .
            </p>
          </div>
        </div>

        {/* What will be deleted */}
        <div className="mb-4 rounded-lg bg-page-bg p-4">
          <p className="mb-2 text-sm font-medium text-text-primary">
            This will permanently delete:
          </p>
          <ul className="space-y-1 text-sm text-text-secondary">
            <li>
              • Assessment data for
              {founderName}
            </li>
            <li>• All email logs</li>
            <li>• All analytics events</li>
            <li>• Associated Brevo contact (if synced)</li>
            <li>• Clerk account (if linked)</li>
          </ul>
        </div>

        {/* Confirmation input */}
        <div className="mb-4">
          <label
            htmlFor="confirm-delete-input"
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            Type
            {' '}
            <span className="font-mono text-score-red">DELETE</span>
            {' '}
            to confirm
          </label>
          <input
            id="confirm-delete-input"
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="h-10 w-full rounded-lg border border-card-border px-3 text-sm focus:border-score-red focus:outline-none focus:ring-1 focus:ring-score-red"
          />
        </div>

        {error && (
          <p className="mb-4 text-sm text-score-red">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-page-bg disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={confirmText !== 'DELETE' || loading}
            className="flex-1 rounded-lg bg-score-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Deleting…' : 'Delete permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}
