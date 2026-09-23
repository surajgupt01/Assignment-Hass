'use client';

import React, { useState } from 'react';
import { QuoteCitation } from '@/types';
import { Clock, MessageSquareQuote } from 'lucide-react';

export default function CitationBadge({ citation }: { citation: QuoteCitation }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block my-1 mr-2">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
      >
        <Clock className="w-3 h-3 text-indigo-500" />
        <span>{citation.timestamp}</span>
        <span className="text-gray-400">|</span>
        <span className="font-semibold text-gray-700">{citation.speaker}</span>
      </button>

      {showTooltip && (
        <div className="absolute z-30 bottom-full left-0 mb-2 w-72 p-3 bg-gray-900 text-white rounded-lg shadow-xl text-xs space-y-1.5 border border-gray-700 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5 text-indigo-300 font-medium">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Verbatim Quote ({citation.market})</span>
          </div>
          <p className="italic text-gray-200 leading-relaxed font-serif">
            `${citation.quote}`
          </p>
          <div className="text-[10px] text-gray-400 border-t border-gray-700 pt-1">
            Timestamp: {citation.timestamp} • {citation.speaker}
          </div>
        </div>
      )}
    </div>
  );
}