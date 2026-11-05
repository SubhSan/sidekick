import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Type, Minus, Plus, Clock, BookOpen } from 'lucide-react';


interface ArticleData {
  title: string;
  content: string;
  textContent: string;
  length: number;
  sourceUrl: string;
}

export default function App() {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans-serif'>('serif');
  const [fontSize, setFontSize] = useState(18);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get article data from URL params -> storage slot
    const params = new URLSearchParams(location.search);
    const slot = params.get('slot');
    if (!slot) {
      setError('No article slot specified');
      setLoading(false);
      return;
    }

    chrome.storage.local.get(slot, (result) => {
      const data = result[slot];
      if (data) {
        setArticle(data as ArticleData);
      } else {
        setError('Article not found. It may have been cleared.');
      }
      setLoading(false);
    });
  }, []);

  const readingTime = useMemo(() => {
    if (!article) return 0;
    const words = article.textContent.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [article]);

  const wordCount = useMemo(() => {
    if (!article) return 0;
    return article.textContent.split(/\s+/).length;
  }, [article]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg, #0f111a)', color: 'var(--fg, #e2e8f0)',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <BookOpen size={32} style={{ opacity: 0.4, marginBottom: 12 }} />
          <p style={{ opacity: 0.5, fontSize: 14 }}>Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg, #0f111a)', color: 'var(--fg, #e2e8f0)',
        fontFamily: 'system-ui, sans-serif', gap: 16,
      }}>
        <BookOpen size={32} style={{ opacity: 0.4 }} />
        <p style={{ opacity: 0.6, fontSize: 14 }}>{error || 'No article found'}</p>
        <button
          onClick={() => history.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 8, padding: '8px 16px', color: '#a5b4fc',
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}
        >
          <ArrowLeft size={14} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg, #0f111a)',
      color: 'var(--fg, #e2e8f0)',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Top toolbar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 24px',
        background: 'rgba(15,17,26,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        {/* Back button */}
        <button
          onClick={() => {
            if (article.sourceUrl) {
              location.href = article.sourceUrl;
            } else {
              history.back();
            }
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer', fontSize: 12, fontWeight: 500, padding: '4px 8px',
            borderRadius: 6, transition: 'background 200ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <ArrowLeft size={14} />
          Return to page
        </button>

        <div style={{ flex: 1 }} />

        {/* Font selector */}
        <button
          onClick={() => setFontFamily(f => f === 'serif' ? 'sans-serif' : 'serif')}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6, padding: '4px 10px', color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer', fontSize: 11, fontWeight: 500,
          }}
        >
          <Type size={13} />
          {fontFamily === 'serif' ? 'Serif' : 'Sans'}
        </button>

        {/* Font size */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => setFontSize(s => Math.max(14, s - 1))}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 26, height: 26, borderRadius: 6,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
            }}
          >
            <Minus size={12} />
          </button>
          <span style={{ fontSize: 11, opacity: 0.5, width: 28, textAlign: 'center' }}>{fontSize}</span>
          <button
            onClick={() => setFontSize(s => Math.min(28, s + 1))}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 26, height: 26, borderRadius: 6,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
            }}
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Article content */}
      <article style={{
        maxWidth: 680, margin: '0 auto',
        padding: '48px 24px 80px',
      }}>
        {/* Meta */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 24, fontSize: 12, opacity: 0.45,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} /> {readingTime} min read
          </span>
          <span>•</span>
          <span>{wordCount.toLocaleString()} words</span>
          {article.sourceUrl && (
            <>
              <span>•</span>
              <a
                href={article.sourceUrl}
                style={{ color: '#a5b4fc', textDecoration: 'none' }}
                target="_blank" rel="noreferrer"
              >
                {new URL(article.sourceUrl).hostname}
              </a>
            </>
          )}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: Math.round(fontSize * 1.8),
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: 32,
          fontFamily: fontFamily === 'serif' ? 'Georgia, "Times New Roman", serif' : 'system-ui, sans-serif',
        }}>
          {article.title}
        </h1>

        {/* Body */}
        <div
          dangerouslySetInnerHTML={{ __html: article.content }}
          style={{
            fontSize,
            lineHeight: 1.75,
            fontFamily: fontFamily === 'serif' ? 'Georgia, "Times New Roman", serif' : 'system-ui, sans-serif',
            color: 'rgba(255,255,255,0.82)',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}
          className="sk-reader-content"
        />
      </article>

      {/* Reader content styles */}
      <style>{`
        .sk-reader-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }
        .sk-reader-content a {
          color: #818cf8;
          text-decoration: underline;
          text-decoration-color: rgba(129,140,248,0.3);
          text-underline-offset: 2px;
        }
        .sk-reader-content a:hover {
          text-decoration-color: rgba(129,140,248,0.7);
        }
        .sk-reader-content h2, .sk-reader-content h3, .sk-reader-content h4 {
          margin-top: 32px;
          margin-bottom: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
        }
        .sk-reader-content h2 { font-size: 1.5em; }
        .sk-reader-content h3 { font-size: 1.25em; }
        .sk-reader-content p {
          margin-bottom: 16px;
        }
        .sk-reader-content blockquote {
          border-left: 3px solid rgba(99,102,241,0.4);
          padding-left: 16px;
          margin: 16px 0;
          color: rgba(255,255,255,0.65);
          font-style: italic;
        }
        .sk-reader-content pre, .sk-reader-content code {
          background: rgba(255,255,255,0.05);
          border-radius: 6px;
          font-size: 0.9em;
        }
        .sk-reader-content pre {
          padding: 16px;
          overflow-x: auto;
          margin: 16px 0;
        }
        .sk-reader-content code {
          padding: 2px 6px;
        }
        .sk-reader-content ul, .sk-reader-content ol {
          padding-left: 24px;
          margin-bottom: 16px;
        }
        .sk-reader-content li {
          margin-bottom: 6px;
        }
        .sk-reader-content figure {
          margin: 24px 0;
          text-align: center;
        }
        .sk-reader-content figcaption {
          font-size: 0.85em;
          color: rgba(255,255,255,0.4);
          margin-top: 8px;
        }
        .sk-reader-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }
        .sk-reader-content th, .sk-reader-content td {
          border: 1px solid rgba(255,255,255,0.1);
          padding: 8px 12px;
          text-align: left;
        }
        .sk-reader-content th {
          background: rgba(255,255,255,0.05);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
