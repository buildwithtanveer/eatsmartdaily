"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";
import Link from "next/link";

interface Post {
  id: number;
  title: string;
  slug: string;
  featuredImage: string | null;
  featuredImageAlt?: string | null;
  publishedAt: Date | null;
  author?: {
    name: string | null;
  } | null;
}

export default function HomeSlider({ posts }: { posts: Post[] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="w-full h-[450px] rounded-xl overflow-hidden mb-10 shadow-lg group relative bg-gray-100">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        style={{
          "--swiper-theme-color": "#568c2c",
          "--swiper-navigation-size": "20px",
        } as React.CSSProperties}
        className="h-full w-full [&_.swiper-button-next]:opacity-0 [&_.swiper-button-prev]:opacity-0 [&_.swiper-button-next]:transition-opacity [&_.swiper-button-prev]:transition-opacity group-hover:[&_.swiper-button-next]:opacity-100 group-hover:[&_.swiper-button-prev]:opacity-100"
      >
        {posts.map((post) => (
          <SwiperSlide key={post.id} className="relative w-full h-full">
            {/* Background Image */}
            <div className="relative w-full h-full">
              <Image
                src={post.featuredImage || "/logo.svg"}
                alt={post.featuredImageAlt || post.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-8 md:p-12">
                <div className="max-w-3xl animate-fadeIn">
                  <div className="flex items-center gap-2 text-green-400 text-sm font-bold uppercase mb-3 tracking-wider">
                    <span className="bg-green-600/20 px-2 py-1 rounded">Featured</span>
                    <span>•</span>
                    <span>
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : ""}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                    <Link href={`/blog/${post.slug}`} className="hover:text-green-400 transition-colors">
                      {post.title}
                    </Link>
                  </h2>
                  <div className="flex items-center text-white/90 font-medium">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold mr-3 border-2 border-white/20">
                      {post.author?.name?.[0] || "A"}
                    </div>
                    <span>By {post.author?.name || "Admin"}</span>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
