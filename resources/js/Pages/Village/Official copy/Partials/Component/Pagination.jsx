import { HiChevronLeft, HiChevronRight, HiEllipsisHorizontal } from "react-icons/hi2";

const Pagination = ({ currentPage, lastPage, handlePageChange }) => {
  // Generate page numbers to show (current page ± 2)
  const getPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(lastPage, currentPage + 2);

    // Always show first page
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Always show last page
    if (endPage < lastPage) {
      if (endPage < lastPage - 1) {
        pages.push('...');
      }
      pages.push(lastPage);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-600">
        Showing page {currentPage} of {lastPage}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2.5 rounded-md border ${
            currentPage === 1
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          <HiChevronLeft className="w-5 h-5" />
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
            className={`p-2.5 min-w-[40px] rounded-md border ${
              page === currentPage
                ? 'border-blue-500 bg-blue-50 text-blue-600 font-medium'
                : page === '...'
                ? 'border-transparent text-gray-500 cursor-default'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
            disabled={page === '...'}
          >
            {page === '...' ? <HiEllipsisHorizontal className="w-5 h-5" /> : page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className={`p-2.5 rounded-md border ${
            currentPage === lastPage
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          <HiChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Example usage:
// <Pagination
//   currentPage={currentPage}
//   lastPage={officials?.last_page || 1}
//   handlePageChange={handlePageChange}
// />

export default Pagination;
