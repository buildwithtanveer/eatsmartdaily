"use client";

import { useRouter, useSearchParams } from "next/navigation";
import AdminPagination from "./AdminPagination";

interface AdminTableFooterProps {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export default function AdminTableFooter({
  totalItems,
  currentPage,
  totalPages,
  limit
}: AdminTableFooterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-white border-t border-gray-100">
        <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={limit}
            onPageChange={handlePageChange}
        />
    </div>
  );
}
