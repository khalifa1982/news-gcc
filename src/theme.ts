export interface TagTheme {
  textColor: string;       // Text color
  bgColor: string;         // Light/Translucent background
  borderColor: string;     // Border styling
  hoverColor: string;      // Active hover bg shift
  badgeStyle: string;      // Combined styled class list
  glowStyle: string;       // Ring glow highlight
  arabicLabel: string;     // Optional bilingual descriptor
}

// Map each news section/category to a unique, professional color palette
export const CATEGORY_THEMES: Record<string, TagTheme> = {
  '#investment': {
    textColor: 'text-amber-800 dark:text-amber-400',
    bgColor: 'bg-amber-50/85 dark:bg-amber-950/30',
    borderColor: 'border-amber-200/80 dark:border-amber-900/45',
    hoverColor: 'hover:bg-amber-100 hover:text-amber-900 dark:hover:bg-amber-900/30',
    badgeStyle: 'text-amber-800 dark:text-amber-400 bg-amber-50/85 dark:bg-amber-950/25 border border-amber-200/60 dark:border-amber-900/40',
    glowStyle: 'focus:ring-amber-400/40 shadow-amber-100 dark:shadow-none',
    arabicLabel: 'الاستثمار المباشر'
  },
  '#economic': {
    textColor: 'text-blue-800 dark:text-blue-400',
    bgColor: 'bg-blue-50/85 dark:bg-blue-950/30',
    borderColor: 'border-blue-200/80 dark:border-blue-900/45',
    hoverColor: 'hover:bg-blue-100 hover:text-blue-900 dark:hover:bg-blue-900/30',
    badgeStyle: 'text-blue-800 dark:text-blue-400 bg-blue-50/85 dark:bg-blue-950/25 border border-blue-200/60 dark:border-blue-900/40',
    glowStyle: 'focus:ring-blue-400/40 shadow-blue-100 dark:shadow-none',
    arabicLabel: 'السياسات الاقتصادية'
  },
  '#global': {
    textColor: 'text-purple-800 dark:text-purple-400',
    bgColor: 'bg-purple-50/85 dark:bg-purple-950/30',
    borderColor: 'border-purple-200/80 dark:border-purple-900/45',
    hoverColor: 'hover:bg-purple-100 hover:text-purple-900 dark:hover:bg-purple-900/30',
    badgeStyle: 'text-purple-800 dark:text-purple-400 bg-purple-50/85 dark:bg-purple-950/25 border border-purple-200/60 dark:border-purple-900/40',
    glowStyle: 'focus:ring-purple-400/40 shadow-purple-100 dark:shadow-none',
    arabicLabel: 'الشؤون العالمية'
  },
  '#commercial': {
    textColor: 'text-emerald-800 dark:text-emerald-400',
    bgColor: 'bg-emerald-50/85 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-900/45',
    hoverColor: 'hover:bg-emerald-100 hover:text-emerald-900 dark:hover:bg-emerald-900/30',
    badgeStyle: 'text-emerald-800 dark:text-emerald-400 bg-emerald-50/85 dark:bg-emerald-950/25 border border-emerald-200/60 dark:border-emerald-900/40',
    glowStyle: 'focus:ring-emerald-400/40 shadow-emerald-100 dark:shadow-none',
    arabicLabel: 'الحركة التجارية المباشرة'
  },
  '#local': {
    textColor: 'text-stone-700 dark:text-zinc-300',
    bgColor: 'bg-stone-50 dark:bg-zinc-900/45',
    borderColor: 'border-stone-200/80 dark:border-zinc-800/80',
    hoverColor: 'hover:bg-stone-200 hover:text-stone-900 dark:hover:bg-zinc-800',
    badgeStyle: 'text-stone-700 dark:text-zinc-300 bg-stone-50 dark:bg-zinc-900/45 border border-stone-200 dark:border-zinc-800',
    glowStyle: 'focus:ring-stone-400/40 shadow-stone-100 dark:shadow-none',
    arabicLabel: 'المجتمع المحلي'
  },
  '#educational': {
    textColor: 'text-teal-800 dark:text-teal-400',
    bgColor: 'bg-teal-50/85 dark:bg-teal-950/30',
    borderColor: 'border-teal-200/80 dark:border-teal-900/45',
    hoverColor: 'hover:bg-teal-100 hover:text-teal-900 dark:hover:bg-teal-900/30',
    badgeStyle: 'text-teal-800 dark:text-teal-400 bg-teal-50/85 dark:bg-teal-950/25 border border-teal-200/60 dark:border-teal-900/40',
    glowStyle: 'focus:ring-teal-400/40 shadow-teal-100 dark:shadow-none',
    arabicLabel: 'قطاع التعليم والبحوث'
  },
  '#international': {
    textColor: 'text-indigo-800 dark:text-indigo-400',
    bgColor: 'bg-indigo-50/85 dark:bg-indigo-950/30',
    borderColor: 'border-indigo-200/80 dark:border-indigo-900/45',
    hoverColor: 'hover:bg-indigo-100 hover:text-indigo-900 dark:hover:bg-indigo-900/30',
    badgeStyle: 'text-indigo-800 dark:text-indigo-400 bg-indigo-50/85 dark:bg-indigo-950/25 border border-indigo-200/60 dark:border-indigo-900/45',
    glowStyle: 'focus:ring-indigo-400/40 shadow-indigo-100 dark:shadow-none',
    arabicLabel: 'العلاقات الدولية'
  },
  '#realestate': {
    textColor: 'text-rose-800 dark:text-rose-400',
    bgColor: 'bg-rose-50/85 dark:bg-rose-950/30',
    borderColor: 'border-rose-200/80 dark:border-rose-900/45',
    hoverColor: 'hover:bg-rose-100 hover:text-rose-900 dark:hover:bg-rose-900/30',
    badgeStyle: 'text-rose-800 dark:text-rose-400 bg-rose-50/85 dark:bg-rose-950/25 border border-rose-200/60 dark:border-rose-900/40',
    glowStyle: 'focus:ring-rose-400/40 shadow-rose-100 dark:shadow-none',
    arabicLabel: 'القطاع العقاري'
  },
  '#high-tech': {
    textColor: 'text-sky-800 dark:text-sky-400',
    bgColor: 'bg-sky-50/85 dark:bg-sky-950/30',
    borderColor: 'border-sky-200/80 dark:border-sky-900/45',
    hoverColor: 'hover:bg-sky-100 hover:text-sky-900 dark:hover:bg-sky-900/30',
    badgeStyle: 'text-sky-805 dark:text-sky-400 bg-sky-50/85 dark:bg-sky-950/25 border border-sky-200/60 dark:border-sky-900/40',
    glowStyle: 'focus:ring-sky-400/40 shadow-sky-100 dark:shadow-none',
    arabicLabel: 'التقنية العالية'
  }
};

