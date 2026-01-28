import { requirePermission } from "@/lib/auth";
import fs from "fs";
import path from "path";
import MediaUploader from "@/components/admin/media/MediaUploader";
import MediaGrid from "@/components/admin/media/MediaGrid";

export default async function MediaPage() {
  await requirePermission(["ADMIN", "EDITOR", "AUTHOR"]);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  let files: string[] = [];

  if (fs.existsSync(uploadDir)) {
    files = fs.readdirSync(uploadDir).filter(file => /\.(webp|png|jpg|jpeg|gif|svg)$/i.test(file));
    // Sort by modification time (newest first)
    files.sort((a, b) => {
      return fs.statSync(path.join(uploadDir, b)).mtime.getTime() - 
             fs.statSync(path.join(uploadDir, a)).mtime.getTime();
    });
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Media Library</h1>
          <p className="text-gray-500 text-sm">Manage and organize your images and files.</p>
        </div>
        <MediaUploader />
      </div>

      <MediaGrid initialFiles={files} />
    </div>
  );
}
