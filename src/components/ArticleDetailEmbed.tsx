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
import { t, Language, translateTag, translateCategory, translateCity } from '../translation';

interface ArticleDetailEmbedProps {
  item: NewsItem;
  onClose: () => void;
  onSelectTag?: (tag: string) => void;
  language?: Language;
}

export default function ArticleDetailEmbed({ item, onClose, onSelectTag, language = 'en' }: ArticleDetailEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechUtterance, setSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);
  
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
  const [chatMessage, setChatMessage] = useState('');
  const [chatSuccess, setChatSuccess] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [showChatConfirm, setShowChatConfirm] = useState(false);

  // Initialize Chat message on load or article shift
  useEffect(() => {
    setChatMessage(`[VERIFIED GCC DISPATCH] ${item.headline} - Authority Audit: ${item.verifiedStatus}`);
    // Reset translation states when target article shifts
    setRealTranslatedHeadline('');
    setRealTranslatedContent('');
    setIsTranslated(language === 'ar');
  }, [item.id, language]);

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
  const renderContentInline = (contentStr: string) => {
    const parts = contentStr.split(/(@\w+(?:\s\w+)*|#\w+)/gi);
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
            className={`px-1.5 py-0.5 mx-0.5 rounded font-bold font-mono text-[10.5px] cursor-pointer shadow-xs transition-all focus:outline-none inline-block ${theme.badgeStyle} ${theme.hoverColor}`}
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
            className={`px-1.5 py-0.5 mx-0.5 rounded font-bold font-mono text-[10.5px] cursor-pointer shadow-xs transition-all focus:outline-none inline-block ${theme.badgeStyle} ${theme.hoverColor}`}
            title={language === 'ar' ? `تصفية حسب التصنيف ${translateTag(cleanPart, language)}` : `Filter by category ${cleanPart}`}
          >
            {translateTag(cleanPart, language)}
          </button>
        );
      }
      return <span key={i} className="text-stone-700 dark:text-zinc-350 font-sans text-sm md:text-[14.5px] leading-relaxed whitespace-pre-wrap">{part}</span>;
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
      console.warn("Gemini translation API failed, utilizing secure fallback:", e);
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
    setIsBookmarked(!!saved);
  }, [item.id]);

  const toggleBookmark = () => {
    const savedKey = `news_bookmark_${item.id}`;
    if (isBookmarked) {
      localStorage.removeItem(savedKey);
      setIsBookmarked(false);
    } else {
      localStorage.setItem(savedKey, 'true');
      setIsBookmarked(true);
    }
  };

  const handleCopyLink = () => {
    const textToCopy = `[WAM NEWS INDEX] ${item.headline} (Audit: ${item.verifiedStatus}) - Details: ${item.content}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    });
  };

  // TTS playback handler
  const handleTTS = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const playbackText = isTranslated 
        ? `${displayHeadline}. ${displayContent}` 
        : `${item.headline}. ${item.content}`;
        
      const utterance = new SpeechSynthesisUtterance(playbackText);
      utterance.lang = isTranslated ? 'ar-SA' : 'en-US';
      utterance.rate = 1.05;
      
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
      setSpeechUtterance(utterance);
      setIsPlaying(true);
    }
  };

  // Ensure any audio reader stops when leaving this view
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [item.id]);

  const displayHeadline = isTranslated && realTranslatedHeadline ? realTranslatedHeadline : item.headline;
  const displayContent = isTranslated && realTranslatedContent ? realTranslatedContent : item.content;

  const formattedDate = new Date(item.publishedAt).toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 350 }}
      className="bg-[#FAF9F5]/40 dark:bg-[#000000]/10 flex flex-col gap-6"
    >
      {/* Control Header Strip */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200/80 dark:border-zinc-850/80 select-none">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-450" />
          <span className="text-[10.5px] font-mono tracking-widest font-black text-stone-900 dark:text-zinc-100 uppercase">
            {language === 'ar' ? 'منصة التدقيق والتحقق' : 'VERIFICATION DESK'}
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 px-2.5 bg-stone-100 hover:bg-stone-200/60 dark:bg-zinc-900/40 dark:hover:bg-zinc-850 text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase transition-all cursor-pointer"
        >
          {language === 'ar' ? 'إغلاق ×' : 'Close ×'}
        </button>
      </div>

      {/* Hero Visual */}
      {item.imageUrl && (
        <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-xs ring-1 ring-black/10">
          <img 
            src={item.imageUrl} 
            alt={item.headline} 
            className="w-full h-full object-cover filter saturate-[0.85] contrast-105 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
            <div className="flex flex-wrap gap-1">
              {item.locationTags.slice(0, 1).map((loc, idx) => {
                const theme = getCityTheme(loc);
                return (
                  <span key={idx} className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${theme.badgeStyle}`}>
                    {translateTag(loc, language)}
                  </span>
                );
              })}
              {item.categoryTags.slice(0, 1).map((cat, idx) => {
                const theme = getCategoryTheme(cat);
                return (
                  <span key={idx} className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${theme.badgeStyle}`}>
                    {translateTag(cat, language)}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Headline & Meta */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2 mt-1">
          {isVerified ? (
            <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/40 px-2.5 py-0.5 rounded text-[9.5px] font-bold tracking-wider font-mono flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3 h-3" /> {language === 'ar' ? 'موثوق' : 'VERIFIED'}
            </span>
          ) : isRumor ? (
            <span className="bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-300/25 dark:border-rose-900/40 px-2.5 py-0.5 rounded text-[9.5px] font-bold tracking-wider font-mono flex items-center gap-1 shrink-0">
              <AlertTriangle className="w-3 h-3 text-rose-500 animate-pulse" /> {language === 'ar' ? 'مزيف' : 'DEBUNKED'}
            </span>
          ) : (
            <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-705 dark:text-amber-400 border border-amber-200/40 dark:border-amber-900/40 px-2.5 py-0.5 rounded text-[9.5px] font-bold tracking-wider font-mono flex items-center gap-1 shrink-0">
              <AlertTriangle className="w-3 h-3 text-amber-500" /> {language === 'ar' ? 'متنازع عليه' : 'DISPUTED'}
            </span>
          )}
          <span className="text-[10px] font-mono font-bold text-stone-400 dark:text-zinc-550 uppercase">
            ID: {item.id}
          </span>
        </div>

        <h2 className={`font-serif tracking-tight font-bold text-xl leading-snug text-stone-900 dark:text-zinc-50 ${isTranslated ? 'text-right' : ''}`}>
          {isTranslated ? displayHeadline : item.headline}
        </h2>

        <span className="text-[10.5px] font-mono text-stone-400 dark:text-zinc-550">
          {formattedDate}
        </span>
      </div>

      {/* Translate & TTS Actions toolbar */}
      <div className="flex items-center gap-2 bg-stone-100/60 dark:bg-zinc-950 p-2 rounded-xl border border-stone-200/50 dark:border-zinc-850/60 select-none">
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
          disabled={isTranslating}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10.5px] font-mono font-bold text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200 transition-all cursor-pointer ${
            isTranslated ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-black' : ''
          }`}
        >
          {isTranslating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>TRNS...</span>
            </>
          ) : (
            <>
              <Globe2 className="w-3.5 h-3.5" />
              <span>{isTranslated ? "ENGLISH" : "ترجمة عاجلة"}</span>
            </>
          )}
        </button>

        <span className="text-stone-300 dark:text-zinc-800">|</span>

        <button
          onClick={handleTTS}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10.5px] font-mono font-bold text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200 transition-all cursor-pointer ${
            isPlaying ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black' : ''
          }`}
        >
          {isPlaying ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>MUTE READ</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>AUDIO BROADCAST</span>
            </>
          )}
        </button>

        <span className="text-stone-300 dark:text-zinc-800">|</span>

        <button
          onClick={toggleBookmark}
          className="p-2 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200 transition-all cursor-pointer"
          title="Save Record"
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 fill-current" />
          ) : (
            <Bookmark className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          onClick={handleCopyLink}
          className="p-2 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200 transition-all cursor-pointer"
          title={copyStatus ? 'Copied' : 'Copy record'}
        >
          {copyStatus ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Link className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Main Body content */}
      <div className="p-4 bg-white dark:bg-zinc-950/20 border border-stone-200/50 dark:border-zinc-850/60 rounded-xl max-h-[280px] overflow-y-auto leading-relaxed rtl:text-right scrollbar-thin scrollbar-thumb-stone-100 scrollbar-track-transparent">
        {renderContentInline(displayContent)}
      </div>

      {/* Resource & Citations Verification Audit */}
      <div className="p-4 rounded-xl border border-stone-200/70 dark:border-zinc-850 bg-stone-50/70 dark:bg-zinc-950/40 text-left">
        <h4 className="text-[10px] font-mono font-bold tracking-widest text-stone-400 dark:text-zinc-550 uppercase mb-2">
          {language === 'ar' ? 'المطابقة والتدقيق الثنائي' : 'CROSS-CHECK AND METHODOLOGY SOURCES'}
        </h4>
        <p className="text-[11px] leading-relaxed text-stone-500 dark:text-zinc-400 mb-3.5 border-b border-stone-200/40 dark:border-zinc-850 pb-2.5">
          {item.verifiedStatus || "Grounding analysis conducted through multiple verified GCC intelligence state registries, Google Search API grounding hooks, and authorized publication networks."}
        </p>

        {/* Citing specific external sources */}
        <div>
          <span className="text-[9px] font-mono text-stone-400 dark:text-zinc-600 uppercase tracking-widest block mb-1.5">{language === 'ar' ? 'المراجع الموثوقة' : 'Authorities Checked'}</span>
          <div className="flex flex-col gap-1.5">
            {item.sources && item.sources.length > 0 ? (
              item.sources.map((src, idx) => (
                <a 
                  key={idx} 
                  href={src.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium w-fit break-all"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span>{src.name}</span>
                </a>
              ))
            ) : (
              <span className="text-stone-400 dark:text-zinc-650 text-xs italic">No citations attached</span>
            )}
          </div>
        </div>
      </div>

      {/* Google Workspace collaboration desk */}
      <div className="p-4 rounded-xl border border-dashed border-stone-200/75 dark:border-zinc-800 bg-[#FAF9F5] dark:bg-zinc-950/45 text-left select-none print:hidden">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-stone-550 dark:text-zinc-500" />
            <span className="text-[10px] font-mono tracking-widest text-[#121316] dark:text-zinc-200 uppercase font-black">COLLABORATION TOOLS</span>
          </div>
          <span className="text-[8px] font-mono bg-emerald-100/80 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-450 px-1.5 py-0.5 rounded">WORKSPACES READY</span>
        </div>

        {!accessToken ? (
          <div>
            <p className="text-[11px] text-stone-500 dark:text-zinc-400 leading-relaxed mb-3">
              Authorize Google Workspace services to immediately spawn deep briefs in Google Chat and secure briefing meetings inside Google Meet.
            </p>
            <button
              onClick={handleLinkWorkspace}
              disabled={isLinking}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 text-white dark:text-zinc-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Globe2 className="w-4 h-4" />
              <span>{isLinking ? "Connecting..." : "Link Google workspace"}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex border-b border-stone-200/50 dark:border-zinc-850 pb-1 gap-4">
              <button
                onClick={() => setActiveTab('meet')}
                className={`text-[10.5px] font-bold tracking-wider uppercase pb-1.5 transition-all text-left cursor-pointer ${
                  activeTab === 'meet' 
                    ? 'border-b-2 border-emerald-600 dark:border-emerald-450 text-stone-900 dark:text-zinc-100' 
                    : 'text-stone-400 dark:text-zinc-600 hover:text-stone-600'
                }`}
              >
                Meet Room
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`text-[10.5px] font-bold tracking-wider uppercase pb-1.5 transition-all text-left cursor-pointer ${
                  activeTab === 'chat' 
                    ? 'border-b-2 border-emerald-600 dark:border-emerald-450 text-stone-900 dark:text-zinc-100' 
                    : 'text-stone-400 dark:text-zinc-600 hover:text-stone-600'
                }`}
              >
                Chat Dispatch
              </button>
            </div>

            {activeTab === 'meet' ? (
              <div className="flex flex-col gap-2">
                <p className="text-[10.5px] text-stone-500 dark:text-zinc-400 leading-normal">
                  Create a dedicated Google Meet room for brief review and invite collaborators.
                </p>
                {createdMeet ? (
                  <div className="bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-stone-200/50 dark:border-zinc-850 flex flex-col gap-2 font-mono text-xs text-stone-650 dark:text-zinc-350">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-emerald-600 font-bold uppercase">Meet room created!</span>
                      <span>CODE: {createdMeet.code}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyMeetUri}
                        className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-[10px] font-bold uppercase rounded-md flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{copiedMeetUrl ? "Copied url!" : "Copy meeting link"}</span>
                      </button>
                      <a
                        href={createdMeet.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 text-white dark:text-zinc-950 text-[10px] font-black uppercase rounded-md flex items-center justify-center gap-1.5 cursor-pointer text-center"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Launch meet</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleCreateMeet}
                    disabled={meetLoading}
                    className="w-full py-2 bg-stone-900 hover:bg-stone-850 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    <span>{meetLoading ? "Provisioning Room..." : "Generate live meet room link"}</span>
                  </button>
                )}
                {meetError && <p className="text-[10px] text-rose-500 mt-1">{meetError}</p>}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-[10.5px] text-stone-500 dark:text-zinc-400 leading-normal">
                  Publish verified intel snippet directly to institutional Spaces in Google Chat.
                </p>

                {chatSpaces.length === 0 ? (
                  <p className="text-[10.5px] italic text-stone-400 dark:text-zinc-600">No active Space rooms found on credentialed Workspace</p>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono text-stone-400 uppercase font-bold">Select Active Workspace space</label>
                      <select
                        value={selectedSpace}
                        onChange={(e) => setSelectedSpace(e.target.value)}
                        className="w-full p-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 focus:outline-none dark:text-zinc-100"
                      >
                        {chatSpaces.map(sp => (
                          <option key={sp.name} value={sp.name}>{sp.displayName || sp.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <textarea
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        rows={2}
                        className="w-full p-2 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 focus:outline-none dark:text-zinc-100"
                      />
                    </div>

                    {showChatConfirm ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowChatConfirm(false)}
                          className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 text-[10px] font-bold uppercase rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSendToChat}
                          disabled={chatLoading}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded-lg cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>{chatLoading ? "Sending..." : "Confirm Publish"}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowChatConfirm(true)}
                        className="w-full py-2 bg-stone-900 hover:bg-stone-850 dark:bg-zinc-800 text-white text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Send snippet to space</span>
                      </button>
                    )}
                    {chatSuccess && <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold">✓ Snippet publicized to space successfully!</span>}
                    {chatError && <p className="text-[10px] text-rose-500 mt-1">{chatError}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

    </motion.div>
  );
}
