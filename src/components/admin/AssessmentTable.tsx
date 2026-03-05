'use client';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { CheckCircle, ChevronDown, ChevronsUpDown, ChevronUp, ExternalLink, Mail, MoreHorizontal, Trash2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';

// ── Types ─────────────────────────────────────────────────────────────────────

export type AssessmentRow = {
  id: string;
  contactName: string;
  contactEmail: string;
  contactCompany: string | null;
  overallScore: number | null;
  readinessLevel: string | null;
  aiScored: boolean;
  emailSent: boolean;
  emailStatus: string | null;
  brevoSynced: boolean;
  booked: boolean;
  bookedAt: string | null;
  createdAt: string;
};

type Props = {
  data: AssessmentRow[];
  total: number;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (column: string) => void;
  onPageChange: (page: number) => void;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60_000);
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(ms / 86_400_000);
  if (mins < 60) {
    return `${mins}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${days}d ago`;
}

function getScoreColor(score: number | null): string {
  if (score === null) {
    return 'bg-gray-200';
  }
  if (score >= 75) {
    return 'bg-score-green';
  }
  if (score >= 50) {
    return 'bg-score-blue';
  }
  if (score >= 25) {
    return 'bg-score-orange';
  }
  return 'bg-score-red';
}

const READINESS_BADGE: Record<string, { label: string; className: string }> = {
  investment_ready: {
    label: 'Investor Ready',
    className: 'bg-score-green-bg text-score-green',
  },
  nearly_there: {
    label: 'Nearly There',
    className: 'bg-accent-blue-light text-accent-blue',
  },
  early_stage: {
    label: 'Early Stage',
    className: 'bg-score-orange-bg text-score-orange',
  },
  too_early: {
    label: 'Too Early',
    className: 'bg-score-red-bg text-score-red',
  },
};

function SortIcon({ column, sortBy, sortDir }: { column: string; sortBy: string; sortDir: string }) {
  if (sortBy !== column) {
    return <ChevronsUpDown className="ml-1 size-3.5 text-text-muted" />;
  }
  return sortDir === 'asc'
    ? <ChevronUp className="ml-1 size-3.5 text-accent-blue" />
    : <ChevronDown className="ml-1 size-3.5 text-accent-blue" />;
}

// ── Row Actions ───────────────────────────────────────────────────────────────

function RowActions({ row, onDeleted }: { row: AssessmentRow; onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="rounded-lg p-1.5 text-text-muted hover:bg-page-bg hover:text-text-primary"
          aria-label="Actions"
        >
          <MoreHorizontal className="size-4" />
        </button>

        {open && (
          <div className="absolute right-0 top-8 z-50 w-40 rounded-xl border border-card-border bg-white py-1 shadow-card-hover">
            <Link
              href={`/dashboard/admin/assessments/${row.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-page-bg hover:text-text-primary"
            >
              <ExternalLink className="size-4" />
              View
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setShowDelete(true);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-score-red hover:bg-score-red-bg"
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        isOpen={showDelete}
        assessmentId={row.id}
        founderName={row.contactName}
        onClose={() => setShowDelete(false)}
        onDeleted={onDeleted}
      />
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AssessmentTable({
  data,
  total,
  page,
  pageSize,
  sortBy,
  sortDir,
  onSort,
  onPageChange,
}: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const columns: ColumnDef<AssessmentRow>[] = [
    {
      id: 'founder',
      header: 'Founder',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-blue-light text-sm font-semibold text-accent-blue">
            {row.original.contactName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-text-primary">{row.original.contactName}</p>
            <p className="truncate text-xs text-text-muted">{row.original.contactCompany ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'contactEmail',
      header: 'Email',
      cell: ({ getValue }) => (
        <span className="truncate text-sm text-text-secondary">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: 'overallScore',
      header: 'Score',
      cell: ({ row }) => {
        const { overallScore, aiScored } = row.original;
        if (!aiScored || overallScore === null) {
          return <span className="text-xs text-text-muted">Pending</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <span className="w-7 text-right text-sm font-medium text-text-primary">
              {overallScore}
            </span>
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${getScoreColor(overallScore)}`}
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'readinessLevel',
      header: 'Readiness',
      cell: ({ getValue }) => {
        const level = getValue() as string | null;
        if (!level) {
          return <span className="text-xs text-text-muted">—</span>;
        }
        const config = READINESS_BADGE[level] ?? READINESS_BADGE.early_stage!;
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      id: 'emailStatus',
      header: 'Email',
      cell: ({ row }) => {
        const { emailSent, emailStatus } = row.original;
        if (!emailSent) {
          return <XCircle className="size-4 text-text-muted" aria-label="Not sent" />;
        }
        const label = emailStatus ?? 'sent';
        return (
          <span className="flex items-center gap-1 text-xs text-score-green" title={label}>
            <Mail className="size-4" />
            <span className="capitalize">{label}</span>
          </span>
        );
      },
    },
    {
      id: 'crmStatus',
      header: 'CRM',
      cell: ({ row }) => (
        row.original.brevoSynced
          ? <CheckCircle className="size-4 text-score-green" aria-label="Synced" />
          : <XCircle className="size-4 text-text-muted" aria-label="Not synced" />
      ),
    },
    {
      accessorKey: 'booked',
      header: 'Booked',
      cell: ({ getValue }) => (
        getValue()
          ? <span className="rounded-full bg-score-green-bg px-2.5 py-0.5 text-xs font-medium text-score-green">Booked</span>
          : <span className="text-xs text-text-muted">—</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ getValue }) => (
        <span className="text-sm text-text-secondary" title={String(getValue())}>
          {relativeTime(String(getValue()))}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions
          row={row.original}
          onDeleted={() => {
            setDeletingId(row.original.id);
            router.refresh();
          }}
        />
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    rowCount: total,
  });

  const sortableColumns = ['overallScore', 'createdAt', 'contactName', 'readinessLevel'];
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="rounded-xl border border-card-border bg-white shadow-card">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-card-border bg-page-bg">
                {headerGroup.headers.map((header) => {
                  const colId = header.column.id === 'founder' ? 'contactName' : header.column.id;
                  const isSortable = sortableColumns.includes(colId);
                  return (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted"
                    >
                      {isSortable
                        ? (
                            <button
                              type="button"
                              onClick={() => onSort(colId)}
                              className="inline-flex items-center gap-0.5 hover:text-text-primary"
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              <SortIcon column={colId} sortBy={sortBy} sortDir={sortDir} />
                            </button>
                          )
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0
              ? (
                  <tr>
                    <td colSpan={columns.length} className="py-16 text-center text-sm text-text-muted">
                      No assessments found.
                    </td>
                  </tr>
                )
              : table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className={`border-b border-card-border transition-colors last:border-b-0 hover:bg-page-bg ${deletingId === row.original.id ? 'opacity-50' : ''}`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between border-t border-card-border px-6 py-3">
        <p className="text-sm text-text-muted">
          {total === 0
            ? 'No results'
            : `Showing ${startItem} to ${endItem} of ${total} results`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-card-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-page-bg disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="text-sm text-text-muted">
            {page}
            {' '}
            /
            {' '}
            {totalPages || 1}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg border border-card-border px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-page-bg disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
