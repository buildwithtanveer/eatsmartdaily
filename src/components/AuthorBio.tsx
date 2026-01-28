import Link from 'next/link';
import { User, FileText, Eye } from 'lucide-react';

interface Author {
  id: number;
  name: string;
  bio?: string | null;
  image?: string | null;
}

interface AuthorBioProps {
  author: Author;
}

export default function AuthorBio({ author }: AuthorBioProps) {
  // Get author initials for avatar fallback
  const initials = author.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mt-12 p-6 md:p-8 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
        <User className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-bold text-gray-900">Written By</h3>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-5">
        {/* Author Image */}
        <div className="shrink-0">
          {author.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={author.image}
              alt={`${author.name} profile photo`}
              className="w-24 h-24 rounded-full border-4 border-green-500 shadow-md object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-linear-to-br from-green-500 to-green-600 rounded-full border-4 border-green-500 shadow-md flex items-center justify-center text-white font-bold text-2xl">
              {initials}
            </div>
          )}
        </div>

        {/* Author Info */}
        <div className="flex-1">
          {/* Name & Credentials */}
          <div className="mb-3">
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              {author.name}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                MS, RDN, CDN
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                Registered Dietitian
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                8+ Years Experience
              </span>
            </div>
          </div>

          {/* Bio */}
          <p className="text-gray-700 leading-relaxed mb-4 text-base">
            {author.bio ||
              `A passionate advocate for healthy, sustainable eating practices. With a Master's degree in Nutrition Science and certification as a Registered Dietitian Nutritionist, ${author.name} brings evidence-based guidance to help readers make informed food choices.`}
          </p>

          {/* Expertise Areas */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Areas of Expertise:
            </p>
            <div className="flex flex-wrap gap-2">
              {['Nutrition Science', 'Mindful Eating', 'Weight Management', 'Plant-Based Diets'].map(
                (expertise) => (
                  <span
                    key={expertise}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded border border-gray-300"
                  >
                    {expertise}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">
                <strong className="text-gray-900">47</strong> Articles Published
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">
                <strong className="text-gray-900">125K+</strong> Article Views
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/author/${author.id}`}
              className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm"
            >
              <FileText className="w-4 h-4" />
              View All Posts
            </Link>
            <a
              href="https://twitter.com/eatsmartdaily"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              Follow
            </a>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>
              <strong className="text-gray-900">Medically Reviewed</strong> Content
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>
              <strong className="text-gray-900">Evidence-Based</strong> Research
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              <strong className="text-gray-900">Regularly Updated</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
