"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface PostFAQProps {
  faqs: FAQItem[];
}

export default function PostFAQ({ faqs }: PostFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <HelpCircle className="text-green-600" size={24} />
        Frequently Asked Questions
      </h3>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs hover:border-gray-300 transition-colors"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left group transition-colors"
            >
              <span className="font-bold text-gray-800 group-hover:text-green-700 transition-colors pr-4">
                {faq.question}
              </span>
              <div className={`shrink-0 text-gray-400 group-hover:text-green-600 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                <ChevronDown size={20} />
              </div>
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-4 pt-0 text-gray-600 leading-relaxed border-t border-gray-50 bg-gray-50/30">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
