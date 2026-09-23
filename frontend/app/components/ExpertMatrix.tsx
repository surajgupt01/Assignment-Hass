'use client';

import React, { useState } from 'react';
import { ExpertReport } from '@/types';
import CitationBadge from './CitationBadge';
import { HelpCircle, Stethoscope, Building2, Landmark } from 'lucide-react';

const QUESTIONS = [
  "1. How would you describe current adoption of robotic surgery in your market?",
  "2. What are the main barriers to adoption?",
  "3. How important are hospital budgets and ROI in purchasing decisions?",
  "4. How important are surgeon training and clinical outcomes?",
  "5. What adoption trend do you expect over the next 3–5 years?",
  "6. What is the typical hospital decision-making timeline for purchasing a new robotic system?"
];

export default function ExpertMatrix({ reports }: { reports: ExpertReport[] }) {
  const [selectedQuestion, setSelectedQuestion] = useState<number>(1);

  if (!reports || reports.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
        No transcript reports loaded. Please upload transcripts to see the comparative matrix.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Question Selector Tabs */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-2">
        {QUESTIONS.map((q, idx) => (
          <button
            key={idx + 1}
            onClick={() => setSelectedQuestion(idx + 1)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg text-left transition-all ${
              selectedQuestion === idx + 1
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Q{idx + 1}: {q.split('?')[0].replace(/^\d+\.\s*/, '').slice(0, 32)}...
          </button>
        ))}
      </div>

      {/* Selected Question Header */}
      <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-700">Guide Question {selectedQuestion}</span>
          <h3 className="text-base font-medium text-gray-900 mt-0.5">
            {QUESTIONS[selectedQuestion - 1]}
          </h3>
        </div>
      </div>

      {/* 3-Column Comparative View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((report) => {
          const ansObj = report.answers.find((a) => a.question_id === selectedQuestion);

          return (
            <div
              key={report.market}
              className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between overflow-hidden"
            >
              {/* Expert Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-gray-800 border border-gray-200">
                    {report.market}
                  </span>
                  {report.market === 'France' && <Stethoscope className="w-4 h-4 text-blue-500" />}
                  {report.market === 'Germany' && <Building2 className="w-4 h-4 text-emerald-500" />}
                  {report.market === 'United Kingdom' && <Landmark className="w-4 h-4 text-purple-500" />}
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mt-2">{report.expert_name}</h4>
                <p className="text-xs text-gray-500">{report.role}</p>
              </div>

              {/* Answer Content */}
              <div className="p-5 flex-grow space-y-4">
                <p className="text-sm text-gray-800 leading-relaxed font-normal">
                  {ansObj?.answer || "No response found."}
                </p>

                {/* Grounded Exact Citations */}
                {ansObj?.citations && ansObj.citations.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                      Verified Transcript Citations:
                    </span>
                    <div className="flex flex-wrap">
                      {ansObj.citations.map((c, i) => (
                        <CitationBadge key={i} citation={c} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}