'use client';

/**
 * IdeasList component: displays a paginated, sortable list of ideas with lazy-loaded images
 * Supports state persistence via URL query parameters
 */

import React, { useEffect, useState } from 'react';
import '../app/globals.css';
import Image from 'next/image';

// Sorting options for ideas list
const sortOptions = [
  { label: 'Newest', value: '-published_at' },
  { label: 'Oldest', value: 'published_at' },
];

// Page size options for pagination
const pageSizes = [10, 20, 50];

// Type definition for Idea object
type Idea = {
  id: number;
  title: string;
  published_at: string;
  small_image?: { url: string };
  medium_image?: { url: string };
};

// Helper to get query param from URL or fallback value
function getQueryParam<T>(param: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const url = new URL(window.location.href);
  const value = url.searchParams.get(param);
  if (!value) return fallback;
  if (typeof fallback === 'number') return Number(value) as T;
  return value as T;
}

export default function IdeasList() {
  // State variables for ideas data, pagination, sorting, and loading
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [page, setPage] = useState<number>(getQueryParam('page', 1));
  const [size, setSize] = useState<number>(getQueryParam('size', 10));
  const [sort, setSort] = useState<string>(getQueryParam('sort', '-published_at'));
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Fetch ideas data from API with current pagination and sorting
    fetch(`/api/ideas?page[number]=${page}&page[size]=${size}&append[]=small_image&append[]=medium_image&sort=${sort}`)
      .then((res) => res.json())
      .then((data) => {
        setIdeas(data.data || []);
        setTotal(data.meta?.total || 0);
        setLoading(false);
      });
    // Update URL query params to persist state
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams({ page: String(page), size: String(size), sort });
      window.history.replaceState({}, '', `?${params.toString()}`);
    }
  }, [page, size, sort]);

  return (
    <div>
      {/* Controls for pagination and sorting */}
      <div className="listControls">
        <div>
          <span>Showing {total === 0 ? '0' : `${size * (page - 1) + 1} - ${Math.min(size * page, total)}`} of {total}</span>
        </div>
        <div className="controlsRight">
          <label htmlFor="showPerPage">Show per page:</label>
          <select id="showPerPage" value={size} onChange={e => setSize(Number(e.target.value))}>
            {pageSizes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <label htmlFor="sortBy">Sort by:</label>
          <select id="sortBy" value={sort} onChange={e => setSort(e.target.value)}>
            {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>
      {/* Cards grid displaying ideas */}
      <div className="cards">
        {loading ? <div>Loading...</div> : ideas.length === 0 ? (
          <div className="noIdeas">No ideas found.</div>
        ) : ideas.map((idea) => (
          <div className="card" key={idea.id}>
            {idea.small_image?.url || idea.medium_image?.url ? (
              <Image
                src={idea.small_image?.url || idea.medium_image?.url || ''}
                alt={idea.title}
                width={320}
                height={180}
                className="cardImage"
                loading="lazy"
                style={{ width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'cover' }}
              />
            ) : (
              <Image
                src="/file.svg"
                alt={idea.title}
                width={320}
                height={180}
                className="cardImage"
                priority
                style={{ width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'cover' }}
              />
            )}
            <div className="cardContent">
              <span className="cardDate">{new Date(idea.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <h3 className="cardTitle">{idea.title}</h3>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination controls */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(1)}>{'<<'}</button>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>{'<'}</button>
        {Array.from({ length: Math.min(5, Math.ceil(total / size)) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              className={page === pageNum ? 'activePage' : ''}
              onClick={() => setPage(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}
        {Math.ceil(total / size) > 5 && <span className="paginationEllipsis">...</span>}
        <button disabled={page === Math.ceil(total / size)} onClick={() => setPage(page + 1)}>{'>'}</button>
        <button disabled={page === Math.ceil(total / size)} onClick={() => setPage(Math.ceil(total / size))}>{'>>'}</button>
      </div>
    </div>
  );
}
