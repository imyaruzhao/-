import React, { useState } from 'react';
import { ResearchResult, ReportSection } from '../types';

// Enhanced Markdown Renderer to handle Badges
const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  // Regex to match [Source Name](URL)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  const renderLine = (line: string, lineIdx: number) => {
    // Split by links to render badges safely
    const parts = [];
    let lastIndex = 0;
    let match;

    // Reset regex state
    linkRegex.lastIndex = 0;

    while ((match = linkRegex.exec(line)) !== null) {
      // Push text before link
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} dangerouslySetInnerHTML={{ __html: formatBold(line.substring(lastIndex, match.index)) }} />
        );
      }
      
      // Push Badge Link
      parts.push(
        <a 
          key={`link-${match.index}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center mx-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-lark-100 text-lark-600 hover:bg-lark-200 hover:text-lark-800 transition-colors align-middle transform -translate-y-0.5 border border-lark-200 no-underline"
          title={`Source: ${match[1]}`}
          onClick={(e) => e.stopPropagation()} 
        >
          {match[1].length > 15 ? match[1].substring(0, 12) + '...' : match[1]}
          <svg className="w-2.5 h-2.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>
      );

      lastIndex = linkRegex.lastIndex;
    }

    // Push remaining text
    if (lastIndex < line.length) {
      parts.push(
        <span key={`text-end`} dangerouslySetInnerHTML={{ __html: formatBold(line.substring(lastIndex)) }} />
      );
    }

    return parts;
  };

  const lines = content.split('\n');
  return (
    <div className="space-y-3 text-gray-700 leading-relaxed text-sm sm:text-base">
      {lines.map((line, idx) => {
        const cleanLine = line.trim();
        if (!cleanLine) return <div key={idx} className="h-1"></div>;
        
        if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start group">
              <span className="mr-3 mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-lark-400 group-hover:bg-lark-600 transition-colors"></span>
              <div className="flex-1">{renderLine(cleanLine.substring(2), idx)}</div>
            </div>
          );
        }
        
        if (cleanLine.match(/^\d+\./)) {
           const dotIndex = cleanLine.indexOf('.');
           return (
            <div key={idx} className="flex items-start">
              <span className="mr-2 font-bold text-gray-900">{cleanLine.substring(0, dotIndex + 1)}</span>
              <div className="flex-1">{renderLine(cleanLine.substring(dotIndex + 1), idx)}</div>
            </div>
          );
        }

        return <div key={idx}>{renderLine(cleanLine, idx)}</div>;
      })}
    </div>
  );
};

const formatBold = (text: string) => {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
};

const SectionCard: React.FC<{ section: ReportSection, index: number }> = ({ section, index }) => {
  return (
    <div 
      className={`rounded-2xl p-6 md:p-8 border shadow-sm transition-all duration-500 hover:shadow-md ${section.color} bg-opacity-30 bg-white`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center mb-6 pb-4 border-b border-black/5">
        <div className="text-3xl mr-4 p-2 bg-white rounded-xl shadow-sm">{section.icon}</div>
        <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
      </div>
      <div className="prose prose-blue max-w-none">
        <MarkdownContent content={section.content} />
      </div>
    </div>
  );
};

interface ResultViewProps {
  data: ResearchResult;
  formData: { country: string; industry: string[]; query: string };
  onNewSearch: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ data, formData, onNewSearch }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-4xl mx-auto animate-slide-up pb-20">
      
      {/* Summary Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-lark-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex flex-col gap-4 mb-2">
            <div className="flex justify-between items-start">
               <div>
                 <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2">
                   <span className="px-2 py-0.5 bg-lark-50 text-lark-700 rounded font-medium border border-lark-100">{formData.country}</span>
                   {formData.industry.map(ind => (
                     <span key={ind} className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">{ind.split(' ')[0]}</span>
                   ))}
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 leading-tight">{formData.query}</h2>
               </div>
            </div>
            
            <div className="flex gap-3 mt-2">
              <button 
                onClick={onNewSearch}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                新调研
              </button>
              
              <button 
                onClick={handleCopy}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center border ${copied ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    已复制
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                    一键复制报告
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Single Column Stack Layout */}
      <div className="space-y-6 mb-8">
        {data.sections.map((section, idx) => (
           <div key={section.id} className="animate-slide-up">
             <SectionCard section={section} index={idx} />
           </div>
        ))}
      </div>

      {/* Footer Sources */}
      {data.sources.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            完整参考来源 (Full Reference List)
          </h4>
          <div className="flex flex-col space-y-2">
            {data.sources.map((source, idx) => (
              <a 
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start text-sm text-lark-600 hover:text-lark-800 hover:underline"
              >
                <span className="mr-2 text-gray-400">[{idx + 1}]</span>
                <span className="break-all">{source.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};