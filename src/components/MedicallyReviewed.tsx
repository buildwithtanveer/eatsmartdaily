import { ShieldCheck } from 'lucide-react';

interface Reviewer {
  id: number;
  name: string;
  bio?: string | null;
}

interface MedicallyReviewedProps {
  reviewer: Reviewer;
  reviewedDate: Date;
}

export default function MedicallyReviewed({ reviewer, reviewedDate }: MedicallyReviewedProps) {
  return (
    <div className="mt-8 p-6 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shrink-0">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Medically Reviewed</h3>
          <p className="text-sm text-gray-600">
            Verified by healthcare professionals
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-green-200">
        <p className="text-gray-700 leading-relaxed mb-3">
          This article was medically reviewed by{' '}
          <strong className="text-gray-900">{reviewer.name}, RDN</strong>, a
          board-certified registered dietitian nutritionist with expertise in
          clinical nutrition and evidence-based dietary guidance.
        </p>

        {reviewer.bio && (
          <p className="text-sm text-gray-600 mb-3">{reviewer.bio}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <strong className="text-gray-900">Last reviewed:</strong>{' '}
            {reviewedDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <a
            href="/about#editorial-policy"
            className="text-sm text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1 transition"
          >
            Learn about our review process
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-green-200 text-sm">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-700">
            <strong className="text-gray-900">Fact-Checked</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-green-200 text-sm">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-gray-700">
            <strong className="text-gray-900">Evidence-Based</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-green-200 text-sm">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-700">
            <strong className="text-gray-900">Regularly Updated</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
