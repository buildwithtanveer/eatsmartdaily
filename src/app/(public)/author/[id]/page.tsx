import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import { notFound } from "next/navigation";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import { Metadata } from "next";
import { getAuthorById } from "@/lib/data";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const authorId = parseInt(params.id);

  if (isNaN(authorId)) {
    return {
      title: "Author Not Found",
    };
  }

  const author = await getAuthorById(authorId);

  if (!author) {
    return {
      title: "Author Not Found",
    };
  }

  return {
    title: `${author.name} | Author at Eat Smart Daily`,
    description: author.bio || `Read articles by ${author.name} on Eat Smart Daily.`,
    alternates: {
      canonical: `https://eatsmartdaily.com/author/${params.id}`,
    },
    openGraph: {
      title: `${author.name} | Author at Eat Smart Daily`,
      description: author.bio || `Read articles by ${author.name} on Eat Smart Daily.`,
      images: author.image ? [{ url: author.image }] : [],
      type: "profile",
    },
  };
}

export default async function AuthorPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const authorId = parseInt(params.id);

  if (isNaN(authorId)) {
    return notFound();
  }

  const author = await getAuthorById(authorId);

  if (!author) {
    return notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    jobTitle: author.jobTitle || "Author at Eat Smart Daily",
    url: `https://eatsmartdaily.com/author/${author.id}`,
    image: author.image || "https://eatsmartdaily.com/logo.svg",
    description: author.bio,
    sameAs: [
      author.socialFacebook,
      author.socialTwitter,
      author.socialLinkedin,
      author.socialInstagram
    ].filter(Boolean)
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* LEFT CONTENT COLUMN */}
      <div className="lg:col-span-8">
        
        {/* Author Bio Box */}
        <div className="bg-gray-50 p-6 rounded-lg border mb-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
           <div className="w-24 h-24 relative rounded-full overflow-hidden shrink-0 bg-gray-200 border-2 border-white shadow">
              {author.image ? (
                <Image src={author.image} alt={author.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-orange-500 flex items-center justify-center text-4xl font-bold text-white">
                  {author.name?.[0] || "A"}
                </div>
              )}
           </div>
           <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {author.name}
                {author.credentials && <span className="text-sm font-normal text-gray-500 ml-2">({author.credentials})</span>}
              </h1>
              <p className="text-[#568c2c] font-medium text-sm mb-3">
                 {author.jobTitle || "Author at Eat Smart Daily"}
              </p>
              <p className="text-gray-700 mb-4">
                 {author.bio || "Passionate about healthy living, nutrition, and delicious food. Sharing tips and recipes to help you live your best life."}
              </p>
              
              {/* Social Links */}
              <div className="flex items-center justify-center md:justify-start gap-3">
                {author.socialFacebook && (
                  <a href={author.socialFacebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1877F2]">
                    <FaFacebook size={18} />
                  </a>
                )}
                {author.socialTwitter && (
                  <a href={author.socialTwitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1DA1F2]">
                    <FaTwitter size={18} />
                  </a>
                )}
                {author.socialLinkedin && (
                  <a href={author.socialLinkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0A66C2]">
                    <FaLinkedin size={18} />
                  </a>
                )}
                {author.socialInstagram && (
                  <a href={author.socialInstagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#E1306C]">
                    <FaInstagram size={18} />
                  </a>
                )}
              </div>
           </div>
        </div>

        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2 uppercase">
          Posts by <span className="text-[#568c2c]">{author.name}</span>
        </h2>

        {author.posts.length === 0 ? (
          <p className="text-gray-600 italic">This author hasn&apos;t published any posts yet.</p>
        ) : (
          <div className="space-y-8">
            {author.posts.map((post) => (
              <div key={post.id} className="flex flex-col md:flex-row gap-6 group">
                {/* Thumbnail */}
                <div className="w-full md:w-1/3 h-52 md:h-44 relative rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={post.featuredImage || "/logo.svg"}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-green-700 transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="text-gray-600 text-base leading-relaxed line-clamp-2 mb-3">
                    {post.metaDescription || post.content.substring(0, 150)}...
                  </p>
                  <div className="flex items-center text-xs text-gray-500 gap-3 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-[9px] font-bold text-gray-600">
                        {author.name?.[0] || "A"}
                      </span>
                      {author.name || "Admin"}
                    </span>
                    <span>•</span>
                    <span>{post.updatedAt.toLocaleDateString("en-US")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR COLUMN */}
      <div className="lg:col-span-4">
        <div className="sticky top-6">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
