"use client";

import { useEffect } from "react";

interface GuideContentProps {
  content: string[];
}

export function GuideContent({ content }: GuideContentProps) {
  // Smooth scroll to anchor on page load if hash present
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, []);

  return (
    <div className="prose prose-invert prose-lg max-w-none">
      {content.map((paragraph, index) => (
        <div
          key={index}
          id={`section-${index}`}
          className="mb-6 scroll-mt-24"
        >
          <p className="text-gray-300 leading-relaxed">{paragraph}</p>
        </div>
      ))}

      <style jsx global>{`
        .prose {
          color: #d1d5db;
        }
        
        .prose p {
          margin-bottom: 1.5rem;
          line-height: 1.75;
        }
        
        .prose strong {
          color: #f8fafc;
          font-weight: 600;
        }
        
        .prose code {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          color: #06d6a0;
        }
        
        .prose a {
          color: #06d6a0;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .prose a:hover {
          color: #04b587;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
