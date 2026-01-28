export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse bg-white">
      {/* LEFT CONTENT COLUMN SKELETON */}
      <div className="lg:col-span-8 space-y-8">
        {/* Page Title Skeleton */}
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>

        {/* Post List Skeletons */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col md:flex-row gap-6">
            {/* Thumbnail */}
            <div className="w-full md:w-1/3 h-52 md:h-44 bg-gray-200 rounded-lg"></div>
            {/* Content */}
            <div className="flex-1 flex flex-col justify-center space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="flex gap-2 mt-2">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT SIDEBAR COLUMN SKELETON */}
      <div className="lg:col-span-4 hidden lg:block space-y-8">
        {/* Widget 1 */}
        <div className="h-64 bg-gray-200 rounded border"></div>
        {/* Widget 2 */}
        <div className="h-64 bg-gray-200 rounded border"></div>
      </div>
    </div>
  );
}
