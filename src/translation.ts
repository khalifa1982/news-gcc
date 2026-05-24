/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Global Language Translation dictionary for VerifyGCC
export type Language = 'en' | 'ar';

import { getCategoryTheme, getCityTheme } from './theme';

export function translateTag(tag: string, language: Language): string {
  if (language === 'en') return tag;
  const prefix = tag.startsWith('#') ? '#' : tag.startsWith('@') ? '@' : '';
  const clean = tag.substring(prefix ? 1 : 0).trim();
  if (prefix === '#') {
    const theme = getCategoryTheme(clean);
    return theme && theme.arabicLabel ? `${prefix}${theme.arabicLabel}` : tag;
  } else if (prefix === '@') {
    const theme = getCityTheme(clean);
    return theme && theme.arabicLabel ? `${prefix}${theme.arabicLabel}` : tag;
  }
  return tag;
}

export function translateCategory(cat: string, language: Language): string {
  if (language === 'en') return cat;
  const theme = getCategoryTheme(cat);
  return theme && theme.arabicLabel ? theme.arabicLabel : cat;
}

export function translateCity(city: string, language: Language): string {
  if (language === 'en') return city;
  const theme = getCityTheme(city);
  return theme && theme.arabicLabel ? theme.arabicLabel : city;
}

export const t = {
  en: {
    intelHub: "INTELLIGENCE HUB",
    regions: "REGIONS",
    publishDispatch: "Publish Audited Dispatch",
    globalFeed: "GLOBAL FEED",
    verificationFeed: "Verification Feed",
    geminiDeepSearch: "Gemini Deep Search",
    verifiedMediaRegistry: "Verified Media Registry",
    queryVerifiedArchives: "Query verified archives...",
    secureLogin: "Secure Login",
    disconnectAccount: "Disconnect Account / Sign Out",
    liveIntelReport: "LIVE INTEL REPORT",
    indexingCapital: "FIRESTORE: SECURE",
    est2026: "EST. 2026 UTC",
    recordsStreamed: "verified records streamed",
    activeFilters: "Active Filters",
    clearAll: "Clear All",
    magazineFlow: "Magazine Flow",
    journalMixed: "Journal Mixed",
    compactRegister: "Compact Register",
    searchPlaceholder: "Search registry by name, country, or keyword...",
    allChannels: "All Channels",
    visitOfficial: "Visit official website",
    noMatchingNews: "No matching news resources found.",
    allGccStates: "All GCC States",
    established: "Est.",
    exclusiveWire: "EXCLUSIVE SOVEREIGN WIRE",
    originalText: "Show original (EN)",
    translateUrgent: "ترجمة عاجلة (AR)",
    sourceDispatch: "Source: Verified Media",
    authorityVerification: "Authority Verification Audit",
    crossVerification: "Cross-Verification Records",
    linkWorkspace: "Link Google Workspace",
    createMeetSpace: "Establish Security Meet Space",
    sendToChatRoom: "Send alert to Google Chat",
    voiceSynthesis: "Voice Synthesis pitch Controls",
    fontSizeSelector: "Adjust display text size",
    closeReader: "Close Reader",
    printDispatch: "Print official dispatch sheet",
    copiedMeetUrl: "Copied Meet URL",
    shareAlert: "Copied shareable dispatch link to clipboard",
    headlinePlaceholder: "Enter primary intelligence headline...",
    contentPlaceholder: "Enter full journalistic details...",
    imagePlaceholder: "Attach certified image asset URL...",
    sourcePlaceholder: "WAM News Agency, Al Arabiya...",
    noMatchingTitle: "No matching news resources found.",
    noMatchingSub: "Try adjusting your query text or state filter tabs to match verified monitors.",
    closeModal: "Close",
    selectCategory: "Choose Vertical Category",
    selectLocation: "Choose Representative Location",
    submitDispatch: "Submit Audited News Dispatch",
    publishing: "Authorizing Audit and Publishing...",
    errorTitle: "Sovereign Audit Error",
    exclusiveSeal: "BILINGUAL VERIFICATION DIRECTORY",
    stateAgency: "State Agency",
    privateOutlet: "Private Outlet",
    stateWire: "State Wire",
    verifiedStatus: "Verified Status",
    liveStatusSignal: "LIVE MONITORED WIRE",
    establishedLabel: "Established",
    showMore: "Show More Reviews",
    loadingPortalText: "Broadcasting query request to Google Search Grounding & Gemini 3.5-Flash...",
    portalHeadline: "Gemini Real-Time Intelligence Grounding Portal",
    portalIntro: "Submit a customized news search query below. Gemini will synthesize a single real-time verified dispatch using live Google Search Grounding to locate and verify current regional announcements.",
    searchPlaceholderInput: "Query e.g., 'Aramco clean tech expansion' or 'Omani green hydrogen initiatives'...",
    searchBtn: "Synthesize Real-Time Dispatch",
    autoSyndicateLabel: "Auto-syndicate generated dispatch to active news feed upon receipt",
    activeCitations: "Active Citation Grounding Coordinates",
    groundingCitationsText: "Dynamic coordinates from official GCC publications parsed to maintain transparency:",
    verificationAuditResult: "Verification and Corroboration Audit Trail",
    noSearchYet: "Awaiting Query Broadcast Input",
    noSearchYetSub: "Enter a news search query above. Gemini will actively browse current regional outlets and compile a verified dispatch with real citation reference URLs.",
    verificationScoreLabel: "Authority Verification Metrics",
    confidenceInterval: "CONFIDENCE GAP"
  },
  ar: {
    intelHub: "مركز المعلومات والتحقق الإقليمي",
    regions: "المناطق والدوائر",
    publishDispatch: "نشر برقية مدققة",
    globalFeed: "الموجز العام الدولي",
    verificationFeed: "موجز التحقق الإخباري",
    geminiDeepSearch: "بحث جيميناي العميق",
    verifiedMediaRegistry: "سجل وسائل الإعلام المعتمدة",
    queryVerifiedArchives: "البحث في الأرشيف المعتمد...",
    secureLogin: "الدخول الآمن للإدارة",
    disconnectAccount: "تسجيل الخروج",
    liveIntelReport: "الموجز الإخباري المباشر",
    indexingCapital: "قاعدة البيانات: مؤمنة وسريعة",
    est2026: "تأسس عام ٢٠٢٦ م",
    recordsStreamed: "برقية إخبارية معتمدة معروضة",
    activeFilters: "الفلاتر النشطة",
    clearAll: "مسح الكل",
    magazineFlow: "طريقة عرض المجلة",
    journalMixed: "أعمدة الصحف",
    compactRegister: "مسجل مكثف للحالات",
    searchPlaceholder: "بحث في السجل بالاسم، الدولة أو الكلمات المفتاحية...",
    allChannels: "جميع القنوات الإعلامية",
    visitOfficial: "زيارة الموقع الإلكتروني الرسمي",
    noMatchingNews: "لم يتم العثور على مصادر إخبارية مطابقة.",
    allGccStates: "جميع دول مجلس التعاون",
    established: "تأسس عام",
    exclusiveWire: "برقية سيادية حصرية",
    originalText: "عرض النص الأصلي الإنجليزي",
    translateUrgent: "ترجمة عاجلة (AR)",
    sourceDispatch: "المصدر: وسائل الإعلام المعتمدة",
    authorityVerification: "تقرير مراجعة والتحقق من الهيئة",
    crossVerification: "سجلات التثبت والمطابقة المستقلة",
    linkWorkspace: "ربط منظومة جوجل ورك سبيس الدبلوماسية",
    createMeetSpace: "إنشاء غرفة اجتماع مرئية أمنية جيت",
    sendToChatRoom: "إرسال تنبيه البرقية إلى فضاء دردشة جوجل",
    voiceSynthesis: "التحكم في النبرة والصوت للمذيع الذكي",
    fontSizeSelector: "تعديل حجم خط العرض للمحتوى",
    closeReader: "إغلاق نافذة القراءة والتعليق",
    printDispatch: "طباعة ورقة البرقية الرسمية المعتمدة",
    copiedMeetUrl: "تم نسخ رابط الاجتماع ببرنامج ميت",
    shareAlert: "تم نسخ لينك البرقية القابل للمشاركة للحافظة",
    headlinePlaceholder: "أدخل عنوان البرقية الرئيسي هنا...",
    contentPlaceholder: "أدخل التفاصيل الصحفية الكاملة مع تضمين وسوم المدن والجهات...",
    imagePlaceholder: "أرفق عنوان صورة معتمد للبرقية...",
    sourcePlaceholder: "وكالة أنباء وام، قناة العربية، وكالة الأنباء السعودية...",
    noMatchingTitle: "لم يتم العثور على برقيات أو سجلات مطابقة.",
    noMatchingSub: "يرجى تعديل مصطلح البحث الخاص بك أو تبديل فلاتر المناطق للوصول إلى السجلات.",
    closeModal: "إغلاق النافذة",
    selectCategory: "اختر تصنيف البرقية الإخبارية",
    selectLocation: "اختر المدينة / الجهة السيادية الممثلة",
    submitDispatch: "إرسال ونشر البرقية المعتمدة",
    publishing: "جاري التدقيق والنشر في القاعدة السيادية...",
    errorTitle: "خطأ في تدقيق المعايير السيادية",
    exclusiveSeal: "دليل التحقق من هويات وسائل الإعلام الخليجية",
    stateAgency: "وكالة أنباء رسمية",
    privateOutlet: "مؤسسة صحفية خاصة",
    stateWire: "خط بث رسمي",
    verifiedStatus: "حالة التحقق والاعتماد",
    liveStatusSignal: "بث برقي مدقق بشكل مباشر",
    establishedLabel: "سنة التأسيس",
    showMore: "عرض المزيد من سجلات المراجعة",
    loadingPortalText: "إرسال البث والاستفسار الذكي إلى جيميناي ٣.٥ فلاش للتصفح والتحليل الفوري...",
    portalHeadline: "بوابة جيميناي للتحقق والبحث الفوري المسند",
    portalIntro: "اكتب استفسارك الإخباري المفصل أدناه. ستبحث خوارزميات جيميناي المدعمة بمحرك جوجل للبحث وتوفر تجميعاً دقيقاً ومصداقاً لبرقية إخبارية مع روابط المصادر الرسمية.",
    searchPlaceholderInput: "مثال للبحث: 'توسعات أرامكو في الطاقة البديلة' أو 'استثمارات الهيدروجين الأخضر بسلطنة عمان'...",
    searchBtn: "توليد البرقية السيادية بالذكاء الاصطناعي",
    autoSyndicateLabel: "إدراج وتزامن البرقية المولدة فوراً داخل الموجز الإخباري المعتمد",
    activeCitations: "روابط التوثيق والإشادات بمواقع المصدر المفتوح",
    groundingCitationsText: "الروابط المرجعية التي تصفحها الذكاء الاصطناعي وبنى عليها برقيته الرسمية للشفافية المطلقة:",
    verificationAuditResult: "مسار التدقيق والتحقق والمطابقة",
    noSearchYet: "في انتظار إرسال استعلامك للموجز",
    noSearchYetSub: "أدخل استعلامك في مربع البحث بالأعلى لتصفح الصحف والقنوات الرسمية وتوليد البرقيات الموثقة فورا.",
    verificationScoreLabel: "معيار الموثوقية وصلاحية النشر والتدقيق الدبلوماسي",
    confidenceInterval: "فجوة الثقة المعتمدة"
  }
};
