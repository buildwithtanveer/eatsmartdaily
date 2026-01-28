'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, List } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeId, setActiveId] = useState<string>('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Extract headings from article
    const extractHeadings = () => {
      const articleHeadings = Array.from(
        document.querySelectorAll('.post-content h2, .post-content h3')
      ).map((heading, index) => {
        const id = heading.id || `heading-${index}`;
        if (!heading.id) heading.id = id;
        
        return {
          id,
          text: heading.textContent || '',
          level: parseInt(heading.tagName.charAt(1)),
        };
      });

      setHeadings(articleHeadings);
    };

    // Wait for content to render
    setTimeout(extractHeadings, 100);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    // Intersection Observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px',
        threshold: 0.5,
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  useEffect(() => {
    // Reading progress
    const updateProgress = () => {
      const article = document.querySelector('.post-content') as HTMLElement;
      if (!article) return;

      const articleTop = article.getBoundingClientRect().top + window.pageYOffset;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrolled = window.pageYOffset - articleTop + windowHeight;
      const progressPercent = Math.min(
        Math.max((scrolled / articleHeight) * 100, 0),
        100
      );

      setProgress(progressPercent);
    };

    window.addEventListener('scroll', updateProgress);
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (headings.length === 0) return null;

  return (
    <div className="my-8 bg-linear-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg shadow-sm overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-5 hover:bg-blue-100 transition"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
            <List className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900">Table of Contents</h3>
            <p className="text-xs text-gray-600">Jump to any section</p>
          </div>
        </div>
        <div className="p-2 hover:bg-blue-200 rounded-full transition">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-blue-700" />
          ) : (
            <ChevronDown className="w-5 h-5 text-blue-700" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-5 pb-5">
          <ol className="space-y-2">
            {headings.map((heading, index) => (
              <li
                key={heading.id}
                className={heading.level === 3 ? 'ml-6' : ''}
              >
                <button
                  onClick={() => scrollToHeading(heading.id)}
                  className={`
                    w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm
                    ${
                      activeId === heading.id
                        ? 'bg-blue-500 text-white font-semibold shadow-md'
                        : 'text-blue-700 hover:bg-blue-100 hover:text-blue-900'
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`
                        shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${
                          activeId === heading.id
                            ? 'bg-white text-blue-500'
                            : 'bg-blue-200 text-blue-700'
                        }
                      `}
                    >
                      {index + 1}
                    </span>
                    <span className="flex-1">{heading.text}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Reading Progress */}
      <div className="bg-blue-100 px-5 py-3 border-t border-blue-200">
        <div className="flex items-center justify-between mb-2 text-xs text-blue-700">
          <span className="font-medium">Reading Progress</span>
          <span className="font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-linear-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
