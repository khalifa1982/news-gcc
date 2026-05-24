import React, { useState } from 'react';
import { ShieldAlert, Cpu, Compass, MapPin, Tag, RefreshCw, BarChart2, ShieldCheck, HelpCircle } from 'lucide-react';
import { getCityTheme, getCategoryTheme } from '../theme';
import { COUNTRIES, NewsItem } from '../data';
import { Language, translateCity, translateCategory } from '../translation';

interface SovereignFocusDashboardProps {
  activeCountry: string;
  activeCity: string | null;
  activeCategory: string | null;
  language: Language;
  filteredNews: NewsItem[];
  triggerSpotCheck: () => Promise<void>;
  spotRefreshActive: boolean;
}

export default function SovereignFocusDashboard({
  activeCountry,
  activeCity,
  activeCategory,
  language,
  filteredNews,
  triggerSpotCheck,
  spotRefreshActive
}: SovereignFocusDashboardProps) {
  const activeCountryObj = COUNTRIES.find(c => c.code === activeCountry) || COUNTRIES[0];
  const [showHelper, setShowHelper] = useState(false);

  const currentLocTag = activeCity ? `@${activeCity}` : `@${activeCountryObj.name}`;
  const currentCatTag = activeCategory ? `#${activeCategory}` : '#Economic';

  const cityTheme = getCityTheme(currentLocTag);
  const catTheme = getCategoryTheme(currentCatTag);

  const cleanTitle = activeCity 
    ? (language === 'ar' ? `${translateCity(activeCity, language)}: النشرة الإستراتيجية` : `${activeCity} Strategic Focus`)
    : (language === 'ar' ? `المؤشر الإقليمي لـ ${activeCountryObj.name}` : `${activeCountryObj.name} Regional Tracker`);

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Upper header lockup */}
      <div className="border-b border-stone-200/80 dark:border-zinc-850/80 pb-4 select-none">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-450 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest font-black text-stone-900 dark:text-zinc-100 uppercase">
            {language === 'ar' ? 'البوصلة الاستراتيجية الإقليمية' : 'REGIONAL STRATEGIC COMPASS'}
          </span>
        </div>
      </div>

      {/* Focus Area Brief Card */}
      <div className="p-5 rounded-xl border border-stone-200/80 dark:border-zinc-805 bg-white dark:bg-zinc-950/20 shadow-xs relative overflow-hidden">
        {/* Abstract glowing focal circle */}
        <div className="absolute right-[-20px] top-[-20px] w-24 h-24 rounded-full bg-emerald-500/5 blur-xl pointer-events-none"></div>

        <div className="font-mono text-[9.5px] font-bold text-stone-400 dark:text-zinc-550 uppercase mb-3 block flex items-center justify-between">
          <span>{language === 'ar' ? 'التركيز الجيو-استراتيجي الحالي' : 'CURRENT GEO-STRATEGIC FOCUS'}</span>
          <span className="text-emerald-600 dark:text-emerald-450">{activeCountry.toUpperCase()} INDEX</span>
        </div>

        {/* Clean, unmixed elegant typography title */}
        <h3 className="font-serif italic font-extrabold text-2.5xl text-stone-950 dark:text-zinc-50 mb-4 tracking-tight">
          {cleanTitle}
        </h3>

        {/* Sovereign Index Marks Ledger / Separate Styled Dynamic Table */}
        <div className="bg-stone-50/75 dark:bg-zinc-950/40 border border-stone-150 dark:border-zinc-850/50 rounded-xl p-3.5 flex flex-col gap-2.5 mb-4 font-mono text-[10.5px] shadow-xs select-none">
          <div className="flex items-center justify-between border-b border-stone-150/60 dark:border-zinc-800/40 pb-2">
            <span className="text-stone-400 dark:text-zinc-505 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-stone-350 dark:text-zinc-650" />
              <span>{language === 'ar' ? 'إشارة البث المعتمدة' : 'SOVEREIGN LOCATION SIGNAL'}</span>
            </span>
            <span className={`font-black uppercase font-mono px-2 py-0.5 rounded border text-xs shadow-xs transition-colors duration-150 leading-none ${cityTheme.badgeStyle}`}>
              {currentLocTag}
            </span>
          </div>

          <div className="flex items-center justify-between pb-0.5">
            <span className="text-stone-400 dark:text-zinc-505 font-bold uppercase tracking-wider text-[9px] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-stone-350 dark:text-zinc-650" />
              <span>{language === 'ar' ? 'مؤشر التصنيف الجيو-استراتيجي' : 'GEO-STRATEGIC CATEGORY MARK'}</span>
            </span>
            <span className={`font-black uppercase font-mono px-2 py-0.5 rounded border text-xs shadow-xs transition-colors duration-150 leading-none ${catTheme.badgeStyle}`}>
              {currentCatTag}
            </span>
          </div>
        </div>

        {/* Dynamic Label Badges Grid */}
        <div className="flex flex-wrap gap-2 mb-4 text-[10.5px] font-mono text-stone-500 dark:text-zinc-400">
          <span className="font-semibold">{language === 'ar' ? 'الموقع الاستراتيجي:' : 'Territory:'} <span className="font-black text-stone-850 dark:text-zinc-205">{activeCity ? translateCity(activeCity, language) : activeCountryObj.name}</span></span>
          <span className="text-stone-300 dark:text-zinc-800">•</span>
          <span className="font-semibold">{language === 'ar' ? 'حقل التركيز:' : 'Sector Focus:'} <span className="font-black text-stone-850 dark:text-zinc-205">{activeCategory ? translateCategory(activeCategory, language) : (language === 'ar' ? 'الاقتصاد' : 'Economic')}</span></span>
        </div>

        <p className="text-xs text-stone-550 dark:text-zinc-400 leading-relaxed mb-1.5">
          {language === 'ar'
            ? `أنت تستعرض بنية بث الأخبار والمعلومات الموثقة لـ ${activeCity ? translateCity(activeCity, language) : activeCountryObj.name}. النظام متأهب وقابل للتحديث الفوري عبر روبوت المسح بالذكاء الاصطناعي.`
            : `You are monitoring the verified news wires and municipal records for ${activeCity ? activeCity : activeCountryObj.name}. Ingest rates can be augmented on-demand via direct AI-grounded searches.`}
        </p>
      </div>

      {/* Intelligence scan statistics ledger */}
      <div className="p-4 rounded-xl border border-stone-200/50 dark:border-zinc-850/60 bg-stone-50/70 dark:bg-zinc-950/15 text-xs flex flex-col gap-3 font-mono">
        <span className="text-[9.5px] font-bold text-stone-400 dark:text-zinc-550 tracking-widest uppercase block border-b border-stone-200/40 dark:border-zinc-850/40 pb-1.5 flex items-center gap-1">
          <BarChart2 className="w-3.5 h-3.5 text-stone-450 dark:text-zinc-500" />
          {language === 'ar' ? 'سجل وكالة الأنباء الإقليمية المباشر' : 'MUNICIPAL SCAN STATS & LEDGER'}
        </span>

        <div className="flex justify-between items-center text-stone-600 dark:text-zinc-400">
          <span className="font-semibold">{language === 'ar' ? 'إجمالي الأخبار المفلترة:' : 'Filter Match Count:'}</span>
          <span className="font-bold text-stone-900 dark:text-stone-100">{filteredNews.length} {language === 'ar' ? 'سجلات' : 'Files'}</span>
        </div>

        <div className="flex justify-between items-center text-stone-600 dark:text-zinc-400">
          <span className="font-semibold">{language === 'ar' ? 'رادار التحقق بالخلفية:' : 'Spot Radar State:'}</span>
          <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-450">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>ACTIVE STANDBY</span>
          </span>
        </div>

        <div className="flex justify-between items-center text-stone-600 dark:text-zinc-400">
          <span className="font-semibold">{language === 'ar' ? 'المطابقة والتدقيف الذاتي:' : 'Self-Audit Level:'}</span>
          <span className="font-bold text-amber-600 dark:text-amber-500">GCC_SECURE_COGNITIVE</span>
        </div>
      </div>

      {/* On-Demand Spot Synthesis Block with big attractive action */}
      <div className="p-5 rounded-xl bg-emerald-600/5 dark:bg-emerald-500/5 border border-emerald-600/20 dark:border-emerald-500/15 flex flex-col gap-4 text-left">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-405 mb-1.5 select-none">
            <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-450 animate-pulse" />
            <span>GEMINI LIVE GROUNDED SENSOR</span>
          </div>
          <p className="text-[11.5px] text-stone-600 dark:text-zinc-400 leading-relaxed">
            {language === 'ar'
              ? `بنقرة واحدة، مرر مرشحات التركيز الحالية لغرفة الذكاء الاصطناعي للتحقق وعمل مسح فوري لمحرك بحث Google، ثم قم بدمج تقرير معتمد فورا.`
              : `Instruct Gemini's live research crawler to query GCC state bulletins, verify source alignments, and write a fresh, authoritative report for this focus in real-time.`}
          </p>
        </div>

        <button 
          onClick={triggerSpotCheck}
          disabled={spotRefreshActive}
          className={`w-full py-3 rounded-xl font-bold font-sans text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-350 shadow-sm ${
            spotRefreshActive
              ? 'bg-stone-200 dark:bg-zinc-800 text-stone-400 cursor-not-allowed scale-98 shadow-none'
              : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-zinc-950 font-black shadow-[0_4px_15px_rgba(16,185,129,0.15)] hover:shadow-[0_6px_22px_rgba(16,185,129,0.3)] hover:scale-102 active:scale-98'
          }`}
        >
          {spotRefreshActive ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{language === 'ar' ? 'جاري التدقيق وصياغة التصنيف...' : 'Crawling & Compiling Dispatch...'}</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>{language === 'ar' ? 'توليد خبر عاجل مباشر' : 'Synthesize Live Breaking Spot'}</span>
            </>
          )}
        </button>
      </div>

      {/* Verification Integrity Disclaimer Seal */}
      <div className="p-4 rounded-xl border border-dashed border-stone-200/80 dark:border-zinc-800 bg-stone-50/40 dark:bg-zinc-950/25 flex flex-col gap-2 select-none text-[11px] leading-relaxed text-stone-500 dark:text-zinc-500">
        <div className="flex items-center gap-1.5 font-mono font-bold tracking-wider text-stone-400 dark:text-zinc-650 text-[9.5px]">
          <ShieldCheck className="w-3.5 h-3.5 text-stone-350" />
          <span>SOVEREIGN DATA AUDIT STANDARD</span>
        </div>
        <span>
          {language === 'ar'
            ? 'تخضع جميع البرقيات لعملية تصفية وتدقيق متقدمة قبل النشر. يتضامن محرك رادار البث مع قنوات الأنباء الموثقة ووكالات مجلس التعاون الرسمية لضمان الدقة وتفادي الشائعات.'
            : 'All synthesized briefings undergo multi-party validation against authenticated wire records. Spot crawlers integrate source citation URLs and metadata to facilitate manual confirmation.'}
        </span>
      </div>
    </div>
  );
}
