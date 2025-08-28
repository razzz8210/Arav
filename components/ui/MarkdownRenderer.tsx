import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div 
      className={`prose prose-sm max-w-none markdown-content ${className}`}
      style={{
        fontSize: '14px',
        lineHeight: '1.6',
        color: 'var(--marketing-strategy-text-primary)'
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Custom styling for different markdown elements
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 mt-6 text-current" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mb-3 mt-6 text-current" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mb-2 mt-4 text-current" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-base font-semibold mb-2 mt-3 text-current" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 text-current leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => <ul className="mb-4 ml-4 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="mb-4 ml-4 space-y-1 list-decimal" {...props} />,
          li: ({ node, ...props }) => <li className="text-current" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-semibold text-current" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-current" {...props} />,
          code: ({ node, inline, ...props }: any) => 
            inline ? (
              <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...props} />
            ) : (
              <code className="block bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono overflow-x-auto" {...props} />
            ),
          pre: ({ node, ...props }) => <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded mb-4 overflow-x-auto" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 mb-4 italic text-gray-700 dark:text-gray-300" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2" {...props} />
          ),
          hr: ({ node, ...props }) => <hr className="my-6 border-t border-gray-300 dark:border-gray-600" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}; 