'use client';

import { BookmarkCheck, BookmarkPlus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';

type Props = {
  assessmentId: string;
  initialBooked: boolean;
  founderName: string;
};

export default function AdminAssessmentActions({ assessmentId, initialBooked, founderName }: Props) {
  const router = useRouter();
  const [booked, setBooked] = useState(initialBooked);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleToggleBooked() {
    setBookingLoading(true);
    setBookingError(null);
    try {
      const res = await fetch(`/api/admin/assessments/${assessmentId}/book`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booked: !booked }),
      });
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        setBookingError(body.error ?? 'Failed to update booking status.');
        showToast('Failed to update booking status.', 'error');
      } else {
        setBooked(b => !b);
        showToast(
          !booked ? 'Marked as booked!' : 'Booking removed.',
          'success',
        );
        router.refresh();
      }
    } catch {
      setBookingError('Network error. Please try again.');
      showToast('Network error. Please try again.', 'error');
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed right-4 top-20 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg transition-all ${
            toast.type === 'success' ? 'bg-score-green' : 'bg-score-red'
          }`}
          role="alert"
        >
          {toast.message}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {/* Mark as booked */}
        <button
          type="button"
          onClick={handleToggleBooked}
          disabled={bookingLoading}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
            booked
              ? 'border border-card-border bg-white text-text-secondary hover:bg-page-bg'
              : 'bg-cta-green text-white hover:bg-cta-green-hover'
          }`}
        >
          {booked
            ? (
                <>
                  <BookmarkCheck className="size-4" />
                  {bookingLoading ? 'Updating…' : 'Unmark Booked'}
                </>
              )
            : (
                <>
                  <BookmarkPlus className="size-4" />
                  {bookingLoading ? 'Updating…' : 'Mark as Booked'}
                </>
              )}
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => setShowDelete(true)}
          className="flex items-center gap-2 rounded-lg border border-card-border bg-white px-4 py-2 text-sm font-medium text-score-red transition-colors hover:bg-score-red-bg"
        >
          <Trash2 className="size-4" />
          Delete
        </button>
      </div>

      {bookingError && (
        <p className="mt-2 text-sm text-score-red">{bookingError}</p>
      )}

      <DeleteConfirmDialog
        isOpen={showDelete}
        assessmentId={assessmentId}
        founderName={founderName}
        onClose={() => setShowDelete(false)}
        onDeleted={() => {
          router.push('/dashboard/admin/assessments');
        }}
      />
    </>
  );
}
