import { Search, Bell, History, Moon, Sun, UserCircle2, Server, HelpCircle, FileText, Sparkles, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { auth, googleProvider, setCachedAccessToken } from '../firebase';
import { signInWithPopup, signOut, User, GoogleAuthProvider } from 'firebase/auth';
import { NewsItem } from '../data';
import { t, Language } from '../translation';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeView: 'feed' | 'gemini-search' | 'sources-registry';
  setActiveView: (view: 'feed' | 'gemini-search' | 'sources-registry') => void;
  news?: NewsItem[];
  onSelectArticle?: (item: NewsItem) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export default function Header({ searchTerm, setSearchTerm, activeView, setActiveView, news = [], onSelectArticle, language, setLanguage }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [uaeTime, setUaeTime] = useState<string>('');

  // UAE Time (GST) Clock syncing with local Asia/Dubai zone
  useEffect(() => {
    const updateTime = () => {
      const optionsTime: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Dubai',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const optionsDay: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Dubai',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      };
      try {
        const d = new Date();
        const timeStr = d.toLocaleTimeString('en-US', optionsTime);
        const dayStr = d.toLocaleDateString('en-US', optionsDay);
        setUaeTime(`${dayStr} • ${timeStr} GST`);
      } catch (e) {
        setUaeTime('GST Time');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic accurate dispatches compiled from active verified live articles
  const activeDispatches = news && news.length > 0 
    ? news.slice(0, 15).map(item => ({
        headline: item.headline,
        article: item,
        sourceName: item.sources && item.sources.length > 0 ? item.sources[0].name : "Verified Bureau",
        sourceUrl: item.sources && item.sources.length > 0 ? item.sources[0].url : "#",
        verifiedStatus: item.verifiedStatus || (language === 'ar' ? 'معتمد' : 'VERIFIED')
      }))
    : language === 'ar'
      ? [
          {
            headline: "دبي تطلق منصة لتكامل أصول الطاقة النظيفة وتدوير المحفظة السيادية بمحافظ متجددة",
            article: null,
            sourceName: "وكالة أنباء الإمارات (وام)",
            sourceUrl: "https://www.wam.ae",
            verifiedStatus: "مؤكد سيادياً"
          },
          {
            headline: "الرياض تفتتح خمس مدن لوجستية ذكية لربط تجارة موانئ دبي وجدة على مسارات ٢٠٣٠",
            article: null,
            sourceName: "وكالة الأنباء السعودية (واس)",
            sourceUrl: "https://www.spa.gov.sa",
            verifiedStatus: "مدقق رسمي"
          },
          {
            headline: "الدوحة تبدأ تطبيق نماذج الذكاء الاصطناعي التوليدي في التنبؤ اللغوي الكلي ببيانات آمنة",
            article: null,
            sourceName: "وكالة الأنباء القطرية (قنا)",
            sourceUrl: "https://www.qna.org.qa",
            verifiedStatus: "معتمد علمياً"
          }
        ]
      : [
          {
            headline: "Dubai launches clean energy integration platform pooling sovereign assets into green networks",
            article: null,
            sourceName: "WAM (Emirates News Agency)",
            sourceUrl: "https://www.wam.ae",
            verifiedStatus: "SOVEREIGN VERIFIED"
          },
          {
            headline: "Riyadh opens five smart logistics hubs to streamline GCC transit under Vision 2030",
            article: null,
            sourceName: "SPA (Saudi Press Agency)",
            sourceUrl: "https://www.spa.gov.sa",
            verifiedStatus: "OFFICIALLY AUDITED"
          },
          {
            headline: "Doha initiates commercial deployment of sovereign large language models in research clusters",
            article: null,
            sourceName: "QNA (Qatar News Agency)",
            sourceUrl: "https://www.qna.org.qa",
            verifiedStatus: "VERIFIED"
          }
        ];

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % activeDispatches.length);
    }, 8500); // slightly longer to read full headlines
    return () => clearInterval(interval);
  }, [activeDispatches.length]);

  const handleAuth = async () => {
    if (user) {
      try {
        await signOut(auth);
        setCachedAccessToken(null);
      } catch (err) {
        console.error("Sign out error", err);
      }
    } else {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setCachedAccessToken(credential.accessToken);
        }
      } catch (err) {
        console.error("Sign in error", err);
      }
    }
  };

  const currentTicker = activeDispatches[tickerIndex] || activeDispatches[0];

  const [translatedTicker, setTranslatedTicker] = useState<string>('');
  const [loadingTicker, setLoadingTicker] = useState(false);

  useEffect(() => {
    if (language === 'ar' && currentTicker) {
      if (currentTicker.article && currentTicker.article.id) {
        const mockTranslations: Record<string, string> = {
          '1': 'هيئة أبوظبي للاستثمار تعلن عن توسع كبير في قطاعات الطاقة المتجددة العالمية',
          '2': 'الشركات الناشئة في مجال التكنولوجيا بدبي تؤمن تمويلاً تأسيسياً قياسياً في الربع الأول',
          '3': 'المملكة العربية السعودية تكشف عن مبادرات تعليمية معززة جديدة في الرياض',
          '4': 'أسواق العقارات العالمية تتفاعل مع السياسات الاقتصادية لدول مجلس التعاون الخليجي',
          '5': 'عمان توقع اتفاقية تاريخية لتوسعة ميناء صحار التجاري'
        };

        const artId = currentTicker.article.id;
        if (mockTranslations[artId]) {
          setTranslatedTicker(mockTranslations[artId]);
          return;
        }

        const cacheKey = `ticker_trans_${artId}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          setTranslatedTicker(cached);
          return;
        }

        const translateTicker = async () => {
          setLoadingTicker(true);
          try {
            const res = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: currentTicker.headline })
            });
            if (res.ok) {
              const data = await res.json();
              const translated = data.translation || currentTicker.headline;
              setTranslatedTicker(translated);
              sessionStorage.setItem(cacheKey, translated);
            }
          } catch (e) {
            setTranslatedTicker(currentTicker.headline);
          } finally {
            setLoadingTicker(false);
          }
        };
        translateTicker();
      } else {
        // Fallbacks for static content or simulated wire reports
        const staticArHeadlines: Record<string, string> = {
          "Dubai launches clean energy integration platform pooling sovereign assets into green networks": "دبي تطلق منصة لتكامل أصول الطاقة النظيفة وتدوير المحفظة السيادية بمحافظ متجددة",
          "Riyadh opens five smart logistics hubs to streamline GCC transit under Vision 2030": "الرياض تفتتح خمس مدن لوجستية ذكية لربط تجارة موانئ دبي وجدة على مسارات ٢٠٣٠",
          "Doha initiates commercial deployment of sovereign large language models in research clusters": "الدوحة تبدأ تطبيق نماذج الذكاء الاصطناعي التوليدي في التنبؤ اللغوي الكلي ببيانات آمنة"
        };
        const fallbackHeadline = staticArHeadlines[currentTicker.headline] || currentTicker.headline;
        setTranslatedTicker(fallbackHeadline);
      }
    } else {
      setTranslatedTicker('');
    }
  }, [language, currentTicker?.article?.id, currentTicker?.headline]);

  return (
    <div className="w-full h-auto flex flex-col shrink-0 sticky top-0 z-40 transition-colors duration-300">
      {/* Redesigned Upper Luxury Intel Ticker Tapes Bar */}
      <div className="bg-[#0b0c0e] dark:bg-[#020203] text-[10px] tracking-wide text-stone-200 dark:text-zinc-400 font-mono py-2.5 px-6 flex flex-col sm:flex-row items-center justify-between border-b border-stone-850/80 font-medium select-none gap-2">
        <div className="flex items-center gap-2 max-w-full overflow-hidden w-full sm:w-auto">
          {/* Pulsing red beacon representing a live critical bulletin */}
          <div className="flex items-center gap-1.5 shrink-0 bg-[#E11D48]/15 dark:bg-[#F43F5E]/10 px-2.5 py-1 rounded border border-[#F43F5E]/35 animate-pulse">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#F43F5E]"></span>
            <span className="text-[#F43F5E] text-[9px] font-black tracking-[0.1em] uppercase">
              {language === 'ar' ? 'بث عاجل ومؤكد' : 'CRITICAL WIRE'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 truncate w-full">
            {/* The Raw Headline and Article trigger */}
            {currentTicker.article ? (
              <button
                onClick={() => onSelectArticle?.(currentTicker.article!)}
                className="text-stone-100 dark:text-zinc-200 truncate text-left hover:text-emerald-400 transition-colors cursor-pointer hover:underline font-bold text-[11px]"
                title={language === 'ar' ? "اضغط لعرض السجل المدقّق بالكامل" : "Click to view full certified record"}
              >
                {language === 'ar' ? (translatedTicker || 'جاري تحميل البث العاجل...') : currentTicker.headline}
              </button>
            ) : (
              <span className="text-stone-100 dark:text-zinc-200 truncate font-bold text-[10.5px]">
                {language === 'ar' ? (translatedTicker || currentTicker.headline) : currentTicker.headline}
              </span>
            )}

            {/* Clickable Resource Anchor detailing source names and outer redirects */}
            <span className="text-[9px] text-stone-400 dark:text-zinc-500 font-mono tracking-normal shrink-0">
              ({language === 'ar' ? 'المصدر الموثق' : 'RESRC'}:{' '}
              <a 
                href={currentTicker.sourceUrl}
                target="_blank" 
                rel="noreferrer"
                className="text-emerald-500 hover:text-emerald-400 underline font-extrabold hover:no-underline hover:brightness-110 cursor-pointer inline-flex items-center gap-0.5"
                onClick={(e) => {
                  if (currentTicker.sourceUrl === "#") {
                    e.preventDefault();
                  } else {
                    e.stopPropagation();
                  }
                }}
              >
                {currentTicker.sourceName} ↗
              </a>
              )
            </span>

            {/* Verification Capsule */}
            <span className="hidden md:inline-flex bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 rounded px-1.5 py-0.5 text-[8.5px] font-mono shrink-0 uppercase">
              {currentTicker.verifiedStatus}
            </span>
          </div>
        </div>

        {/* UAE clock display (GST) */}
        <div className="flex items-center gap-4 shrink-0 font-mono text-[10px] text-emerald-500 dark:text-emerald-450 font-bold bg-neutral-900/60 dark:bg-black/40 px-3 py-1 rounded border border-emerald-900/30">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>UAE • {uaeTime}</span>
        </div>
      </div>

      {/* Primary Newspaper Header */}
      <header className="h-[96px] border-b border-stone-200/80 dark:border-zinc-800/70 bg-[#FAF9F5]/95 dark:bg-[#0A0B0D]/95 backdrop-blur-md px-6 md:px-8 xl:px-12 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-8 lg:gap-14">
          {/* Brand Identity / Elegant Serif Seal */}
          <div className="flex flex-col select-none cursor-pointer" onClick={() => setActiveView('feed')}>
            <span className="font-serif italic font-black text-2.5xl md:text-3xl tracking-tight text-stone-950 dark:text-zinc-50 flex items-center gap-2">
              VERIFY<span className="text-emerald-600 dark:text-emerald-400 font-sans not-italic font-extrabold text-2xl tracking-[0.1em]">GCC</span>
            </span>
            <span className="text-[9px] font-mono tracking-[0.3em] font-medium text-stone-500 dark:text-zinc-500 uppercase">
              {language === 'ar' ? 'البوابة السيادية للتحقق من الأخبار' : 'The Sovereign Truth Feed'}
            </span>
          </div>

          {/* Core Navigation Links with elegant borders */}
          <nav className="hidden xl:flex gap-10 text-[11px] font-bold tracking-[0.18em] uppercase text-stone-600 dark:text-zinc-400 mt-1.5 align-middle items-center">
            <button 
              onClick={() => setActiveView('feed')}
              className={`relative cursor-pointer transition-colors hover:text-stone-900 dark:hover:text-zinc-100 pb-1 ${
                activeView === 'feed'
                  ? 'text-stone-950 dark:text-zinc-50 font-black'
                  : 'text-stone-500 dark:text-zinc-500'
              }`}
            >
              <span>{t[language].verificationFeed}</span>
              {activeView === 'feed' && (
                <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-emerald-600 dark:bg-emerald-500 rounded"></span>
              )}
            </button>
            <button 
              onClick={() => setActiveView('gemini-search')}
              className={`relative cursor-pointer transition-colors hover:text-stone-950 dark:hover:text-zinc-100 pb-1 flex items-center gap-1.5 ${
                activeView === 'gemini-search'
                  ? 'text-stone-950 dark:text-zinc-50 font-black'
                  : 'text-stone-500 dark:text-zinc-500'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>{t[language].geminiDeepSearch}</span>
              {activeView === 'gemini-search' && (
                <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-emerald-600 dark:bg-emerald-500 rounded"></span>
              )}
            </button>
            <button 
              onClick={() => setActiveView('sources-registry')}
              className={`relative cursor-pointer transition-colors hover:text-stone-950 dark:hover:text-zinc-100 pb-1 flex items-center gap-1.5 ${
                activeView === 'sources-registry'
                  ? 'text-stone-950 dark:text-zinc-50 font-black'
                  : 'text-stone-500 dark:text-zinc-500'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t[language].verifiedMediaRegistry}</span>
              {activeView === 'sources-registry' && (
                <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-emerald-600 dark:bg-emerald-500 rounded"></span>
              )}
            </button>
          </nav>
        </div>

        {/* Live Search & Utility Suite */}
        <div className="flex items-center gap-4 md:gap-6 text-stone-700 dark:text-zinc-400">
          
          {/* Integrated Editorial Search Input */}
          <div className="relative hidden md:flex items-center">
            <Search className="w-4 h-4 text-stone-400 dark:text-zinc-500 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t[language].queryVerifiedArchives}
              className="w-52 lg:w-64 pl-10 pr-4 py-2 text-xs font-medium bg-stone-100/70 dark:bg-zinc-900/60 hover:bg-stone-200/40 dark:hover:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-950 border border-transparent focus:border-stone-200/90 dark:focus:border-zinc-800 rounded-lg outline-none text-stone-800 dark:text-zinc-200 transition-all placeholder-stone-400 dark:placeholder-zinc-500 font-sans"
            />
          </div>

          <div className="flex items-center gap-1.5 md:gap-3 bg-stone-100/50 dark:bg-zinc-900/40 p-1 rounded-lg border border-stone-200/40 dark:border-zinc-800/30">
            {/* Elegant Language Selector */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-2 md:px-2.5 py-1 text-[9.5px] font-black uppercase tracking-wider bg-white dark:bg-zinc-950 text-emerald-600 dark:text-emerald-450 border border-stone-250/80 dark:border-zinc-800/80 hover:bg-stone-50 dark:hover:bg-zinc-900 duration-150 cursor-pointer rounded-md flex items-center justify-center gap-1 shadow-sm leading-none"
              title={language === 'en' ? "تحويل الواجهة للغة العربية" : "Switch interface to English"}
            >
              <Globe className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>{language === 'en' ? 'عربي' : 'EN'}</span>
            </button>

            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors cursor-pointer rounded"
              title="Toggle theme aesthetics"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-500" />}
            </button>

            <button className="p-1.5 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors cursor-pointer rounded relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            </button>
            
            <button className="p-1.5 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors cursor-pointer rounded">
              <History className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-stone-200 dark:bg-zinc-800"></div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden md:flex select-none">
                <span className="text-[10px] font-bold text-stone-800 dark:text-zinc-300 max-w-[110px] truncate leading-none">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <span className="text-[8px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">
                  Advisory Elite
                </span>
              </div>
              <button
                onClick={handleAuth}
                title={t[language].disconnectAccount}
                className="w-10 h-10 rounded-full overflow-hidden border border-stone-200 dark:border-zinc-800 cursor-pointer shadow-sm hover:ring-2 hover:ring-emerald-500/80 active:scale-95 transition-all shrink-0 bg-[#E8E6DD] dark:bg-zinc-800 flex items-center justify-center text-stone-700 dark:text-zinc-200 font-bold"
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="avatar" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const fallbackText = document.createElement('span');
                        fallbackText.className = 'text-xs font-bold font-sans uppercase';
                        fallbackText.innerText = (user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase();
                        parent.appendChild(fallbackText);
                      }
                    }}
                  />
                ) : (
                  <span className="text-xs font-bold font-sans uppercase">
                    {(user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                  </span>
                )}
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAuth}
              className="hover:text-stone-900 dark:hover:text-zinc-50 transition-all font-sans text-xs font-bold tracking-wider uppercase bg-stone-950 dark:bg-zinc-100 text-stone-50 dark:text-zinc-950 hover:bg-stone-850 dark:hover:bg-zinc-200 px-4 py-2.5 rounded-lg border border-transparent cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg"
              title="Sign In with Google"
            >
              <UserCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" /> {t[language].secureLogin}
            </button>
          )}
        </div>
      </header>

      {/* Scrollable sub-header navigation tabs for mobile screens */}
      <div className="xl:hidden flex bg-[#FAF9F5] dark:bg-[#0A0B0D] px-6 py-2.5 pb-3 overflow-x-auto border-b border-stone-200/50 dark:border-zinc-850/50 gap-5 text-[10px] font-bold tracking-[0.12em] uppercase scrollbar-none items-center select-none shrink-0 w-full">
        <button 
          onClick={() => setActiveView('feed')}
          className={`shrink-0 transition-colors uppercase cursor-pointer ${
            activeView === 'feed' ? 'text-emerald-600 dark:text-emerald-450 font-black' : 'text-stone-500 dark:text-zinc-500 hover:text-stone-900 dark:hover:text-zinc-200'
          }`}
        >
          {t[language].verificationFeed}
        </button>
        <button 
          onClick={() => setActiveView('gemini-search')}
          className={`shrink-0 transition-colors uppercase flex items-center gap-1 cursor-pointer ${
            activeView === 'gemini-search' ? 'text-emerald-600 dark:text-emerald-450 font-black' : 'text-stone-500 dark:text-zinc-500 hover:text-stone-900 dark:hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-3 h-3 text-amber-500 shrink-0 animate-pulse" />
          {t[language].geminiDeepSearch}
        </button>
        <button 
          onClick={() => setActiveView('sources-registry')}
          className={`shrink-0 transition-colors uppercase flex items-center gap-1 cursor-pointer ${
            activeView === 'sources-registry' ? 'text-emerald-600 dark:text-emerald-450 font-black' : 'text-stone-500 dark:text-zinc-500 hover:text-stone-900 dark:hover:text-zinc-200'
          }`}
        >
          <FileText className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          {t[language].verifiedMediaRegistry}
        </button>
        
        {/* Mobile inline integrated search box */}
        <div className="relative shrink-0 flex items-center ml-auto">
          <Search className="w-3 h-3 text-stone-400 dark:text-zinc-500 absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-24 pl-7 pr-3 py-1 text-[10.5px] font-medium bg-stone-100 dark:bg-zinc-900 border border-transparent focus:border-stone-200 dark:focus:border-zinc-800 rounded-md outline-none text-stone-800 dark:text-zinc-200 transition-all font-sans"
          />
        </div>
      </div>
    </div>
  );
}
