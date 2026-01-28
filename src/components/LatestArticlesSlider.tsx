"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";
import Link from "next/link";

interface Post {
  id: number;
  title: string;
  slug: string;
  featuredImage: string | null;
  featuredImageAlt?: string | null;
  metaDescription: string | null;
  content: string;
  updatedAt: Date | string; // Allow string if serialized
  author?: {
    name: string | null;
  } | null;
}

export default function LatestArticlesSlider({ posts }: { posts: Post[] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="relative group">
      <Swiper
        modules={[Pagination]}
        spaceBetween={16}
        slidesPerView={1}
        pagination={{ 
          clickable: true,
          el: ".custom-pagination",
        }}
        breakpoints={{
          768: {
            slidesPerView: 3,
          },
        }}
        className="w-full pb-4"
      >
        {posts.map((post) => (
          <SwiperSlide key={post.id} className="h-auto p-1">
            <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden border hover:shadow-md transition-shadow">
              {/* Thumbnail */}
              <div className="relative aspect-16/10 w-full overflow-hidden bg-gray-100">
                <Image
                  src={post.featuredImage || "/logo.svg"}
                  alt={post.featuredImageAlt || post.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              
              {/* Content */}
              <div className="p-4 flex flex-col grow">
                <h4 className="text-lg font-bold text-gray-800 mb-2 leading-tight hover:text-green-700 h-14 overflow-hidden">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title.length > 50 ? `${post.title.substring(0, 50)}...` : post.title}
                  </Link>
                </h4>
                
                <p className="text-gray-600 text-sm mb-4 grow h-18 overflow-hidden">
                  {(post.metaDescription || post.content.replace(/<[^>]*>/g, '')).substring(0, 100)}
                  {(post.metaDescription || post.content.replace(/<[^>]*>/g, '')).length > 100 ? "..." : ""}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-4 border-t">
                  <span className="text-orange-500 font-semibold truncate max-w-[50%]">
                    By {post.author?.name || "Admin"}
                  </span>
                  <span>
                    {new Date(post.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Pagination Container */}
      <div className="custom-pagination flex justify-center gap-2 mt-4 static! [&_.swiper-pagination-bullet]:bg-gray-300 [&_.swiper-pagination-bullet-active]:bg-[#568c2c]!"></div>
    </div>
  );
}
