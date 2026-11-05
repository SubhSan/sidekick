import React from 'react';
import { Sparkles } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0c16] text-[#f0f0f0] font-sans">
      <div className="flex flex-col items-center gap-4 max-w-md text-center p-8 rounded-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Sparkles size={48} className="text-indigo-400" />
        <h1 className="text-2xl font-bold tracking-tight mt-2">Sidekick Settings</h1>
        <p className="text-sm opacity-60 leading-relaxed">
          Sidekick's settings are managed directly from the extension popup in your browser toolbar.
        </p>
        <button 
          onClick={() => window.close()}
          className="mt-4 px-6 py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-sm font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
