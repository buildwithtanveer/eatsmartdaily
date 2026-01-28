"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import {
  generateImageSrcSet,
  getOptimalImageSize,
  LAZY_LOADING_CONFIG,
} from "@/lib/performance";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  fill?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "scale-down";
  objectPosition?: string;
  blurDataURL?: string;
  placeholder?: "blur" | "empty";
}

/**
 * OptimizedImage Component
 * Handles responsive image loading with WebP support, lazy loading, and blur placeholders
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = "",
  sizes,
  fill = false,
  objectFit = "cover",
  objectPosition = "center",
  blurDataURL,
  placeholder = blurDataURL ? "blur" : "empty",
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Default sizes if not provided
  const defaultSizes =
    sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 1200px";

  return (
    <div className={`relative ${fill ? "w-full h-full" : ""}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        sizes={defaultSizes}
        fill={fill}
        className={`
          ${className}
          ${isLoading ? "blur-sm" : "blur-0"}
          transition-all duration-300
        `}
        style={
          fill
            ? {
                objectFit,
                objectPosition,
              }
            : undefined
        }
        quality={85}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoadingComplete={handleLoadingComplete}
      />
    </div>
  );
}

/**
 * Responsive Picture Component
 * Uses native <picture> element for multiple image formats (WebP, JPEG)
 */
interface ResponsivePictureProps {
  webpSrc: string;
  jpegSrc: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  lazy?: boolean;
}

export function ResponsivePicture({
  webpSrc,
  jpegSrc,
  alt,
  width,
  height,
  className = "",
  lazy = true,
}: ResponsivePictureProps) {
  const srcSet = generateImageSrcSet(webpSrc);

  return (
    <picture>
      <source srcSet={srcSet} type="image/webp" />
      <img
        src={jpegSrc}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? "lazy" : "eager"}
        className={`w-full h-auto ${className}`}
        style={{
          aspectRatio: `${width} / ${height}`,
        }}
      />
    </picture>
  );
}

/**
 * Image Gallery Component
 * Optimized for multiple images with lazy loading
 */
interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: number;
  gap?: string;
  className?: string;
}

export function ImageGallery({
  images,
  columns = 3,
  gap = "1rem",
  className = "",
}: ImageGalleryProps) {
  return (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(300px, 1fr))`,
        gap,
      }}
    >
      {images.map((image, index) => (
        <div
          key={image.id}
          className="relative overflow-hidden rounded-lg bg-gray-200"
        >
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            priority={index < 3} // Prioritize first 3 images
            className="w-full h-full"
            fill
            objectFit="cover"
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Hero Image Component
 * Optimized hero image with multiple breakpoints
 */
interface HeroImageProps {
  src: string;
  alt: string;
  height?: number;
  blurDataURL?: string;
}

export function HeroImage({
  src,
  alt,
  height = 600,
  blurDataURL,
}: HeroImageProps) {
  return (
    <div
      className="relative w-full overflow-hidden bg-gray-200"
      style={{ height }}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority
        objectFit="cover"
        objectPosition="center"
        sizes="100vw"
        blurDataURL={blurDataURL}
        placeholder={blurDataURL ? "blur" : "empty"}
      />
    </div>
  );
}

/**
 * Thumbnail Component
 * Small optimized image for previews
 */
interface ThumbnailProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Thumbnail({
  src,
  alt,
  size = "md",
  className = "",
}: ThumbnailProps) {
  const sizeClass =
    size === "sm" ? "w-16 h-16" : size === "lg" ? "w-32 h-32" : "w-24 h-24";

  return (
    <div
      className={`relative ${sizeClass} overflow-hidden rounded ${className}`}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        objectFit="cover"
        sizes={`${size === "sm" ? 64 : size === "lg" ? 128 : 96}px`}
      />
    </div>
  );
}
