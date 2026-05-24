import { useEffect, useState } from 'react';
import { MOCK_NEWS, COUNTRIES, NewsItem } from '../data';
import NewsCard from './NewsCard';
import { collection, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Tag, MapPin, Search, Layers, RefreshCw, LayoutGrid, LayoutList, Newspaper } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { t, Language } from '../translation';

interface NewsGridProps {
  activeCountryCode: string;
  activeCategory: string | null;
  activeCity: string | null;
  searchTerm: string;
  setActiveCategory: (cat: string | null) => void;
  setActiveCity: (city: string | null) => void;
  setSearchTerm: (term: string) => void;
  onSelectTag?: (tag: string) => void;
  news: NewsItem[];
  loading: boolean;
  onSelectArticle: (item: NewsItem) => void;
  language: Language;
  onTriggerSpotCheck?: () => void;
  spotRefreshActive?: boolean;
  activeArchive?: string | null;
}

export default function NewsGrid({
  activeCountryCode,
  activeCategory,
  activeCity,
  searchTerm,
  setActiveCategory,
  setActiveCity,
  setSearchTerm,
  onSelectTag,
  news,
  loading,
  onSelectArticle,
  language,
  onTriggerSpotCheck,
  spotRefreshActive = false,
  activeArchive = null
}: NewsGridProps) {
  const activeCountry = COUNTRIES.find(c => c.code === activeCountryCode) || COUNTRIES[0];
  const [displayMode, setDisplayMode] = useState<'magazine' | 'traditional' | 'compact'>('magazine');

  // Multi-tier search and tags cascade
  const filteredNews = news.filter(item => {
    // 1. Country filter
    const countryTag = `@${activeCountry.name}`.toLowerCase();
    const cityTags = activeCountry.cities.map(c => `@${c}`.toLowerCase());
    
    const matchesCountry = item.locationTags.some(tag => {
      const tagLower = tag.toLowerCase();
      return tagLower === countryTag || cityTags.includes(tagLower);
    });
    if (!matchesCountry) return false;

    // 2. City Filter
    if (activeCity) {
      const cityTag = `@${activeCity}`.toLowerCase();
      const matchesCity = item.locationTags.some(tag => tag.toLowerCase() === cityTag);
      if (!matchesCity) return false;
    }

    // 3. Category Filter
    if (activeCategory) {
      const categoryTag = `#${activeCategory}`.toLowerCase();
      const matchesCategory = item.categoryTags.some(tag => tag.toLowerCase() === categoryTag);
      if (!matchesCategory) return false;
    }

    // 4. Search Query Term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        item.headline.toLowerCase().includes(term) || 
        item.content.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    // 5. Historical Archive Filter
    if (activeArchive) {
      const ageInHours = (Date.now() - new Date(item.publishedAt).getTime()) / (1005 * 60 * 60);
      if (activeArchive === 'q1_2026') {
        const isArchiveMatch = ageInHours > 6 || item.id === '2' || item.id === '5' || item.id.includes('archive');
        if (!isArchiveMatch) return false;
      } else if (activeArchive === 'q4_2025') {
        const isArchiveMatch = ageInHours > 18 || item.id === '5' || item.id.includes('archive_2025');
        if (!isArchiveMatch) return false;
      }
    }

    return true;
  });

  const hasAnyFilters = activeCategory || activeCity || searchTerm.trim();

  const handleClearAll = () => {
    setActiveCategory(null);
    setActiveCity(null);
    setSearchTerm('');
  };

  return (
    <div className="w-full relative">
      {/* Title block with editorial layout details */}
      <div className="border-b border-stone-200/80 dark:border-zinc-800 pb-6 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="text-left">
          <span className="text-xs font-mono tracking-[0.25em] text-emerald-600 dark:text-emerald-400 font-bold uppercase block mb-2">
            {t[language].intelHub}
          </span>
          <h1 className="font-serif italic font-black text-4xl md:text-5xl lg:text-6xl text-stone-950 dark:text-zinc-50 tracking-tight transition-all duration-500">
            {language === 'ar' 
              ? (activeCountryCode === 'ae' ? 'الإمارات' :
                 activeCountryCode === 'sa' ? 'السعودية' :
                 activeCountryCode === 'om' ? 'عُمان' :
                 activeCountryCode === 'qa' ? 'قطر' :
                 activeCountryCode === 'bh' ? 'البحرين' : 'الكويت')
              : activeCountry.name} {language === 'ar' ? 'موجز التحقق' : 'Index'}
          </h1>
        </div>

        {/* Elegant display mode controls and status pill */}
        <div className="flex flex-wrap items-center gap-4 shrink-0">
          {/* Display Mode Switcher */}
          <div className="flex bg-stone-100 dark:bg-zinc-900 border border-stone-200/60 dark:border-zinc-800/80 p-0.5 rounded-xl text-stone-600 dark:text-zinc-400">
            <button
              onClick={() => setDisplayMode('magazine')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                displayMode === 'magazine'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-stone-200/30'
                  : 'hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
              title={language === 'ar' ? 'نمط المجلة الغني بالصور' : 'Rich Magazine Style (All Images)'}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              {t[language].magazineFlow}
            </button>
            <button
              onClick={() => setDisplayMode('traditional')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                displayMode === 'traditional'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-stone-200/30'
                  : 'hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
              title={language === 'ar' ? 'نمط الصحيفة التقليدية المختلط' : 'Traditional Newspaper Style (Alternating Images)'}
            >
              <Newspaper className="w-3.5 h-3.5" />
              {t[language].journalMixed}
            </button>
            <button
              onClick={() => setDisplayMode('compact')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                displayMode === 'compact'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-stone-200/30'
                  : 'hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
              title={language === 'ar' ? 'نمط القائمة المكثفة للمسح' : 'Compact list style for high-density'}
            >
              <LayoutList className="w-3.5 h-3.5" />
              {t[language].compactRegister}
            </button>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-stone-200/60 dark:border-zinc-800 px-4 py-2 rounded-xl text-xs shadow-sm w-fit shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] text-stone-600 dark:text-zinc-400 font-medium">
              {filteredNews.length} {t[language].recordsStreamed}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Active Filters Pills Drawer */}
      {hasAnyFilters && (
        <div className="flex flex-wrap items-center gap-3 bg-stone-100/60 dark:bg-zinc-950/60 p-3 rounded-xl border border-stone-200/40 dark:border-zinc-850 mb-8 animate-fade-in text-left">
          <span className="text-[10px] font-mono tracking-wider text-stone-500 dark:text-zinc-500 uppercase select-none mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-stone-400" /> {t[language].activeFilters}:
          </span>
          
          {activeCategory && (
            <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 px-3 py-1 rounded-lg text-xs font-medium border border-amber-200/40 dark:border-amber-900/40 select-none">
              <Tag className="w-3 h-3" /> #{activeCategory}
              <button 
                onClick={() => setActiveCategory(null)}
                className="hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded px-1 cursor-pointer font-bold ml-1"
              >
                ×
              </button>
            </span>
          )}

          {activeCity && (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 px-3 py-1 rounded-lg text-xs font-medium border border-emerald-200/40 dark:border-emerald-945/40 select-none">
              <MapPin className="w-3 h-3" /> @{activeCity}
              <button 
                onClick={() => setActiveCity(null)}
                className="hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded px-1 cursor-pointer font-bold ml-1"
              >
                ×
              </button>
            </span>
          )}

          {searchTerm.trim() && (
            <span className="inline-flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/45 text-sky-800 dark:text-sky-400 px-3 py-1 rounded-lg text-xs font-medium border border-sky-200/40 dark:border-sky-900/40 select-none">
              <Search className="w-3 h-3" /> "{searchTerm}"
              <button 
                onClick={() => setSearchTerm('')}
                className="hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded px-1 cursor-pointer font-bold ml-1"
              >
                ×
              </button>
            </span>
          )}

          <button
            onClick={handleClearAll}
            className="text-[10px] font-mono tracking-widest text-[#F43F5E] hover:underline font-bold uppercase ml-auto mr-1 cursor-pointer flex items-center gap-1"
          >
            {t[language].clearAll}
          </button>
        </div>
      )}

      {/* Loading State OR Filter Block Rendering */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm font-mono text-stone-500">{language === 'ar' ? 'يرجى الإنتظار بينما نجري المطابقة البينية من فلاش...' : 'Syncing live sovereign feed...'}</p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="p-8 md:p-12 text-center rounded-2xl bg-white dark:bg-[#0E0F12] border border-stone-200/80 dark:border-zinc-800 shadow-xs animate-fade-in text-left">
          <div className="max-w-xl mx-auto flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/5 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 mb-5 border border-amber-500/15">
              <Layers className="w-6 h-6 animate-pulse" />
            </div>
            
            <h3 className="font-serif italic font-extrabold text-xl text-stone-900 dark:text-zinc-150 mb-2.5 text-center">
              {language === 'ar' 
                ? `بانتظار تدفق البث لـ @${activeCity || activeCountry.name}` 
                : `Awaiting Broadcast stream: @${activeCity || activeCountry.name}`}
            </h3>
            
            <p className="text-stone-550 dark:text-zinc-400 text-sm mb-6 leading-relaxed text-center">
              {language === 'ar'
                ? `لا توجد حالياً برقيات مؤرشفة تطابق مرشحات الدعم المحددة (#${activeCategory || 'الاقتصاد'}). يمكنك تشغيل روبوت المسح الضوئي المعتمد لـ Gemini للبحث الشامل وصياغة تقرير مباشر في الحال!`
                : `No archived dispatches match the selected filters (#${activeCategory || 'Economic'}). Trigger Gemini's live research crawler to scan verified GCC wires and synthesize an authoritative spot report on-the-spot!`}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {onTriggerSpotCheck && (
                <button
                  type="button"
                  onClick={onTriggerSpotCheck}
                  disabled={spotRefreshActive}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold font-sans text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    spotRefreshActive
                      ? 'bg-stone-100 dark:bg-zinc-800 text-stone-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-zinc-950 text-white font-black shadow-md hover:scale-102 active:scale-98'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${spotRefreshActive ? 'animate-spin' : ''}`} />
                  <span>
                    {spotRefreshActive 
                      ? (language === 'ar' ? 'جاري صياغة الخبر عاجلاً...' : 'Compiling verified news...') 
                      : (language === 'ar' ? `البحث التلقائي التوليدي لـ @${activeCity || activeCountry.name}` : `Synthesize Breaking Spot for @${activeCity || activeCountry.name}`)}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={handleClearAll}
                className="px-5 py-3 bg-stone-100 dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 hover:bg-stone-205 dark:hover:bg-zinc-800 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer text-center"
              >
                {language === 'ar' ? 'إعادة ضبط كافة المرشحات' : 'Clear Search Criteria'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={
          displayMode === 'compact'
            ? "grid grid-cols-1 xl:grid-cols-2 gap-6"
            : "masonry-grid"
        }>
          <AnimatePresence mode="popLayout">
            {filteredNews.map((item, idx) => (
              <motion.div
                key={item.id}
                layout="position"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 28,
                  opacity: { duration: 0.25 }
                }}
                className={displayMode === 'compact' ? "" : "masonry-item"}
              >
                <NewsCard 
                  item={item} 
                  index={idx} 
                  displayMode={displayMode} 
                  onSelect={onSelectArticle} 
                  onSelectTag={onSelectTag}
                  language={language}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
