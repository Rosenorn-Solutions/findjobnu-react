import React from "react";

interface PagingProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  scrollTargetId?: string;
  scrollBehavior?: ScrollBehavior;
}

function getPageNumbers(current: number, total: number, window: number = 2) {
  const pages: (number | string)[] = [];
  if (total <= 10) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  pages.push(1);
  const start = Math.max(2, current - window);
  const end = Math.min(total - 1, current + window);

  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}

const Paging: React.FC<PagingProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  scrollTargetId,
  scrollBehavior,
}) => {
  if (totalPages <= 1) return null;

  const getScrollBehavior = (): ScrollBehavior => {
    if (scrollBehavior) return scrollBehavior;
    if (typeof window === "undefined") return "auto";
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    return prefersReduced ? "auto" : "smooth";
  };

  const scrollToTarget = () => {
    if (!scrollTargetId) return;
    const target = document.getElementById(scrollTargetId);
    if (!target) return;
    target.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
    if (scrollTargetId) {
      window.requestAnimationFrame(scrollToTarget);
    }
  };

  return (
    <div className="flex justify-center mt-6">
      <div className="join shadow">
        <button
          className="join-item btn btn-lg bg-base-100 border border-base-300 hover:bg-base-200 text-base-content"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          «
        </button>
        {getPageNumbers(currentPage, totalPages).map((page, idx, arr) =>
          page === "..." ? (
            <button
              key={`ellipsis-${arr[idx - 1]}-${arr[idx + 1]}`}
              className="join-item btn btn-lg btn-disabled bg-base-100 border border-base-300 text-base-content"
            >
              ...
            </button>
          ) : (
            <button
              key={page}
              className={`join-item btn btn-lg text-base-content ${
                currentPage === page
                  ? "btn-primary"
                  : "bg-base-100 border border-base-300 hover:bg-base-200"
              }`}
              onClick={() => handlePageChange(Number(page))}
            >
              {page}
            </button>
          )
        )}
        <button
          className="join-item btn btn-lg bg-base-100 border border-base-300 hover:bg-base-200 text-base-content"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Paging;