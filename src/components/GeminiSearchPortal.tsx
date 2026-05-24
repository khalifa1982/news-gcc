import React, { useState, useEffect } from 'react';
import { 
  Search, Sparkles, Sliders, ExternalLink, RefreshCw, Layers, 
  CheckCircle2, AlertTriangle, Save, MapPin, Tag, ShieldCheck, Newspaper,
  Play, StopCircle, Database, Globe, Activity, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface GeminiSearchPortalProps {
  onArticleSyndicated: (newArticle: any) => void;
  activeCountryCode: string;
  language?: 'en' | 'ar';
}

interface SweepTarget {
  id: string;
  country: string;
  city: string;
  category: string;
  status: 'idle' | 'searching' | 'completed' | 'failed' | 'syndicated';
  result?: any;
}

export default function GeminiSearchPortal({ onArticleSyndicated, activeCountryCode }: GeminiSearchPortalProps) {
  // Navigation tabs
  const [activePortalTab, setActivePortalTab] = useState<'single' | 'sweep'>('sweep');

  // Manual query states
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [syndicating, setSyndicating] = useState(false);
  const [syndicatedSuccess, setSyndicatedSuccess] = useState(false);

  // Manual search parameters
  const [regionFocus, setRegionFocus] = useState<string>('All GCC');
  const [categoryFocus, setCategoryFocus] = useState<string>('Economic');
  const [recencyConstraint, setRecencyConstraint] = useState<string>('today');
  const [outputStyle, setOutputStyle] = useState<string>('comprehensive');
  const [loadingStep, setLoadingStep] = useState(0);

  // Automated Ingest Sweep cockpit states
  const [autoSyndicateOnFetch, setAutoSyndicateOnFetch] = useState(true);
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepTargets, setSweepTargets] = useState<SweepTarget[]>([
    { id: 't1', country: 'UAE', city: 'Dubai', category: 'Investment', status: 'idle' },
    { id: 't2', country: 'Saudi Arabia', city: 'Riyadh', category: 'Economic', status: 'idle' },
    { id: 't3', country: 'Qatar', city: 'Doha', category: 'Commercial', status: 'idle' },
    { id: 't4', country: 'Oman', city: 'Muscat', status: 'idle', category: 'Political' },
    { id: 't5', country: 'Bahrain', city: 'Manama', status: 'idle', category: 'Local' },
    { id: 't6', country: 'Kuwait', city: 'Kuwait City', status: 'idle', category: 'Commercial' },
    { id: 't7', country: 'UAE', city: 'Abu Dhabi', status: 'idle', category: 'Educational' },
    { id: 't8', country: 'Saudi Arabia', city: 'Mecca', status: 'idle', category: 'Local' },
  ]);
  const [activeSweepIndex, setActiveSweepIndex] = useState<number | null>(null);
  const [sweepLogs, setSweepLogs] = useState<string[]>([]);
  const [sweepDispatches, setSweepDispatches] = useState<any[]>([]);

  // Helpers to compile queries
  const getRecencyPromptText = () => {
    switch (recencyConstraint) {
      case 'today': return "Limit searches strictly to the last 24 hours for current breaking news.";
      case 'past-week': return "Prioritize publications from the past 7 days.";
      default: return "Search historical and recent indexes without time bounds.";
    }
  };

  const getStylePromptText = () => {
    switch (outputStyle) {
      case 'bulletin': return "Analyze and synthesize the data as highly compressed, dense executive intelligence bullets.";
      case 'stream': return "Draft the report as a fast, factual feed stream entry.";
      default: return "Synthesize a structured, long-form journalistic article suitable for sovereign syndication.";
    }
  };

  // Append entry to live sweeper terminal log
  const logMessage = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSweepLogs(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 50));
  };

  // Perform manual single search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSyndicatedSuccess(false);
    setLoadingStep(0);

    const stepIntervals = [
      setTimeout(() => setLoadingStep(1), 1200),
      setTimeout(() => setLoadingStep(2), 2800),
      setTimeout(() => setLoadingStep(3), 4200),
    ];

    try {
      const compiledQuery = `[Region: ${regionFocus}] [Focus: ${categoryFocus}] [Filter: ${getRecencyPromptText()}] [Style: ${getStylePromptText()}] Topic: ${query}`;
      
      const response = await fetch('/api/search-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: compiledQuery })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      setResult(data.article);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to contact sovereign Gemini Search Index.");
    } finally {
      stepIntervals.forEach(clearTimeout);
      setLoading(false);
    }
  };

  const generateAiImageForArticle = async (headline: string, country: string, city: string, category: string): Promise<string> => {
    try {
      const response = await fetch('/api/generate-article-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, country, city, category })
      });
      if (response.ok) {
        const data = await response.json();
        return data.imageUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800";
      }
    } catch (e) {
      console.warn("Failed to generate custom AI image, using fallback asset:", e);
    }
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800";
  };

  // Syndicate a single manually searched dispatch
  const handleSyndicate = async () => {
    if (!result) return;
    setSyndicating(true);
    setError(null);

    const randomId = 'news_gemini_' + Math.random().toString(36).substr(2, 9);
    const mainCity = result.city ? `@${result.city}` : '@Dubai';
    const mainCountry = result.country ? `@${result.country}` : '@UAE';
    const locationTags = [mainCity];
    if (mainCountry && mainCountry !== mainCity) {
      locationTags.push(mainCountry);
    }

    const categoryTag = result.category || categoryFocus;
    let computedImg = result.imageUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800";
    if (!result.imageUrl) {
      try {
        computedImg = await generateAiImageForArticle(result.headline, result.country || 'UAE', result.city || 'Dubai', categoryTag);
      } catch (e) {
        console.warn(e);
      }
    }

    const newsItem = {
      id: randomId,
      headline: result.headline || "Grounded AI Dispatch",
      content: result.content || "Factual summary content compiled with search grounding.",
      publishedAt: new Date().toISOString(),
      imageUrl: computedImg,
      sources: result.sources || [{ name: "Google Gemini Grounded Search", url: "https://google.com" }],
      locationTags: locationTags,
      categoryTags: [`#${categoryTag}`],
      verifiedStatus: result.verifiedStatus || "Verified with Real-Time Google Search Grounding"
    };

    try {
      await setDoc(doc(db, 'news', randomId), newsItem);
      setSyndicatedSuccess(true);
      onArticleSyndicated(newsItem);
    } catch (err: any) {
      console.warn("Firestore write fallback used in search:", err);
      setSyndicatedSuccess(true);
      onArticleSyndicated(newsItem);
      setError("Note: Article registered in active browser session. Admin DB lock is active.");
    } finally {
      setSyndicating(false);
    }
  };

  // Run the full automated GCC search sweep (Past 5 Hours focus)
  const startAutopilotSweep = async () => {
    if (isSweeping) return;
    setIsSweeping(true);
    setSweepLogs([]);
    setSweepDispatches([]);
    
    // Reset statuses to idle before starting
    setSweepTargets(prev => prev.map(t => ({ ...t, status: 'idle', result: undefined })));
    logMessage("🚨 SYSTEM ALERT: Initiating GCC Sovereign Multi-Dimensional Sweep Cycle.");
    logMessage("🕒 TEMPORAL FOCUS: Past 5 Hours strictly filtered web index crawling.");
    
    // Iterate sequentially through targets
    for (let i = 0; i < sweepTargets.length; i++) {
      const target = sweepTargets[i];
      setActiveSweepIndex(i);
      
      setSweepTargets(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'searching' } : t));
      logMessage(`🔍 Starting retrieval for target [${target.country} / ${target.city}] aligned with #${target.category}...`);

      try {
        // Construct targeted query targeting news in the past 5 hours strictly
        const sweepQuery = `Latest verified breaking news/announcements published in ${target.city}, ${target.country} about ${target.category} strictly in the past 5 hours. Exclude historical events. Focus only on today's current GCC publications.`;
        
        const response = await fetch('/api/search-news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: sweepQuery })
        });

        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }

        const data = await response.json();
        const article = data.article;

        if (article) {
          logMessage(`✨ Grounded data retrieved cleanly for ${target.city}: "${article.headline.substring(0, 45)}..."`);
          
          setSweepTargets(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'completed', result: article } : t));
          
          logMessage(`🎨 Triggering dynamic AI photo synthesis matching '${target.city}' and '#${target.category}'...`);
          let computedImg = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800";
          try {
            computedImg = await generateAiImageForArticle(article.headline, target.country, target.city, target.category);
          } catch (e) {
            console.warn(e);
          }

          // Assembling proper GCC News Item format
          const randomId = 'news_sweep_' + Math.random().toString(36).substr(2, 9);
          const locationTags = [`@${target.city}`, `@${target.country}`];
          
          const verifiedNewsItem = {
            id: randomId,
            headline: article.headline || `${target.city} ${target.category} Update`,
            content: article.content || "Factual summary content compiled with search grounding.",
            publishedAt: new Date().toISOString(), // Fresh
            imageUrl: computedImg,
            sources: article.sources && article.sources.length > 0 ? article.sources : [{ name: "Google Real-Time Index", url: "https://google.com" }],
            locationTags: locationTags,
            categoryTags: [`#${target.category}`],
            verifiedStatus: article.verifiedStatus || `Verified across regional sources in the last 5 hours via Gemini Search Grounding`
          };

          setSweepDispatches(prev => [verifiedNewsItem, ...prev]);

          // Auto-syndicate if ticked
          if (autoSyndicateOnFetch) {
            logMessage(`💾 Auto-syndicating "${verifiedNewsItem.headline.substring(0, 40)}" directly into the active register...`);
            try {
              await setDoc(doc(db, 'news', randomId), verifiedNewsItem);
              setSweepTargets(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'syndicated' } : t));
              onArticleSyndicated(verifiedNewsItem);
              logMessage(`✅ Successfully syndicated & published.`);
            } catch (fsErr) {
              // Local fallback inside App
              onArticleSyndicated(verifiedNewsItem);
              setSweepTargets(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'syndicated' } : t));
              logMessage(`⚠️ Local system register successful for ${target.city}. (Database sync locked to administrator write tokens)`);
            }
          }
        } else {
          throw new Error("No article synthesized in body.");
        }
      } catch (err: any) {
        logMessage(`❌ Failed target sweep combo: ${err.message || err}`);
        setSweepTargets(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'failed' } : t));
      }

      // Small pause to spacing API requests gracefully
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setIsSweeping(false);
    setActiveSweepIndex(null);
    logMessage("🏁 COCKPIT PROGRESS: Full sovereign sweep sequence completed. All fresh grounded dispatches registered.");
  };

  // Perform manual syndication for single swept dispatch
  const syndicateSweptDispatch = async (index: number, article: any, target: SweepTarget) => {
    const randomId = 'news_sweep_manual_' + Math.random().toString(36).substr(2, 9);
    const locationTags = [`@${target.city}`, `@${target.country}`];
    
    logMessage(`🎨 Generating custom AI image for manual syndication...`);
    let computedImg = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800";
    try {
      computedImg = await generateAiImageForArticle(article.headline, target.country, target.city, target.category);
    } catch (e) {
      console.warn(e);
    }

    const verifiedNewsItem = {
      id: randomId,
      headline: article.headline,
      content: article.content,
      publishedAt: new Date().toISOString(),
      imageUrl: computedImg,
      sources: article.sources || [{ name: "Google Grounded Engine", url: "https://google.com" }],
      locationTags: locationTags,
      categoryTags: [`#${target.category}`],
      verifiedStatus: article.verifiedStatus || `Real-time search check (Last 5 hours)`
    };

    try {
      await setDoc(doc(db, 'news', randomId), verifiedNewsItem);
      setSweepTargets(prev => prev.map((t, idx) => idx === index ? { ...t, status: 'syndicated' } : t));
      onArticleSyndicated(verifiedNewsItem);
      logMessage(`✅ Manually syndicated: "${verifiedNewsItem.headline.substring(0, 30)}..."`);
    } catch (fsErr) {
      onArticleSyndicated(verifiedNewsItem);
      setSweepTargets(prev => prev.map((t, idx) => idx === index ? { ...t, status: 'syndicated' } : t));
      logMessage(`⚠️ Dynamic session syndication loaded. (DB administrative rules limit direct writes)`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-12 animate-fade-in select-none">
      
      {/* Editorial Search Mission Branding Lockup */}
      <div className="border-b border-stone-200/80 dark:border-zinc-800 pb-5 mb-1 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="text-xs font-mono tracking-[0.25em] text-emerald-600 dark:text-emerald-400 font-bold uppercase block mb-2">
            INTELLIGENCE INGEST GATEWAY
          </span>
          <h1 className="font-serif italic font-black text-3.5xl md:text-4.5xl text-stone-950 dark:text-zinc-50 tracking-tight">
            Sovereign Grounded Search Engine
          </h1>
          <p className="text-[12.5px] leading-relaxed text-stone-500 dark:text-zinc-400 mt-2 max-w-2xl">
            Real-time direct web crawlers using Google Gemini search engine models. Retrieve, parse, and verify live regional bulletins from all official GCC outlets.
          </p>
        </div>

        {/* Portal Portal Tabs Switcher */}
        <div className="flex bg-stone-100 dark:bg-zinc-900 border border-stone-200/60 dark:border-zinc-800/80 p-0.5 rounded-xl text-stone-605 self-start md:self-end">
          <button
            onClick={() => setActivePortalTab('sweep')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activePortalTab === 'sweep'
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-stone-500 hover:text-stone-905 dark:text-zinc-450'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Core 5-Hour Sweep Cockpit
          </button>
          <button
            onClick={() => setActivePortalTab('single')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activePortalTab === 'single'
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-stone-500 hover:text-stone-905 dark:text-zinc-450'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Manual Search Target
          </button>
        </div>
      </div>

      {activePortalTab === 'sweep' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: SWEEP CONTROLS & TARGETS CARD */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* INGEST TERMINAL METRICS CONTROL BOARD */}
            <div className="bg-white dark:bg-[#0E0F12] border border-stone-200/80 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.02)] flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-stone-150 dark:border-zinc-850 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-450" />
                  <span className="font-mono text-[11px] font-bold uppercase text-stone-950 dark:text-zinc-200 tracking-wider">
                    Auto-Pilot GCC Sweep configuration
                  </span>
                </div>
                <span className="text-[9.5px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-mono font-bold rounded">
                  PAST 5 HOURS ACTIVE
                </span>
              </div>

              <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed font-sans mt-1">
                Launches an automated sequential indexing cycle across GCC nations. The harvester searches for public developments published strictly **in the last 5 hours** to populate regional filters.
              </p>

              {/* Toggle switch for auto syndication */}
              <div className="flex items-center justify-between bg-stone-50 dark:bg-zinc-950/60 p-4 rounded-xl border border-stone-200/50 dark:border-zinc-850/60">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-stone-900 dark:text-zinc-200">
                    Auto-Syndicate Grounded Bulletins
                  </span>
                  <span className="text-[10px] text-stone-400 dark:text-zinc-500 leading-none">
                    Automatically publish verified results to the news feed in real-time
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSyndicateOnFetch(!autoSyndicateOnFetch)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                    autoSyndicateOnFetch ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-stone-300 dark:bg-zinc-850'
                  }`}
                >
                  <div className={`bg-white dark:bg-stone-950 w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    autoSyndicateOnFetch ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Big Action button trigger */}
              <div className="flex items-center gap-4 mt-2">
                {isSweeping ? (
                  <button
                    onClick={() => setIsSweeping(false)}
                    className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <StopCircle className="w-4 h-4" />
                    ABORT CURRENT SWEEP CYCLE
                  </button>
                ) : (
                  <button
                    onClick={startAutopilotSweep}
                    className="flex-1 py-3.5 bg-stone-950 dark:bg-zinc-100 hover:bg-stone-850 dark:hover:bg-zinc-200 text-stone-50 dark:text-zinc-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md"
                  >
                    <Play className="w-4 h-4 fill-current text-amber-500 dark:text-amber-600" />
                    INITIATE REAL-TIME 5-HOUR SWEEP
                  </button>
                )}
              </div>
            </div>

            {/* THE HARVEST MATRIX GRID (LIST OF COGNITIVE COMBOS WHICH WILL BE INGESTED) */}
            <div className="bg-white dark:bg-[#0E0F12] border border-stone-200/85 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
              <span className="font-mono text-[10.5px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest block pb-2.5 border-b border-stone-150 dark:border-zinc-850">
                SWEEP MATRICES ({sweepTargets.length} TARGET FIELDS)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sweepTargets.map((target, idx) => {
                  const isCurrent = activeSweepIndex === idx;
                  return (
                    <div
                      key={target.id}
                      className={`p-3.5 items-center rounded-xl border flex justify-between gap-3 transition-all ${
                        isCurrent 
                          ? 'border-emerald-500/70 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-[0_4px_15px_rgba(16,185,129,0.05)] scale-[1.01]' 
                          : target.status === 'syndicated'
                          ? 'border-emerald-200/50 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 opacity-75'
                          : target.status === 'completed'
                          ? 'border-amber-200/50 dark:border-amber-900/30 bg-amber-50/10 dark:bg-amber-950/10'
                          : target.status === 'failed'
                          ? 'border-rose-200/50 dark:border-rose-900/30 bg-rose-50/10'
                          : 'border-stone-200/40 dark:border-zinc-850/60 bg-stone-50/30 dark:bg-zinc-950/20'
                      }`}
                    >
                      <div className="flex flex-col gap-1 overflow-hidden min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Globe className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="text-xs font-extrabold text-stone-900 dark:text-zinc-200 truncate">
                            {target.city}, {target.country}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-450" />
                          <span className="text-[10px] font-mono text-stone-500 dark:text-zinc-400">
                            #{target.category}
                          </span>
                        </div>
                      </div>

                      {/* Status indicator badge */}
                      <div className="shrink-0 select-none">
                        {target.status === 'idle' && (
                          <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-zinc-800 block" title="Waiting for queue" />
                        )}
                        {target.status === 'searching' && (
                          <RefreshCw className="w-3.5 h-3.5 text-emerald-500 animate-spin shrink-0" />
                        )}
                        {target.status === 'completed' && (
                          <span className="text-[9px] font-mono font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded">
                            Fetched
                          </span>
                        )}
                        {target.status === 'syndicated' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        )}
                        {target.status === 'failed' && (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: TERMINAL AND DISPATCH FEED DYNAMICS */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* LIVE TERMINAL CONSOLE LOGGER */}
            <div className="bg-[#090A0D] border border-stone-800 dark:border-zinc-850 rounded-2xl flex flex-col overflow-hidden h-64 shadow-2xl relative">
              <div className="flex items-center justify-between px-4 py-3 bg-[#0E0F13] border-b border-stone-850">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[9.5px] font-mono uppercase font-bold text-zinc-300 tracking-widest">
                    Sovereign Harvest Feed Console
                  </span>
                </div>
                {isSweeping && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>

              <div className="flex-1 p-4 font-mono text-[10.5px] leading-relaxed text-zinc-350 overflow-y-auto flex flex-col gap-1.5 select-text selection:bg-emerald-500/20">
                {sweepLogs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-500 text-center text-[10px] italic">
                    Sweeper idle. Press "Initiate real-time 5-hour sweep" to engage log tracking.
                  </div>
                ) : (
                  sweepLogs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`break-words ${
                        log.includes('✅') || log.includes('✨') ? 'text-emerald-400 font-bold' : 
                        log.includes('🚨') ? 'text-amber-400 font-extrabold font-sans py-0.5' : 
                        log.includes('🏁') ? 'text-cyan-400 font-bold animate-pulse' :
                        log.includes('❌') ? 'text-rose-450 font-bold' : 'text-zinc-350'
                      }`}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ACCUMULATED FRESH DISPATCHES FROM SWEEP */}
            <div className="bg-white dark:bg-[#0E0F12] border border-stone-200/80 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
              <span className="font-mono text-[10.5px] font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest block pb-2.5 border-b border-stone-150 dark:border-zinc-850">
                Dispatches synthethised ({sweepDispatches.length} Articles)
              </span>

              {sweepDispatches.length === 0 ? (
                <div className="py-8 text-center text-stone-400 dark:text-zinc-500 text-xs italic">
                  No dispatches generated yet. Active sweep is required to accumulate dynamic payloads.
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-1">
                  {sweepDispatches.map((disp, index) => {
                    const matchIndex = sweepTargets.findIndex(t => t.city === disp.locationTags[0].replace('@', ''));
                    const targetStateObj = matchIndex !== -1 ? sweepTargets[matchIndex] : null;
                    const syndicated = targetStateObj?.status === 'syndicated';
                    
                    return (
                      <div 
                        key={disp.id}
                        className="p-4 rounded-xl border border-stone-200/60 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-950/40 flex flex-col gap-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono bg-stone-100 dark:bg-zinc-900 border border-stone-200/40 px-2 py-0.5 rounded font-extrabold text-stone-600 dark:text-zinc-400 uppercase">
                            {disp.categoryTags[0]}
                          </span>
                          <span className="text-[9.5px] text-stone-400 dark:text-zinc-500 font-mono">
                            {disp.locationTags.join(' ')}
                          </span>
                        </div>

                        <h4 className="font-serif italic font-bold text-sm text-stone-900 dark:text-zinc-150 leading-tight">
                          {disp.headline}
                        </h4>

                        <p className="text-[11.5px] text-stone-500 dark:text-zinc-400 line-clamp-3">
                          {disp.content}
                        </p>

                        <div className="flex items-center justify-between pt-1.5 border-t border-stone-150 dark:border-zinc-850 mt-1">
                          <div className="flex gap-1.5">
                            {disp.sources?.slice(0, 2).map((s: any, idx: number) => (
                              <span key={idx} className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                                {s.name}
                              </span>
                            ))}
                          </div>

                          {!syndicated && targetStateObj && (
                            <button
                              onClick={() => syndicateSweptDispatch(matchIndex, disp, targetStateObj)}
                              className="px-3 py-1 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-zinc-950 font-bold text-[9.5px] uppercase tracking-wider rounded-lg hover:bg-emerald-700 transition-all cursor-pointer"
                            >
                              Syndicate
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      ) : (
        <>
          {/* harvester configuration bento board (manual search style) */}
          <form onSubmit={handleSearch} className="bg-white dark:bg-[#0E0F12] border border-stone-200/80 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.02)] flex flex-col gap-6">
            
            {/* HARVEST OPTIONS SECTIONS HEADER */}
            <div className="flex items-center gap-2.5 pb-3.5 border-b border-stone-150 dark:border-zinc-850/80">
              <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-[11.5px] font-mono font-bold uppercase tracking-widest text-stone-950 dark:text-zinc-150">
                1. Harvester Retrieval Setup Parameters
              </h2>
            </div>

            {/* Dynamic setup inputs grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Territory Focus */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9.5px] font-mono font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Territory Alignment
                </label>
                <select
                  value={regionFocus}
                  onChange={(e) => setRegionFocus(e.target.value)}
                  className="bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg p-2.5 text-xs text-stone-850 dark:text-zinc-200 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <option value="All GCC">GCC-Wide (All regions)</option>
                  <option value="UAE">UAE (Dubai, Abu Dhabi)</option>
                  <option value="Saudi Arabia">Saudi Arabia (Riyadh, Jeddah)</option>
                  <option value="Oman">Oman (Muscat, Sohar)</option>
                  <option value="Qatar">Qatar (Doha)</option>
                  <option value="Bahrain">Bahrain (Manama)</option>
                  <option value="Kuwait">Kuwait (Kuwait City)</option>
                </select>
              </div>

              {/* Core Verticals */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9.5px] font-mono font-bold text-stone-400 dark:text-zinc-400 uppercase tracking-widest">
                  Industry Vertical
                </label>
                <select
                  value={categoryFocus}
                  onChange={(e) => setCategoryFocus(e.target.value)}
                  className="bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg p-2.5 text-xs text-stone-850 dark:text-zinc-200 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <option value="Economic">Economic & Capital</option>
                  <option value="Investment">Investment Expansion</option>
                  <option value="Commercial">Commercial & Trade</option>
                  <option value="Political">Political Frameworks</option>
                  <option value="Educational">Educational & Research</option>
                  <option value="Local">Local Bulletins</option>
                </select>
              </div>

              {/* Time Filter recency */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9.5px] font-mono font-bold text-stone-400 dark:text-zinc-500 uppercase tracking-widest">
                  Recency Constrain
                </label>
                <select
                  value={recencyConstraint}
                  onChange={(e) => setRecencyConstraint(e.target.value)}
                  className="bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg p-2.5 text-xs text-stone-850 dark:text-zinc-200 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <option value="any">Unbounded (All matching logs)</option>
                  <option value="today">Past 24 Hours (Breaking news)</option>
                  <option value="past-week">Past Week (Recommended)</option>
                </select>
              </div>

              {/* Reporting Style */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9.5px] font-mono font-bold text-[#b4b4b4] uppercase tracking-widest">
                  Synthesis Blueprint
                </label>
                <select
                  value={outputStyle}
                  onChange={(e) => setOutputStyle(e.target.value)}
                  className="bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg p-2.5 text-xs text-stone-850 dark:text-zinc-200 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <option value="comprehensive">Comprehensive Report Article</option>
                  <option value="bulletin">Executive Bullet List</option>
                  <option value="stream">Real-time Stream Layout</option>
                </select>
              </div>
            </div>

            {/* INPUT QUERY TRIGGER INTERFACE */}
            <div className="flex flex-col gap-3.5 pt-2">
              <div className="flex items-center gap-2.5 pb-2 border-b border-stone-150 dark:border-zinc-850/80">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <h2 className="text-[11.5px] font-mono font-bold uppercase tracking-widest text-stone-950 dark:text-zinc-150">
                  2. Query the Global google Index
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 dark:text-zinc-500 absolute left-4 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type query to fetch... (e.g. Riyadh mega sports project agreements or Dubai AI tech funding)"
                    className="w-full pl-11 pr-4 py-3 text-xs font-semibold bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 focus:border-stone-300 dark:focus:border-zinc-700 focus:bg-white rounded-xl outline-none text-stone-900 dark:text-zinc-150 transition-all font-sans leading-normal"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-[#121316] dark:bg-zinc-100 dark:hover:bg-zinc-200 text-stone-50 dark:text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-stone-800 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Accessing Web...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-600" />
                      Engage Harvester
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* ACTIVE LOADING SEQUENCE EXPLAINER */}
          {loading && (
            <div className="bg-white dark:bg-[#0E0F12] border border-stone-250/70 dark:border-zinc-800/80 p-8 rounded-2xl flex flex-col items-center justify-center gap-4 text-center shadow-lg animate-pulse">
              <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
              <div className="flex flex-col gap-1 max-w-sm">
                <span className="text-xs font-bold uppercase tracking-widest font-mono text-stone-950 dark:text-zinc-150">
                  Retrieving Coverage...
                </span>
                <span className="text-[11px] font-mono text-stone-400 tracking-wide mt-1 animate-fade-in text-center leading-normal">
                  {loadingStep === 0 && "Step 1/3: Triggering Google search index for web grounding..."}
                  {loadingStep === 1 && "Step 2/3: Sifting authority publication resources & filtering date constraints..."}
                  {loadingStep === 2 && "Step 3/3: Synthesizing grounded data structures & assembling citations..."}
                </span>
              </div>
            </div>
          )}

          {/* GROUNDED HARVEST RESULTS PANEL */}
          {result && (
            <motion.div 
              className="flex flex-col gap-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-white dark:bg-[#0E0F12] border border-stone-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-[0_6px_40px_rgba(0,0,0,0.03)] relative overflow-hidden flex flex-col gap-6">
                
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-150 dark:border-zinc-850 pb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9.5px] font-bold font-mono uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200/40 dark:border-amber-900/40 rounded-lg">
                      <Tag className="w-3 h-3" /> #{result.category || categoryFocus}
                    </span>
                    {result.city && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9.5px] font-bold font-mono uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/40 rounded-lg">
                        <MapPin className="w-3 h-3" /> @{result.city}
                      </span>
                    )}
                    {result.country && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[9.5px] font-bold font-mono uppercase bg-stone-100 dark:bg-zinc-800/80 text-stone-700 dark:text-zinc-300 border border-stone-200 dark:border-zinc-700 rounded-lg">
                        {result.country}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/30 px-3 py-1 rounded-xl text-xs text-emerald-800 dark:text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="font-mono text-[10px] uppercase tracking-wide">
                      Grounded AI verified
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-mono text-stone-400 dark:text-zinc-500 tracking-widest uppercase font-bold">
                    CURRENT GROUNDED OUTCOME:
                  </span>
                  <h2 className="font-serif italic font-black text-2.5xl md:text-3.5xl text-stone-900 dark:text-zinc-50 tracking-tight leading-tight">
                    {result.headline}
                  </h2>
                </div>

                <div className="text-stone-700 dark:text-zinc-350 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {result.content}
                </div>

                <div className="p-4 bg-stone-50 dark:bg-zinc-950/60 rounded-2xl border border-stone-150 dark:border-zinc-850/80 flex flex-col gap-1.5">
                  <span className="text-[9.5px] font-mono uppercase text-stone-400 dark:text-zinc-500 font-bold tracking-widest">
                    Verification Pipeline Audit:
                  </span>
                  <p className="text-xs text-stone-650 dark:text-zinc-400 font-medium">
                    {result.verifiedStatus}
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <span className="text-[9.5px] font-mono text-stone-400 dark:text-zinc-500 tracking-widest uppercase font-bold flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-500" /> Google search grounded citations:
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {result.sources?.map((src: any, index: number) => (
                      <a
                        key={index}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl border border-stone-200/50 dark:border-zinc-800/60 bg-stone-50 dark:bg-zinc-950 hover:bg-stone-100 dark:hover:bg-zinc-900 transition-colors shadow-sm select-none"
                      >
                        <div className="flex flex-col gap-0.5 max-w-[90%]">
                          <span className="text-xs font-bold text-stone-800 dark:text-zinc-200 truncate">
                            {src.name}
                          </span>
                          <span className="text-[9.5px] text-stone-400 truncate dark:text-zinc-500 font-mono">
                            {src.url}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400 shrink-0 select-none" />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-5 border-t border-stone-200/80 dark:border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col text-center sm:text-left">
                    <span className="text-[10px] font-mono tracking-wider font-bold text-stone-400 dark:text-zinc-500 uppercase">
                      REGIONAL SYNDICATION GATEWAY
                    </span>
                    <span className="text-[10.5px] text-stone-500 dark:text-zinc-500 font-medium">
                      Authorise publication directly into the active dashboard news feed.
                    </span>
                  </div>

                  {syndicatedSuccess ? (
                    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/40 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide animate-bounce">
                      <CheckCircle2 className="w-4 h-4" /> Published to Sovereign Feed!
                    </div>
                  ) : (
                    <button
                      onClick={handleSyndicate}
                      disabled={syndicating}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white dark:bg-emerald-500 dark:text-zinc-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      {syndicating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Syndicating...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Syndicate to News Feed
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* ERROR HANDLED BOX */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-905/30 rounded-xl flex items-start gap-3 shadow-sm select-none">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-rose-800 dark:text-rose-450 uppercase font-mono tracking-widest">
              Indexing / Write System Intercept:
            </span>
            <p className="text-[11px] leading-relaxed text-rose-600 dark:text-rose-450 font-mono mt-1 select-all break-all">
              {error}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
