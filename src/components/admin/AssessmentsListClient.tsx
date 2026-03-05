'use client';

import { Download, Filter } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import type { AssessmentRow } from '@/components/admin/AssessmentTable';
import AssessmentTable from '@/components/admin/AssessmentTable';

type Pagination = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

type Filters = {
  search: string;
  readiness: string[];
  minScore: string;
  maxScore: string;
  dateFrom: string;
  dateTo: string;
  booked: string;
  aiScored: string;
  source: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  page: number;
  pageSize: number;
};

const READINESS_OPTIONS = [
  { value: 'investment_ready', label: 'Investor Ready' },
  { value: 'nearly_there', label: 'Nearly There' },
  { value: 'early_stage', label: 'Early Stage' },
  { value: 'too_early', label: 'Too Early' },
];

export default function AssessmentsListClient() {
  const [data, setData] = useState<AssessmentRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    pageSize: 25,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    readiness: [],
    minScore: '',
    maxScore: '',
    dateFrom: '',
    dateTo: '',
    booked: '',
    aiScored: '',
    source: '',
    sortBy: 'createdAt',
    sortDir: 'desc',
    page: 1,
    pageSize: 25,
  });

  const fetchData = useCallback(async (f: Filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.search) {
        params.set('search', f.search);
      }
      for (const r of f.readiness) {
        params.append('readiness', r);
      }
      if (f.minScore) {
        params.set('minScore', f.minScore);
      }
      if (f.maxScore) {
        params.set('maxScore', f.maxScore);
      }
      if (f.dateFrom) {
        params.set('dateFrom', f.dateFrom);
      }
      if (f.dateTo) {
        params.set('dateTo', f.dateTo);
      }
      if (f.booked) {
        params.set('booked', f.booked);
      }
      if (f.aiScored) {
        params.set('aiScored', f.aiScored);
      }
      if (f.source) {
        params.set('source', f.source);
      }
      params.set('sortBy', f.sortBy);
      params.set('sortDir', f.sortDir);
      params.set('page', String(f.page));
      params.set('pageSize', String(f.pageSize));

      const res = await fetch(`/api/admin/assessments?${params.toString()}`);
      if (res.ok) {
        const json = await res.json() as { data: AssessmentRow[]; pagination: Pagination };
        setData(json.data);
        setPagination(json.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(filters);
  }, [filters, fetchData]);

  function handleSort(column: string) {
    setFilters(f => ({
      ...f,
      sortBy: column,
      sortDir: f.sortBy === column && f.sortDir === 'desc' ? 'asc' : 'desc',
      page: 1,
    }));
  }

  function handlePageChange(newPage: number) {
    setFilters(f => ({ ...f, page: newPage }));
  }

  function handleSearchChange(value: string) {
    setFilters(f => ({ ...f, search: value, page: 1 }));
  }

  function handleReadinessToggle(value: string) {
    setFilters(f => ({
      ...f,
      readiness: f.readiness.includes(value)
        ? f.readiness.filter(r => r !== value)
        : [...f.readiness, value],
      page: 1,
    }));
  }

  function handleExport() {
    const params = new URLSearchParams();
    if (filters.search) {
      params.set('search', filters.search);
    }
    for (const r of filters.readiness) {
      params.append('readiness', r);
    }
    if (filters.booked) {
      params.set('booked', filters.booked);
    }
    window.location.href = `/api/admin/assessments/export?${params.toString()}`;
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Assessments</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {pagination.total}
            {' '}
            total submission
            {pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters(s => !s)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              showFilters
                ? 'border-accent-blue bg-accent-blue-light text-accent-blue'
                : 'border-card-border bg-white text-text-secondary hover:bg-page-bg'
            }`}
          >
            <Filter className="size-4" />
            Filters
            {filters.readiness.length > 0 || filters.booked || filters.aiScored
              ? <span className="ml-1 size-2 rounded-full bg-accent-blue" />
              : null}
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg border border-card-border bg-white px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-page-bg"
          >
            <Download className="size-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            placeholder="Search by name, email, or company..."
            value={filters.search}
            onChange={e => handleSearchChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-card-border bg-white py-2 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
          />
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-4 rounded-xl border border-card-border bg-white p-4 shadow-card">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Readiness level */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-text-muted">Readiness Level</p>
              <div className="space-y-1">
                {READINESS_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.readiness.includes(opt.value)}
                      onChange={() => handleReadinessToggle(opt.value)}
                      className="size-4 rounded border-card-border text-accent-blue"
                    />
                    <span className="text-sm text-text-secondary">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Booked */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-text-muted">Booking Status</p>
              <select
                value={filters.booked}
                onChange={e => setFilters(f => ({ ...f, booked: e.target.value, page: 1 }))}
                className="h-9 w-full rounded-lg border border-card-border px-3 text-sm text-text-primary focus:border-accent-blue focus:outline-none"
              >
                <option value="">All</option>
                <option value="yes">Booked</option>
                <option value="no">Not booked</option>
              </select>
            </div>

            {/* AI Scored */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-text-muted">AI Scored</p>
              <select
                value={filters.aiScored}
                onChange={e => setFilters(f => ({ ...f, aiScored: e.target.value, page: 1 }))}
                className="h-9 w-full rounded-lg border border-card-border px-3 text-sm text-text-primary focus:border-accent-blue focus:outline-none"
              >
                <option value="">All</option>
                <option value="yes">Scored</option>
                <option value="no">Pending</option>
              </select>
            </div>

            {/* Score range */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-text-muted">Score Range</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Min"
                  value={filters.minScore}
                  onChange={e => setFilters(f => ({ ...f, minScore: e.target.value, page: 1 }))}
                  className="h-9 w-full rounded-lg border border-card-border px-3 text-sm focus:border-accent-blue focus:outline-none"
                />
                <span className="text-text-muted">–</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Max"
                  value={filters.maxScore}
                  onChange={e => setFilters(f => ({ ...f, maxScore: e.target.value, page: 1 }))}
                  className="h-9 w-full rounded-lg border border-card-border px-3 text-sm focus:border-accent-blue focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Clear filters */}
          <button
            type="button"
            onClick={() => setFilters(f => ({
              ...f,
              readiness: [],
              booked: '',
              aiScored: '',
              minScore: '',
              maxScore: '',
              dateFrom: '',
              dateTo: '',
              source: '',
              page: 1,
            }))}
            className="mt-3 text-sm text-accent-blue hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Table */}
      <div className={loading ? 'opacity-60' : ''}>
        <AssessmentTable
          data={data}
          total={pagination.total}
          page={filters.page}
          pageSize={filters.pageSize}
          sortBy={filters.sortBy}
          sortDir={filters.sortDir}
          onSort={handleSort}
          onPageChange={handlePageChange}
        />
      </div>

      {loading && (
        <div className="mt-4 text-center text-sm text-text-muted">Loading…</div>
      )}
    </div>
  );
}
