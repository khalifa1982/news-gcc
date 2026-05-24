import React, { useState, useEffect } from 'react';
import { NewsItem } from '../data';
import { CheckCircle2, AlertTriangle, Eye, Calendar, Clock } from 'lucide-react';
import { getCategoryTheme, getCityTheme } from '../theme';
import { Language, translateTag } from '../translation';

interface NewsCardProps {
  item: NewsItem;
  index?: number;
  displayMode?: 'magazine' | 'traditional' | 'compact';
  onSelect?: (item: NewsItem) => void;
  onSelectTag?: (tag: string) => void;
  language: Language;
}

export default function NewsCard({ item, index = 0, displayMode = 'magazine', onSelect, onSelectTag, language }: NewsCardProps) {
  const [transHeadline, setTransHeadline] = useState('');
  const [transContent, setTransContent] = useState('');
  const [loadingTrans, setLoadingTrans] = useState(false);

  useEffect(() => {
    if (language === 'ar') {
      // Direct mock mappings to prevent API quota exhaust for mock data
      const mockTranslations: Record<string, { h: string, c: string }> = {
        '1': {
          h: 'هيئة أبوظبي للاستثمار تعلن عن توسع كبير في قطاعات الطاقة المتجددة العالمية',
          c: 'كشفت @Abu_Dhabi عن خارطة طريق إستراتيجية جديدة تركز بشكل مكثف على أصول الطاقة المستدامة والمستقبلية المتجددة على مستوى العالم. وتشير المصادر إلى توقع تخصيص رأس مال ضخم بحلول الربع الرابع لدعم مسارات #Investment الخضراء.'
        },
        '2': {
          h: 'الشركات الناشئة في مجال التكنولوجيا بدبي تؤمن تمويلاً تأسيسياً قياسياً في الربع الأول',
          c: 'تظهر الاتجاهات الأخيرة في @Dubai طفرة هائلة في رأس المال الاستثماري ومبادرات #Investment التي تدخل الشركات الناشئة المحلية في مجال التكنولوجيا لتعزيز الابتكار والريادة.'
        },
        '3': {
          h: 'المملكة العربية السعودية تكشف عن مبادرات تعليمية معززة جديدة في الرياض',
          c: 'يجري التخطيط لإنشاء مجمعات تعليمية رفيعة المستوى في @Riyadh، مع التركيز على مجالات العلوم والتكنولوجيا والهندسة والرياضيات وجوانب #Educational والذكاء الاصطناعي المتقدمة تماشياً مع الرؤية.'
        },
        '4': {
          h: 'أسواق العقارات العالمية تتفاعل مع السياسات الاقتصادية لدول مجلس التعاون الخليجي',
          c: 'تشهد الأسواق الدولية تأثيراً تموجياً من الإصلاحات الاقتصادية الأخيرة #Economic المعتمدة من قبل دول مجلس التعاون الخليجي. واجتمع مسؤولون رئيسيون من @Manama لمناقشة آليات الاستثمار المتبادل.'
        },
        '5': {
          h: 'عمانتوقع اتفاقية تاريخية لتوسعة ميناء صحار التجاري المشترك وبث الروابط',
          c: 'سيخضع ميناء @Sohar لتوسعة هائلة على النطاق #Commercial، مما يعزز القدرة التجارية بنسبة 40 ٪ ويخلق آلاف فرص العمل ويحسن تدفقات التجارة العالمية.'
        }
      };

      if (mockTranslations[item.id]) {
        setTransHeadline(mockTranslations[item.id].h);
        setTransContent(mockTranslations[item.id].c);
        return;
      }

      // Check session caching
      const cacheKey = `trans_cache_${item.id}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { h, c } = JSON.parse(cached);
        setTransHeadline(h);
        setTransContent(c);
        return;
      }

      // Hit Translate API
      const fetchTranslation = async () => {
        setLoadingTrans(true);
        try {
          const [hRes, cRes] = await Promise.all([
            fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: item.headline })
            }),
            fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: item.content })
            })
          ]);
          if (hRes.ok && cRes.ok) {
            const hData = await hRes.json();
            const cData = await cRes.json();
            const h = hData.translation || item.headline;
            const c = cData.translation || item.content;
            setTransHeadline(h);
            setTransContent(c);
            sessionStorage.setItem(cacheKey, JSON.stringify({ h, c }));
          }
        } catch (e) {
          console.warn("Translation failed for card", item.id, e);
          setTransHeadline(item.headline);
          setTransContent(item.content);
        } finally {
          setLoadingTrans(false);
        }
      };
      fetchTranslation();
    } else {
      setTransHeadline('');
      setTransContent('');
    }
  }, [language, item.id]);

  const activeHeadline = language === 'ar' ? (transHeadline || 'جاري تحميل الترجمة السيادية...') : item.headline;
  const activeContent = language === 'ar' ? (transContent || 'جاري تهيئة تفاصيل البرقية العاجلة باللغة العربية...') : item.content;

  // Utility to handle tagging and styled visual anchors
  const renderContent = (content: string) => {
    const parts = content.split(/(@\w+(?:\s\w+)*|#\w+)/gi);
    return parts.map((part, i) => {
      const cleanPart = part.trim();
      const isLocation = cleanPart.startsWith('@');
      const isCategory = cleanPart.startsWith('#');
      
      if (isLocation) {
        const theme = getCityTheme(cleanPart);
        return (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              onSelectTag?.(cleanPart);
            }}
            className={`px-1.5 py-0.5 mx-0.5 rounded font-bold font-mono text-xs cursor-pointer shadow-sm transition-all focus:outline-none inline-block ${theme.badgeStyle} ${theme.hoverColor}`}
            title={language === 'ar' ? `تصفية حسب الموقع ${translateTag(cleanPart, language)}` : `Filter by location ${cleanPart}`}
          >
            {translateTag(cleanPart, language)}
          </button>
        );
      }
      if (isCategory) {
        const theme = getCategoryTheme(cleanPart);
        return (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              onSelectTag?.(cleanPart);
            }}
            className={`px-1.5 py-0.5 mx-0.5 rounded font-bold font-mono text-[11px] cursor-pointer shadow-sm transition-all focus:outline-none inline-block ${theme.badgeStyle} ${theme.hoverColor}`}
            title={language === 'ar' ? `تصفية حسب التصنيف ${translateTag(cleanPart, language)}` : `Filter by category ${cleanPart}`}
          >
            {translateTag(cleanPart, language)}
          </button>
        );
      }
      return <span key={i} className="text-stone-700 dark:text-zinc-300">{part}</span>;
    });
  };

  const isRumor = 
    item.verifiedStatus?.toUpperCase().includes('DEBUNKED') ||
    item.verifiedStatus?.toUpperCase().includes('MISINFORMATION') ||
    item.headline?.toUpperCase().includes('MISINFORMATION') ||
    item.headline?.toUpperCase().includes('RUMOR') ||
    item.headline?.toUpperCase().includes('DEBUNKED');

  const isVerified = !isRumor && (item.id !== '2' && item.id !== '5'); 
  const showImage = displayMode === 'magazine' || (displayMode === 'traditional' && (index % 2 === 0));

  const formattedDate = new Date(item.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking a link, do not trigger card's select modal
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) {
      return;
    }
    if (onSelect) {
      onSelect(item);
    }
  };

  if (displayMode === 'compact') {
    return (
      <article 
        onClick={handleCardClick}
        className="group bg-white dark:bg-[#0E0F12] rounded-xl overflow-hidden border border-stone-200/80 dark:border-zinc-805/80 transition-all duration-400 hover:-translate-y-1 hover:shadow-lg flex flex-row gap-5 p-4.5 select-none items-center cursor-pointer"
      >
        {item.imageUrl && (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-stone-100 dark:bg-zinc-900 shrink-0 border border-stone-200/50 dark:border-zinc-800">
            <img 
              src={item.imageUrl} 
              alt={item.headline} 
              onError={handleImageError}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 opacity-95 dark:opacity-80"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5 text-[9px] uppercase tracking-wider font-bold font-mono">
              {item.locationTags.map((loc, idx) => {
                const theme = getCityTheme(loc);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onSelectTag?.(loc); }}
                    className={`px-1.5 py-0.5 rounded cursor-pointer transition-all focus:outline-none ${theme.textColor} ${theme.bgColor} ${theme.borderColor} border hover:opacity-80`}
                    title={language === 'ar' ? `تصفية حسب ${translateTag(loc, language)}` : `Filter by ${loc}`}
                  >
                    {translateTag(loc, language)}
                  </button>
                );
              })}
              <span className="text-stone-300 dark:text-zinc-700">•</span>
              {item.categoryTags.map((cat, idx) => {
                const theme = getCategoryTheme(cat);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onSelectTag?.(cat); }}
                    className={`px-1.5 py-0.5 rounded cursor-pointer transition-all focus:outline-none ${theme.textColor} ${theme.bgColor} ${theme.borderColor} border hover:opacity-80`}
                    title={language === 'ar' ? `تصفية حسب ${translateTag(cat, language)}` : `Filter by ${cat}`}
                  >
                    {translateTag(cat, language)}
                  </button>
                );
              })}
              <span className="text-stone-300 dark:text-zinc-700">•</span>
              {isVerified ? (
                <span className="text-emerald-550 dark:text-emerald-400 font-extrabold font-mono text-[10px] tracking-wider uppercase">{language === 'ar' ? '★ موثق معتمد' : '★ VERIFIED'}</span>
              ) : isRumor ? (
                <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900/40 px-2 py-0.5 font-extrabold font-mono text-[9px] rounded tracking-wider uppercase">{language === 'ar' ? '⚠ شائعة مضللة' : '⚠ DEBUNKED HOAX'}</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-450 font-extrabold font-mono text-[10px] tracking-wider uppercase">{language === 'ar' ? '▲ قيد التحقق' : '▲ DISPUTED'}</span>
              )}
            </div>
            <h2 className="font-serif text-sm md:text-base font-bold text-stone-900 dark:text-zinc-100 leading-snug tracking-tight mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
              <button 
                onClick={(e) => { e.preventDefault(); onSelect?.(item); }}
                className="text-left font-serif text-sm md:text-base font-bold text-stone-900 dark:text-zinc-100 leading-snug tracking-tight hover:underline focus:outline-none cursor-pointer"
              >
                {activeHeadline}
              </button>
            </h2>
            <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed font-sans line-clamp-2">
              {renderContent(activeContent)}
            </p>
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono font-medium text-stone-400 dark:text-zinc-500 mt-2 pt-2 border-t border-stone-150 dark:border-zinc-800/40">
            <span>{formattedDate}</span>
            <span>{language === 'ar' ? `قراءة في ${Math.max(2, (index * 2) % 6 + 1)} د ك` : `${Math.max(2, (index * 2) % 6 + 1)}m read`}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article 
      onClick={handleCardClick}
      className="group bg-white dark:bg-[#0E0F12] rounded-xl overflow-hidden border border-stone-200/80 dark:border-zinc-800/80 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col justify-between select-none cursor-pointer"
    >
      
      {/* Optional Top Image */}
      {showImage && (
        <div className="relative h-56 w-full overflow-hidden bg-stone-100 dark:bg-zinc-900 shrink-0">
          <img 
            src={item.imageUrl} 
            alt={item.headline} 
            onError={handleImageError}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-95 dark:opacity-80"
            referrerPolicy="no-referrer"
          />
          {/* Subtle overlay gradient on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
          
          <div className="absolute top-4 right-4 z-20">
            {isVerified ? (
              <span className="px-3 py-1 text-[9px] uppercase tracking-[0.2em] font-extrabold rounded-full flex items-center gap-1.5 bg-emerald-600 text-white shadow-md backdrop-blur-md">
                <CheckCircle2 className="w-3.5 h-3.5" /> {language === 'ar' ? 'موثق معتمد' : 'VERIFIED'}
              </span>
            ) : isRumor ? (
              <span className="px-3 py-1 text-[9px] uppercase tracking-[0.15em] font-extrabold rounded-full flex items-center gap-1.5 bg-rose-600 text-white shadow-md backdrop-blur-md">
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> {language === 'ar' ? 'شائعة مضللة' : 'DEBUNKED HOAX'}
              </span>
            ) : (
              <span className="px-3 py-1 text-[9px] uppercase tracking-[0.2em] font-extrabold rounded-full flex items-center gap-1.5 bg-amber-600 text-white shadow-md backdrop-blur-md">
                <AlertTriangle className="w-3.5 h-3.5" /> {language === 'ar' ? 'قيد التحقق' : 'DISPUTED'}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-6 md:p-8 flex flex-col flex-grow">
        
        {/* Meta Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] tracking-wider uppercase font-bold">
            {item.locationTags.map((loc, idx) => {
              const theme = getCityTheme(loc);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onSelectTag?.(loc); }}
                  className={`px-2 py-0.75 rounded font-mono text-[10px] cursor-pointer focus:outline-none transition-all ${theme.badgeStyle} ${theme.hoverColor}`}
                  title={language === 'ar' ? `تصفية حسب الموقع ${translateTag(loc, language)}` : `Filter by location ${loc}`}
                >
                  {translateTag(loc, language)}
                </button>
              );
            })}
            {item.categoryTags.map((cat, idx) => {
              const theme = getCategoryTheme(cat);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onSelectTag?.(cat); }}
                  className={`px-2 py-0.75 rounded font-mono text-[10px] cursor-pointer focus:outline-none transition-all ${theme.badgeStyle} ${theme.hoverColor}`}
                  title={language === 'ar' ? `تصفية حسب التصنيف ${translateTag(cat, language)}` : `Filter by category ${cat}`}
                >
                  {translateTag(cat, language)}
                </button>
              );
            })}
          </div>
          
          {/* If no image, show badge here instead */}
          {!showImage && (
            <div>
              {isVerified ? (
                <span className="px-2.5 py-1 text-[9px] tracking-[0.2em] uppercase font-bold rounded flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-600/15 dark:border-emerald-500/10">
                  <CheckCircle2 className="w-3 h-3" /> {language === 'ar' ? 'موثق معتمد' : 'VERIFIED'}
                </span>
              ) : isRumor ? (
                <span className="px-2.5 py-1 text-[9px] tracking-[0.15em] uppercase font-bold rounded flex items-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-600/15 dark:border-rose-500/10">
                  <AlertTriangle className="w-3 h-3 animate-pulse" /> {language === 'ar' ? 'شائعة مضللة' : 'DEBUNKED HOAX'}
                </span>
              ) : (
                <span className="px-2.5 py-1 text-[9px] tracking-[0.2em] uppercase font-bold rounded flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-600/15 dark:border-amber-500/10">
                  <AlertTriangle className="w-3 h-3" /> {language === 'ar' ? 'قيد التحقق' : 'DISPUTED'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Headline */}
        <h2 className="font-serif text-xl md:text-[22px] font-bold leading-[1.3] text-stone-900 dark:text-zinc-100 mb-4 tracking-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-300">
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); onSelect?.(item); }}
            className="text-left font-serif text-xl md:text-[22px] font-bold leading-[1.3] text-stone-900 dark:text-zinc-100 tracking-tight hover:underline focus:outline-none cursor-pointer"
          >
            {activeHeadline}
          </button>
        </h2>

        {/* Excerpt with higher typography spacing and elegance */}
        <p className="text-sm text-stone-700 dark:text-zinc-300 leading-[1.8] mb-6 font-sans font-normal break-words">
          {renderContent(activeContent)}
        </p>

        {/* Sources List if available */}
        {item.sources && item.sources.length > 0 && (
          <div className="mb-6 pt-4 border-t border-dashed border-stone-100 dark:border-zinc-800/60">
            <span className="text-[10px] font-mono tracking-wider text-stone-400 dark:text-zinc-600 uppercase block mb-2">{language === 'ar' ? 'روابط مراجع التدقيق والاعتماد السيادي:' : 'Audit Citations:'}</span>
            <div className="flex flex-wrap gap-2">
              {item.sources.map((src, sIdx) => {
                const hasRealUrl = src.url && src.url !== '#';
                return (
                  <a 
                    key={sIdx} 
                    href={hasRealUrl ? src.url : undefined}
                    target="_blank" 
                    rel="noreferrer"
                    className={`text-[10px] px-2 py-1 rounded border transition-all ${
                      hasRealUrl 
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/10 text-emerald-750 dark:text-emerald-400 border-emerald-250/50 dark:border-emerald-900/30 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/20 font-bold' 
                        : 'bg-stone-50 dark:bg-zinc-900 text-stone-500 dark:text-zinc-500 border-stone-150 dark:border-zinc-850 cursor-default'
                    }`}
                    onClick={(e) => {
                      if (!hasRealUrl) {
                        e.preventDefault();
                      } else {
                        e.stopPropagation();
                      }
                    }}
                  >
                    {src.name} {hasRealUrl && <span className="text-[9px] text-emerald-500">↗</span>}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Card Footer */}
        <div className="mt-auto flex items-center justify-between pt-5 border-t border-stone-150 dark:border-zinc-800/50">
          <div className="text-[10px] font-mono font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onSelect?.(item); }}
            className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1 hover:underline cursor-pointer"
          >
            {language === 'ar' ? 'عرض السجل والتدقيق بالكامل ←' : 'READ ARTICLE →'}
          </button>
        </div>
      </div>
    </article>
  );
}
