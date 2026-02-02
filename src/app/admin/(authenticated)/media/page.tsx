import { requirePermission } from "@/lib/auth";
import fs from "fs";
import path from "path";
import MediaUploader from "@/components/admin/media/MediaUploader";
import MediaGrid from "@/components/admin/media/MediaGrid";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
import AdminTableFooter from "@/components/admin/AdminTableFooter";

export default async function MediaPage(props: {
  searchParams: Promise<{ page?: string; limit?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  await requirePermission(["ADMIN", "EDITOR", "AUTHOR"]);

  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.limit) || 20));
  const search = (searchParams.search || "").toLowerCase();

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  let allFiles: string[] = [];

  if (fs.existsSync(uploadDir)) {
    allFiles = fs.readdirSync(uploadDir).filter(file => /\.(webp|png|jpg|jpeg|gif|svg)$/i.test(file));
    // Sort by modification time (newest first)
    allFiles.sort((a, b) => {
      return fs.statSync(path.join(uploadDir, b)).mtime.getTime() - 
             fs.statSync(path.join(uploadDir, a)).mtime.getTime();
    });
  }

  // Filter
  const filteredFiles = search 
    ? allFiles.filter(file => file.toLowerCase().includes(search))
    : allFiles;

  const totalFiles = filteredFiles.length;
  const totalPages = Math.ceil(totalFiles / limit);
  
  // Paginate
  const files = filteredFiles.slice((page - 1) * limit, page * limit);

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Media Library</h1>
          <p className="text-gray-500 text-sm">Manage and organize your images and files.</p>
        </div>
        <MediaUploader />
      </div>

      <AdminTableToolbar searchPlaceholder="Search media files..." />

      <MediaGrid files={files} />
      
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <AdminTableFooter 
          currentPage={page} 
          totalPages={totalPages} 
          totalItems={totalFiles} 
          limit={limit} 
        />
      </div>
    </div>
  );
}
