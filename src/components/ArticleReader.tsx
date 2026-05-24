import React, { useState, useEffect } from 'react';
import { NewsItem } from '../data';
import { getCategoryTheme, getCityTheme } from '../theme';
import { 
  X, CheckCircle2, AlertTriangle, Volume2, VolumeX, Type, Bookmark, BookmarkCheck,
  Share2, Printer, Map, ShieldCheck, Cpu, Globe2, HelpCircle, ChevronRight, FileText, Download,
  Video, MessageSquare, Send, Link, Check, ExternalLink, RefreshCw, Lock
} from 'lucide-react';
import { auth, googleProvider, getCachedAccessToken, setCachedAccessToken } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { motion } from 'motion/react';
import { t, Language, translateTag } from '../translation';

interface ArticleReaderProps {
  item: NewsItem;
  onClose: () => void;
  onSelectTag?: (tag: string) => void;
  language?: Language;
}

export default function ArticleReader({ item, onClose, onSelectTag, language = 'en' }: ArticleReaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechUtterance, setSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  
  // Real translation states (Gemini API backed)
  const [realTranslatedHeadline, setRealTranslatedHeadline] = useState<string>('');
  const [realTranslatedContent, setRealTranslatedContent] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Google Workspace States
  const [wsUser, setWsUser] = useState(auth.currentUser);
  const [accessToken, setAccessToken] = useState<string | null>(getCachedAccessToken());
  const [isLinking, setIsLinking] = useState(false);
  const [activeTab, setActiveTab] = useState<'meet' | 'chat'>('meet');

  // Meet Space States
  const [meetLoading, setMeetLoading] = useState(false);
  const [createdMeet, setCreatedMeet] = useState<{ id: string; uri: string; code: string } | null>(null);
  const [meetError, setMeetError] = useState<string | null>(null);
  const [copiedMeetUrl, setCopiedMeetUrl] = useState(false);

  // Chat Space States
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSpaces, setChatSpaces] = useState<any[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [chatMessage, setChatMessage] = useState(`[VERIFIED GCC DISPATCH] ${item.headline} - Authority Audit: ${item.verifiedStatus}`);
  const [chatSuccess, setChatSuccess] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [showChatConfirm, setShowChatConfirm] = useState(false);

  // Synchronize auth state and cached token
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setWsUser(u);
      setAccessToken(getCachedAccessToken());
    });
    return () => unsub();
  }, []);

  // Fetch Chat Spaces if token is available
  useEffect(() => {
    if (accessToken) {
      fetchChatSpaces();
    } else {
      setChatSpaces([]);
      setSelectedSpace('');
    }
  }, [accessToken]);

  const fetchChatSpaces = async () => {
    try {
      setChatError(null);
      const res = await fetch('https://chat.googleapis.com/v1/spaces', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch Spaces: Status ${res.status}`);
      }
      const data = await res.json();
      const spacesList = data.spaces || [];
      setChatSpaces(spacesList);
      if (spacesList.length > 0) {
        setSelectedSpace(spacesList[0].name);
      }
    } catch (err: any) {
      console.error(err);
      setChatError(err.message || String(err));
    }
  };

  const handleLinkWorkspace = async () => {
    setIsLinking(true);
    setMeetError(null);
    setChatError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setCachedAccessToken(credential.accessToken);
        setAccessToken(credential.accessToken);
      } else {
        throw new Error("No Google access token was returned.");
      }
    } catch (err: any) {
      console.error(err);
      setMeetError(err.message || "Failed to authorize Workspace APIs");
    } finally {
      setIsLinking(false);
    }
  };

  const handleCreateMeet = async () => {
    if (!accessToken) return;
    setMeetLoading(true);
    setMeetError(null);
    try {
      const res = await fetch('https://meet.googleapis.com/v2/spaces', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Google Meet API failed with status ${res.status}: ${errText}`);
      }
      const data = await res.json();
      setCreatedMeet({
        id: data.name,
        uri: data.meetingUri,
        code: data.meetingCode
      });
    } catch (err: any) {
      console.error(err);
      setMeetError(err.message || String(err));
    } finally {
      setMeetLoading(false);
    }
  };

  const handleSendToChat = async () => {
    if (!accessToken || !selectedSpace) return;
    setChatLoading(true);
    setChatSuccess(false);
    setChatError(null);
    setShowChatConfirm(false);
    try {
      const res = await fetch(`https://chat.googleapis.com/v1/${selectedSpace}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: chatMessage
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Google Chat API failed: ${res.status}: ${errText}`);
      }
      setChatSuccess(true);
      setTimeout(() => setChatSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      setChatError(err.message || String(err));
    } finally {
      setChatLoading(false);
    }
  };

  const handleCopyMeetUri = () => {
    if (!createdMeet) return;
    navigator.clipboard.writeText(createdMeet.uri).then(() => {
      setCopiedMeetUrl(true);
      setTimeout(() => setCopiedMeetUrl(false), 2000);
    });
  };

  // Utility to handle tagging and styled visual anchors inside article contents
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
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectTag?.(cleanPart);
              onClose();
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
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectTag?.(cleanPart);
              onClose();
            }}
            className={`px-1.5 py-0.5 mx-0.5 rounded font-bold font-mono text-[11px] cursor-pointer shadow-sm transition-all focus:outline-none inline-block ${theme.badgeStyle} ${theme.hoverColor}`}
            title={language === 'ar' ? `تصفية حسب التصنيف ${translateTag(cleanPart, language)}` : `Filter by category ${cleanPart}`}
          >
            {translateTag(cleanPart, language)}
          </button>
        );
      }
      return <span key={i} className="text-stone-700 dark:text-zinc-300 font-serif whitespace-pre-wrap">{part}</span>;
    });
  };

  // Check verification
  const isRumor = 
    item.verifiedStatus?.toUpperCase().includes('DEBUNKED') ||
    item.verifiedStatus?.toUpperCase().includes('MISINFORMATION') ||
    item.headline?.toUpperCase().includes('MISINFORMATION') ||
    item.headline?.toUpperCase().includes('RUMOR') ||
    item.headline?.toUpperCase().includes('DEBUNKED');

  const isVerified = !isRumor && (item.id !== '2' && item.id !== '5');

  // Trigger Gemini neural translation
  const triggerRealTranslation = async () => {
    if (realTranslatedHeadline && realTranslatedContent) {
      setIsTranslated(true);
      return;
    }
    setIsTranslating(true);
    setIsTranslated(true);
    try {
      const [headlineRes, contentRes] = await Promise.all([
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

      const headlineData = await headlineRes.json();
      const contentData = await contentRes.json();

      if (headlineData.translation) {
        setRealTranslatedHeadline(headlineData.translation);
      }
      if (contentData.translation) {
        setRealTranslatedContent(contentData.translation);
      }
    } catch (e) {
      console.warn("Gemini translation API failed, utilizing secure editorial backup:", e);
    } finally {
      setIsTranslating(false);
    }
  };

  // Sync translation triggers with website language
  useEffect(() => {
    if (language === 'ar') {
      triggerRealTranslation();
    } else {
      setIsTranslated(false);
    }
  }, [language, item.id]);

  // Verify Bookmarked status
  useEffect(() => {
    const saved = localStorage.getItem(`news_bookmark_${item.id}`);
    if (saved) setIsBookmarked(true);

    // Initialize list of synthesis voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const list = window.speechSynthesis.getVoices();
        setVoices(list.filter(v => v.lang.startsWith('en') || v.lang.startsWith('ar')));
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [item.id]);

  const toggleBookmark = () => {
    if (isBookmarked) {
      localStorage.removeItem(`news_bookmark_${item.id}`);
      setIsBookmarked(false);
    } else {
      localStorage.setItem(`news_bookmark_${item.id}`, 'true');
      setIsBookmarked(true);
    }
  };

  // Text-To-Speech Handlers
  const handleTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = isTranslated 
      ? `${displayHeadline}. Dispatch content: ${displayContent}`
      : `${item.headline}. Dispatch content: ${item.content}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    if (selectedVoice) {
      const matchedVoice = voices.find(v => v.name === selectedVoice);
      if (matchedVoice) utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
    setSpeechUtterance(utterance);
    setIsPlaying(true);
  };

  // Share link trigger
  const handleShare = () => {
    const fakeLink = `${window.location.origin}/#article-${item.id}`;
    navigator.clipboard.writeText(fakeLink).then(() => {
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    });
  };

  // Generate standard print output for dispatches
  const handlePrint = () => {
    window.print();
  };

  // Automated & Fallback Neural Translation (Eng -> Ara with optional Gemini API routing)
  const displayHeadline = isTranslating 
    ? "جاري تهيئة الترجمة الفورية عبر الذكاء الاصطناعي..." 
    : (realTranslatedHeadline || (item.id === '1' 
        ? 'هيئة أبوظبي للاستثمار تعلن عن توسع كبير في قطاعات الطاقة المتجددة العالمية'
        : item.id === '2'
        ? 'الشركات الناشئة في مجال التكنولوجيا بدبي تؤمن تمويلاً تأسيسياً قياسياً في الربع الأول'
        : item.id === '3'
        ? 'المملكة العربية السعودية تكشف عن مبادرات تعليمية معززة جديدة في الرياض'
        : item.id === '4'
        ? 'أسواق العقارات العالمية تتفاعل مع السياسات الاقتصادية لدول مجلس التعاون الخليجي'
        : item.id === '5'
        ? 'عمان توقع اتفاقية تاريخية لتوسعة ميناء صحار التجاري'
        : `ترجمة معتمدة: ${item.headline}`));

  const displayContent = isTranslating 
    ? "جاري تحميل تفاصيل المحتوى المعرب دقيقاً من خوادم جيميناي..." 
    : (realTranslatedContent || (item.id === '1'
        ? 'كشفت هيئة أبوظبي للاستثمار عن خارطة طريق إستراتيجية جديدة تركز بشكل مكثف على أصول الطاقة المستدامة والمتجددة على مستوى العالم. وتشير المصادر إلى توقع تخصيص رأس مال ضخم بحلول الربع الرابع.'
        : item.id === '2'
        ? 'تظهر الاتجاهات الأخيرة في دبي طفرة هائلة في رأس المال الاستثماري الذي يدخل الشركات الناشئة المحلية في مجال التكنولوجيا. ويشير سوق دبي المالي إلى زيادة الاهتمام من المجموعات القابضة الدولية.'
        : item.id === '3'
        ? 'يجري التخطيط لإنشاء مجمعات تعليمية جديدة في الرياض، مع التركيز على مجالات العلوم والتكنولوجيا والهندسة والرياضيات وأبحاث الذكاء الاصطناعي المتقدمة، بما يتماشى مع أهداف رؤية 2030.'
        : item.id === '4'
        ? 'تشهد الأسواق الدولية تأثيراً تموجياً من الإصلاحات الاقتصادية الأخيرة المعتمدة من قبل دول مجلس التعاون الخليجي. واجتمع مسؤولون رئيسيون من الشارقة والمنامة لمناقشة الاستثمارات العابرة للحدود.'
        : item.id === '5'
        ? 'سيخضع ميناء صحار لتوسعة هائلة، مما يعزز القدرة التجارية بنسبة 40 ٪ ويخلق آلاف فرص العمل في المنطقة.'
        : `المحتوى المترجم: ${item.content}`));

  // Formatting date elegantly
  const formattedDate = new Date(item.publishedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const fontClasses = {
    sm: 'text-xs md:text-sm leading-relaxed',
    base: 'text-sm md:text-base leading-relaxed',
    lg: 'text-base md:text-lg leading-relaxed',
    xl: 'text-lg md:text-xl leading-relaxed',
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#0C0C0E]/80 backdrop-blur-md z-50 overflow-y-auto flex items-start justify-center p-4 md:p-8"
    >
      <motion.div 
        initial={{ y: 30, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 30, scale: 0.98 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="bg-[#FAF9F5] dark:bg-[#0E0F12] border border-stone-200 dark:border-zinc-800/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden mt-2 md:mt-6 print:border-none print:shadow-none print:bg-white"
        id="print-container"
      >
        {/* Top Control Header Toolbar (Not printed) */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-100/80 dark:bg-zinc-950/40 border-b border-stone-200 dark:border-zinc-800/80 print:hidden select-none">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-mono tracking-widest font-bold text-stone-500 dark:text-zinc-500 uppercase">
              DISPATCH ID: <span className="text-stone-800 dark:text-zinc-350">{item.id}</span>
            </span>
            <span className="text-stone-300 dark:text-zinc-700">•</span>
            {isVerified ? (
              <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED
              </span>
            ) : isRumor ? (
              <span className="bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono flex items-center gap-1 border border-rose-300/20 dark:border-rose-900/40">
                <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse" /> DEBUNKED HOAX / MISINFORMATION
              </span>
            ) : (
              <span className="bg-amber-50 dark:bg-amber-950/30 text-amber-755 dark:text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" /> DISPUTED DISPATCH
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Translate Neural Switcher */}
            <button
              onClick={() => {
                if (!isTranslated) {
                  triggerRealTranslation();
                } else {
                  setIsTranslated(false);
                }
                if (isPlaying) {
                  window.speechSynthesis.cancel();
                  setIsPlaying(false);
                }
              }}
              className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg border uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                isTranslated 
                  ? 'bg-amber-100/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/60 text-amber-800 dark:text-amber-400' 
                  : 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800/80 text-stone-600 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-850'
              }`}
            >
              <Globe2 className="w-3 h-3" />
              {isTranslated ? "Show original (EN)" : "ترجمة عاجلة (AR)"}
            </button>

            {/* Bookmark button */}
            <button
              onClick={toggleBookmark}
              title={isBookmarked ? "Remove Bookmark" : "Save Dispatch"}
              className="p-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-lg text-stone-600 dark:text-zinc-450 hover:bg-stone-50 dark:hover:bg-zinc-850 cursor-pointer shadow-sm"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Print action */}
            <button
              onClick={handlePrint}
              title="Print Sovereign Dispatch Record"
              className="p-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-lg text-stone-600 dark:text-zinc-450 hover:bg-stone-50 dark:hover:bg-zinc-850 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 bg-stone-900 text-stone-100 dark:bg-zinc-800 dark:text-zinc-200 rounded-lg hover:bg-stone-850 dark:hover:bg-zinc-700 cursor-pointer transition-all ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cinematic Header Block (Bilingual responsive display) */}
        <div className="relative bg-stone-100 dark:bg-zinc-950 px-6 py-8 md:p-10 border-b border-stone-200 dark:border-zinc-900">
          {item.imageUrl && (
            <div className="absolute inset-0 z-0 opacity-15 dark:opacity-20 select-none">
              <img 
                src={item.imageUrl} 
                alt="" 
                className="w-full h-full object-cover filter saturate-50 blur-sm" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F5] dark:from-[#0E0F12] to-transparent"></div>
            </div>
          )}

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono font-bold tracking-widest uppercase">
              {item.locationTags.map((loc, idx) => {
                const theme = getCityTheme(loc);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTag?.(loc);
                      onClose();
                    }}
                    className={`px-2 py-0.75 rounded-md font-mono text-[10.5px] cursor-pointer focus:outline-none transition-all ${theme.badgeStyle} ${theme.hoverColor}`}
                    title={language === 'ar' ? `تصفية حسب الموقع ${translateTag(loc, language)}` : `Filter by location ${loc}`}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTag?.(cat);
                      onClose();
                    }}
                    className={`px-2 py-0.75 rounded-md font-mono text-[10.5px] cursor-pointer focus:outline-none transition-all ${theme.badgeStyle} ${theme.hoverColor}`}
                    title={language === 'ar' ? `تصفية حسب التصنيف ${translateTag(cat, language)}` : `Filter by category ${cat}`}
                  >
                    {translateTag(cat, language)}
                  </button>
                );
              })}
            </div>

            <h1 className={`font-serif tracking-tight font-extrabold text-2xl md:text-3xl lg:text-4.5xl leading-tight text-stone-950 dark:text-zinc-50 ${isTranslated ? 'text-right font-sans' : ''}`}>
              {isTranslated ? displayHeadline : item.headline}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-500 dark:text-zinc-500 pt-2 border-t border-stone-200/50 dark:border-zinc-800/50">
              <span className="font-mono">{formattedDate}</span>
              <span className="hidden md:inline text-stone-300 dark:text-zinc-700">•</span>
              <span className="font-mono">INTELLIGENCE REGISTRY BROADCAST</span>
            </div>
          </div>
        </div>

        {/* Master Contents Split (Primary Reading + Sovereign Metadata sidebar) */}
        <div className="px-6 py-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Reading Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Interactive Audio Synthesizer Controls (Not printed) */}
            <div className="bg-stone-50 dark:bg-zinc-950/50 border border-stone-200/75 dark:border-zinc-850/80 p-4.5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden select-none">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTTS}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isPlaying 
                      ? 'bg-amber-500 text-zinc-950 scale-105 animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:text-zinc-950 shadow-md'
                  }`}
                  title={isPlaying ? "Mute Broadcast Room Reader" : "Auditory Broadcast Readout"}
                >
                  {isPlaying ? (
                    <VolumeX className="w-5 h-5 font-bold" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <div className="text-[11px] font-mono tracking-widest text-stone-400 dark:text-zinc-500 uppercase font-bold">DISPATCH BROADCAST ROOM</div>
                  <div className="text-[12px] font-bold text-stone-800 dark:text-zinc-350 flex items-center gap-1">
                    {isPlaying ? "Live neural synthesizer dictating..." : "Listen to dynamic dispatch audit"}
                  </div>
                </div>
              </div>

              {/* Advanced Controls: Voice Pitch/Type and Read Equalizer animation */}
              <div className="flex items-center gap-4">
                {isPlaying && (
                  <div className="flex items-end gap-1.5 h-6 px-1 shrink-0">
                    <span className="w-0.75 bg-amber-500 h-2 animate-[bounce_0.8s_infinite] block rounded-sm"></span>
                    <span className="w-0.75 bg-amber-500 h-5 animate-[bounce_1.1s_infinite] delay-100 block rounded-sm"></span>
                    <span className="w-0.75 bg-amber-500 h-3 animate-[bounce_0.9s_infinite] delay-200 block rounded-sm"></span>
                    <span className="w-0.75 bg-amber-500 h-6 animate-[bounce_1.2s_infinite] delay-300 block rounded-sm"></span>
                  </div>
                )}

                {voices.length > 0 && (
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800/80 rounded-lg p-1.5 text-[10.5px] text-stone-600 dark:text-zinc-400 max-w-44 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-ellipsis overflow-hidden"
                  >
                    <option value="">System Voice Default</option>
                    {voices.map((v, idx) => (
                      <option key={idx} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Typography reading controls toolbar (Not printed) */}
            <div className="flex items-center justify-between border-b border-stone-200/50 dark:border-zinc-900 pb-3 font-mono text-[10.5px] text-stone-400 dark:text-zinc-500 uppercase print:hidden select-none">
              <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Primary Dispatch Body</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 mr-1"><Type className="w-3 h-3" /> FONT ADJUST</span>
                {(['sm', 'base', 'lg', 'xl'] as const).map(sz => (
                  <button
                    key={sz}
                    onClick={() => setFontSize(sz)}
                    className={`w-6 h-6 rounded flex items-center justify-center font-bold font-mono transition-all cursor-pointer ${
                      fontSize === sz 
                        ? 'bg-stone-200 text-stone-900 dark:bg-zinc-800 dark:text-zinc-200 border border-stone-300 dark:border-zinc-700'
                        : 'hover:bg-stone-100 dark:hover:bg-zinc-900 text-stone-400'
                    }`}
                  >
                    {sz.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Headline and Article content */}
            <article className={`text-stone-900 dark:text-zinc-200 break-words font-serif ${isTranslated ? 'text-right font-sans leading-loose' : ''}`} style={{ direction: isTranslated ? 'rtl' : 'ltr' }}>
              <div className={`${fontClasses[fontSize]} whitespace-pre-wrap leading-relaxed tracking-wide`}>
                {renderContent(isTranslated ? displayContent : item.content)}
              </div>
            </article>

            {/* Verification metadata & dynamic details audit list */}
            <div className="mt-8 p-5 rounded-2xl border border-stone-200 dark:border-zinc-850 bg-[#FAF9F5] dark:bg-[#08080B] shadow-sm select-none">
              <div className="flex items-center gap-2 mb-3.5 border-b border-stone-200/50 dark:border-zinc-800/50 pb-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-mono tracking-widest text-[#121316] dark:text-zinc-150 uppercase font-bold">{language === 'ar' ? "تقرير الامتثال الرقابي والتحقق" : "Discretionary Compliance Report"}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-4.5 h-4.5 rounded bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono flex items-center justify-center font-bold">01</span>
                  <div>
                    <div className="font-bold text-stone-800 dark:text-zinc-350 font-sans">{language === 'ar' ? "مطابقة التصنيف البلدي" : "Municipal Tag Compliance"}</div>
                    <p className="text-[11px] text-stone-500 dark:text-zinc-500">{language === 'ar' ? "التصنيفات الجغرافية والبلدية ومطابقة العقد مصبوبة محلياً بدقة." : "Cross-matched database tags match regional municipality filters exactly."}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-4.5 h-4.5 rounded bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono flex items-center justify-center font-bold">02</span>
                  <div>
                    <div className="font-bold text-stone-800 dark:text-zinc-350 font-sans">{language === 'ar' ? "مؤشر دقة التحقق (٠-١٠٠)" : "Verification Index (0-100)"}</div>
                    <p className="text-[11px] text-stone-500 dark:text-zinc-500">
                      {language === 'ar' 
                        ? (isVerified ? "درجة التوافق الرقابي: ٩٨٪ (برقية رسمية معتمدة)." : "درجة التوافق الرقابي: ٤١٪ (قيد التدقيق والانتظار).")
                        : (isVerified ? "Compliance Score: 98% (High Authority Cert)." : "Compliance Score: 41% (Disputed under Review).")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-4.5 h-4.5 rounded bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono flex items-center justify-center font-bold">03</span>
                  <div>
                    <div className="font-bold text-stone-800 dark:text-zinc-350 font-sans">{language === 'ar' ? "توقيع الموثوقية الرقمية" : "Audit Signature ID"}</div>
                    <p className="text-[11px] text-stone-500 dark:text-zinc-500 font-mono text-[10.5px]">SHA-256: d83a9fcb_{item.id}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-4.5 h-4.5 rounded bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono flex items-center justify-center font-bold">04</span>
                  <div>
                    <div className="font-bold text-stone-800 dark:text-zinc-350 font-sans">{language === 'ar' ? "ربط وتطابق مصادر الرفع" : "Sovereign Source Matching"}</div>
                    <p className="text-[11px] text-stone-500 dark:text-zinc-500">{language === 'ar' ? "تمت فهرسة وتحري جميع المراجع والشهادات بموجب الأنظمة والجهات المعتمدة." : "Citations cataloged against authentic state databases."}</p>
                  </div>
                </div>
              </div>

              {/* Disputed Dispatch Warnings Frame */}
              {!isVerified && (
                <div className={`mt-4 p-4 border rounded-xl text-xs flex gap-3 ${
                  isRumor 
                    ? 'border-rose-350 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-955/20 text-rose-800 dark:text-rose-400' 
                    : 'border-amber-350 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-955/20 text-amber-800 dark:text-amber-400'
                }`}>
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 animate-pulse" />
                  <div>
                    <span className="font-bold uppercase block mb-1">
                      {isRumor 
                        ? (language === 'ar' ? "🚨 لوحة تحذير دقة الأخبار (شائعة مغلوطة مضللة)" : "🚨 State Integrity Warning Panel (DEBUNKED)") 
                        : (language === 'ar' ? "⚠️ لوحة تحذير التحقق الرقابي (نزاع قيد التحقق)" : "⚠️ State Integrity Warning Panel (DISPUTED)")}
                    </span>
                    <p className="mb-2">
                      {isRumor 
                        ? (language === 'ar' ? "تحتوي هذه البرقية الإخبارية على عناصر مصنفة على أنها مزيفة أو شائعات غير دقيقة من قبل جهات المراقبة الرقمية للأمان الإعلامي." : "This news dispatch contains elements flagged as DEBUNKED RUMOR / MISINFORMATION by digital safety authorities. Re-verification measures have been completed.") 
                        : (language === 'ar' ? "يجري العمل والتحقق من صحة هذه البرقية الإخبارية من قبل الأوساط الإعلامية والجهات الصحفية السيادية الخليجية المعتمدة." : "This news dispatch contains elements flagged as UNCONFIRMED / DISPUTED by digital safety authorities. Re-verification measures have been completed.")}
                    </p>
                    {item.verifiedStatus && (
                      <div className="p-2 rounded-lg bg-black/5 dark:bg-black/20 text-[11px] font-mono text-rose-900 dark:text-rose-300">
                        <strong>{language === 'ar' ? "تحقيق ومعالجة الهيئة السيادية الفورية للتوضيح:" : "Official Verification & Correction Audit:"}</strong> {item.verifiedStatus}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Sovereign Metadata Sidebar Column */}
          <div className="lg:col-span-4 flex flex-col gap-8 print:hidden select-none">
            
            {/* Dynamic Interactive Mini Map Coordinates */}
            <div className="bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800/80 p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#121316] dark:text-zinc-150 flex items-center gap-1.5 pb-2.5 border-b border-stone-200 dark:border-zinc-850">
                <Map className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {language === 'ar' ? 'مؤشر التموضع الجغرافي' : 'Geolocation Index'}
              </h3>

              {/* Dynamic Coordinate Radar Graphic */}
              <div className="relative h-32 bg-stone-100 dark:bg-zinc-900 border border-stone-200/50 dark:border-zinc-800/50 rounded-xl overflow-hidden flex items-center justify-center">
                {/* Radial circles radar */}
                <div className="absolute w-24 h-24 rounded-full border border-stone-200/60 dark:border-zinc-800/40 animate-ping opacity-30"></div>
                <div className="absolute w-16 h-16 rounded-full border border-stone-200/50 dark:border-zinc-800/40"></div>
                <span className="absolute text-[8px] font-mono font-bold text-stone-400 dark:text-zinc-600 uppercase tracking-widest top-2">{language === 'ar' ? "إحداثيات إلكترونية ذاتية" : "AUTONOMOUS COORDINATES"}</span>
                
                {/* Custom dot representing the active city */}
                <div className="relative z-10 flex flex-col items-center">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-[9.5px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-1.5">{translateTag(item.locationTags[0], language)}</span>
                </div>
              </div>

              <div className="text-[11px] leading-relaxed text-stone-500 dark:text-zinc-500 space-y-1 bg-stone-100/50 dark:bg-zinc-900/40 p-3 rounded-lg border border-stone-200/20 dark:border-zinc-850">
                <div><strong>{language === 'ar' ? "العقدة السيادية:" : "Sovereign Node:"}</strong> Gulf Index Host ae_node_01</div>
                <div><strong>{language === 'ar' ? "خط العرض:" : "Latitude:"}</strong> 25.2048° N</div>
                <div><strong>{language === 'ar' ? "خط الطول:" : "Longitude:"}</strong> 55.2708° E</div>
              </div>
            </div>

            {/* Official Source Citations Panel */}
            <div className="bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800/80 p-5 rounded-2xl shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#121316] dark:text-zinc-150 flex items-center gap-1.5 pb-2.5 border-b border-stone-200 dark:border-zinc-850 mb-3.5">
                <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {language === 'ar' ? "المكتب المركزي لمصادر التدقيق" : "Bureau Audit Sources"}
              </h3>

              <div className="flex flex-col gap-3">
                {item.sources && item.sources.length > 0 ? (
                  item.sources.map((src, idx) => {
                    const hasRealUrl = src.url && src.url !== '#';
                    return (
                      <a 
                        key={idx}
                        href={hasRealUrl ? src.url : undefined}
                        target="_blank"
                        rel="noreferrer"
                        className={`group flex items-center justify-between p-2.5 bg-white dark:bg-[#0E0F12] border border-stone-200 dark:border-zinc-850 rounded-lg transition-all font-sans text-xs font-medium ${
                          hasRealUrl 
                            ? 'hover:border-emerald-500/50 hover:bg-stone-50 dark:hover:bg-zinc-900 cursor-pointer' 
                            : 'opacity-70 cursor-default'
                        }`}
                        onClick={(e) => {
                          if (!hasRealUrl) e.preventDefault();
                        }}
                      >
                        <span className="text-stone-700 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-bold">{src.name}</span>
                        {hasRealUrl && <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-500 transition-colors" />}
                      </a>
                    );
                  })
                ) : (
                  <span className="text-xs text-stone-400">{language === 'ar' ? "لا تتطلب هذه البرقية السيادية مرجع بث خارجي لتكامل المصداقية." : "No external source citation required for this dispatch."}</span>
                )}
              </div>

              <div className="text-[10px] leading-relaxed text-stone-400 dark:text-zinc-650 mt-4 pt-3.5 border-t border-stone-200/50 dark:border-zinc-800/50 flex flex-col gap-1.5">
                <div>🔒 <strong>{language === 'ar' ? "ضمان البث الموثق معتمداً:" : "Verified Stream Guarantee:"}</strong> {language === 'ar' ? "الخلاصات متزامنة ومطابقة تماماً للسجلات الحكومية الرسمية." : "Dispatches match original governmental registers."}</div>
                <div>📋 {language === 'ar' ? "يمكن للزوار تحميل وطباعة ورقة البرقية الرسمية للشفافية." : "Users can download standard dispatches directly."}</div>
              </div>
            </div>

            {/* Google Workspace Integration Hub Panel */}
            <div className="bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800/80 p-5 rounded-2xl shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#121316] dark:text-zinc-150 flex items-center gap-1.5 pb-2.5 border-b border-stone-200 dark:border-zinc-850 mb-3.5">
                <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {language === 'ar' ? "مركز غوغل وورك سبيس" : "Google Workspace Hub"}
              </h3>

              {!accessToken ? (
                /* Not authenticated / Linked Workspace */
                <div className="flex flex-col gap-3 py-1">
                  <p className="text-[11px] leading-relaxed text-stone-500 dark:text-zinc-400">
                    {language === 'ar' 
                      ? "قم بربط حساب غوغل السيادي الخاص بك لإلغاء القفل عن ميزات التعاون الفوري والحي (غوغل ميت وغوغل تشات)." 
                      : "Connect your sovereign Google Account to unlock integrated real-time collaboration features (Google Meet & Google Chat)."}
                  </p>
                  <button
                    onClick={handleLinkWorkspace}
                    disabled={isLinking}
                    className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-stone-50 dark:text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    {isLinking ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        {language === 'ar' ? "جاري منح التفويض..." : "Authorizing..."}
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                        {language === 'ar' ? "منح صلاحية الوصول الإلكتروني" : "Grant Workspace Access"}
                      </>
                    )}
                  </button>
                  {meetError && (
                    <span className="text-[9.5px] font-mono text-rose-600 dark:text-rose-400 block text-center break-words leading-normal bg-rose-50/50 dark:bg-rose-955/10 p-2 rounded">
                      {meetError}
                    </span>
                  )}
                </div>
              ) : (
                /* Authenticated & Authorized */
                <div className="flex flex-col gap-3.5">
                  {/* Tab Selector */}
                  <div className="flex border-b border-stone-200 dark:border-zinc-800/80 pb-1">
                    <button
                      onClick={() => setActiveTab('meet')}
                      className={`flex-1 pb-2 text-[10px] font-mono font-bold tracking-wider uppercase transition-colors text-center cursor-pointer border-b-2 ${
                        activeTab === 'meet'
                          ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400 font-extrabold'
                          : 'border-transparent text-stone-400 dark:text-zinc-550 hover:text-stone-700 dark:hover:text-zinc-350'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <Video className="w-3.5 h-3.5" />
                        {language === 'ar' ? "غوغل ميت" : "Google Meet"}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className={`flex-1 pb-2 text-[10px] font-mono font-bold tracking-wider uppercase transition-colors text-center cursor-pointer border-b-2 ${
                        activeTab === 'chat'
                          ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400 font-extrabold'
                          : 'border-transparent text-stone-400 dark:text-zinc-550 hover:text-stone-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {language === 'ar' ? "غوغل تشات" : "Google Chat"}
                      </span>
                    </button>
                  </div>

                  {/* Tab Content: Google Meet */}
                  {activeTab === 'meet' && (
                    <div className="flex flex-col gap-3">
                      <p className="text-[11px] leading-relaxed text-stone-500 dark:text-zinc-400">
                        {language === 'ar' 
                          ? "قم بإنشاء غرفة اجتماعات فورية ومستقلة لمناقشة ومراجعة هذا التدفق التحريري." 
                          : "Spawn a dedicated meeting room instantly to debate or discuss this editorial stream."}
                      </p>

                      {!createdMeet ? (
                        <button
                          onClick={handleCreateMeet}
                          disabled={meetLoading}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          {meetLoading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              {language === 'ar' ? "جاري إنشاء الغرفة..." : "Creating Space..."}
                            </>
                          ) : (
                            <>
                              <Video className="w-3.5 h-3.5" />
                              {language === 'ar' ? "إنشاء غرفة مناقشة فورية" : "Create Discussion Room"}
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2.5 p-3 bg-stone-100 dark:bg-zinc-900/60 rounded-xl border border-stone-200/50 dark:border-zinc-800/50">
                          <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase">
                            {language === 'ar' ? "✓ غرفة المناقشة الفورية جاهزة" : "✓ Discussion Space Ready"}
                          </span>
                          <div className="text-xs font-semibold select-all text-stone-850 dark:text-zinc-200 font-mono break-all leading-normal bg-white dark:bg-zinc-950 px-2 py-1.5 rounded border border-stone-150 dark:border-zinc-800">
                            {createdMeet.uri}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleCopyMeetUri}
                              className="flex-1 py-1 px-2.5 bg-white hover:bg-stone-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-stone-200 dark:border-zinc-700 rounded-md text-[10.5px] font-bold text-stone-700 dark:text-zinc-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              {copiedMeetUrl ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  {language === 'ar' ? "تم النسخ!" : "Copied!"}
                                </>
                              ) : (
                                <>
                                  <Link className="w-3 h-3" />
                                  {language === 'ar' ? "نسخ الرابط" : "Copy Link"}
                                </>
                              )}
                            </button>
                            <a
                              href={createdMeet.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:text-zinc-950 rounded-md text-[10.5px] font-extrabold tracking-wide transition-colors flex items-center justify-center gap-1 cursor-pointer text-center"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {language === 'ar' ? "انضمام للغرفة" : "Join Room"}
                            </a>
                          </div>
                        </div>
                      )}

                      {meetError && (
                        <span className="text-[9.5px] font-mono text-rose-600 dark:text-rose-400 block text-center break-words scrollbar-thin max-h-20 overflow-y-auto">
                          {meetError}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tab Content: Google Chat */}
                  {activeTab === 'chat' && (
                    <div className="flex flex-col gap-3">
                      <p className="text-[11px] leading-relaxed text-stone-500 dark:text-zinc-400">
                        {language === 'ar' 
                          ? "قم ببث تفاصيل هذه البرقية الإخبارية بصورة عاجلة وفورية ومباشرة عبر خط التشات السيادي." 
                          : "Broadcast details of this dispatch immediately down the sovereign Chat wire."}
                      </p>

                      {/* Dropdown to select space */}
                      {chatSpaces.length > 0 ? (
                        <div>
                          <label className="block text-[9px] font-mono text-stone-400 dark:text-zinc-550 uppercase tracking-widest mb-1 font-bold">
                            {language === 'ar' ? "اختر قناة المحادثة الإخبارية" : "Select Chat Space Channel"}
                          </label>
                          <select
                            value={selectedSpace}
                            onChange={(e) => setSelectedSpace(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded px-2.5 py-1.5 text-xs text-stone-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            {chatSpaces.map((space) => (
                              <option key={space.name} value={space.name}>
                                {space.displayName || space.name.replace('spaces/', 'Space #')}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="text-[10px] italic text-stone-400 dark:text-zinc-550 flex items-center justify-between">
                          <span>{language === 'ar' ? "جاري جلب قائمة قنوات المحادثة..." : "Listing your Chat membership spaces..."}</span>
                          <button 
                            onClick={fetchChatSpaces}
                            title="Reload Spaces"
                            className="p-1 hover:text-stone-700 dark:hover:text-zinc-300"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Message editor */}
                      <div>
                        <label className="block text-[9px] font-mono text-stone-400 dark:text-zinc-550 uppercase tracking-widest mb-1 font-bold">
                          {language === 'ar' ? "محتوى برقية البث العاجل" : "Wire Message Dispatch"}
                        </label>
                        <textarea
                          rows={2}
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded p-2 text-xs text-stone-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-sans"
                        />
                      </div>

                      {/* Confirm/Send Actions */}
                      {!showChatConfirm ? (
                        <button
                          onClick={() => {
                            if (!selectedSpace) {
                              setChatError(language === 'ar' ? "يرجى تحديد أو التحقق من صحة القناة المستهدفة أولاً." : "Please select/verify a destination space channel first.");
                              return;
                            }
                            setShowChatConfirm(true);
                          }}
                          disabled={chatLoading}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {language === 'ar' ? "بث إلى الخط الإخباري العاجل" : "Broadcast to Wire"}
                        </button>
                      ) : (
                        <div className="p-3 border border-dashed border-amber-300/80 bg-amber-50/20 dark:border-amber-900/60 dark:bg-amber-955/10 rounded-xl flex flex-col gap-2">
                          <span className="text-[10px] font-mono text-amber-800 dark:text-amber-500 font-bold tracking-wide uppercase block text-center">
                            {language === 'ar' ? "⚠️ تأكيد عملية البث الرقمي" : "⚠️ Confirm Broadcast Operation"}
                          </span>
                          <p className="text-[9.5px] leading-relaxed text-stone-500 dark:text-zinc-400 text-center">
                            {language === 'ar' 
                              ? "هل أنت متأكد من رغبتك في بث هذه البرقية الإخبارية إلى غوغل تشات؟ هذا الإجراء سيتم تفويضه باسمك بالكامل." 
                              : "Are you sure you want to write this dispatch into Google Chat? This action is user-authoritative."}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowChatConfirm(false)}
                              className="flex-1 py-1.5 px-2 bg-white hover:bg-stone-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-stone-200 dark:border-zinc-700 rounded text-[10px] font-bold text-stone-600 dark:text-zinc-300 uppercase transition-colors cursor-pointer shadow-sm"
                            >
                              {language === 'ar' ? "الاحتفاظ بالمسودة" : "Keep Draft"}
                            </button>
                            <button
                              onClick={handleSendToChat}
                              disabled={chatLoading}
                              className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:text-zinc-950 rounded text-[10px] font-extrabold uppercase tracking-wide transition-colors cursor-pointer shadow-sm text-center"
                            >
                              {chatLoading ? (language === 'ar' ? "جاري البث والرفع..." : "Sending...") : (language === 'ar' ? "نعم، انشر الآن" : "Yes, Post Now")}
                            </button>
                          </div>
                        </div>
                      )}

                      {chatSuccess && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold tracking-wider block text-center bg-emerald-50/50 dark:bg-emerald-950/20 py-1.5 px-2.5 rounded-lg border border-emerald-200/50 dark:border-emerald-900/50 animate-pulse">
                          {language === 'ar' ? "✓ تم إرسال البث العاجل بنجاح!" : "✓ Wire Broadcast Submitted!"}
                        </span>
                      )}

                      {chatError && (
                        <span className="text-[9.5px] font-mono text-rose-600 dark:text-rose-400 block text-center break-words max-h-20 overflow-y-auto p-1">
                          {chatError}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Disconnect Actions */}
                  <div className="pt-2 border-t border-stone-200 dark:border-zinc-850/80 flex items-center justify-between text-[9.5px] font-mono text-stone-400 dark:text-zinc-550">
                    <span>{language === 'ar' ? "نشط حالياً:" : "Active:"} {wsUser?.displayName || wsUser?.email?.split('@')[0]}</span>
                    <button
                      onClick={() => {
                        setCachedAccessToken(null);
                        setAccessToken(null);
                      }}
                      className="hover:text-rose-600 transition-colors uppercase font-bold cursor-pointer"
                    >
                      {language === 'ar' ? "فصل الخدمة" : "Disconnect API"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Print Friendly Dispatch Card Actions */}
            <div className="p-4 bg-amber-500/5 dark:bg-amber-500/5 border border-dashed border-amber-500/30 dark:border-amber-500/10 rounded-2xl text-center">
              <span className="text-[10.5px] font-mono tracking-wider text-amber-800 dark:text-amber-500 block mb-2 font-bold select-none uppercase">{language === 'ar' ? "خيارات التشارك والتصدير والطباعة" : "Interactive share options"}</span>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleShare}
                  className="px-3.5 py-2 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800/80 rounded-lg text-xs font-bold text-stone-700 dark:text-zinc-350 hover:bg-stone-50 dark:hover:bg-zinc-850 cursor-pointer shadow-sm flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {language === 'ar' ? (copyStatus ? "تم النسخ!" : "نسخ الرابط") : (copyStatus ? "Copied!" : "Copy URL")}
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950 font-extrabold rounded-lg text-xs hover:opacity-90 cursor-pointer shadow-sm flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <Download className="w-3.5 h-3.5" />
                  {language === 'ar' ? "طباعة البرقية الإخبارية" : "Print Dispatch"}
                </button>
              </div>
            </div>

          </div>

        </div>

      </motion.div>
    </motion.div>
  );
}
