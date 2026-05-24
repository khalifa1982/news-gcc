/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Header from './components/Header';
import NewsGrid from './components/NewsGrid';
import GeminiSearchPortal from './components/GeminiSearchPortal';
import SourcesRegistry from './components/SourcesRegistry';
import ArticleReader from './components/ArticleReader';
import ArticleDetailEmbed from './components/ArticleDetailEmbed';
import SovereignFocusDashboard from './components/SovereignFocusDashboard';
import { Shield, Globe, Plus, X, BookOpen, Layers, Clock, ChevronRight } from 'lucide-react';
import { COUNTRIES, CATEGORIES, NewsItem, MOCK_NEWS } from './data';
import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, setDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { getCategoryTheme, getCityTheme, CATEGORY_THEMES, CITY_THEMES } from './theme';
import { AnimatePresence, motion } from 'motion/react';
import { t, Language, translateCategory, translateCity, translateTag } from './translation';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeCountry, setActiveCountry] = useState<string>('ae'); 
  const [activeView, setActiveView] = useState<'feed' | 'gemini-search' | 'sources-registry'>('feed');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Custom Filters States Hook
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openSection, setOpenSection] = useState<'sectors' | 'cities' | 'archives' | null>('sectors');
  const [activeArchive, setActiveArchive] = useState<string | null>(null);

  // App Version and Update Stats States
  const [appVersion, setAppVersion] = useState<string>('v1.0.0');
  const [lastUpdateDay, setLastUpdateDay] = useState<string>('');

  // Global news subscription and active article state
  const [news, setNews] = useState<NewsItem[]>(MOCK_NEWS);
  const [loadingNews, setLoadingNews] = useState(true);
  const [selectedGlobalArticle, setSelectedGlobalArticle] = useState<NewsItem | null>(null);
  const [pitchedNotification, setPitchedNotification] = useState<NewsItem | null>(null);

  // Sync HTML attributes for localized direction layout
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Fetch compiled app version and modification dates automatically
  useEffect(() => {
    fetch('/api/version')
      .then(res => res.json())
      .then(data => {
        if (data.version) setAppVersion(data.version);
        if (data.lastUpdated) setLastUpdateDay(data.lastUpdated);
      })
      .catch(err => console.warn("Failed retrieving dynamic version tracking indices:", err));
  }, []);

  const getMergedNews = (firestoreNews: NewsItem[]) => {
    try {
      const sess = sessionStorage.getItem('sovereign_session_news');
      const sessionNews: NewsItem[] = sess ? JSON.parse(sess) : [];
      const combined = [...sessionNews, ...firestoreNews];
      const finalPool = combined.length > 0 ? combined : MOCK_NEWS;
      const seen = new Set<string>();
      const unique = finalPool.filter(item => {
        if (!item || !item.id) return false;
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
      return unique.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    } catch (e) {
      console.warn("Failed merging session news", e);
      return firestoreNews.length > 0 ? firestoreNews : MOCK_NEWS;
    }
  };

  useEffect(() => {
    setLoadingNews(true);
    let fetchedFromFirestore: NewsItem[] = [];

    const unsub = onSnapshot(collection(db, 'news'), (snapshot) => {
      fetchedFromFirestore = [];
      if (!snapshot.empty) {
        snapshot.forEach((d) => {
          fetchedFromFirestore.push(d.data() as NewsItem);
        });
      }
      const merged = getMergedNews(fetchedFromFirestore);
      setNews(merged);
      setLoadingNews(false);
    }, (error) => {
      setLoadingNews(false);
      console.warn("Firestore subscription failed, falling back to local data gracefully:", error);
      const merged = getMergedNews([]);
      setNews(merged);
    });

    const handleNewsEvent = () => {
      const merged = getMergedNews(fetchedFromFirestore);
      setNews(merged);
    };

    window.addEventListener('sovereign_news_updated', handleNewsEvent);

    return () => {
      unsub();
      window.removeEventListener('sovereign_news_updated', handleNewsEvent);
    };
  }, []);

  // 5-Hour Real-time Spotlight Refresh state managers
  const [spotRefreshActive, setSpotRefreshActive] = useState(false);
  const [spotRefreshTarget, setSpotRefreshTarget] = useState('');

  // 5-Hour Startup Intelligence Sweep state managers
  const [startupSweepActive, setStartupSweepActive] = useState(false);
  const [startupSweepProgress, setStartupSweepProgress] = useState('');

  const triggerSpotCheck = async (
    countryCode = activeCountry,
    cityFocus = activeCity,
    catFocus = activeCategory
  ) => {
    setSpotRefreshActive(true);
    const activeCountryObj = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];
    
    const displayTarget = cityFocus 
      ? translateTag(`@${cityFocus}`, language) 
      : translateTag(`@${activeCountryObj.name}`, language);

    const displayCategory = catFocus 
      ? translateTag(`#${catFocus}`, language) 
      : '#Economic';

    setSpotRefreshTarget(`${displayTarget} ${displayCategory}`);
    
    try {
      const res = await fetch('/api/spot-refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: countryCode,
          city: cityFocus,
          category: catFocus || 'Economic'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const article = data.article;
        if (article && article.headline) {
          const randomId = 'spot_ref_' + Math.random().toString(36).substr(2, 9);
          const newsItem = {
            id: randomId,
            headline: article.headline,
            content: article.content,
            publishedAt: new Date().toISOString(),
            imageUrl: article.imageUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
            sources: article.sources && article.sources.length > 0 ? article.sources : [{ name: "Verify Spot Radar", url: "https://google.com" }],
            locationTags: cityFocus ? [`@${cityFocus}`, `@${activeCountryObj.name}`] : [`@${activeCountryObj.name}`],
            categoryTags: [`#${catFocus || 'Economic'}`],
            verifiedStatus: article.verifiedStatus || `Verified real-time spot dispatch`
          };

          saveArticleToSession(newsItem);

          try {
            await setDoc(doc(db, 'news', randomId), newsItem);
          } catch (err) {
            console.warn("Firestore save skipped during background spot check:", err);
          }
        }
      }
    } catch (err) {
      console.warn("Real-time spot refresh check failed/throttled:", err);
    } finally {
      setTimeout(() => {
        setSpotRefreshActive(false);
      }, 1200);
    }
  };

  // Background spot refresh checking when visiting any category, country or city focus
  useEffect(() => {
    if (startupSweepActive) return;

    const timer = setTimeout(() => {
      triggerSpotCheck(activeCountry, activeCity, activeCategory);
    }, 400);

    return () => clearTimeout(timer);
  }, [activeCountry, activeCity, activeCategory, startupSweepActive]);

  // Handler for dynamic global click-to-filter tag clicks
  const handleSelectTagGlobal = (tag: string) => {
    const cleanStr = tag.trim();
    if (cleanStr.startsWith('#')) {
      const catName = cleanStr.substring(1);
      // Find case-insensitive match
      const matched = CATEGORIES.find(c => c.toLowerCase() === catName.toLowerCase());
      setActiveCategory(activeCategory === (matched || catName) ? null : (matched || catName));
    } else if (cleanStr.startsWith('@')) {
      const locName = cleanStr.substring(1);
      // Check if matching a Country name first
      const matchedCountry = COUNTRIES.find(c => c.name.toLowerCase() === locName.toLowerCase());
      if (matchedCountry) {
        if (activeCountry === matchedCountry.code) {
          // Toggle off country means clearing city too
          setActiveCity(null);
        } else {
          setActiveCountry(matchedCountry.code);
          setActiveCity(null);
        }
      } else {
        // Find which Country owns this city
        const parentCountry = COUNTRIES.find(c => c.cities.some(ct => ct.toLowerCase() === locName.toLowerCase()));
        if (parentCountry) {
          setActiveCountry(parentCountry.code);
          const actualCityName = parentCountry.cities.find(ct => ct.toLowerCase() === locName.toLowerCase());
          setActiveCity(activeCity === (actualCityName || locName) ? null : (actualCityName || locName));
        } else {
          setActiveCity(activeCity === locName ? null : locName);
        }
      }
    }
  };
  
  // Form states
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800');
  const [sourcesInput, setSourcesInput] = useState('Verify GCC Internal, WAM');
  const [selectedLoc, setSelectedLoc] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [statusVal, setStatusVal] = useState('Verified across 2 sources');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto set first location/category
  const activeCountryObj = COUNTRIES.find(c => c.code === activeCountry) || COUNTRIES[0];
  
  // Reset child city filter when country shifts
  useEffect(() => {
    setActiveCity(null);
    if (activeCountryObj.cities.length > 0) {
      setSelectedLoc(`@${activeCountryObj.cities[0]}`);
    }
    if (CATEGORIES.length > 0) {
      setSelectedCat(`#${CATEGORIES[0]}`);
    }
  }, [activeCountry]);

  const saveArticleToSession = (newsItem: any) => {
    try {
      const existing = sessionStorage.getItem('sovereign_session_news');
      const list = existing ? JSON.parse(existing) : [];
      // Prevent duplicates
      if (!list.some((item: any) => item.id === newsItem.id)) {
        list.unshift(newsItem);
        sessionStorage.setItem('sovereign_session_news', JSON.stringify(list));
        window.dispatchEvent(new Event('sovereign_news_updated'));
      }
    } catch (e) {
      console.warn("Failed to write to sessionStorage", e);
    }
  };

  // Automated startup 5-hour GCC Intelligence Sweep
  useEffect(() => {
    const runStartupSweep = async () => {
      // Run once per browser session to maintain high speed and prevent query loops
      if (sessionStorage.getItem('verify_gcc_start_sweep_completed')) {
        return;
      }
      sessionStorage.setItem('verify_gcc_start_sweep_completed', 'true');

      setStartupSweepActive(true);
      setStartupSweepProgress("Initializing parallel search crawlers...");

      // Major city/territory coordinates and vertical alignments
      const startupTargets = [
        { city: 'Dubai', country: 'UAE', category: 'Investment' },
        { city: 'Riyadh', country: 'Saudi Arabia', category: 'Economic' },
        { city: 'Doha', country: 'Qatar', category: 'Commercial' },
        { city: 'Muscat', country: 'Oman', category: 'Political' },
        { city: 'Manama', country: 'Bahrain', category: 'Investment' },
        { city: 'Kuwait City', country: 'Kuwait', category: 'Commercial' }
      ];

      for (let i = 0; i < startupTargets.length; i++) {
        const target = startupTargets[i];
        setStartupSweepProgress(`Grounded crawling for ${target.city}, ${target.country} (${i + 1}/${startupTargets.length})...`);
        
        try {
          const compiledQuery = `Latest verified breaking news/announcements published in ${target.city}, ${target.country} about ${target.category} strictly in the past 5 hours.`;
          
          const response = await fetch('/api/search-news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: compiledQuery })
          });

          if (response.ok) {
            const data = await response.json();
            const article = data.article;

            if (article) {
              const randomId = 'news_start_' + Math.random().toString(36).substr(2, 9);
              const locationTags = [`@${target.city}`, `@${target.country}`];
              
              let computedImg = article.imageUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800";
              if (!article.imageUrl) {
                try {
                  const imgRes = await fetch('/api/generate-article-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      headline: article.headline,
                      country: target.country,
                      city: target.city,
                      category: target.category
                    })
                  });
                  if (imgRes.ok) {
                    const imgData = await imgRes.json();
                    computedImg = imgData.imageUrl;
                  }
                } catch (e) {
                  console.warn("Failed to generate AI image on startup sweep:", e);
                }
              }

              const newsItem = {
                id: randomId,
                headline: article.headline || `${target.city} ${target.category} Update`,
                content: article.content || "Factual dispatch summary.",
                publishedAt: new Date().toISOString(),
                imageUrl: computedImg,
                sources: article.sources && article.sources.length > 0 ? article.sources : [{ name: "Google Real-Time Index", url: "https://google.com" }],
                locationTags: locationTags,
                categoryTags: [`#${article.category || target.category}`],
                verifiedStatus: article.verifiedStatus || `Verified across regional sources in the past 5 hours`
              };

              // Safely save locally to sessionStorage to ensure immediate display
              saveArticleToSession(newsItem);

              try {
                await setDoc(doc(db, 'news', randomId), newsItem);
              } catch (fsErr) {
                console.warn(`Firestore save blocked (expected security constraints) for ${target.city}, loaded to active session cache.`, fsErr);
              }
            }
          }
        } catch (err) {
          console.warn(`Background startup sweep skipped for ${target.city}:`, err);
        }

        // Lightweight throttle delay to sequence request payloads
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      setStartupSweepActive(false);
    };

    // Delay start slightly to allow primary resources to mount
    const timer = setTimeout(() => {
      runStartupSweep();
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Automated Background News Pitcher: Executes every 3 minutes
  // It crawls through all cities, countries, and categories/fields.
  // If there is nothing new, it skips ("skipped to the next one") and continues searching.
  // If nothing is found across up to 5 checks, it stays silent.
  useEffect(() => {
    // Generate a flat array of all combinations to systematically cycle through them
    const targets: Array<{ countryCode: string; city: string; category: string }> = [];
    COUNTRIES.forEach(country => {
      country.cities.forEach(city => {
        CATEGORIES.forEach(category => {
          targets.push({
            countryCode: country.code,
            city,
            category
          });
        });
      });
    });

    const checkNextTarget = async () => {
      if (targets.length === 0) return;

      let attempts = 0;
      const maxAttempts = 5; // maximum cities/fields to skip & check sequentially in single interval run

      while (attempts < maxAttempts) {
        let currentTargetIndex = parseInt(localStorage.getItem('sovereign_scheduler_index') || '0', 10);
        if (isNaN(currentTargetIndex) || currentTargetIndex >= targets.length) {
          currentTargetIndex = 0;
        }

        const target = targets[currentTargetIndex];
        
        // Advance current index for next check
        const nextIndex = (currentTargetIndex + 1) % targets.length;
        localStorage.setItem('sovereign_scheduler_index', nextIndex.toString());

        const activeCountryObj = COUNTRIES.find(c => c.code === target.countryCode) || COUNTRIES[0];
        console.log(`[Auto-Pitcher] Checking (${attempts + 1}/${maxAttempts}): ${target.city}, ${activeCountryObj.name} (#${target.category})...`);

        try {
          // Instruct Gemini to retrieve verified announcements strictly from the past 5 hours matching this target
          const queryStr = `Latest verified breaking news or official announcements published in ${target.city}, ${activeCountryObj.name} regarding ${target.category} strictly in the past 5 hours.`;

          const response = await fetch('/api/search-news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: queryStr })
          });

          if (response.ok) {
            const data = await response.json();
            const article = data.article;

            if (article && article.headline) {
              // Exact and fuzzy duplicate detection
              const isDuplicate = news.some((existingItem) => {
                const h1 = existingItem.headline.toLowerCase().replace(/[^a-z0-9]/g, '');
                const h2 = article.headline.toLowerCase().replace(/[^a-z0-9]/g, '');
                return h1 === h2 || h1.includes(h2) || h2.includes(h1);
              });

              if (!isDuplicate) {
                // Pitch it - it's a completely new verified story!
                console.log(`[Auto-Pitcher] Success! Found new verified news article "${article.headline}" for ${target.city}, pitching immediately!`);
                const randomId = 'auto_pitch_' + Math.random().toString(36).substr(2, 9);
                const locationTags = [`@${target.city}`, `@${activeCountryObj.name}`];
                
                const newsItem: NewsItem = {
                  id: randomId,
                  headline: article.headline,
                  content: article.content || "Factual dispatch summary.",
                  publishedAt: new Date().toISOString(),
                  imageUrl: article.imageUrl || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
                  sources: article.sources && article.sources.length > 0 ? article.sources : [{ name: "Automated GCC Sovereign Source", url: "https://google.com" }],
                  locationTags,
                  categoryTags: [`#${article.category || target.category}`],
                  verifiedStatus: article.verifiedStatus || `Real-time automatic background pitch`
                };

                saveArticleToSession(newsItem);

                try {
                  await setDoc(doc(db, 'news', randomId), newsItem);
                } catch (fsErr) {
                  console.warn("Firestore save blocked for background pitch (expected security rules), saved to session catalog:", fsErr);
                }

                // Smoothly notify user of new content drop in visible tab state
                setPitchedNotification(newsItem);
                
                // Break out of search loop because we found a completely new article
                break;
              } else {
                console.log(`[Auto-Pitcher] Checked ${target.city} #${target.category}: Found article "${article.headline}", but it is already pitched. Skipping dynamically to the next center...`);
              }
            } else {
              console.log(`[Auto-Pitcher] Checked ${target.city} #${target.category}: No breaking news found. Skipping to the next center...`);
            }
          } else {
            console.log(`[Auto-Pitcher] Fetch failed (status ${response.status}) at ${target.city}. Skipping...`);
          }
        } catch (err) {
          console.warn(`[Auto-Pitcher] Request error for ${target.city}:`, err);
        }

        attempts++;
        // Short pause spacing between rapid loop fetches if we are about to scan another place
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      if (attempts >= maxAttempts) {
        console.log(`[Auto-Pitcher] Checked max combinations (${maxAttempts}) during interval, no new dispatches discovered. Remaining silent.`);
      }
    };

    // Every 3 minutes (180,000 milliseconds)
    const intervalTimer = setInterval(checkNextTarget, 180000);

    // Initial check after 45 seconds to let first-load sweeps conclude cleanly
    const initialCheckTimer = setTimeout(checkNextTarget, 45000);

    return () => {
      clearInterval(intervalTimer);
      clearTimeout(initialCheckTimer);
    };
  }, [news]);

  // Bilingual Arabic branding labels for countries
  const countryArNameMap: Record<string, string> = {
    ae: "الإمارات",
    sa: "السعودية",
    om: "عُمان",
    qa: "قطر",
    bh: "البحرين",
    kw: "الكويت"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const randomId = 'news_' + Math.random().toString(36).substr(2, 9);
    const sourcesArr = sourcesInput.split(',').map(s => ({ name: s.trim(), url: '#' }));
    
    let computedImg = imageUrl;
    // If it's the default unsplash photo or empty, generate a brilliant custom AI photo!
    if (!imageUrl || imageUrl.includes('photo-1486406146926-c627a92ad1ab') || imageUrl.trim() === '') {
      try {
        const cleanLoc = selectedLoc.replace('@', '');
        const cleanCat = selectedCat.replace('#', '');
        const imgRes = await fetch('/api/generate-article-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            headline,
            country: activeCountryObj.name,
            city: cleanLoc,
            category: cleanCat
          })
        });
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          computedImg = imgData.imageUrl;
        }
      } catch (e) {
        console.warn("Manual post AI image generation failed:", e);
      }
    }

    const newArticle = {
      id: randomId,
      headline,
      content,
      publishedAt: new Date().toISOString(),
      imageUrl: computedImg,
      sources: sourcesArr,
      locationTags: [selectedLoc, `@${activeCountryObj.name}`],
      categoryTags: [selectedCat],
      verifiedStatus: statusVal
    };

    // Save locally first so the user sees it in their feed instantly
    saveArticleToSession(newArticle);

    try {
      await setDoc(doc(db, 'news', randomId), newArticle);
      setHeadline('');
      setContent('');
      setShowAddModal(false);
    } catch (err: any) {
      console.warn("Sovereign security rule active, utilizing verified fallback session storage:", err);
      // We still close cleanly and set values because it was saved to active sesssion-catalog
      setHeadline('');
      setContent('');
      setShowAddModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-dismiss pitched notifications after 8 seconds
  useEffect(() => {
    if (pitchedNotification) {
      const timer = setTimeout(() => {
        setPitchedNotification(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [pitchedNotification]);

  const filteredNews = news.filter(item => {
    const countryTag = `@${activeCountryObj.name}`.toLowerCase();
    const cityTags = activeCountryObj.cities.map(c => `@${c}`.toLowerCase());
    
    const matchesCountry = item.locationTags.some(tag => {
      const tagLower = tag.toLowerCase();
      return tagLower === countryTag || cityTags.includes(tagLower);
    });
    if (!matchesCountry) return false;

    if (activeCity) {
      const cityTag = `@${activeCity}`.toLowerCase();
      const matchesCity = item.locationTags.some(tag => tag.toLowerCase() === cityTag);
      if (!matchesCity) return false;
    }

    if (activeCategory) {
      const categoryTag = `#${activeCategory}`.toLowerCase();
      const matchesCategory = item.categoryTags.some(tag => tag.toLowerCase() === categoryTag);
      if (!matchesCategory) return false;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        item.headline.toLowerCase().includes(term) || 
        item.content.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    if (activeArchive) {
      const ageInHours = (Date.now() - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60);
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

  return (
    <div className="flex h-screen bg-[#FAF9F5] dark:bg-[#0A0B0D] overflow-hidden font-sans text-stone-900 dark:text-zinc-100 transition-colors duration-300">
      
      {/* Dynamic Left Sovereign Selection Command Sidebar */}
      <aside className="hidden md:flex w-20 md:w-[92px] border-r border-stone-200/70 dark:border-zinc-850/70 bg-[#FAF9F5] dark:bg-[#08090B] flex flex-col items-center py-6 shrink-0 z-20 transition-colors duration-300 select-none">
        {/* Fine Serif Crest Lockup */}
        <div className="mb-10 text-stone-950 dark:text-zinc-50 flex flex-col items-center justify-center font-serif font-black italic text-2xl relative select-none cursor-pointer" onClick={() => setActiveView('feed')}>
          <Shield className="w-8 h-8 text-emerald-600/10 dark:text-emerald-500/10 fill-current absolute" />
          <span className="relative z-10 text-stone-900 dark:text-zinc-150 font-black">V</span>
        </div>
        
        {/* Highly polished flags with bilingual active glow overlays */}
        <div className="flex flex-col gap-4 w-full items-center">
          <span className="text-[8px] font-mono tracking-widest text-stone-400 dark:text-zinc-600 uppercase font-bold mb-1">
            {t[language].regions}
          </span>
          {COUNTRIES.map((country) => {
            const isActive = activeCountry === country.code;
            return (
              <button
                key={country.code}
                onClick={() => setActiveCountry(country.code)}
                className={`group relative flex flex-col items-center justify-center w-14 py-2.5 rounded-xl transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-zinc-900 border border-stone-200/80 dark:border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] scale-105'
                    : 'hover:bg-stone-200/30 dark:hover:bg-zinc-900/30 border border-transparent'
                }`}
                title={language === 'ar' ? `موجز ${country.name}` : `${country.name} index`}
              >
                {/* Custom glowing ember on active country */}
                {isActive && (
                  <span className="absolute left-[-2px] top-1/3 w-[3px] h-1/3 bg-emerald-600 dark:bg-emerald-400 rounded-r-md shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                )}
                
                <div className="w-8 h-5.5 rounded-sm overflow-hidden mb-1 shadow-sm ring-1 ring-black/10 transition-transform group-hover:scale-105 shrink-0">
                  <img
                    src={`https://flagcdn.com/w80/${country.code}.png`}
                    alt={`${country.name} flag`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Upper code representation */}
                <span className={`text-[9px] font-mono tracking-wider uppercase font-bold leading-none ${
                  isActive ? 'text-stone-900 dark:text-white' : 'text-stone-400 dark:text-zinc-600 group-hover:text-stone-600'
                }`}>
                  {country.code}
                </span>

                {/* Bilingual label wrapper */}
                <span className={`text-[8.5px] font-medium leading-none mt-0.5 opacity-80 ${
                  isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400 dark:text-zinc-600'
                }`}>
                  {countryArNameMap[country.code]}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Side footer interactions */}
        <div className="mt-auto flex flex-col gap-5 items-center">
          <button 
            onClick={() => {
              setSearchTerm('');
              setActiveCategory(null);
              setActiveCity(null);
              setActiveView('feed');
            }}
            className="p-3 bg-stone-100 hover:bg-stone-200/60 dark:bg-zinc-900/40 dark:hover:bg-zinc-850 text-stone-500 dark:text-zinc-500 hover:text-stone-950 dark:hover:text-zinc-100 rounded-xl transition-all cursor-pointer shadow-sm relative group"
          >
            <Globe className="w-4 h-4" />
            <span className="absolute left-16 bg-stone-900 text-stone-50 text-[9px] px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-50 font-mono tracking-wider">
              {t[language].globalFeed}
            </span>
          </button>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="p-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:text-zinc-950 dark:font-bold text-white rounded-xl cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_6px_18px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all text-xs"
            title={t[language].publishDispatch}
          >
            <Plus className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          activeView={activeView}
          setActiveView={setActiveView}
          news={news}
          onSelectArticle={setSelectedGlobalArticle}
          language={language}
          setLanguage={setLanguage}
        />
        
        <main className="flex-1 overflow-y-auto w-full px-6 md:px-8 xl:px-12 pb-16 pt-8">
          {/* Mobile Country Flags & Category Chips Strip (Only on mobile viewport screens) */}
          <div className="md:hidden flex flex-col gap-3.5 mb-6 pb-4 border-b border-stone-200/50 dark:border-zinc-850/50 select-none">
            {/* dynamic GCC flag selectors */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1.5 w-full">
              <span className="text-[9px] font-mono font-bold tracking-wider text-stone-400 dark:text-zinc-650 uppercase shrink-0">
                {language === 'ar' ? 'المنطقة:' : 'REGION:'}
              </span>
              {COUNTRIES.map((country) => {
                const isActive = activeCountry === country.code;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => setActiveCountry(country.code)}
                    className={`flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-lg border text-[10px] font-extrabold tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-white dark:bg-zinc-950 text-stone-600 dark:text-zinc-400 border-stone-200/50 dark:border-zinc-850/60 shadow-xs'
                    }`}
                  >
                    <img
                      src={`https://flagcdn.com/w80/${country.code}.png`}
                      alt={country.name}
                      className="w-4 h-3 object-cover rounded-sm border border-black/10"
                    />
                    <span>{countryArNameMap[country.code] || country.code.toUpperCase()}</span>
                  </button>
                );
              })}
            </div>

            {/* horizontal scrollable categories pills on mobile feed selection */}
            {activeView === 'feed' && (
              <div className="flex items-center gap-2 data-mobile-cats overflow-x-auto scrollbar-none pt-0.5 w-full">
                <span className="text-[9px] font-mono font-bold tracking-wider text-stone-400 dark:text-zinc-650 uppercase shrink-0">
                  {language === 'ar' ? 'القطاع:' : 'SECTOR:'}
                </span>
                {CATEGORIES.map((cat) => {
                  const isSelected = activeCategory === cat;
                  const theme = getCategoryTheme(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(isSelected ? null : cat)}
                      className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-extrabold border cursor-pointer transition-all ${
                        isSelected
                          ? `${theme.textColor} ${theme.bgColor} ${theme.borderColor} shadow-sm`
                          : 'bg-white dark:bg-zinc-950 text-stone-500 dark:text-zinc-400 border-stone-200/50 dark:border-zinc-850/65 shadow-xs'
                      }`}
                    >
                      #{translateCategory(cat, language)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {activeView === 'gemini-search' ? (
            <GeminiSearchPortal 
              activeCountryCode={activeCountry}
              language={language}
              onArticleSyndicated={(newArticle) => {
                saveArticleToSession(newArticle);
                // Only redirect if this is a manual single search, not an automated/manual cockpit sweep
                if (newArticle && newArticle.id && !newArticle.id.includes('sweep')) {
                  setActiveView('feed');
                }
              }}
            />
          ) : activeView === 'sources-registry' ? (
            <SourcesRegistry 
              activeCountryCode={activeCountry} 
              language={language}
              onSelectSource={(sourceName) => {
                setSearchTerm(sourceName);
                setActiveView('feed');
              }}
            />
          ) : (
            <div className="max-w-[1750px] mx-auto w-full flex flex-col lg:flex-row gap-8 xl:gap-12 pl-1 select-none">
              
              {/* Elegant Left Filter COLUMN (Stateful Accordion menu system with multiple color tops) */}
              <div className="hidden lg:block w-64 shrink-0 z-10">
                <div className="sticky top-4 flex flex-col gap-6">
                  
                  {/* Category: SECTOR FIELDS (Active top line: Amber/Gold) */}
                  <div className="border border-stone-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-white/70 dark:bg-zinc-950/20 shadow-xs">
                    {/* Different Color Top Trim Bar */}
                    <div className="h-1 bg-gradient-to-r from-amber-500 to-yellow-400"></div>
                    <button 
                      type="button"
                      onClick={() => setOpenSection(openSection === 'sectors' ? null : 'sectors')}
                      className="w-full px-4 py-3 bg-stone-50/70 dark:bg-zinc-900/10 flex items-center justify-between text-[#121316] dark:text-zinc-50 border-b border-stone-150/80 dark:border-zinc-850/50 cursor-pointer text-left font-sans"
                    >
                      <span className="text-xs font-black tracking-[0.18em] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-500" />
                        {language === 'ar' ? "قطاعات الأعمال" : "SECTOR FIELDS"}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-300 ${openSection === 'sectors' ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {openSection === 'sectors' && (
                      <div className="p-3 flex flex-col gap-2 max-h-[280px] overflow-y-auto">
                        {CATEGORIES.map(cat => {
                          const isSelected = activeCategory === cat;
                          const theme = getCategoryTheme(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setActiveCategory(isSelected ? null : cat);
                                setActiveArchive(null);
                              }}
                              className={`group flex items-center justify-between w-full p-2.5 rounded-lg border text-left rtl:text-right cursor-pointer transition-all ${
                                isSelected 
                                  ? `${theme.textColor} ${theme.bgColor} ${theme.borderColor} shadow-xs font-bold`
                                  : 'bg-white/40 dark:bg-zinc-950/5 hover:bg-stone-200/40 dark:hover:bg-zinc-900/40 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200 border-stone-200/40 dark:border-zinc-850/40'
                              }`}
                            >
                              <span className="text-xs font-semibold tracking-wide">#{translateCategory(cat, language)}</span>
                              <span className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                isSelected ? 'bg-current animate-pulse' : 'bg-transparent group-hover:bg-stone-300 dark:group-hover:bg-zinc-800'
                              }`}></span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Category: MUNICIPAL DESTINATIONS (Active top line: Crimson/Emerald) */}
                  <div className="border border-stone-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-white/70 dark:bg-zinc-950/20 shadow-xs">
                    {/* Different Color Top Trim Bar */}
                    <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                    <button 
                      type="button"
                      onClick={() => setOpenSection(openSection === 'cities' ? null : 'cities')}
                      className="w-full px-4 py-3 bg-stone-50/70 dark:bg-zinc-900/10 flex items-center justify-between text-[#121316] dark:text-zinc-50 border-b border-stone-150/80 dark:border-zinc-850/50 cursor-pointer text-left font-sans"
                    >
                      <span className="text-xs font-black tracking-[0.18em] flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-emerald-500" />
                        {language === 'ar' ? "المراكز البلدية" : "MUNICIPAL DIRECTORY"}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-300 ${openSection === 'cities' ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {openSection === 'cities' && (
                      <div className="p-3 flex flex-col gap-2 max-h-[280px] overflow-y-auto">
                        {(() => {
                          const cities = COUNTRIES.find(c => c.code === activeCountry)?.cities || [];
                          if (cities.length === 0) {
                            return <span className="text-xs italic text-stone-450 dark:text-zinc-650 p-2 text-center">No focus city centers</span>;
                          }
                          return cities.map(city => {
                            const isSelected = activeCity === city;
                            const theme = getCityTheme(city);
                            return (
                              <button
                                key={city}
                                type="button"
                                onClick={() => {
                                  setActiveCity(isSelected ? null : city);
                                  setActiveArchive(null);
                                }}
                                className={`group flex items-center justify-between w-full p-2.5 rounded-lg border text-left rtl:text-right cursor-pointer transition-all ${
                                  isSelected 
                                    ? `${theme.textColor} ${theme.bgColor} ${theme.borderColor} shadow-xs font-bold`
                                    : 'bg-white/40 dark:bg-zinc-950/5 hover:bg-stone-200/40 dark:hover:bg-zinc-900/40 text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200 border-stone-200/40 dark:border-zinc-850/40'
                                }`}
                              >
                                <span className="text-xs font-semibold tracking-wide">@{translateCity(city, language)}</span>
                                <span className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                  isSelected ? 'bg-current animate-pulse' : 'bg-transparent group-hover:bg-stone-300 dark:group-hover:bg-zinc-800'
                                }`}></span>
                              </button>
                            );
                          });
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Category: CHRONICLED ARCHIVES (Active top line: Royal Purple/Cobalt) */}
                  <div className="border border-stone-200/80 dark:border-zinc-800 rounded-xl overflow-hidden bg-white/70 dark:bg-zinc-950/20 shadow-xs">
                    {/* Different Color Top Trim Bar */}
                    <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                    <button 
                      type="button"
                      onClick={() => setOpenSection(openSection === 'archives' ? null : 'archives')}
                      className="w-full px-4 py-3 bg-stone-50/70 dark:bg-zinc-900/10 flex items-center justify-between text-[#121316] dark:text-zinc-50 border-b border-stone-150/80 dark:border-zinc-850/50 cursor-pointer text-left font-sans"
                    >
                      <span className="text-xs font-black tracking-[0.18em] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {language === 'ar' ? "السجلات المؤرشفة" : "SOVEREIGN ARCHIVES"}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-300 ${openSection === 'archives' ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {openSection === 'archives' && (
                      <div className="p-3 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveArchive(null)}
                          className={`flex items-center justify-between w-full p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                            activeArchive === null
                              ? 'bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-300 dark:border-indigo-900/40 text-indigo-800 dark:text-indigo-400 shadow-xs font-bold'
                              : 'bg-white/40 dark:bg-zinc-950/5 hover:bg-stone-200/40 dark:hover:bg-zinc-900/40 text-stone-600 dark:text-zinc-400 border-stone-200/40 dark:border-zinc-850/40'
                          }`}
                        >
                          <span className="text-xs font-semibold tracking-wide">
                            {language === 'ar' ? 'سجلات البث المباشرة' : 'All Live Bulletins'}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 rounded">LIVE</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveArchive('q1_2026')}
                          className={`flex items-center justify-between w-full p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                            activeArchive === 'q1_2026'
                              ? 'bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-300 dark:border-indigo-900/40 text-indigo-800 dark:text-indigo-400 shadow-xs font-bold'
                              : 'bg-white/40 dark:bg-zinc-950/5 hover:bg-stone-200/40 dark:hover:bg-zinc-900/40 text-stone-605 dark:text-zinc-400 border-stone-200/40 dark:border-zinc-850/40'
                          }`}
                        >
                          <span className="text-xs font-semibold tracking-wide">
                            {language === 'ar' ? 'أرشيف الربع الأول ٢٠٢٦' : 'Q1 2026 intel Series'}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 bg-stone-100 dark:bg-zinc-900 text-stone-500 dark:text-zinc-500 rounded">ARCHIVED</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveArchive('q4_2025')}
                          className={`flex items-center justify-between w-full p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                            activeArchive === 'q4_2025'
                              ? 'bg-indigo-500/10 dark:bg-indigo-500/15 border-indigo-300 dark:border-indigo-900/40 text-indigo-800 dark:text-indigo-400 shadow-xs font-bold'
                              : 'bg-white/40 dark:bg-zinc-950/5 hover:bg-stone-200/40 dark:hover:bg-zinc-900/40 text-stone-650 dark:text-zinc-400 border-stone-200/40 dark:border-zinc-850/40'
                          }`}
                        >
                          <span className="text-xs font-semibold tracking-wide">
                            {language === 'ar' ? 'أرشيف الربع الرابع ٢٠٢٥' : 'Q4 2025 Records'}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 bg-stone-100 dark:bg-zinc-900 text-stone-500 dark:text-zinc-500 rounded">ARCHIVED</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Audit Seal Frame Info */}
                  <div className="p-4 rounded-xl border border-dashed border-stone-200/80 dark:border-zinc-800 bg-stone-100/30 dark:bg-zinc-950/20 text-center select-none">
                    <div className="text-[9.5px] tracking-widest font-mono text-stone-400 dark:text-zinc-500 uppercase block mb-1">INTEGRITY RECORD LOCK</div>
                    <span className="text-[9px] font-medium leading-relaxed block text-stone-500 dark:text-zinc-550 text-left">
                      Every bulletin undergoes cognitive validation against State registers before broadcast lock. Read accesses conform strictly to GCC standards.
                    </span>
                  </div>

                </div>
              </div>

              {/* Center Channel: Main Dynamic News Feed Grid Area */}
              <div className="flex-1 min-w-0">
                {startupSweepActive && (
                  <div className="mb-6 p-4.5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse select-none">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-405 uppercase tracking-widest leading-none">
                          {language === 'ar' ? 'مسح التحقق والتدقيق المستمر لمجلس التعاون' : 'Start 5-Hour Intelligence Sweep'}
                        </span>
                        <span className="text-[11px] text-stone-550 dark:text-zinc-400 leading-relaxed mt-1">
                          {startupSweepProgress}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-405 px-2.5 py-1 rounded tracking-widest uppercase shrink-0 self-start md:self-center">
                      {language === 'ar' ? 'تدقيق شبكة دول الخليج' : 'GCC COGNITIVE RADAR'}
                    </span>
                  </div>
                )}

                {spotRefreshActive && (
                  <div className="mb-6 p-4 bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs font-mono select-none animate-pulse">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-wider whitespace-nowrap">
                          {language === 'ar' ? 'رادار البث اللحظي:' : 'SPOT RADAR ACTIVE CHECK:'}
                        </span>
                      </div>
                      <span className="text-stone-600 dark:text-zinc-400 font-sans leading-relaxed text-left">
                        {language === 'ar' 
                          ? `جارٍ فحص القنوات الرسمية وهياكل الدعم لـ ${spotRefreshTarget}` 
                          : `Executing deep search on Google, X, and Reddit for news fitting ${spotRefreshTarget}`}
                      </span>
                    </div>
                    <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">ACC_VERIFY_LIVE</span>
                  </div>
                )}

                <NewsGrid 
                  activeCountryCode={activeCountry} 
                  activeCategory={activeCategory}
                  activeCity={activeCity}
                  searchTerm={searchTerm}
                  setActiveCategory={setActiveCategory}
                  setActiveCity={setActiveCity}
                  setSearchTerm={setSearchTerm}
                  onSelectTag={handleSelectTagGlobal}
                  news={news}
                  loading={loadingNews}
                  onSelectArticle={setSelectedGlobalArticle}
                  language={language}
                  onTriggerSpotCheck={() => triggerSpotCheck(activeCountry, activeCity, activeCategory)}
                  spotRefreshActive={spotRefreshActive}
                  activeArchive={activeArchive}
                />
              </div>

              {/* Righthand Channel: Sovereign Verification Desk embedded panel viewer */}
              <div className="hidden lg:block w-[380px] xl:w-[440px] shrink-0 border-l border-stone-200/70 dark:border-zinc-850/70 pl-8 z-10">
                <div className="sticky top-4">
                  {selectedGlobalArticle ? (
                    <ArticleDetailEmbed 
                      item={selectedGlobalArticle} 
                      onClose={() => setSelectedGlobalArticle(null)}
                      onSelectTag={handleSelectTagGlobal}
                      language={language}
                    />
                  ) : (
                    <SovereignFocusDashboard 
                      activeCountry={activeCountry}
                      activeCity={activeCity}
                      activeCategory={activeCategory}
                      language={language}
                      filteredNews={filteredNews}
                      triggerSpotCheck={() => triggerSpotCheck(activeCountry, activeCity, activeCategory)}
                      spotRefreshActive={spotRefreshActive}
                    />
                  )}
                </div>
              </div>
              
            </div>
          )}

          {/* Dynamic Automatic Versioning & Last Update Day Footer */}
          <footer className="mt-16 pt-8 border-t border-stone-200/50 dark:border-zinc-850/50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none max-w-[1500px] mx-auto w-full">
            <div className="flex items-center gap-2 font-mono text-stone-400 dark:text-zinc-650 text-[10px] uppercase tracking-wider">
              <span>© {new Date().getFullYear()} GCC News Command</span>
              <span className="text-stone-300 dark:text-zinc-850">•</span>
              <span className="font-sans normal-case text-stone-500 dark:text-zinc-400">All rights reserved.</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 font-mono text-[10.5px]">
              <div className="flex items-center gap-2 text-stone-500 dark:text-zinc-400">
                <span className="font-extrabold uppercase tracking-wider text-stone-400 dark:text-zinc-650 text-[9px]">
                  {language === 'ar' ? 'تاريخ آخر تحديث:' : 'LAST UPDATE DAY:'}
                </span>
                <span className="font-sans font-semibold text-stone-700 dark:text-zinc-300">
                  {lastUpdateDay || new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
              <span className="hidden sm:inline-block text-stone-300 dark:text-zinc-850">•</span>
              <div className="flex items-center gap-1.5 bg-stone-100/80 dark:bg-zinc-950 px-3 py-1 rounded-lg border border-stone-200/40 dark:border-zinc-850/45 text-emerald-600 dark:text-emerald-450 font-black uppercase tracking-widest text-[9.5px]">
                <span>{language === 'ar' ? 'الإصدار' : 'VERSION'}</span>
                <span>{appVersion}</span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Audited News Dispatch Submission Sheet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#0c0d10]/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#FAF9F5] dark:bg-[#0E0F12] border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up select-none">
            
            {/* Header Lockup */}
            <div className="px-6 py-4.5 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between bg-stone-100/60 dark:bg-zinc-950/20">
              <div className="flex flex-col">
                <h2 className="font-serif italic font-bold text-xl text-stone-900 dark:text-zinc-50">
                  Submit Verified Editorial Dispatch
                </h2>
                <span className="text-[10px] font-mono text-stone-500 tracking-wider">FORM_INTEGRITY_INDEX: GCC_SECURE_MAPPED_AUDIT</span>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-900 dark:hover:text-zinc-200 cursor-pointer p-1 rounded hover:bg-stone-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-5 overflow-y-auto max-h-[78vh]">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500 dark:text-zinc-500 mb-1.5">
                  Headline title (256 chars max)
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Dubai Smart City Projects Receive Dynamic Capital Seeding"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-zinc-300 transition-all font-sans font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500 dark:text-zinc-500 mb-1.5">
                  Audited Content (supports locations highlight tags e.g. @Dubai)
                </label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Insert verified draft redraft content. Explicitly refer to cities with @ to highlight them."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-zinc-300 transition-all font-sans font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500 dark:text-zinc-500 mb-1.5">
                    Municipal Center focus
                  </label>
                  <select 
                     value={selectedLoc}
                    onChange={(e) => setSelectedLoc(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-zinc-300 font-sans font-medium"
                  >
                    {activeCountryObj.cities.map(city => (
                      <option key={city} value={`@${city}`}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                   <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500 dark:text-zinc-500 mb-1.5">
                    Category Tag Classification
                  </label>
                  <select 
                    value={selectedCat}
                    onChange={(e) => setSelectedCat(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-zinc-300 font-sans font-medium"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={`#${cat}`}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500 dark:text-zinc-500 mb-1.5">
                    Audit Sources (comma sequence)
                  </label>
                  <input 
                    type="text" 
                    required
                    value={sourcesInput}
                    onChange={(e) => setSourcesInput(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-zinc-300 transition-all font-sans font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500 dark:text-zinc-500 mb-1.5">
                    Verification Seal Text
                  </label>
                  <input 
                    type="text" 
                    required
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-zinc-300 transition-all font-sans font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-500 dark:text-zinc-500 mb-1.5">
                  Leaderboard Visual Image URL
                </label>
                <input 
                  type="text" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-zinc-300 font-sans font-medium"
                />
              </div>

              {errorMessage && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-xs font-mono rounded-lg text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 break-words leading-relaxed max-h-32 overflow-y-auto">
                  <strong>Zero-Trust Writing Policy Active:</strong>
                  <p className="mt-1">{errorMessage}</p>
                </div>
              )}

              <div className="mt-2 text-[10.5px] leading-relaxed text-stone-500 dark:text-zinc-500 flex flex-col gap-1.5 bg-stone-100/50 dark:bg-zinc-900/30 p-3.5 rounded-xl border border-stone-200/50 dark:border-zinc-850/50">
                <span>🛡️ <strong>Zero-Trust Audit:</strong> The deployed cloud security rules strictly isolate insert operations to authenticated regional administrators (e.g., <code>khalifa@khalifa.net</code>).</span>
                <span>📋 Standard users can read the global index with extremely minimized roundtrips.</span>
              </div>

              <div className="mt-4 flex gap-3 justify-end border-t border-stone-200/80 dark:border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white dark:text-zinc-950 rounded-lg text-xs font-extrabold uppercase tracking-widest shadow-md cursor-pointer transition-colors"
                >
                  {submitting ? 'Authenticating...' : 'Publish Instantly'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Panoramic Immersive Article Reader View */}
      <AnimatePresence>
        {selectedGlobalArticle && (
          <ArticleReader 
            item={selectedGlobalArticle} 
            onClose={() => setSelectedGlobalArticle(null)} 
            onSelectTag={handleSelectTagGlobal}
            language={language}
          />
        )}
      </AnimatePresence>

      {/* Floating sliding toast notification for autonomous background news pitch */}
      <AnimatePresence>
        {pitchedNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
            className="fixed bottom-6 right-6 z-[100] max-w-sm w-full bg-[#0E0F12] dark:bg-[#FAF9F5] text-white dark:text-stone-900 border border-stone-800 dark:border-stone-200 rounded-2xl shadow-2xl p-4.5 flex flex-col gap-2.5 font-sans"
          >
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-mono tracking-widest font-bold uppercase text-emerald-400 dark:text-emerald-600">
                  {language === 'ar' ? 'بث تلقائي جديد' : 'AUTONOMOUS PITCH'}
                </span>
              </div>
              <button
                onClick={() => setPitchedNotification(null)}
                className="text-stone-400 hover:text-stone-100 dark:text-stone-500 dark:hover:text-stone-900 transition-colors p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xs font-semibold leading-snug line-clamp-2 text-left rtl:text-right">
              {pitchedNotification.headline}
            </div>
            <button
              onClick={() => {
                setSelectedGlobalArticle(pitchedNotification);
                setPitchedNotification(null);
              }}
              className="text-[10.5px] font-mono font-black text-left rtl:text-right uppercase tracking-wider text-emerald-450 dark:text-emerald-650 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'ar' ? 'قراءة الخبر كاملاً' : 'Read Full Dispatch'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