// Map each municipal focus city/region to a unique, highly contrasted highlight
export const CITY_THEMES: Record<string, TagTheme> = {
  '@abu dhabi': {
    textColor: 'text-red-800 dark:text-red-400',
    bgColor: 'bg-red-50/90 dark:bg-red-950/35',
    borderColor: 'border-red-200/80 dark:border-red-900/50',
    hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900/40',
    badgeStyle: 'text-red-800 dark:text-red-400 bg-red-50/90 dark:bg-red-950/25 border border-red-200/60 dark:border-red-900/40',
    glowStyle: 'focus:ring-red-400/40 shadow-red-100',
    arabicLabel: 'أبوظبي العاصمة'
  },
  '@uae': {
    textColor: 'text-orange-850 dark:text-orange-400',
    bgColor: 'bg-orange-50/95 dark:bg-orange-950/35',
    borderColor: 'border-orange-200/80 dark:border-orange-900/50',
    hoverColor: 'hover:bg-orange-100 dark:hover:bg-orange-900/45',
    badgeStyle: 'text-orange-800 dark:text-orange-400 bg-orange-50/95 dark:bg-orange-950/25 border border-orange-200/60 dark:border-orange-900/40',
    glowStyle: 'focus:ring-orange-400/40 shadow-orange-100',
    arabicLabel: 'دولة الإمارات'
  },
  '@dubai': {
    textColor: 'text-fuchsia-800 dark:text-fuchsia-400',
    bgColor: 'bg-fuchsia-50/90 dark:bg-fuchsia-950/30',
    borderColor: 'border-fuchsia-200/80 dark:border-fuchsia-900/45',
    hoverColor: 'hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/40',
    badgeStyle: 'text-fuchsia-800 dark:text-fuchsia-400 bg-fuchsia-50/90 dark:bg-fuchsia-950/25 border border-fuchsia-200/60 dark:border-fuchsia-905/40',
    glowStyle: 'focus:ring-fuchsia-400/40 shadow-fuchsia-100',
    arabicLabel: 'دبي المالية'
  },
  '@riyadh': {
    textColor: 'text-green-800 dark:text-green-400',
    bgColor: 'bg-green-50/90 dark:bg-green-950/30',
    borderColor: 'border-green-200/80 dark:border-green-900/45',
    hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900/40',
    badgeStyle: 'text-green-800 dark:text-green-400 bg-green-50/90 dark:bg-green-950/25 border border-green-200/60 dark:border-green-900/40',
    glowStyle: 'focus:ring-green-400/40 shadow-green-100',
    arabicLabel: 'الرياض الإستراتيجية'
  },
  '@saudi arabia': {
    textColor: 'text-emerald-800 dark:text-emerald-400',
    bgColor: 'bg-emerald-50/90 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200/80 dark:border-emerald-900/45',
    hoverColor: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/40',
    badgeStyle: 'text-emerald-805 dark:text-emerald-400 bg-emerald-50/90 dark:bg-emerald-950/25 border border-emerald-200/60 dark:border-emerald-900/40',
    glowStyle: 'focus:ring-emerald-400/40 shadow-emerald-100',
    arabicLabel: 'المملكة العربية السعودية'
  },
  '@sharjah': {
    textColor: 'text-cyan-800 dark:text-cyan-400',
    bgColor: 'bg-cyan-50/90 dark:bg-cyan-950/30',
    borderColor: 'border-cyan-200/80 dark:border-cyan-900/45',
    hoverColor: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/40',
    badgeStyle: 'text-cyan-800 dark:text-cyan-400 bg-cyan-50/90 dark:bg-cyan-950/25 border border-cyan-200/60 dark:border-cyan-900/40',
    glowStyle: 'focus:ring-cyan-400/40 shadow-cyan-100',
    arabicLabel: 'الشارقة الثقافية'
  },
  '@manama': {
    textColor: 'text-yellow-800 dark:text-yellow-500',
    bgColor: 'bg-yellow-50/90 dark:bg-yellow-950/30',
    borderColor: 'border-yellow-200/80 dark:border-yellow-900/40',
    hoverColor: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/40',
    badgeStyle: 'text-yellow-800 dark:text-yellow-500 bg-yellow-50/90 dark:bg-yellow-950/25 border border-yellow-200/60 dark:border-yellow-900/40',
    glowStyle: 'focus:ring-yellow-400/40 shadow-yellow-100',
    arabicLabel: 'المنامة البحرينية'
  },
  '@gcc': {
    textColor: 'text-pink-800 dark:text-pink-400',
    bgColor: 'bg-pink-50/90 dark:bg-pink-950/30',
    borderColor: 'border-pink-200/80 dark:border-pink-900/45',
    hoverColor: 'hover:bg-pink-100 dark:hover:bg-pink-900/40',
    badgeStyle: 'text-pink-800 dark:text-pink-400 bg-pink-50/90 dark:bg-pink-950/25 border border-pink-200/60 dark:border-pink-900/40',
    glowStyle: 'focus:ring-pink-400/40 shadow-pink-100',
    arabicLabel: 'مجلس التعاون الخليجي'
  },
  '@sohar': {
    textColor: 'text-sky-800 dark:text-sky-400',
    bgColor: 'bg-sky-50/90 dark:bg-sky-950/30',
    borderColor: 'border-sky-200/80 dark:border-sky-900/45',
    hoverColor: 'hover:bg-sky-100 dark:hover:bg-sky-900/40',
    badgeStyle: 'text-sky-800 dark:text-sky-400 bg-sky-50/90 dark:bg-sky-950/25 border border-sky-200/60 dark:border-sky-900/40',
    glowStyle: 'focus:ring-sky-400/40 shadow-sky-100',
    arabicLabel: 'ميناء صحار الصناعي'
  },
  '@oman': {
    textColor: 'text-amber-900 dark:text-amber-500',
    bgColor: 'bg-amber-100/40 dark:bg-amber-950/25',
    borderColor: 'border-amber-200 dark:border-amber-900/40',
    hoverColor: 'hover:bg-amber-200/50 dark:hover:bg-amber-900/35',
    badgeStyle: 'text-amber-900 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/25 border border-amber-200/60 dark:border-amber-900/40',
    glowStyle: 'focus:ring-amber-500/40 shadow-amber-100',
    arabicLabel: 'سلطنة عُمان'
  }
};

