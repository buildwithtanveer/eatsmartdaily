import Link from "next/link";
import Image from "next/image";

interface Post {
  id: number;
  title: string;
  slug: string;
  featuredImage: string | null;
}

export default function FeaturedSlider({ posts }: { posts: Post[] }) {
  return (
    <section className="mb-10">
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article
            key={post.id}
            className="relative rounded-xl overflow-hidden group"
          >
            <Image
              src={post.featuredImage || "/globe.svg"}
              alt={post.title}
              width={600}
              height={400}
              className="object-cover w-full h-64 group-hover:scale-105 transition"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
            <h2 className="absolute bottom-4 left-4 text-white text-xl font-bold">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
          </article>
        ))}
      </div>
    </section>
  );
}
