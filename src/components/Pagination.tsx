import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Determine the range of pages to show
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  // Helper to construct URL with page param
  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, "http://dummy.com"); // Dummy base for URL parsing
    url.searchParams.set("page", page.toString());
    return url.pathname + url.search;
  };

  return (
    <nav className="flex justify-center items-center mt-12 gap-1 sm:gap-2" aria-label="Pagination">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs sm:text-sm font-bold uppercase transition-colors text-gray-700 flex items-center gap-1"
        >
          <span className="hidden sm:inline">&larr;</span> Prev
        </Link>
      ) : (
        <span className="px-3 sm:px-4 py-2 border border-gray-100 rounded-lg text-gray-300 text-xs sm:text-sm font-bold uppercase cursor-not-allowed">
          <span className="hidden sm:inline">&larr;</span> Prev
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {startPage > 1 && (
          <>
            <Link
              href={getPageUrl(1)}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-200 rounded-lg text-xs sm:text-sm font-bold hover:bg-gray-50 transition-colors text-gray-700"
            >
              1
            </Link>
            {startPage > 2 && <span className="text-gray-400 px-1">...</span>}
          </>
        )}

        {pages.map((p) => (
          <Link
            key={p}
            href={getPageUrl(p)}
            className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border rounded-lg text-xs sm:text-sm font-bold transition-all ${
              p === currentPage
                ? "bg-green-600 text-white border-green-600 shadow-sm"
                : "border-gray-200 hover:bg-gray-50 text-gray-700"
            }`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </Link>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-gray-400 px-1">...</span>}
            <Link
              href={getPageUrl(totalPages)}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-200 rounded-lg text-xs sm:text-sm font-bold hover:bg-gray-50 transition-colors text-gray-700"
            >
              {totalPages}
            </Link>
          </>
        )}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs sm:text-sm font-bold uppercase transition-colors text-gray-700 flex items-center gap-1"
        >
          Next <span className="hidden sm:inline">&rarr;</span>
        </Link>
      ) : (
        <span className="px-3 sm:px-4 py-2 border border-gray-100 rounded-lg text-gray-300 text-xs sm:text-sm font-bold uppercase cursor-not-allowed">
          Next <span className="hidden sm:inline">&rarr;</span>
        </span>
      )}
    </nav>
  );
}
