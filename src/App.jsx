import React, { useState, useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';
import heroBg from './assets/hero_bg.png';
import {
  BrainCircuit, Layers, Calculator, ShieldAlert, TestTube,
  Sparkles, Copy, Check, RefreshCw, Download, Code2,
  CheckCircle2, AlertTriangle, FileText, Play, Clock,
  Users, DollarSign, Box, Zap, ChevronRight, Server,
  FileCode, Bug, ShieldCheck, Table, BarChart3, Settings,
  ZoomIn, ZoomOut, RotateCcw, Terminal, Activity, Cpu,
  ArrowRight, Shield, Search, PieChart, GitBranch,
  WifiOff, Menu, X, TrendingUp, Globe
} from 'lucide-react';

// ── Mermaid init ──────────────────────────────────────────────────
try {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    themeVariables: {
      darkMode: true,
      background: '#0C0C0C',
      primaryColor: '#C8F550',
      primaryTextColor: '#F0EBE1',
      primaryBorderColor: '#C8F550',
      lineColor: '#4A4641',
      secondaryColor: '#1C1C1C',
      tertiaryColor: '#141414',
      edgeLabelBackground: '#141414',
      fontFamily: '"JetBrains Mono", monospace',
    }
  });
} catch (e) { console.warn('Mermaid:', e); }

// ── Data ──────────────────────────────────────────────────────────
const PRESETS = {
  foodApp: "Build an online food delivery application where users can browse local restaurants, customize meal orders, track delivery drivers in real-time on a map, pay securely via credit card or UPI, and write driver ratings.",
  ecommerce: "An enterprise e-commerce platform with catalog management, cart checkout with Stripe payment integration, automated order fulfillment webhooks, inventory tracking, and sales analytics reporting.",
  fintech: "A high-frequency algorithmic crypto & equities trading API with multi-signature wallet verification, limit order matching engine, audit logging, and automated compliance risk checks.",
  healthcare: "A HIPAA-compliant telemedicine platform with patient video consultations, encrypted electronic health records (EHR), automated prescription generation, and appointment scheduling calendar.",
  pythonBuggy: `def process_user_payment(account_id, amount, coupon_code=None):\n    if amount <= 0:\n        return {"status": "error", "message": "Invalid amount"}\n    \n    # Vulnerability: Direct unsanitized SQL injection flaw\n    query = f"SELECT balance FROM user_accounts WHERE id = '{account_id}'"\n    user_record = db.execute(query).fetchone()\n    \n    discount = 0.0\n    if coupon_code == "VIP2026":\n        discount = 0.25\n    elif coupon_code == "WELCOME":\n        discount = 0.10\n        \n    final_bill = amount - (amount * discount)\n    # Missing transaction rollback on network failure\n    payment_gateway.charge(account_id, final_bill)\n    db.execute(f"UPDATE user_accounts SET balance = balance - {final_bill} WHERE id = '{account_id}'")\n    return {"status": "success", "billed": final_bill}`
};

const MODULES = [
  { id: 'requirements', num: '01', label: 'Requirements', sub: 'Decomposition & Analysis', icon: FileText },
  { id: 'uml', num: '02', label: 'UML Architect', sub: 'Diagrams & Modeling', icon: Layers },
  { id: 'effort', num: '03', label: 'Effort & Cost', sub: 'COCOMO II Estimation', icon: Calculator },
  { id: 'defects', num: '04', label: 'Security Audit', sub: 'OWASP Vulnerability Scan', icon: Bug },
  { id: 'tests', num: '05', label: 'Test Matrix', sub: 'QA Synthesis & Scripts', icon: TestTube },
];

const TICKER_ITEMS = [
  'Requirements Decomposition', '·', 'UML Architecture Synthesis', '·',
  'COCOMO II Effort Estimation', '·', 'OWASP Security Auditing', '·',
  'QA Test Matrix Generation', '·', 'Defect Prediction', '·',
  'Function Point Analysis', '·', 'Mermaid.js Diagrams', '·',
];

