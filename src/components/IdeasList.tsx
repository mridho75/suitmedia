"use client";
/**
 * IdeasList component: displays a paginated, sortable list of ideas with lazy-loaded images
 * Supports state persistence via URL query parameters
 */

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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

export default function IdeasList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parseInt(searchParams?.get('page') || '1');
  const size = parseInt(searchParams?.get('size') || '10');
  const sort = searchParams?.get('sort') || '-published_at';

  // State variables for ideas data, pagination, sorting, and loading
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const sizeDropdownRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false);
      }
    }
    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSortDropdown]);

  // Fetch ideas data
  useEffect(() => {
    setLoading(true);
    fetch(`/api/ideas?page[number]=${page}&page[size]=${size}&append[]=small_image&append[]=medium_image&sort=${sort}`)
      .then((res) => res.json())
      .then((data) => {
        setIdeas(data.data || []);
        setTotal(data.meta?.total || 0);
        setLoading(false);
      });
  }, [page, size, sort]);

  // Update URL query params when page/size/sort changes
  const updateParams = (newParams: Partial<{ page: number; size: number; sort: string }>) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (newParams.page !== undefined) params.set('page', String(newParams.page));
    if (newParams.size !== undefined) params.set('size', String(newParams.size));
    if (newParams.sort !== undefined) params.set('sort', newParams.sort);
    router.replace('?' + params.toString());
  };

  return (
    <div>
      {/* Controls for pagination and sorting */}
      <div className="listControls">
        <div>
          <span>Showing {total === 0 ? '0' : `${size * (page - 1) + 1} - ${Math.min(size * page, total)}`} of {total}</span>
        </div>
        <div className="controlsRight">
          <span className="selectGroup">
            <label>Show per page:</label>
            <div className="customDropdown" ref={sizeDropdownRef}>
              <button
                type="button"
                className={"dropdownButton" + (showSizeDropdown ? " open" : "")}
                onClick={() => setShowSizeDropdown(v => !v)}
                aria-haspopup="listbox"
                aria-expanded={showSizeDropdown}
              >
                {size}
                <span className="selectChevron">
                  <Image src="/chevron-down.svg" alt="Chevron" width={22} height={22} />
                </span>
              </button>
              <ul
                className={"dropdownList" + (showSizeDropdown ? " show" : "")}
                tabIndex={-1}
                role="listbox"
                style={{ pointerEvents: showSizeDropdown ? 'auto' : 'none' }}
              >
                {pageSizes.map(s => (
                  <li
                    key={s}
                    className={s === size ? "selected" : ""}
                    role="option"
                    aria-selected={s === size}
                    onClick={() => {
                      updateParams({ size: s, page: 1 });
                      setShowSizeDropdown(false);
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </span>
          <span className="selectGroup">
            <label>Sort by:</label>
            <div className="customDropdown" ref={sortDropdownRef}>
              <button
                type="button"
                className={"dropdownButton" + (showSortDropdown ? " open" : "")}
                onClick={() => setShowSortDropdown(v => !v)}
                aria-haspopup="listbox"
                aria-expanded={showSortDropdown}
              >
                {sortOptions.find(opt => opt.value === sort)?.label}
                <span className="selectChevron">
                  <Image src="/chevron-down.svg" alt="Chevron" width={22} height={22} />
                </span>
              </button>
              <ul
                className={"dropdownList" + (showSortDropdown ? " show" : "")}
                tabIndex={-1}
                role="listbox"
                style={{ pointerEvents: showSortDropdown ? 'auto' : 'none' }}
              >
                {sortOptions.map(opt => (
                  <li
                    key={opt.value}
                    className={opt.value === sort ? "selected" : ""}
                    role="option"
                    aria-selected={opt.value === sort}
                    onClick={() => {
                      updateParams({ sort: opt.value, page: 1 });
                      setShowSortDropdown(false);
                    }}
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            </div>
          </span>
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
        <button className="paginationNav" disabled={page === 1} onClick={() => updateParams({ page: 1 })} aria-label="First page">
          &laquo;
        </button>
        <button className="paginationNav" disabled={page === 1} onClick={() => updateParams({ page: page - 1 })} aria-label="Previous page">
          &lsaquo;
        </button>
        {Array.from({ length: Math.min(5, Math.ceil(total / size)) }, (_, i) => {
          const pageNum = i + 1;
          return (
            <button
              key={pageNum}
              className={page === pageNum ? 'activePage' : 'pageButton'}
              onClick={() => updateParams({ page: pageNum })}
            >
              {pageNum}
            </button>
          );
        })}
        {Math.ceil(total / size) > 5 && <span className="paginationEllipsis">...</span>}
        <button className="paginationNav" disabled={page === Math.ceil(total / size)} onClick={() => updateParams({ page: page + 1 })} aria-label="Next page">
          &rsaquo;
        </button>
        <button className="paginationNav" disabled={page === Math.ceil(total / size)} onClick={() => updateParams({ page: Math.ceil(total / size) })} aria-label="Last page">
          &raquo;
        </button>
      </div>
    </div>
  );
}
