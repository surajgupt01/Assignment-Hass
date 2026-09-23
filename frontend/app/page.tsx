'use client';

import React, { useState, useEffect } from 'react';
import { fetchReports, fetchSynthesis } from '@/lib/api';
import { ExpertReport, CrossExpertSynthesis } from '@/types';
import ExpertMatrix from './components/ExpertMatrix';
import SynthesisView from './components/SynthesisView';
import QAPanel from './components/QAPanel';
import { LayoutDashboard, GitCompare, MessageSquare } from 'lucide-react';

export default function Home() {
  const [reports, setReports] = useState<ExpertReport[]>([]);
  const [synthesis, setSynthesis] = useState<CrossExpertSynthesis | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'synthesis' | 'qa'>('matrix');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rData, sData] = await Promise.all([fetchReports(), fetchSynthesis()]);
      setReports(rData);
      setSynthesis(sData);
    } catch (e) {
      console.error('Failed to load project state', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded">
                Hasamex AI
              </span>
              <h1 className="text-lg font-bold text-gray-900">
                Robotic Surgery Market – Expert Call Intelligence
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Multi-expert interview analysis across France, Germany, and the United Kingdom
            </p>
          </div>
          <button
            onClick={loadData}
            className="text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md font-medium transition"
          >
            Refresh Data
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-6 text-sm font-medium border-t border-gray-100">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'matrix'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Interview Guide Matrix (Q1–Q6)
          </button>
          <button
            onClick={() => setActiveTab('synthesis')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'synthesis'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            Common Themes & Disagreements
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'qa'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Cross-Transcript Q&A
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading transcript analysis...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'matrix' && <ExpertMatrix reports={reports} />}
            {activeTab === 'synthesis' && <SynthesisView synthesis={synthesis} />}
            {activeTab === 'qa' && <QAPanel />}
          </div>
        )}
      </main>
    </div>
  );
}