// ── Mermaid Viewer ────────────────────────────────────────────────
const MermaidViewer = ({ chartCode, diagramType }) => {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!chartCode) return;
    (async () => {
      try {
        const id = `mm-${Math.random().toString(36).slice(2, 8)}`;
        const { svg: rendered } = await mermaid.render(id, chartCode);
        if (alive) { setSvg(rendered); setError(null); }
      } catch (e) {
        if (alive) setError(e.message || 'Syntax error');
      }
    })();
    return () => { alive = false; };
  }, [chartCode]);

  const copy = () => {
    navigator.clipboard.writeText(chartCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    if (!svg) return;
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })),
      download: `${diagramType || 'diagram'}_${Date.now()}.svg`
    });
    a.click();
  };

  return (
    <div className="anim-reveal-scale d-200" style={{ border: '1px solid rgba(240,235,225,0.08)' }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 gap-2"
        style={{ background: 'var(--ink-2)', borderBottom: '1px solid rgba(240,235,225,0.08)' }}>
        <div className="flex items-center gap-3">
          <Code2 className="w-3.5 h-3.5" style={{ color: 'var(--acid)' }} />
          <span className="type-label">{diagramType} Diagram</span>
        </div>
        <div className="flex items-center gap-1.5">
          {!showCode && svg && !error && (
            <div className="flex items-center gap-0.5" style={{ border: '1px solid rgba(240,235,225,0.08)' }}>
              {[
                { icon: ZoomOut, onClick: () => setZoom(z => Math.max(0.4, z - 0.15)), label: '−' },
                { label: `${Math.round(zoom * 100)}%`, isText: true },
                { icon: ZoomIn, onClick: () => setZoom(z => Math.min(2.2, z + 0.15)), label: '+' },
                { icon: RotateCcw, onClick: () => setZoom(1) },
              ].map((item, i) => item.isText
                ? <span key={i} className="type-mono px-2" style={{ color: 'var(--ivory-dim)' }}>{item.label}</span>
                : <button key={i} onClick={item.onClick} className="btn-micro" style={{ border: 'none', padding: '0.3rem 0.5rem' }}>
                  {item.icon && <item.icon className="w-3 h-3" />}
                </button>
              )}
            </div>
          )}
          <button onClick={() => setShowCode(s => !s)} className={`btn-micro ${showCode ? 'active' : ''}`}>
            <FileCode className="w-3 h-3" /> {showCode ? 'Diagram' : 'Code'}
          </button>
          {svg && !error && (
            <button onClick={download} className="btn-micro">
              <Download className="w-3 h-3" /> SVG
            </button>
          )}
          <button onClick={copy} className={`btn-micro ${copied ? 'active' : ''}`}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="diagram-canvas" style={{ padding: '2rem' }}>
        <div className="canvas-grid" />
        {error ? (
          <div style={{ border: '1px solid rgba(255,59,48,0.3)', background: 'rgba(255,59,48,0.06)', padding: '1.5rem', maxWidth: '520px', textAlign: 'center' }}>
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--signal-red)' }} />
            <p className="type-label mb-2" style={{ color: 'var(--signal-red)' }}>Diagram Syntax Error</p>
            <pre className="type-mono text-left overflow-x-auto" style={{ color: 'rgba(255,59,48,0.8)', background: 'rgba(0,0,0,0.4)', padding: '0.75rem' }}>{error}</pre>
          </div>
        ) : showCode ? (
          <pre className="code-surface w-full">{chartCode}</pre>
        ) : svg ? (
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s' }}
            className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="flex flex-col items-center gap-3" style={{ color: 'var(--ivory-ghost)' }}>
            <div className="spinner" />
            <span className="type-label">Rendering diagram</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Module Header ─────────────────────────────────────────────────
const ModuleHeader = ({ num, icon: Icon, title, subtitle }) => (
  <div className="flex items-start justify-between mb-6 anim-reveal-up d-50">
    <div className="flex items-start gap-4">
      <div className="shrink-0 pt-0.5">
        <div className="type-mono text-xs" style={{ color: 'var(--acid)' }}>{num}</div>
        <Icon className="w-5 h-5 mt-1" style={{ color: 'var(--ivory-dim)' }} />
      </div>
      <div>
        <h2 className="type-heading text-xl text-ivory-DEFAULT">{title}</h2>
        <p className="type-label mt-1">{subtitle}</p>
      </div>
    </div>
  </div>
);

// ── Run Button ────────────────────────────────────────────────────
const RunButton = ({ onClick, loading, disabled, icon: Icon = Sparkles, readyText, loadingText }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="btn btn-acid"
    style={{ opacity: disabled ? 0.45 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
  >
    {loading
      ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} />{loadingText}</>
      : <><Icon className="w-4 h-4" />{readyText}</>
    }
  </button>
);

// ── Main App ──────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('requirements');
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');
  const [connected, setConnected] = useState(null);
  const [latency, setLatency] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [meta, setMeta] = useState(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const heroRef = useRef(null);

  // Module states
  const [reqInput, setReqInput] = useState(PRESETS.foodApp);
  const [reqLoading, setReqLoading] = useState(false);
  const [reqResults, setReqResults] = useState(null);

  const [umlInput, setUmlInput] = useState(PRESETS.ecommerce);
  const [umlType, setUmlType] = useState('class');
  const [umlLoading, setUmlLoading] = useState(false);
  const [umlResults, setUmlResults] = useState(null);

  const [effortScope, setEffortScope] = useState(PRESETS.foodApp);
  const [hourlyRate, setHourlyRate] = useState(75);
  const [effortLoad, setEffortLoad] = useState(false);
  const [effortRes, setEffortRes] = useState(null);

  const [defectCode, setDefectCode] = useState(PRESETS.pythonBuggy);
  const [codeLang, setCodeLang] = useState('python');
  const [defectLoad, setDefectLoad] = useState(false);
  const [defectRes, setDefectRes] = useState(null);

  const [testReq, setTestReq] = useState(PRESETS.foodApp);
  const [testFW, setTestFW] = useState('pytest');
  const [testLoad, setTestLoad] = useState(false);
  const [testRes, setTestRes] = useState(null);
  const [testFilter, setTestFilter] = useState('All');
  const [testSearch, setTestSearch] = useState('');
  const [showScript, setShowScript] = useState(false);

  // Parallax
  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) heroRef.current.style.backgroundPositionY = `${window.scrollY * 0.3}px`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const checkHealth = useCallback(async (url = backendUrl) => {
    const t0 = performance.now();
    try {
      let res = await fetch(`${url}/api/status`).catch(() => null);
      if (!res?.ok) res = await fetch(`${url}/`).catch(() => null);
      if (res?.ok) {
        const data = await res.json();
        setConnected(true); setLatency(Math.round(performance.now() - t0)); setMeta(data); setApiError(null);
        return true;
      }
      setConnected(false); setLatency(null); return false;
    } catch { setConnected(false); setLatency(null); return false; }
  }, [backendUrl]);

  useEffect(() => {
    checkHealth();
    const id = setInterval(() => checkHealth(), 12000);
    return () => clearInterval(id);
  }, [checkHealth]);

  const apiPost = async (path, body, onSuccess, errPrefix, setLoading) => {
    setLoading(true); setApiError(null);
    try {
      const res = await fetch(`${backendUrl}${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || `${res.status}`); }
      onSuccess(await res.json());
    } catch (e) { setApiError(`${errPrefix}: ${e.message}`); }
    finally { setLoading(false); }
  };

  const handleAnalyzeReq = () => apiPost('/api/analyze-requirements', { prompt: reqInput },
    d => { setReqResults(d); showToast('Requirements analyzed'); }, 'Requirements', setReqLoading);
  const handleGenerateUML = () => apiPost('/api/generate-uml', { project_description: umlInput, diagram_type: umlType },
    d => { setUmlResults(d); showToast('UML diagram generated'); }, 'UML', setUmlLoading);
  const handleEstimateEffort = () => apiPost('/api/estimate-effort', { project_scope: effortScope, hourly_rate: +hourlyRate },
    d => { setEffortRes(d); showToast('COCOMO II complete'); }, 'Effort', setEffortLoad);
  const handleAuditDefects = () => apiPost('/api/predict-defects', { source_code: defectCode, language: codeLang },
    d => { setDefectRes(d); showToast('Security audit complete'); }, 'Defects', setDefectLoad);
  const handleGenTests = () => apiPost('/api/generate-tests', { requirement_text: testReq, framework: testFW },
    d => { setTestRes(d); showToast('Test suite synthesized'); }, 'Tests', setTestLoad);

  const exportCSV = () => {
    if (!testRes?.test_cases) return;
    const rows = testRes.test_cases.map(tc =>
      `"${tc.id}","${tc.category}","${tc.description.replace(/"/g, '""')}","${tc.expected_result.replace(/"/g, '""')}","${tc.priority}"`
    );
    const blob = new Blob(['Test ID,Category,Description,Expected,Priority\n' + rows.join('\n')], { type: 'text/csv' });
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `tests_${Date.now()}.csv` }).click();
    showToast('CSV exported');
  };

  const exportJSON = () => {
    if (!testRes) return;
    const blob = new Blob([JSON.stringify(testRes, null, 2)], { type: 'application/json' });
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `tests_${Date.now()}.json` }).click();
    showToast('JSON exported');
  };

  const filteredTests = testRes?.test_cases?.filter(tc => {
    const cat = testFilter === 'All' || tc.category.toLowerCase().includes(testFilter.toLowerCase());
    const srch = !testSearch || tc.description.toLowerCase().includes(testSearch.toLowerCase()) || tc.id.toLowerCase().includes(testSearch.toLowerCase());
    return cat && srch;
  }) || [];

  const activeMod = MODULES.find(m => m.id === tab);

  return (
    <div style={{ background: 'var(--ink)', color: 'var(--ivory)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Toast ──────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] anim-toast" style={{ minWidth: 260, maxWidth: 360 }}>
          <div className="toast-item">
            <div style={{ width: 6, height: 6, background: 'var(--acid)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-body)', color: 'var(--ivory)' }}>{toast}</span>
          </div>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="site-header anim-reveal-fade d-0">
        <div className="w-full max-w-screen-2xl mx-auto px-5 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(s => !s)}
              style={{ background: 'none', border: 'none', color: 'var(--ivory-dim)', cursor: 'pointer' }}>
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-3">
              <div style={{ width: 28, height: 28, background: 'var(--acid)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BrainCircuit className="w-4 h-4" style={{ color: 'var(--ink)' }} />
              </div>
              <div>
                <div className="type-display text-sm" style={{ color: 'var(--ivory)', letterSpacing: '0.02em' }}>
                  AI<span style={{ color: 'var(--acid)' }}>—</span>SE
                </div>
                <div className="type-label hidden sm:block" style={{ marginTop: 0 }}>Software Engineering Toolkit</div>
              </div>
            </div>
          </div>

          {/* Desktop module nav */}
          <nav className="hidden xl:flex items-center" style={{ gap: 0, borderLeft: '1px solid rgba(240,235,225,0.08)' }}>
            {MODULES.map(m => {
              const active = tab === m.id;
              return (
                <button key={m.id} onClick={() => setTab(m.id)}
                  style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.72rem',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    padding: '0 1.1rem', height: 56, cursor: 'pointer',
                    background: active ? 'var(--acid-dim)' : 'transparent',
                    color: active ? 'var(--acid)' : 'var(--ivory-ghost)',
                    border: 'none', borderRight: '1px solid rgba(240,235,225,0.08)',
                    borderBottom: active ? '2px solid var(--acid)' : '2px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  {m.num} {m.label}
                </button>
              );
            })}
          </nav>

          {/* Status */}
          <button onClick={() => setConfigOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--ink-3)', border: '1px solid rgba(240,235,225,0.10)',
              padding: '0.4rem 0.8rem', cursor: 'pointer', color: 'var(--ivory)',
            }}>
            <div style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
              {connected && <span style={{
                position: 'absolute', inset: -3,
                background: 'rgba(48,209,88,0.35)',
                animation: 'ping-dot 2s cubic-bezier(0,0,0.2,1) infinite',
              }} />}
              <span style={{
                display: 'block', width: 8, height: 8,
                background: connected ? 'var(--signal-green)' : 'var(--signal-red)',
              }} />
            </div>
            <span className="type-mono hidden sm:inline" style={{ color: 'var(--ivory-dim)' }}>
              {connected ? `${latency}ms` : 'OFFLINE'}
            </span>
            {meta?.active_model && (
              <span className="type-mono hidden lg:inline" style={{ color: 'var(--ivory-ghost)' }}>
                {meta.active_model}
              </span>
            )}
            <Settings className="w-3 h-3" style={{ color: 'var(--ivory-ghost)' }} />
          </button>
        </div>
      </header>

      {/* ── Alerts ─────────────────────────────────────────────── */}
      {!connected && connected !== null && (
        <div style={{ background: 'rgba(255,59,48,0.08)', borderBottom: '1px solid rgba(255,59,48,0.2)', padding: '0.6rem 1.25rem' }}>
          <div className="max-w-screen-2xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2" style={{ fontSize: '0.78rem', color: 'rgba(255,59,48,0.9)' }}>
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              <span>Backend at <code style={{ fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.3)', padding: '0 0.4rem' }}>{backendUrl}</code> not responding.
                Run: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--acid)', background: 'rgba(0,0,0,0.4)', padding: '0 0.4rem' }}>uvicorn main:app --reload</code></span>
            </div>
            <button onClick={() => checkHealth()} className="btn-micro">Retry</button>
          </div>
        </div>
      )}
      {apiError && (
        <div style={{ background: 'rgba(255,159,10,0.08)', borderBottom: '1px solid rgba(255,159,10,0.2)', padding: '0.5rem 1.25rem' }}>
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-2" style={{ fontSize: '0.78rem', color: 'rgba(255,159,10,0.9)' }}>
            <div className="flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 shrink-0" /><span>{apiError}</span></div>
            <button onClick={() => setApiError(null)} style={{ background: 'none', border: 'none', color: 'var(--ivory-ghost)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          </div>
        </div>
      )}

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div className="hero">
        <div ref={heroRef} className="hero-bg-image" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="hero-noise" />
        <div className="hero-number">SE</div>

        <div className="max-w-screen-2xl mx-auto px-5" style={{ paddingTop: '4rem', paddingBottom: '4rem', position: 'relative', zIndex: 2 }}>
          {/* Eyebrow */}
          <div className="anim-reveal-up d-50 flex items-center gap-3 mb-6">
            <div style={{ width: 24, height: 2, background: 'var(--acid)' }} />
            <span className="type-label" style={{ color: 'var(--acid)' }}>AI-Powered Engineering Suite · v2.0</span>
          </div>

          {/* Headline — massive, asymmetric */}
          <h1 className="type-display anim-reveal-up d-100"
            style={{ fontSize: 'clamp(3rem, 8vw, 7.5rem)', color: 'var(--ivory)', maxWidth: '14ch' }}>
            Build Better<br />
            <span style={{ color: 'var(--acid)', WebkitTextStroke: '0px', display: 'block' }}>Software.</span>
            <span style={{ color: 'var(--ivory)', opacity: 0.3 }}>Faster.</span>
          </h1>

          {/* Description — offset right, editorial */}
          <div className="anim-reveal-up d-200 mt-8" style={{ maxWidth: 420, marginLeft: 'clamp(0px, 20%, 320px)' }}>
            <p style={{ fontSize: '0.95rem', color: 'var(--ivory-dim)', lineHeight: 1.7, fontFamily: 'var(--font-body)' }}>
              Five AI modules covering the full software lifecycle — from requirements decomposition
              through security auditing to QA test synthesis.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn btn-acid"
              >
                <Sparkles className="w-4 h-4" /> Start Analyzing <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => setConfigOpen(true)} className="btn btn-ghost">
                <Server className="w-4 h-4" /> Configure API
              </button>
            </div>
          </div>

          {/* Stat strip */}
          <div className="anim-reveal-up d-350 mt-12 grid grid-cols-2 sm:grid-cols-4 gap-0"
            style={{ borderTop: '1px solid rgba(240,235,225,0.08)', borderLeft: '1px solid rgba(240,235,225,0.08)' }}>
            {[
              { num: '05', label: 'AI Modules' },
              { num: 'OWASP', label: 'Security Standard' },
              { num: 'II', label: 'COCOMO Model' },
              { num: 'UML', label: 'Diagram Types' },
            ].map(s => (
              <div key={s.label} style={{ padding: '1.25rem', borderRight: '1px solid rgba(240,235,225,0.08)', borderBottom: '1px solid rgba(240,235,225,0.08)' }}>
                <div className="type-display text-2xl" style={{ color: 'var(--acid)' }}>{s.num}</div>
                <div className="type-label mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticker */}
        <div className="ticker-wrap anim-reveal-fade d-500">
          <div className="ticker-inner" style={{ padding: '0.55rem 0' }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="type-mono px-4" style={{ color: item === '·' ? 'var(--acid)' : 'var(--ivory-ghost)' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Workspace ──────────────────────────────────────────── */}
      <div id="workspace" className="flex-1 max-w-screen-2xl mx-auto w-full"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 0, padding: '0' }}>

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside style={{
          gridColumn: 'span 3',
          borderRight: '1px solid rgba(240,235,225,0.08)',
          display: sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'block' : 'none',
          paddingTop: '2rem',
        }}
          className={`lg:block ${sidebarOpen ? 'block' : 'hidden'}`}>

          {/* Module nav */}
          <div style={{ borderBottom: '1px solid rgba(240,235,225,0.08)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div className="type-label px-4 mb-3">Modules</div>
            {MODULES.map(m => {
              const Icon = m.icon;
              const active = tab === m.id;
              return (
                <button key={m.id}
                  onClick={() => { setTab(m.id); setSidebarOpen(false); }}
                  className={`nav-entry w-full ${active ? 'active' : ''}`}
                  style={{ width: '100%', textAlign: 'left', background: 'none', fontFamily: 'var(--font-body)' }}>
                  <span className="nav-num">{m.num}</span>
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ opacity: 0.6 }} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.02em' }}>
                      {m.label}
                    </div>
                    <div className="type-label" style={{ marginTop: 1 }}>{m.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Presets */}
          <div style={{ padding: '0 1rem 1.5rem', borderBottom: '1px solid rgba(240,235,225,0.08)' }}>
            <div className="type-label mb-3">Quick Presets</div>
            <div className="grid grid-cols-2 gap-px" style={{ background: 'rgba(240,235,225,0.08)' }}>
              {[
                { key: 'foodApp', e: '🍔', l: 'Food Delivery' },
                { key: 'ecommerce', e: '🛍', l: 'E-Commerce' },
                { key: 'fintech', e: '📈', l: 'FinTech' },
                { key: 'healthcare', e: '🏥', l: 'Healthcare' },
              ].map(p => (
                <button key={p.key}
                  onClick={() => {
                    const t = PRESETS[p.key];
                    if (tab === 'requirements') setReqInput(t);
                    else if (tab === 'uml') setUmlInput(t);
                    else if (tab === 'effort') setEffortScope(t);
                    else if (tab === 'defects') setDefectCode(PRESETS.pythonBuggy);
                    else if (tab === 'tests') setTestReq(t);
                    showToast(`Preset: ${p.l}`);
                  }}
                  className="preset-tile">
                  <span style={{ fontSize: '1rem' }}>{p.e}</span>
                  <span className="type-label" style={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.7rem', color: 'var(--ivory-dim)' }}>{p.l}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Backend status */}
          <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(240,235,225,0.08)' }}>
            <div className="type-label mb-3">Backend Status</div>
            <div style={{ background: 'var(--ink)', border: '1px solid rgba(240,235,225,0.06)', padding: '0.75rem' }}>
              {[
                { k: 'Status', v: connected ? 'ONLINE' : 'OFFLINE', ok: connected },
                { k: 'Latency', v: latency ? `${latency}ms` : '—' },
                { k: 'Model', v: meta?.active_model || 'Groq OSS' },
              ].map(r => (
                <div key={r.k} className="status-line">
                  <span className="type-label">{r.k}</span>
                  <span className="type-mono" style={{
                    color: r.ok === true ? 'var(--signal-green)' : r.ok === false ? 'var(--signal-red)' : 'var(--ivory-dim)',
                    fontSize: '0.65rem'
                  }}>{r.v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => checkHealth()} className="btn btn-ghost w-full mt-2" style={{ width: '100%', justifyContent: 'center', fontSize: '0.7rem', padding: '0.45rem' }}>
              <RefreshCw className="w-3 h-3" /> Recheck
            </button>
          </div>

          {/* Activity */}
          <div style={{ padding: '1.25rem 1rem' }}>
            <div className="type-label mb-3">Activity</div>
            <div className="flex items-end gap-0.5" style={{ height: 36 }}>
              {[3, 5, 4, 7, 6, 8, 5, 7, 9, 6, 8, 10, 7, 9, 6, 4, 8].map((h, i) => (
                <div key={i} className="activity-bar flex-1"
                  style={{ height: `${h * 10}%`, animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
            <div className="type-label mt-2">Idle — awaiting inference</div>
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────── */}
        <main style={{ gridColumn: 'span 9', padding: '2rem 2.5rem', borderLeft: sidebarOpen ? 'none' : undefined }}
          className="lg:col-span-9 col-span-12">

          {/* ══════════════════════════════════════════════════
              MODULE 1 — REQUIREMENTS
              ══════════════════════════════════════════════════ */}
          {tab === 'requirements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="module-panel active" style={{ padding: '1.75rem' }}>
                <ModuleHeader num="01" icon={FileText} title="Requirement Analyzer & Decomposition"
                  subtitle="Extract functional specs, NFRs, domain entities, and technical risks" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <textarea rows={5} value={reqInput} onChange={e => setReqInput(e.target.value)}
                      placeholder="Paste BRD, user stories, or software scope here..."
                      className="surface-sunken w-full anim-reveal-up d-150"
                      style={{ padding: '1rem', fontSize: '0.85rem' }} />
                    <span className="type-mono absolute bottom-3 right-3" style={{ color: 'var(--ivory-ghost)', fontSize: '0.6rem' }}>
                      {reqInput.length} chars
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 anim-reveal-up d-200">
                    <div className="flex gap-2">
                      {['foodApp', 'fintech'].map(k => (
                        <button key={k} className="btn-micro" onClick={() => setReqInput(PRESETS[k])}>
                          {k === 'foodApp' ? '🍔 Food' : '📈 FinTech'}
                        </button>
                      ))}
                    </div>
                    <RunButton onClick={handleAnalyzeReq} loading={reqLoading}
                      disabled={reqLoading || !reqInput.trim()}
                      readyText="Analyze Requirements" loadingText="Analyzing…" icon={Sparkles} />
                  </div>
                </div>
              </div>

              {reqResults && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Summary */}
                  <div className="panel anim-reveal-up d-0">
                    <div className="type-label mb-2">Project Summary</div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--ivory)', lineHeight: 1.65 }}>{reqResults.project_summary}</p>
                    <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="type-label">Complexity:</span>
                      <span className="type-mono" style={{
                        padding: '0.15rem 0.5rem', fontSize: '0.65rem',
                        background: reqResults.complexity_rating === 'High' ? 'rgba(255,59,48,0.12)' :
                          reqResults.complexity_rating === 'Low' ? 'rgba(48,209,88,0.12)' : 'rgba(255,159,10,0.12)',
                        color: reqResults.complexity_rating === 'High' ? 'var(--signal-red)' :
                          reqResults.complexity_rating === 'Low' ? 'var(--signal-green)' : 'var(--signal-amber)',
                        border: `1px solid ${reqResults.complexity_rating === 'High' ? 'rgba(255,59,48,0.3)' :
                          reqResults.complexity_rating === 'Low' ? 'rgba(48,209,88,0.3)' : 'rgba(255,159,10,0.3)'}`,
                      }}>
                        {reqResults.complexity_rating || 'Medium'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: 'rgba(240,235,225,0.08)' }}>
                    {/* Functional */}
                    <div className="anim-reveal-up d-100" style={{ background: 'var(--ink-2)', padding: '1.25rem' }}>
                      <div className="type-label mb-3" style={{ color: 'var(--signal-green)' }}>
                        Functional ({reqResults.functional_requirements?.length || 0})
                      </div>
                      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                        {reqResults.functional_requirements?.map((item, i) => (
                          <div key={i} className="result-item">
                            <span className="result-num">#{i + 1}</span>
                            <span style={{ lineHeight: 1.6, fontSize: '0.82rem' }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Non-Functional */}
                    <div className="anim-reveal-up d-150" style={{ background: 'var(--ink-2)', padding: '1.25rem' }}>
                      <div className="type-label mb-3" style={{ color: 'var(--acid)' }}>
                        Non-Functional ({reqResults.non_functional_requirements?.length || 0})
                      </div>
                      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                        {reqResults.non_functional_requirements?.map((item, i) => (
                          <div key={i} className="result-item">
                            <span className="result-num" style={{ color: 'var(--acid)' }}>#{i + 1}</span>
                            <span style={{ lineHeight: 1.6, fontSize: '0.82rem' }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Entities */}
                    <div className="anim-reveal-up d-200" style={{ background: 'var(--ink-2)', padding: '1.25rem' }}>
                      <div className="type-label mb-3">Domain Entities ({reqResults.detected_entities?.length || 0})</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.25rem' }}>
                        {reqResults.detected_entities?.map((e, i) => (
                          <span key={i} className="entity-tag"><Box className="w-3 h-3" />{e}</span>
                        ))}
                      </div>
                    </div>

                    {/* Risks */}
                    <div className="anim-reveal-up d-250" style={{ background: 'var(--ink-2)', padding: '1.25rem' }}>
                      <div className="type-label mb-3" style={{ color: 'var(--signal-amber)' }}>
                        Technical Risks ({reqResults.potential_risks?.length || 0})
                      </div>
                      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                        {reqResults.potential_risks?.map((r, i) => (
                          <div key={i} className="result-item" style={{ borderLeft: '2px solid rgba(255,159,10,0.4)', paddingLeft: '0.75rem', borderBottom: '1px solid rgba(240,235,225,0.06)' }}>
                            <span style={{ color: 'var(--signal-amber)', flexShrink: 0 }}>⚠</span>
                            <span style={{ lineHeight: 1.6, fontSize: '0.82rem', color: 'var(--ivory-dim)' }}>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 2 — UML
              ══════════════════════════════════════════════════ */}
          {tab === 'uml' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="module-panel active anim-reveal-up d-0" style={{ padding: '1.75rem' }}>
                <ModuleHeader num="02" icon={Layers} title="UML Architecture Synthesizer"
                  subtitle="Generate compile-ready Mermaid.js class and sequence diagrams" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="flex gap-2 anim-reveal-up d-100">
                    {[{ id: 'class', label: 'Class Diagram', icon: Box }, { id: 'sequence', label: 'Sequence', icon: GitBranch }].map(dt => (
                      <button key={dt.id} onClick={() => setUmlType(dt.id)}
                        className={`btn ${umlType === dt.id ? 'btn-acid' : 'btn-ghost'}`}>
                        <dt.icon className="w-3.5 h-3.5" /> {dt.label}
                      </button>
                    ))}
                  </div>
                  <textarea rows={4} value={umlInput} onChange={e => setUmlInput(e.target.value)}
                    placeholder="Describe the system domain or workflow to model..."
                    className="surface-sunken w-full anim-reveal-up d-150"
                    style={{ padding: '1rem', fontSize: '0.85rem' }} />
                  <div className="flex justify-end anim-reveal-up d-200">
                    <RunButton onClick={handleGenerateUML} loading={umlLoading}
                      disabled={umlLoading || !umlInput.trim()}
                      readyText="Generate Diagram" loadingText="Synthesizing…" icon={Play} />
                  </div>
                </div>
              </div>

              {umlResults && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {umlResults.explanation && (
                    <div className="panel anim-reveal-up d-0">
                      <div className="type-label mb-2">Architectural Rationale</div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--ivory-dim)', lineHeight: 1.7 }}>{umlResults.explanation}</p>
                    </div>
                  )}
                  <MermaidViewer chartCode={umlResults.mermaid_code} diagramType={umlResults.diagram_type} />
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 3 — EFFORT
              ══════════════════════════════════════════════════ */}
          {tab === 'effort' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="module-panel active anim-reveal-up d-0" style={{ padding: '1.75rem' }}>
                <ModuleHeader num="03" icon={Calculator} title="Software Effort & Cost Estimator"
                  subtitle="Algorithmic COCOMO II & IFPUG Function Point cost modeling" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <textarea rows={4} value={effortScope} onChange={e => setEffortScope(e.target.value)}
                    placeholder="Describe project modules, deliverables, and scope..."
                    className="surface-sunken w-full anim-reveal-up d-100"
                    style={{ padding: '1rem', fontSize: '0.85rem' }} />

                  <div className="anim-reveal-up d-150" style={{ background: 'var(--ink)', border: '1px solid rgba(240,235,225,0.08)', padding: '1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
                    <div>
                      <div className="type-label mb-1">Engineering Rate</div>
                      <div className="type-display text-3xl" style={{ color: 'var(--acid)' }}>${hourlyRate}<span className="type-mono text-sm" style={{ color: 'var(--ivory-ghost)' }}>/hr</span></div>
                    </div>
                    <div style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="type-mono" style={{ color: 'var(--ivory-ghost)', fontSize: '0.6rem' }}>$25</span>
                      <input type="range" min="25" max="200" step="5" value={hourlyRate}
                        onChange={e => setHourlyRate(e.target.value)} style={{ flex: 1 }} />
                      <span className="type-mono" style={{ color: 'var(--ivory-ghost)', fontSize: '0.6rem' }}>$200</span>
                    </div>
                  </div>

                  <div className="flex justify-end anim-reveal-up d-200">
                    <RunButton onClick={handleEstimateEffort} loading={effortLoad}
                      disabled={effortLoad || !effortScope.trim()}
                      readyText="Calculate Cost & Effort" loadingText="Computing…" icon={BarChart3} />
                  </div>
                </div>
              </div>

              {effortRes && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* KPI grid — brutalist, asymmetric */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: 'rgba(240,235,225,0.08)' }}>
                    {[
                      { label: 'Function Points', value: effortRes.function_points, unit: 'UFP', note: 'IFPUG' },
                      { label: 'Code Volume', value: effortRes.estimated_kloc, unit: 'KLOC', note: '~50 LOC/FP' },
                      { label: 'Effort', value: effortRes.person_months, unit: 'PM', note: 'COCOMO II Organic' },
                      { label: 'Team / Timeline', value: effortRes.recommended_team_size, unit: `engs · ${effortRes.duration_months}mo`, note: `~${effortRes.duration_weeks}w` },
                    ].map((k, i) => (
                      <div key={i} className={`kpi anim-reveal-up d-${i * 50}`}>
                        <div className="kpi-label">{k.label}</div>
                        <div className="kpi-value">{k.value}</div>
                        <div className="kpi-unit">{k.unit}</div>
                        <div className="type-label mt-1">{k.note}</div>
                      </div>
                    ))}
                  </div>

                  {/* Budget hero card */}
                  <div className="budget-card anim-reveal-scale d-100">
                    <div className="type-label mb-2">Total Engineering Budget</div>
                    <div className="type-display" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: 'var(--ivory)', lineHeight: 1 }}>
                      ${effortRes.estimated_total_cost?.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </div>
                    <div className="type-label mt-2" style={{ color: 'var(--ivory-ghost)' }}>
                      {effortRes.person_months} PM × ${hourlyRate}/hr × 160 hrs
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ background: 'rgba(240,235,225,0.08)' }}>
                    <div className="anim-reveal-up d-200" style={{ background: 'var(--ink-2)', padding: '1.25rem' }}>
                      <div className="type-label mb-3" style={{ color: 'var(--acid)' }}>IFPUG Component Counts</div>
                      {[
                        ['External Inputs (EI)', effortRes.breakdown?.external_inputs],
                        ['External Outputs (EO)', effortRes.breakdown?.external_outputs],
                        ['External Inquiries (EQ)', effortRes.breakdown?.external_inquiries],
                        ['Internal Logical Files (ILF)', effortRes.breakdown?.internal_logical_files],
                        ['External Interface Files (EIF)', effortRes.breakdown?.external_interface_files],
                      ].map(([k, v]) => (
                        <div key={k} className="status-line">
                          <span style={{ fontSize: '0.78rem', color: 'var(--ivory-dim)' }}>{k}</span>
                          <span className="type-mono" style={{ color: 'var(--ivory)' }}>{v}</span>
                        </div>
                      ))}
                    </div>

                    <div className="anim-reveal-up d-250" style={{ background: 'var(--ink-2)', padding: '1.25rem' }}>
                      <div className="type-label mb-4" style={{ color: 'var(--acid)' }}>SDLC Phase Allocation</div>
                      {[
                        { label: 'Implementation & Coding', pct: 35 },
                        { label: 'Architecture & Design', pct: 20 },
                        { label: 'Verification & QA', pct: 20 },
                        { label: 'Requirements & Feasibility', pct: 15 },
                        { label: 'Deployment & DevOps', pct: 10 },
                      ].map(row => (
                        <div key={row.label} style={{ marginBottom: '0.85rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--ivory-dim)' }}>{row.label}</span>
                            <span className="type-mono" style={{ color: 'var(--acid)', fontSize: '0.65rem' }}>{row.pct}%</span>
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${row.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 4 — DEFECTS
              ══════════════════════════════════════════════════ */}
          {tab === 'defects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="module-panel active anim-reveal-up d-0" style={{ padding: '1.75rem' }}>
                <ModuleHeader num="04" icon={Bug} title="Defect Predictor & Security Auditor"
                  subtitle="OWASP vulnerability audit, cyclomatic complexity & maintainability scoring" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="flex flex-wrap items-center justify-between gap-3 anim-reveal-up d-100">
                    <div className="flex items-center gap-3">
                      <span className="type-label">Language:</span>
                      <select value={codeLang} onChange={e => setCodeLang(e.target.value)}
                        style={{ background: 'var(--ink)', border: '1px solid rgba(240,235,225,0.12)', color: 'var(--ivory)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', padding: '0.35rem 1.75rem 0.35rem 0.6rem' }}>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript / TypeScript</option>
                        <option value="java">Java</option>
                        <option value="go">Go</option>
                      </select>
                    </div>
                    <button className="btn-micro" onClick={() => setDefectCode(PRESETS.pythonBuggy)}>
                      <Bug className="w-3 h-3" /> Load Vulnerable Snippet
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <textarea rows={9} value={defectCode} onChange={e => setDefectCode(e.target.value)}
                      placeholder="Paste source code for security and defect analysis..."
                      className="surface-sunken w-full anim-reveal-up d-150"
                      style={{ padding: '1rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', lineHeight: 1.75 }} />
                    <span className="type-mono absolute bottom-3 right-3" style={{ color: 'var(--ivory-ghost)', fontSize: '0.6rem' }}>
                      {defectCode.split('\n').length} lines
                    </span>
                  </div>
                  <div className="flex justify-end anim-reveal-up d-200">
                    <RunButton onClick={handleAuditDefects} loading={defectLoad}
                      disabled={defectLoad || !defectCode.trim()}
                      readyText="Audit Vulnerabilities" loadingText="Scanning…" icon={ShieldCheck} />
                  </div>
                </div>
              </div>

              {defectRes && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* KPI trio */}
                  <div className="grid grid-cols-3 gap-px" style={{ background: 'rgba(240,235,225,0.08)' }}>
                    {[
                      { label: 'Cyclomatic Complexity', value: defectRes.cyclomatic_complexity, note: defectRes.cyclomatic_complexity > 10 ? 'High branch count' : 'Moderate' },
                      { label: 'Maintainability Index', value: `${defectRes.maintainability_index}`, unitSuffix: '/100', note: 'Halstead metric' },
                      { label: 'Risk Level', value: defectRes.risk_level, note: `${defectRes.vulnerabilities?.length || 0} findings` },
                    ].map((k, i) => (
                      <div key={i} className={`kpi anim-reveal-up d-${i * 50}`}>
                        <div className="kpi-label">{k.label}</div>
                        <div className="kpi-value">{k.value}<span className="type-mono text-base" style={{ color: 'var(--ivory-ghost)' }}>{k.unitSuffix}</span></div>
                        <div className="type-label mt-1">{k.note}</div>
                      </div>
                    ))}
                  </div>

                  {/* Vuln list */}
                  <div className="anim-reveal-up d-100" style={{ background: 'var(--ink-2)', border: '1px solid rgba(240,235,225,0.08)', padding: '1.25rem' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldAlert className="w-4 h-4" style={{ color: 'var(--signal-red)' }} />
                      <div className="type-label" style={{ color: 'var(--ivory)' }}>
                        Security Findings ({defectRes.vulnerabilities?.length || 0})
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {defectRes.vulnerabilities?.map((v, i) => {
                        const sev = (v.severity || '').toLowerCase();
                        return (
                          <div key={i} className={`vuln-card ${sev}`}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--ivory)' }}>{v.title}</span>
                                <span className="type-mono" style={{ color: 'var(--ivory-ghost)', fontSize: '0.62rem', background: 'var(--ink)', padding: '0.1rem 0.4rem', border: '1px solid rgba(240,235,225,0.08)' }}>
                                  Ln {v.line}
                                </span>
                              </div>
                              <span className={`severity-badge ${sev}`}>{v.severity}</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--ivory-dim)', lineHeight: 1.65, marginBottom: '0.6rem' }}>{v.description}</p>
                            <div style={{ background: 'var(--ink)', border: '1px solid rgba(48,209,88,0.15)', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                              <span className="type-mono" style={{ fontSize: '0.68rem', color: 'rgba(48,209,88,0.9)' }}>
                                <strong>Fix: </strong>{v.mitigation}
                              </span>
                              <button className="btn-micro" onClick={() => { navigator.clipboard.writeText(v.mitigation); showToast('Fix copied'); }}>
                                Copy
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {defectRes.refactoring_suggestions?.length > 0 && (
                    <div className="anim-reveal-up d-200" style={{ background: 'var(--ink-2)', border: '1px solid rgba(240,235,225,0.08)', padding: '1.25rem' }}>
                      <div className="type-label mb-3" style={{ color: 'var(--acid)' }}>Refactoring Recommendations</div>
                      {defectRes.refactoring_suggestions.map((s, i) => (
                        <div key={i} className="result-item">
                          <span style={{ color: 'var(--acid)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', flexShrink: 0 }}>→</span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--ivory-dim)' }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              MODULE 5 — TESTS
              ══════════════════════════════════════════════════ */}
          {tab === 'tests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="module-panel active anim-reveal-up d-0" style={{ padding: '1.75rem' }}>
                <ModuleHeader num="05" icon={TestTube} title="QA Test Case Matrix Generator"
                  subtitle="Synthesize end-to-end verification suites and automation scripts" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="flex items-center gap-3 anim-reveal-up d-100">
                    <span className="type-label">Framework:</span>
                    <select value={testFW} onChange={e => setTestFW(e.target.value)}
                      style={{ background: 'var(--ink)', border: '1px solid rgba(240,235,225,0.12)', color: 'var(--ivory)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', padding: '0.35rem 1.75rem 0.35rem 0.6rem' }}>
                      <option value="pytest">pytest (Python)</option>
                      <option value="jest">Jest / Vitest (Node.js)</option>
                    </select>
                  </div>
                  <textarea rows={4} value={testReq} onChange={e => setTestReq(e.target.value)}
                    placeholder="Enter feature specs to generate a comprehensive test matrix..."
                    className="surface-sunken w-full anim-reveal-up d-150"
                    style={{ padding: '1rem', fontSize: '0.85rem' }} />
                  <div className="flex justify-end anim-reveal-up d-200">
                    <RunButton onClick={handleGenTests} loading={testLoad}
                      disabled={testLoad || !testReq.trim()}
                      readyText="Synthesize Test Suite" loadingText="Synthesizing…" icon={Sparkles} />
                  </div>
                </div>
              </div>

              {testRes && (
                <div className="anim-reveal-scale d-0" style={{ background: 'var(--ink-2)', border: '1px solid rgba(240,235,225,0.08)' }}>
                  {/* Table header */}
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(240,235,225,0.08)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--ivory)' }}>{testRes.test_suite_name}</div>
                      <div className="type-label mt-0.5">{testRes.test_cases?.length || 0} specifications synthesized</div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {testRes.code_template && (
                        <button onClick={() => setShowScript(s => !s)} className={`btn-micro ${showScript ? 'active' : ''}`}>
                          <Terminal className="w-3 h-3" /> {showScript ? 'View Table' : 'View Script'}
                        </button>
                      )}
                      <button onClick={exportCSV} className="btn-micro"><Download className="w-3 h-3" /> CSV</button>
                      <button onClick={exportJSON} className="btn-micro"><FileCode className="w-3 h-3" /> JSON</button>
                    </div>
                  </div>

                  {showScript && testRes.code_template ? (
                    <div style={{ padding: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                        <span className="type-label" style={{ color: 'var(--acid)' }}>Generated {testFW} Script</span>
                        <button className="btn-micro" onClick={() => { navigator.clipboard.writeText(testRes.code_template); showToast('Script copied'); }}>
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                      </div>
                      <pre className="code-surface" style={{ maxHeight: 520, overflowY: 'auto' }}>{testRes.code_template}</pre>
                    </div>
                  ) : (
                    <>
                      {/* Filter bar */}
                      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(240,235,225,0.08)', display: 'flex', flexWrap: 'wrap', items: 'center', justifyContent: 'space-between', gap: '0.75rem', background: 'var(--ink)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 120 }}>
                          <Search className="w-3.5 h-3.5" style={{ color: 'var(--ivory-ghost)' }} />
                          <input type="text" value={testSearch} onChange={e => setTestSearch(e.target.value)}
                            placeholder="Search tests…"
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--ivory)', fontFamily: 'var(--font-body)', fontSize: '0.78rem', width: '100%' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {['All', 'Authentication', 'Validation', 'Security', 'Boundary'].map(cat => (
                            <button key={cat} onClick={() => setTestFilter(cat)}
                              className={`btn-micro ${testFilter === cat ? 'active' : ''}`} style={{ fontSize: '0.6rem' }}>
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Table */}
                      <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              {['ID', 'Category', 'Scenario', 'Expected', 'Priority'].map(h => <th key={h}>{h}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTests.map((tc, i) => (
                              <tr key={i}>
                                <td><span className="type-mono" style={{ color: 'var(--acid)', fontSize: '0.65rem' }}>{tc.id}</span></td>
                                <td style={{ color: 'var(--ivory-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>{tc.category}</td>
                                <td style={{ minWidth: 200, lineHeight: 1.55, fontSize: '0.8rem' }}>{tc.description}</td>
                                <td style={{ minWidth: 160, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(48,209,88,0.85)' }}>{tc.expected_result}</td>
                                <td>
                                  <span className={`priority-tag ${(tc.priority || '').toLowerCase()}`}>{tc.priority}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Config Modal ────────────────────────────────────────── */}
      {configOpen && (
        <div className="modal-overlay fixed inset-0 z-[80] flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setConfigOpen(false)}>
          <div className="modal-box anim-modal" style={{ padding: '0' }}>
            {/* Modal header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(240,235,225,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 24, height: 24, background: 'var(--acid)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Settings className="w-3.5 h-3.5" style={{ color: 'var(--ink)' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ivory)' }}>Backend Configuration</span>
              </div>
              <button onClick={() => setConfigOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--ivory-ghost)', cursor: 'pointer' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div className="type-label mb-2">FastAPI Endpoint</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="text" value={backendUrl} onChange={e => setBackendUrl(e.target.value)}
                    style={{ flex: 1, background: 'var(--ink)', border: '1px solid rgba(240,235,225,0.12)', color: 'var(--ivory)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '0.5rem 0.75rem', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'var(--acid)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(240,235,225,0.12)'} />
                  <button className="btn-micro" onClick={() => setBackendUrl('http://localhost:8000')}>Reset</button>
                </div>
              </div>

              <div style={{ background: 'var(--ink)', border: '1px solid rgba(240,235,225,0.06)', padding: '0.75rem 1rem' }}>
                {[
                  { k: 'Connection', v: connected ? 'ACTIVE (200 OK)' : 'UNREACHABLE', ok: connected },
                  { k: 'Latency', v: latency ? `${latency}ms` : 'N/A' },
                  { k: 'LLM Engine', v: meta?.active_model || 'Groq OSS' },
                  { k: 'API Key', v: meta?.api_key_configured ? 'CONFIGURED' : 'NOT DETECTED', ok: meta?.api_key_configured },
                ].map(r => (
                  <div key={r.k} className="status-line">
                    <span className="type-label">{r.k}</span>
                    <span className="type-mono" style={{
                      fontSize: '0.65rem',
                      color: r.ok === true ? 'var(--signal-green)' : r.ok === false ? 'var(--signal-red)' : 'var(--ivory-dim)',
                    }}>{r.v}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--ink)', border: '1px solid rgba(240,235,225,0.06)', padding: '0.75rem 1rem' }}>
                <div className="type-label mb-2">Start Backend Server</div>
                <div className="type-mono" style={{ color: 'var(--acid)', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 0.75rem', fontSize: '0.72rem', userSelect: 'all' }}>
                  uvicorn main:app --reload --port 8000
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(240,235,225,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-acid" onClick={async () => { const ok = await checkHealth(); showToast(ok ? 'Connected!' : 'Unreachable'); }}>
                <RefreshCw className="w-3.5 h-3.5" /> Test Connection
              </button>
              <button className="btn btn-ghost" onClick={() => setConfigOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(240,235,225,0.08)', padding: '2rem 1.25rem', marginTop: '4rem' }}>
        <div className="max-w-screen-2xl mx-auto" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 24, height: 24, background: 'var(--acid)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrainCircuit className="w-3.5 h-3.5" style={{ color: 'var(--ink)' }} />
            </div>
            <div>
              <div className="type-display text-sm" style={{ color: 'var(--ivory)' }}>AI<span style={{ color: 'var(--acid)' }}>—</span>SE Toolkit</div>
              <div className="type-label">Enterprise Software Engineering Suite</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {[
              { icon: Zap, text: 'FastAPI' }, { icon: Globe, text: 'Groq Inference' }, { icon: Shield, text: 'OWASP' }
            ].map(f => (
              <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <f.icon className="w-3 h-3" style={{ color: 'var(--acid)' }} />
                <span className="type-label" style={{ textTransform: 'none', fontSize: '0.7rem', color: 'var(--ivory-ghost)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', height: 1, background: 'rgba(240,235,225,0.05)' }} />
        <div className="max-w-screen-2xl mx-auto mt-3">
          <span className="type-mono" style={{ fontSize: '0.62rem', color: 'var(--ivory-ghost)' }}>
            © 2026 AI-SE TOOLKIT · ARCHITECTURAL MODELING · VULNERABILITY AUDITING · COCOMO II · QA SYNTHESIS
          </span>
        </div>
      </footer>
    </div>
  );
}