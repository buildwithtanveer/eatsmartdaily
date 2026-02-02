import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  isPending?: boolean;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  isPending = false,
}: AdminPaginationProps) {
  if (totalPages <= 1 && totalItems <= limit) return null;

  return (
    <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
      <p className="text-sm text-gray-500">
        Showing <span className="font-bold text-gray-900">{totalItems === 0 ? 0 : (currentPage - 1) * limit + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * limit, totalItems)}</span> of <span className="font-bold text-gray-900">{totalItems}</span> items
      </p>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isPending}
          className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-all"
          aria-label="Previous Page"
        >
          <ChevronLeft size={18} />
        </button>
        
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((p, i, arr) => (
              <div key={p} className="flex items-center">
                {i > 0 && arr[i-1] !== p - 1 && <span className="text-gray-400 px-1">...</span>}
                <button
                  onClick={() => onPageChange(p)}
                  disabled={isPending}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                    p === currentPage
                      ? "bg-black text-white shadow-sm"
                      : "hover:bg-white border border-transparent hover:border-gray-200 text-gray-600"
                  }`}
                  aria-current={p === currentPage ? "page" : undefined}
                >
                  {p}
                </button>
              </div>
            ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0 || isPending}
          className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-all"
          aria-label="Next Page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
