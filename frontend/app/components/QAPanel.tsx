'use client';

import React, { useState } from 'react';
import { askQuestion } from '@/lib/api';
import { QAResponse } from '@/types';
import CitationBadge from './CitationBadge';
import { Search, Loader2, Sparkles, Filter } from 'lucide-react';

export default function QAPanel() {
  const [query, setQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QAResponse | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    try {
      const res = await askQuestion(query, marketFilter || undefined);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    "What are the main differences in purchase timelines across countries?",
    "Why is surgeon training considered critical for financial ROI?",
    "How does the UK NHS view ROI differently than Germany?",
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h3 className="text-base font-semibold text-gray-900">
          Cross-Transcript Question Answering
        </h3>
      </div>
      <p className="text-xs text-gray-500">
        Ask any exploratory question. Answers are strictly grounded with ChromaDB vector search and include verifiable timestamps.
      </p>

      {/* Query Form */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Which country expects the highest annual procedure growth rate?"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
          </div>

          <div className="relative flex items-center">
            <Filter className="w-4 h-4 text-gray-400 absolute left-2.5 pointer-events-none" />
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
              className="pl-8 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
            >
              <option value="">All Markets</option>
              <option value="France">France</option>
              <option value="Germany">Germany</option>
              <option value="United Kingdom">United Kingdom</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ask"}
          </button>
        </div>

        {/* Quick Query Suggestions */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-gray-400">Try asking:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQuery(sq)}
              className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition"
            >
              {sq}
            </button>
          ))}
        </div>
      </form>

      {/* Response Box */}
      {result && (
        <div className="mt-5 p-5 bg-gray-50 border border-gray-200 rounded-lg space-y-3 animate-in fade-in duration-200">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500">Grounded Answer</h4>
          <p className="text-sm text-gray-800 leading-relaxed">{result.answer}</p>

          {result.citations && result.citations.length > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <span className="text-xs font-semibold text-gray-500 block mb-1.5">
                Exact Source References:
              </span>
              <div className="flex flex-wrap gap-1">
                {result.citations.map((c, i) => (
                  <CitationBadge key={i} citation={c} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}