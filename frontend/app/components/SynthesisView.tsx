'use client';

import React from 'react';
import { CrossExpertSynthesis } from '@/types';
import { CheckCircle2, AlertTriangle, Quote } from 'lucide-react';

interface Props {
  synthesis: CrossExpertSynthesis | null;
}

export default function SynthesisView({ synthesis }: Props) {
  // Support both possible schema key names
  const rawThemes = (synthesis as any)?.common_themes || (synthesis as any)?.agreements || [];
  const rawDisagreements = (synthesis as any)?.disagreements || [];

  if (!synthesis || (rawThemes.length === 0 && rawDisagreements.length === 0)) {
    return (
      <div className="p-12 text-center bg-white border border-gray-200 rounded-xl shadow-xs">
        <p className="text-sm text-gray-500">
          Upload at least two transcripts to automatically generate cross-expert consensus and divergences.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Common Themes */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-semibold text-gray-900">
            Agreements & Common Themes
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rawThemes.map((theme: any, idx: number) => {
            const citations = theme.supporting_citations || theme.citations || [];
            return (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1.5">{theme.topic}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">{theme.finding}</p>
                </div>
                {citations.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
                    {citations.map((c: any, cIdx: number) => (
                      <span
                        key={cIdx}
                        title={`"${c.quote}" — ${c.speaker} (${c.market})`}
                        className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded cursor-help font-mono"
                      >
                        <Quote className="w-2.5 h-2.5" />
                        [{c.timestamp}] {c.market}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Disagreements */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-semibold text-gray-900">
            Market Divergences & Contrasting Dynamics
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rawDisagreements.map((item: any, idx: number) => {
            const citations = item.supporting_citations || item.citations || [];
            return (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 mb-1.5">{item.topic}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">{item.finding}</p>
                </div>
                {citations.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
                    {citations.map((c: any, cIdx: number) => (
                      <span
                        key={cIdx}
                        title={`"${c.quote}" — ${c.speaker} (${c.market})`}
                        className="inline-flex items-center gap-1 text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded cursor-help font-mono"
                      >
                        <Quote className="w-2.5 h-2.5" />
                        [{c.timestamp}] {c.market}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}