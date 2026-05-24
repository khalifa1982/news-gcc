import React, { useState } from 'react';
import { NEWS_RESOURCES, NewsResource, COUNTRIES } from '../data';
import { Search, ExternalLink, Network, FileText, Tv, Globe, Shield, Radio, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

interface SourcesRegistryProps {
  activeCountryCode: string;
  onSelectSource: (sourceName: string) => void;
  language?: 'en' | 'ar';
}

export default function SourcesRegistry({ activeCountryCode, onSelectSource }: SourcesRegistryProps) {
  const [search, setSearch] = useState('');
  const [selectedCountryTab, setSelectedCountryTab] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredResources = NEWS_RESOURCES.filter(res => {
    // 1. Country filter
    const matchesCountry = selectedCountryTab === 'all' || res.countryCode === selectedCountryTab;
    // 2. Type filter
    const matchesType = typeFilter === 'all' || res.type === typeFilter;
    // 3. Text search
    const cleanSearch = search.toLowerCase();
    const matchesSearch = 
      res.name.toLowerCase().includes(cleanSearch) || 
      res.description.toLowerCase().includes(cleanSearch) || 
      res.countryName.toLowerCase().includes(cleanSearch) || 
      res.type.toLowerCase().includes(cleanSearch);

    return matchesCountry && matchesType && matchesSearch;
  });

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'State Agency':
        return <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'Daily Newspaper':
        return <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />;
      case 'Broadcast Network':
        return <Tv className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />;
      default:
        return <Globe className="w-5 h-5 text-stone-600 dark:text-zinc-400 shrink-0" />;
    }
  };

  const getCountryFlagUrl = (code: string) => {
    return `https://flagcdn.com/w40/${code}.png`;
  };

  return (
    <div className="w-full max-w-[1500px] mx-auto select-none animate-fade-in">
      
      {/* Top Hero Banner Profile */}
      <div className="mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-emerald-950/40 text-stone-50 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(16,185,129,0.15),transparent)] pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-mono tracking-widest uppercase mb-4">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            V-GCC Sovereign Media Monitor (26 Registry Sources)
          </div>
          <h1 className="font-serif italic font-extrabold text-3xl md:text-4xl text-white tracking-tight mb-3">
            Sovereign Media & News Registry
          </h1>
          <p className="text-stone-300 text-xs md:text-sm leading-relaxed max-w-2xl font-sans tracking-wide">
            Our real-time engine maps and crawls all 6 Gulf Cooperation Council (GCC) state news wires, national daily journals, 
            and broadcast stations. All syndicated reports are cross-referenced across these high-integrity nodes.
          </p>
        </div>
      </div>

      {/* Directory Searching and Filters Toolbar Card */}
      <div className="bg-white dark:bg-[#0E0F12] border border-stone-200/80 dark:border-zinc-800/80 rounded-2xl p-5 md:p-6 mb-8 shadow-sm flex flex-col gap-5 transition-colors">
        
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Integrated search bar */}
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search registry by name, country, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-stone-50 dark:bg-zinc-950/40 hover:bg-stone-100 dark:hover:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl focus:border-emerald-500 outline-none text-stone-800 dark:text-zinc-300 transition-all font-sans"
            />
          </div>

          {/* Quick Stat Bar */}
          <div className="flex gap-4 self-stretch lg:self-center justify-between md:justify-end text-xs font-mono font-bold text-stone-500 dark:text-zinc-400 tracking-wider">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100/50 dark:bg-zinc-900/30 rounded-lg border border-stone-200/40 dark:border-zinc-800/20">
              <span className="text-emerald-500 animate-ping inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
              ACTIVE MONITOR NODES: <span className="text-stone-900 dark:text-zinc-200 font-extrabold">{NEWS_RESOURCES.length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100/50 dark:bg-zinc-900/30 rounded-lg border border-stone-200/40 dark:border-zinc-800/20">
              MATCHED: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{filteredResources.length}</span>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-stone-100 dark:bg-zinc-800"></div>

        {/* Filters and category controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
          {/* Country list tabs */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 dark:text-zinc-500 font-semibold mr-1.5">
              Region:
            </span>
            <button
              onClick={() => setSelectedCountryTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCountryTab === 'all'
                  ? 'bg-stone-900 text-stone-50 dark:bg-zinc-100 dark:text-zinc-950'
                  : 'bg-stone-100/60 hover:bg-stone-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-800 text-stone-600 dark:text-zinc-400'
              }`}
            >
              All GCC States
            </button>
            {COUNTRIES.map(c => (
              <button
                key={c.code}
                onClick={() => setSelectedCountryTab(c.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  selectedCountryTab === c.code
                    ? 'bg-stone-900 text-stone-50 dark:bg-emerald-500 dark:text-zinc-950'
                    : 'bg-stone-100/60 hover:bg-stone-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-800 text-stone-600 dark:text-zinc-400'
                }`}
              >
                <img src={getCountryFlagUrl(c.code)} alt={c.name} className="w-4 h-2.5 object-cover rounded-sm ring-1 ring-black/10 shrink-0" />
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 dark:text-zinc-500 font-semibold mr-1.5">
              Type:
            </span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs font-bold bg-stone-50 dark:bg-zinc-900/50 hover:bg-stone-100 dark:hover:bg-zinc-800 border border-stone-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 outline-none text-stone-700 dark:text-zinc-300 focus:border-emerald-500 font-sans cursor-pointer"
            >
              <option value="all">All Channels</option>
              <option value="State Agency">State Agency</option>
              <option value="Daily Newspaper">Daily Newspaper</option>
              <option value="Broadcast Network">Broadcast Network</option>
            </select>
          </div>
        </div>

      </div>

      {/* Grid of Resources Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredResources.map((res) => {
          const isStateWire = res.type === 'State Agency';
          return (
            <div
              key={res.id}
              className={`bg-white dark:bg-[#0E0F12] border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-350 select-none ${
                isStateWire 
                  ? 'border-emerald-500/20 dark:border-emerald-500/10 ring-1 ring-emerald-500/5 dark:ring-emerald-500/5 bg-gradient-to-b from-white to-emerald-500/[0.015] dark:from-[#0E0F12] dark:to-emerald-500/[0.01]' 
                  : 'border-stone-200/70 dark:border-zinc-800/70 hover:border-stone-300 dark:hover:border-zinc-800'
              }`}
            >
              <div>
                
                {/* Channel Header Group row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-zinc-900/80 flex items-center justify-center border border-stone-200/50 dark:border-zinc-805 shrink-0">
                      {getSourceIcon(res.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-zinc-100 tracking-tight leading-tight">
                        {res.name}
                      </h4>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <img 
                          src={getCountryFlagUrl(res.countryCode)} 
                          alt="flag" 
                          className="w-3.5 h-2 object-cover rounded-sm ring-1 ring-black/5" 
                        />
                        <span className="text-[10px] font-mono uppercase font-bold text-stone-400 dark:text-zinc-500 tracking-wider">
                          {res.countryName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Established text */}
                  <span className="text-[9.5px] font-mono text-stone-500 dark:text-zinc-400 border border-stone-100 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-950/40 px-1.5 py-0.5 rounded">
                    Est. {res.established}
                  </span>
                </div>

                {/* Body description text info */}
                <p className="text-xs text-stone-600 dark:text-zinc-405 leading-relaxed tracking-wide mb-4.5 font-sans min-h-[48px]">
                  {res.description}
                </p>

                {/* Badges tag pill stack row */}
                <div className="flex flex-wrap gap-1.5 mb-5 select-none font-mono text-[9px] font-bold">
                  <span className="bg-stone-100/80 dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 px-2 py-0.5 rounded capitalize">
                    {res.type.toLowerCase()}
                  </span>
                  <span className="bg-amber-500/5 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/10 px-2 py-0.5 rounded uppercase">
                    {res.lang}
                  </span>
                  <span className="bg-stone-100/80 dark:bg-zinc-900 text-stone-500 dark:text-zinc-400 px-2 py-0.5 rounded uppercase font-bold">
                    {res.frequency}
                  </span>
                </div>

              </div>

              {/* Bottom footer active state telemetry and interactive CTAs */}
              <div className="pt-4.5 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between gap-4 mt-1 select-none">
                
                {/* Status signal bulb */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    res.status === 'Active Feed' 
                      ? 'bg-emerald-500 animate-pulse' 
                      : 'bg-stone-400 dark:bg-zinc-600'
                  }`}></span>
                  <span className={res.status === 'Active Feed' ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-stone-400 dark:text-zinc-500'}>
                    {res.status.toUpperCase()}
                  </span>
                </div>

                {/* Operations links row buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectSource(res.name)}
                    className="px-2.5 py-1.5 text-[10px] font-bold font-mono tracking-wider bg-emerald-600 hover:bg-emerald-700 active:scale-95 dark:disabled:opacity-40 text-stone-50 dark:bg-emerald-500 dark:text-slate-950 rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                    title={`Focus news grid feed on ${res.name}`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>FOCUS FEED</span>
                  </button>
                  
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-zinc-500 dark:hover:text-zinc-200 border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-950/40 hover:bg-stone-100 dark:hover:bg-zinc-900 rounded-lg transition-colors flex items-center justify-center shrink-0"
                    title={`Visit official ${res.name} website`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>

            </div>
          );
        })}

        {filteredResources.length === 0 && (
          <div className="col-span-full py-16 text-center select-none">
            <Globe className="w-12 h-12 text-stone-300 dark:text-zinc-700 mx-auto mb-4 animate-bounce" />
            <span className="text-sm font-semibold text-stone-600 dark:text-zinc-400 block">
              No matching news resources found.
            </span>
            <p className="text-stone-500 dark:text-zinc-500 text-xs mt-1.5 max-w-sm mx-auto">
              Try adjusting your query text or state filter tabs to match verified monitors.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
