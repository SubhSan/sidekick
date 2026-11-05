import React, { useState, useEffect } from 'react';
import { store } from '../lib/storage';

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [slide, setSlide] = useState(0);
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [keyStatus, setKeyStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');

  useEffect(() => {
    store.settings.getValue().then((settings) => {
      if (!settings.onboardingDone) setShow(true);
    });
  }, []);

  if (!show) return null;

  const handleNext = () => setSlide(s => Math.min(3, s + 1));
  const handlePrev = () => setSlide(s => Math.max(0, s - 1));

  const completeOnboarding = async () => {
    const settings = await store.settings.getValue();
    await store.settings.setValue({ ...settings, name: name.trim(), onboardingDone: true });
    if (apiKey.trim()) {
      await store.groqKey.setValue(apiKey.trim());
      await store.settings.setValue({ ...settings, aiMode: true, name: name.trim(), onboardingDone: true });
    }
    setShow(false);
  };

  const testKey = async () => {
    setKeyStatus('testing');
    // Stub implementation for key validation during onboarding
    setTimeout(() => {
      if (apiKey.trim().length > 10) setKeyStatus('valid');
      else setKeyStatus('invalid');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
        <div className="p-8 flex-1 min-h-[300px] flex flex-col justify-center">
          {slide === 0 && (
            <div className="text-center animate-[sk-panel-in_0.3s_ease-out]">
              <h2 className="text-3xl font-bold mb-4 text-[var(--fg)]">Welcome to Sidekick</h2>
              <p className="text-[var(--muted)] mb-6">Let's set up your personal dashboard.</p>
              <input
                type="text"
                placeholder="What should I call you?"
                className="w-full bg-[var(--glass-bg)] border border-[var(--border)] rounded-lg px-4 py-3 text-center text-lg text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                autoFocus
              />
            </div>
          )}

          {slide === 1 && (
            <div className="text-center animate-[sk-panel-in_0.3s_ease-out]">
              <h2 className="text-3xl font-bold mb-4 text-[var(--fg)]">Feature Tour</h2>
              <div className="text-left space-y-4 text-[var(--muted)]">
                <p>✨ <b>AI Integrated:</b> Tag, summarize, and understand the web.</p>
                <p>🎯 <b>Focus Mode:</b> Block distractions and stay on task.</p>
                <p>📂 <b>Tab Manager:</b> Group and deduplicate tabs with ease.</p>
                <p>🌦️ <b>Beautiful UI:</b> Procedural wallpapers and weather.</p>
              </div>
            </div>
          )}

          {slide === 2 && (
            <div className="text-center animate-[sk-panel-in_0.3s_ease-out]">
              <h2 className="text-3xl font-bold mb-4 text-[var(--fg)]">AI Intelligence</h2>
              <p className="text-[var(--muted)] mb-6 text-sm">Bring Your Own Key (BYOK) for Groq to enable AI features. It's free and fast.</p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="gsk_..."
                  className="flex-1 bg-[var(--glass-bg)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--fg)] outline-none focus:border-[var(--accent)] transition-colors"
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); setKeyStatus('idle'); }}
                />
                <button 
                  onClick={testKey} 
                  disabled={!apiKey || keyStatus === 'testing'}
                  className="px-4 py-2 bg-[var(--glass-bg)] border border-[var(--border)] rounded-lg text-[var(--fg)] hover:bg-[var(--border)] disabled:opacity-50"
                >
                  {keyStatus === 'testing' ? '...' : keyStatus === 'valid' ? '✓' : 'Test'}
                </button>
              </div>
              {keyStatus === 'invalid' && <p className="text-red-400 mt-2 text-sm">Invalid key</p>}
              {keyStatus === 'valid' && <p className="text-green-400 mt-2 text-sm">Key looks good!</p>}
              <p className="text-xs text-[var(--muted)] mt-4">You can skip this and add it in Settings later.</p>
            </div>
          )}

          {slide === 3 && (
            <div className="text-center animate-[sk-panel-in_0.3s_ease-out]">
              <h2 className="text-3xl font-bold mb-4 text-[var(--fg)]">Privacy Promise</h2>
              <p className="text-[var(--muted)] mb-6">
                Your data stays exactly where it belongs: on your machine.
                Sidekick runs entirely locally (except for API calls you explicitly authorize).
              </p>
              <button 
                onClick={completeOnboarding}
                className="w-full py-3 px-6 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg font-medium transition-colors"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        <div className="bg-[var(--glass-bg)] border-t border-[var(--border)] p-4 flex items-center justify-between">
          <button 
            onClick={handlePrev} 
            className={`px-4 py-2 text-[var(--muted)] hover:text-[var(--fg)] transition-colors ${slide === 0 ? 'invisible' : ''}`}
          >
            Back
          </button>
          
          <div className="flex gap-2">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === slide ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />
            ))}
          </div>
          
          {slide < 3 ? (
            <button 
              onClick={handleNext}
              className="px-4 py-2 bg-[var(--fg)] text-[var(--bg)] rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Next
            </button>
          ) : (
            <div className="w-16" /> /* Placeholder to balance the flex layout */
          )}
        </div>
      </div>
    </div>
  );
}
