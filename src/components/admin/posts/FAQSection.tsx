"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  setFaqs: (faqs: FAQItem[]) => void;
}

export default function FAQSection({ faqs, setFaqs }: FAQSectionProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>
          <h3 className="font-bold text-gray-900">FAQ Section</h3>
        </div>
        <button
          type="button"
          onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
          className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
        >
          <Plus size={16} />
          Add Question
        </button>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100 relative group">
            <button
              type="button"
              onClick={() => setFaqs(faqs.filter((_, i) => i !== index))}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={16} />
            </button>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Question</label>
                <input
                  value={faq.question}
                  onChange={(e) => {
                    const newFaqs = [...faqs];
                    newFaqs[index].question = e.target.value;
                    setFaqs(newFaqs);
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden text-sm"
                  placeholder="e.g. Is this recipe vegan?"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Answer</label>
                <textarea
                  value={faq.answer}
                  onChange={(e) => {
                    const newFaqs = [...faqs];
                    newFaqs[index].answer = e.target.value;
                    setFaqs(newFaqs);
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black/5 focus:border-black outline-hidden text-sm min-h-[80px]"
                  placeholder="Provide a clear answer..."
                />
              </div>
            </div>
          </div>
        ))}
        {faqs.length === 0 && (
          <p className="text-center py-4 text-sm text-gray-400 italic">No FAQ items added yet.</p>
        )}
      </div>
    </div>
  );
}