// Fallback Theme Definitions
export const FALLBACK_CATEGORY_THEME: TagTheme = {
  textColor: 'text-amber-700 dark:text-amber-400',
  bgColor: 'bg-amber-50 dark:bg-amber-950/30',
  borderColor: 'border-amber-200 dark:border-amber-900/40',
  hoverColor: 'hover:bg-amber-100 dark:hover:bg-amber-900/40',
  badgeStyle: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/40',
  glowStyle: 'focus:ring-amber-400/40',
  arabicLabel: 'إضافي'
};

export const FALLBACK_CITY_THEME: TagTheme = {
  textColor: 'text-emerald-700 dark:text-emerald-450',
  bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
  borderColor: 'border-emerald-200 dark:border-emerald-900/40',
  hoverColor: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/30',
  badgeStyle: 'text-emerald-700 dark:text-emerald-450 bg-emerald-55 dark:bg-emerald-900/20 border border-emerald-200/80 dark:border-emerald-900/40',
  glowStyle: 'focus:ring-emerald-400/40',
  arabicLabel: 'بلدية خليجية'
};

/**
 * Returns the theme styled spec for a given category hashtag eg "#Investment"
 */
export function getCategoryTheme(category: string): TagTheme {
  const norm = category.trim().toLowerCase();
  return CATEGORY_THEMES[norm] || CATEGORY_THEMES[`#${norm}`] || FALLBACK_CATEGORY_THEME;
}

/**
 * Returns the theme styled spec for a given city/location handle eg "@Dubai"
 */
export function getCityTheme(city: string): TagTheme {
  const norm = city.trim().toLowerCase();
  return CITY_THEMES[norm] || CITY_THEMES[`@${norm}`] || FALLBACK_CITY_THEME;
}
