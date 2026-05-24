export interface SourceCitation {
  name: string;
  url: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  content: string;
  publishedAt: string;
  imageUrl: string;
  sources: SourceCitation[];
  locationTags: string[]; // Cities or Countries prefixed with @
  categoryTags: string[]; // Categories prefixed with #
  verifiedStatus: string;
}

export interface NewsResource {
  id: string;
  name: string;
  type: 'State Agency' | 'Daily Newspaper' | 'Broadcast Network' | 'Digital Publisher';
  lang: 'Bilingual' | 'English' | 'Arabic';
  countryCode: string;
  countryName: string;
  url: string;
  description: string;
  established: string;
  status: 'Active Feed' | 'Verified Monitor';
  frequency: string;
}

export const COUNTRIES = [
  { code: 'ae', name: 'UAE', cities: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Al Fujairah'] },
  { code: 'sa', name: 'Saudi Arabia', cities: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar'] },
  { code: 'om', name: 'Oman', cities: ['Muscat', 'Salalah', 'Sohar', 'Nizwa'] },
  { code: 'qa', name: 'Qatar', cities: ['Doha', 'Al Wakrah', 'Al Khor'] },
  { code: 'bh', name: 'Bahrain', cities: ['Manama', 'Muharraq', 'Riffa'] },
  { code: 'kw', name: 'Kuwait', cities: ['Kuwait City', 'Al Ahmadi', 'Hawalli'] },
];

export const CATEGORIES = [
  'Economic', 'Investment', 'High-Tech', 'Commercial', 'Political', 'Educational', 'Local', 'Global', 'International'
];

export const NEWS_RESOURCES: NewsResource[] = [
  // UAE
  {
    id: 'res-wam',
    name: 'WAM (Emirates News Agency)',
    type: 'State Agency',
    lang: 'Bilingual',
    countryCode: 'ae',
    countryName: 'UAE',
    url: 'https://www.wam.ae',
    description: 'The official news agency of the United Arab Emirates, broadcasting state decrees, international bilateral agreements, and municipal updates in multiple languages.',
    established: '1976',
    status: 'Active Feed',
    frequency: 'Real-time'
  },
  {
    id: 'res-gulfnews',
    name: 'Gulf News',
    type: 'Daily Newspaper',
    lang: 'English',
    countryCode: 'ae',
    countryName: 'UAE',
    url: 'https://gulfnews.com',
    description: 'Premier English language daily newspaper publishing breaking developments across Gulf financial markets, local real estate trends, and regulatory updates.',
    established: '1978',
    status: 'Active Feed',
    frequency: 'Continuous'
  },
  {
    id: 'res-khaleejtimes',
    name: 'Khaleej Times',
    type: 'Daily Newspaper',
    lang: 'English',
    countryCode: 'ae',
    countryName: 'UAE',
    url: 'https://khaleejtimes.com',
    description: 'The first English-language newspaper published in the UAE, providing trusted coverage of municipal developments, corporate partnerships, and tech seeding hubs.',
    established: '1978',
    status: 'Active Feed',
    frequency: 'Continuous'
  },
  {
    id: 'res-national',
    name: 'The National',
    type: 'Daily Newspaper',
    lang: 'Bilingual',
    countryCode: 'ae',
    countryName: 'UAE',
    url: 'https://www.thenationalnews.com',
    description: 'Distinguished Middle East publication focusing on political strategy, macroeconomics, cultural shifts, and green sovereign initiatives.',
    established: '2008',
    status: 'Active Feed',
    frequency: 'Hourly'
  },
  {
    id: 'res-skynews-ar',
    name: 'Sky News Arabia',
    type: 'Broadcast Network',
    lang: 'Arabic',
    countryCode: 'ae',
    countryName: 'UAE',
    url: 'https://www.skynewsarabia.com',
    description: 'An influential 24-hour Arabic-language news channel based in Abu Dhabi, broadcasting real-time financial markets, security reports, and sovereign summit briefs.',
    established: '2012',
    status: 'Verified Monitor',
    frequency: 'Real-time'
  },
  {
    id: 'res-ittihad',
    name: 'Al Ittihad',
    type: 'Daily Newspaper',
    lang: 'Arabic',
    countryCode: 'ae',
    countryName: 'UAE',
    url: 'https://www.alittihad.ae',
    description: 'The first Arabic-language newspaper in the UAE, representing the official domestic and regional outlook with authentic sources.',
    established: '1969',
    status: 'Verified Monitor',
    frequency: 'Daily'
  },
  // Saudi Arabia
  {
    id: 'res-spa',
    name: 'SPA (Saudi Press Agency)',
    type: 'State Agency',
    lang: 'Bilingual',
    countryCode: 'sa',
    countryName: 'Saudi Arabia',
    url: 'https://www.spa.gov.sa',
    description: 'The official news wire of the Kingdom of Saudi Arabia, detailing Royal decrees, commercial frameworks, Vision 2030 development directives, and legal files.',
    established: '1971',
    status: 'Active Feed',
    frequency: 'Real-time'
  },
  {
    id: 'res-arabnews',
    name: 'Arab News',
    type: 'Daily Newspaper',
    lang: 'English',
    countryCode: 'sa',
    countryName: 'Saudi Arabia',
    url: 'https://www.arabnews.com',
    description: 'The leading English-language daily newspaper in the Middle East, covering macroeconomics, international diplomacy, energy, and Saudi development files.',
    established: '1975',
    status: 'Active Feed',
    frequency: 'Daily'
  },
  {
    id: 'res-arabiya',
    name: 'Al Arabiya',
    type: 'Broadcast Network',
    lang: 'Bilingual',
    countryCode: 'sa',
    countryName: 'Saudi Arabia',
    url: 'https://www.alarabiya.net',
    description: 'A major international 24-hour news network headquartered in Riyadh, known for deep political reporting, regional analysis, and high-frequency live dispatches.',
    established: '2003',
    status: 'Active Feed',
    frequency: 'Real-time'
  },
  {
    id: 'res-asharq',
    name: 'Asharq Al-Awsat',
    type: 'Daily Newspaper',
    lang: 'Arabic',
    countryCode: 'sa',
    countryName: 'Saudi Arabia',
    url: 'https://aawsat.com',
    description: 'The premier pan-Arab daily newspaper, delivering analytical coverage of geopolitical frameworks and GCC economic alignments.',
    established: '1978',
    status: 'Verified Monitor',
    frequency: 'Daily'
  },
  {
    id: 'res-saudigazette',
    name: 'Saudi Gazette',
    type: 'Daily Newspaper',
    lang: 'English',
    countryCode: 'sa',
    countryName: 'Saudi Arabia',
    url: 'https://saudigazette.com.sa',
    description: 'Dynamic English-language voice in Saudi Arabia, tracking progress on the Vision 2030 initiatives, trade barriers, and investment structures.',
    established: '1976',
    status: 'Verified Monitor',
    frequency: 'Daily'
  },
  {
    id: 'res-okaz',
    name: 'Okaz',
    type: 'Daily Newspaper',
    lang: 'Arabic',
    countryCode: 'sa',
    countryName: 'Saudi Arabia',
    url: 'https://okaz.com.sa',
    description: 'An authoritative Arabic-language newspaper delivering bold investigative coverage, regional politics, and municipal developments.',
    established: '1960',
    status: 'Verified Monitor',
    frequency: 'Daily'
  },
  // Qatar
  {
    id: 'res-qna',
    name: 'QNA (Qatar News Agency)',
    type: 'State Agency',
    lang: 'Bilingual',
    countryCode: 'qa',
    countryName: 'Qatar',
    url: 'https://www.qna.org.qa',
    description: 'The official government news wire of the State of Qatar, tracking legislative updates, diplomatic visits, and sovereign gas/energy policies.',
    established: '1975',
    status: 'Active Feed',
    frequency: 'Real-time'
  },
  {
    id: 'res-aljazeera',
    name: 'Al Jazeera',
    type: 'Broadcast Network',
    lang: 'Bilingual',
    countryCode: 'qa',
    countryName: 'Qatar',
    url: 'https://www.aljazeera.com',
    description: 'The pioneering 24-hour broadcast news channel headquartered in Doha, renowned globally for deep investigations and comprehensive coverage.',
    established: '1996',
    status: 'Active Feed',
    frequency: 'Real-time'
  },
  {
    id: 'res-qatar-tribune',
    name: 'Qatar Tribune',
    type: 'Daily Newspaper',
    lang: 'English',
    countryCode: 'qa',
    countryName: 'Qatar',
    url: 'https://www.qatar-tribune.com',
    description: 'Prominent daily English newspaper offering extensive reporting on municipal developments, real estate schemes, and regional treaties in Doha.',
    established: '2006',
    status: 'Verified Monitor',
    frequency: 'Daily'
  },
  {
    id: 'res-gulf-times',
    name: 'Gulf Times',
    type: 'Daily Newspaper',
    lang: 'English',
    countryCode: 'qa',
    countryName: 'Qatar',
    url: 'https://www.gulf-times.com',
    description: 'The earliest English newspaper in Qatar, offering trusted perspectives on industry frameworks and energy intelligence.',
    established: '1978',
    status: 'Verified Monitor',
    frequency: 'Daily'
  },
  // Oman
  {
    id: 'res-ona',
    name: 'ONA (Oman News Agency)',
    type: 'State Agency',
    lang: 'Bilingual',
    countryCode: 'om',
    countryName: 'Oman',
    url: 'http://omannews.gov.om',
    description: 'The official state news wire of the Sultanate of Oman, documenting Royal announcements, fiscal policies, and maritime developments.',
    established: '1997',
    status: 'Active Feed',
    frequency: 'Real-time'
  },
  {
    id: 'res-timesofoman',
    name: 'Times of Oman',
    type: 'Daily Newspaper',
    lang: 'English',
    countryCode: 'om',
    countryName: 'Oman',
    url: 'https://timesofoman.com',
    description: 'The oldest and most widely read English-language digital news portal in Oman, tracking port expansions, tourism directives, and regional trade logs.',
    established: '1975',
    status: 'Active Feed',
    frequency: 'Continuous'
  },
  {
    id: 'res-omanobserver',
    name: 'Oman Daily Observer',
    type: 'Daily Newspaper',
    lang: 'English',
    countryCode: 'om',
    countryName: 'Oman',
    url: 'https://www.omanobserver.om',
    description: 'The analytical and objective voice of Oman, published by Oman Establishment for Press, focused on logistics, infrastructure, and green initiatives.',
    established: '1981',
    status: 'Verified Monitor',
    frequency: 'Daily'
  },
  // Bahrain
  {
    id: 'res-bna',
    name: 'BNA (Bahrain News Agency)',
    type: 'State Agency',
    lang: 'Bilingual',
    countryCode: 'bh',
    countryName: 'Bahrain',
    url: 'https://www.bna.bh',
    description: 'The official government news network of the Kingdom of Bahrain, streaming municipal news, parliamentary files, and fin-tech regulations.',
    established: '1978',
    status: 'Active Feed',
    frequency: 'Real-time'
  },
  {
    id: 'res-gdn',
    name: 'GDN Online',
    type: 'Daily Newspaper',
    lang: 'English',
    countryCode: 'bh',
    countryName: 'Bahrain',
    url: 'https://www.gdnonline.com',
    description: 'Bahrain’s veteran English newspaper, providing rich reviews of local legal reforms, logistics projects, and tourism investments.',
    established: '1978',
    status: 'Active Feed',
    frequency: 'Daily'
  },
  {
    id: 'res-alayam',
    name: 'Al Ayam',
    type: 'Daily Newspaper',
    lang: 'Arabic',
    countryCode: 'bh',
    countryName: 'Bahrain',
    url: 'https://www.alayam.com',
    description: 'Acclaimed Arabic journal offering extensive domestic coverage, business alignments, and sovereign political initiatives.',
    established: '1989',
    status: 'Verified Monitor',
    frequency: 'Daily'
  },
  // Kuwait
  {
    id: 'res-kuna',
    name: 'KUNA (Kuwait News Agency)',
    type: 'State Agency',
    lang: 'Bilingual',
    countryCode: 'kw',
    countryName: 'Kuwait',
    url: 'https://www.kuna.net.kw',
    description: 'The official national news body of the State of Kuwait, providing direct releases on oil production targets, parliamentary votes, and commercial laws.',
    established: '1976',
    status: 'Active Feed',
    frequency: 'Real-time'
  },
  {
    id: 'res-kuwaittimes',
    name: 'Kuwait Times',
    type: 'Daily Newspaper',
    lang: 'English',
    countryCode: 'kw',
    countryName: 'Kuwait',
    url: 'https://www.kuwaittimes.com',
    description: 'The oldest English-language daily newspaper in the Arabian Gulf region, focused on macroeconomic data, sovereign funds, and legal alerts.',
    established: '1961',
    status: 'Active Feed',
    frequency: 'Daily'
  },
  {
    id: 'res-alanba',
    name: 'Al-Anba',
    type: 'Daily Newspaper',
    lang: 'Arabic',
    countryCode: 'kw',
    countryName: 'Kuwait',
    url: 'https://www.alanba.com.kw',
    description: 'Highly authoritative Arabic publication providing comprehensive domestic coverage, legislative audits, and regional integrations.',
    established: '1976',
    status: 'Verified Monitor',
    frequency: 'Daily'
  },
  {
    id: 'res-alqabas',
    name: 'Al-Qabas',
    type: 'Daily Newspaper',
    lang: 'Arabic',
    countryCode: 'kw',
    countryName: 'Kuwait',
    url: 'https://www.alqabas.com',
    description: 'Kuwait’s distinguished Arabic independent newspaper, leading in deep-dive investigative features and corporate reports.',
    established: '1972',
    status: 'Verified Monitor',
    frequency: 'Daily'
  }
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    headline: 'Abu Dhabi Investment Authority Announces Major Expansion into Renewable Energy Sectors',
    content: 'The @Abu Dhabi Investment Authority has unveiled a new strategic roadmap focusing heavily on sustainable and renewable energy assets globally. Sources indicate a massive capital capital placement expected across GCC partners by Q4 to foster solar and hydrogen networks.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-12001569e25d?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Abu Dhabi Securities Exchange', url: '#' },
      { name: 'WAM', url: 'https://www.wam.ae' },
      { name: 'Reuters', url: '#' }
    ],
    locationTags: ['@Abu Dhabi', '@UAE'],
    categoryTags: ['#Investment', '#Economic', '#Global'],
    verifiedStatus: 'Verified across 3 sources',
  },
  {
    id: '2',
    headline: 'Dubai Tech Startups Securing Record Seed Funding in Q1',
    content: 'Recent tech-ecosystem audits in @Dubai show a massive surge in venture capital entering local SaaS and AI startups. The @DFM reports increased interest from international venture funds looking to seed smart logistics systems.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'DFM', url: '#' },
      { name: 'Gulf News', url: 'https://gulfnews.com' }
    ],
    locationTags: ['@Dubai', '@UAE'],
    categoryTags: ['#Commercial', '#Local', '#Investment'],
    verifiedStatus: 'Verified across 2 sources',
  },
  {
    id: '3',
    headline: 'Saudi Arabia Unveils New Educational Initiatives in Riyadh',
    content: 'New high-capacity educational campuses are being planned across @Riyadh, focusing on advanced computing, robotic automation, and AI ethics. The initiative matches the core human capital targets of the Vision 2030 template.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'SPA', url: 'https://www.spa.gov.sa' },
      { name: 'Arab News', url: 'https://www.arabnews.com' }
    ],
    locationTags: ['@Riyadh', '@Saudi Arabia'],
    categoryTags: ['#Educational', '#Local', '#Economic'],
    verifiedStatus: 'Verified across 2 sources',
  },
  {
    id: '4',
    headline: 'Global Real Estate Markets React to GCC Economic Policies',
    content: 'International financial markets are seeing a positive ripple effect from recent macroeconomic guidelines adopted by the GCC. Core property groups in @Sharjah and @Manama held a joint development forum to detail cooperative cross-border urban designs.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Bloomberg', url: '#' },
      { name: 'Reuters', url: '#' }
    ],
    locationTags: ['@Sharjah', '@Manama', '@GCC', '@UAE', '@Bahrain'],
    categoryTags: ['#Economic', '#International', '#Investment'],
    verifiedStatus: 'Verified across 2 sources',
  },
  {
    id: '5',
    headline: 'Oman Signs Historic Port Expansion Agreement',
    content: 'The maritime hub of @Sohar will undergo a massive phase-two expansion, boosting general cargo capacity by 40%. The expansion is backed by state infrastructure funds and aims to optimize logistics speed between GCC nations and global shipping routes.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Oman News Agency', url: 'http://omannews.gov.om' },
      { name: 'Khaleej Times', url: 'https://khaleejtimes.com' }
    ],
    locationTags: ['@Sohar', '@Oman'],
    categoryTags: ['#Commercial', '#Economic', '#Investment'],
    verifiedStatus: 'Verified across 2 sources',
  },
  {
    id: '6',
    headline: 'Sharjah Heritage and Cultural District Expands Historic Preservation Program',
    content: 'The executive council of @Sharjah announced a landmark investment to expand the Al Shuwaihean historic arts quarter. The program aims to integrate digital archival systems to verify architectural structures dating back to original maritime trading centuries.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Sharjah News', url: '#' },
      { name: 'WAM', url: 'https://www.wam.ae' }
    ],
    locationTags: ['@Sharjah', '@UAE'],
    categoryTags: ['#Educational', '#Local'],
    verifiedStatus: 'Verified across 2 sources',
  },
  {
    id: '7',
    headline: 'Ajman Free Zone Outlines Smart Industrial Upgrading Initiatives',
    content: 'Under new regulatory directives, @Ajman Free Zone is transitioning its manufacturing park to IoT-enabled smart logistics hubs. The upgrading guarantees local businesses tariff relief and verified sustainability rankings.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Ajman Media Office', url: '#' },
      { name: 'WAM', url: 'https://www.wam.ae' }
    ],
    locationTags: ['@Ajman', '@UAE'],
    categoryTags: ['#Commercial', '#Economic'],
    verifiedStatus: 'Verified by Ajman Municipality Desk',
  },
  {
    id: '8',
    headline: 'Umm Al Quwain Launches Blue Economy Cooperative Reserve',
    content: 'The government of @Umm Al Quwain has set aside 150 hectares for mangrove-based blue carbon credits. Backed by sovereign climate partners, the reserve will establish a low-impact tourism and commercial aquaculture research park.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'UAQ News Portal', url: '#' },
      { name: 'Gulf News', url: 'https://gulfnews.com' }
    ],
    locationTags: ['@Umm Al Quwain', '@UAE'],
    categoryTags: ['#Investment', '#Local', '#Global'],
    verifiedStatus: 'Verified via WAM State Wire',
  },
  {
    id: '9',
    headline: 'Ras Al Khaimah Infrastructure Plan Upgrades Jebel Jais Transport Corridor',
    content: 'The tourism department of @Ras Al Khaimah is deploying high-safety automated shuttle routes ascending Jebel Jais. The transit corridors utilize hybrid systems to reduce emissions across the mountainous terrain.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'RAK Media Desk', url: '#' },
      { name: 'Khaleej Times', url: 'https://khaleejtimes.com' }
    ],
    locationTags: ['@Ras Al Khaimah', '@UAE'],
    categoryTags: ['#Investment', '#Local'],
    verifiedStatus: 'Verified across regional channels',
  },
  {
    id: '10',
    headline: 'Al Fujairah Deep Water Oil Terminal Launches Smart Bunkering Platform',
    content: 'As one of the world’s leading bunkering hubs, @Al Fujairah has fully digitized its terminal scheduling system. Ship crews can now verify regulatory standards, maritime fuel ratios, and terminal availability in real-time.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Fujairah Port Authority', url: '#' },
      { name: 'WAM', url: 'https://www.wam.ae' }
    ],
    locationTags: ['@Al Fujairah', '@UAE'],
    categoryTags: ['#Commercial', '#Economic'],
    verifiedStatus: 'Verified and Monitored',
  },
  {
    id: '11',
    headline: 'Jeddah Historic District preservation Secures $200M Restoration Fund',
    content: 'The historic Al-Balad quarter in @Jeddah has received new sovereign capital injections to stabilize historic architectural structures. Restorations utilize original coral stone techniques combined with 3D structural scanning to ensure authentic preservation.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'SPA', url: 'https://www.spa.gov.sa' },
      { name: 'Saudi Gazette', url: 'https://saudigazette.com.sa' }
    ],
    locationTags: ['@Jeddah', '@Saudi Arabia'],
    categoryTags: ['#Local', '#Investment', '#Economic'],
    verifiedStatus: 'Verified by Saudi Heritage Commission',
  },
  {
    id: '12',
    headline: 'Mecca Smart Pilgrim logistics deploys Autonomous Electric Transit fleets',
    content: 'The transport council of @Mecca is launching non-polluting autonomous transit shuttles to optimize shuttle flow between major assembly fields. Fleet coordination is monitored by localized algorithmic control nodes.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Ministry of Hajj', url: '#' },
      { name: 'Okaz', url: 'https://okaz.com.sa' }
    ],
    locationTags: ['@Mecca', '@Saudi Arabia'],
    categoryTags: ['#Commercial', '#Local'],
    verifiedStatus: 'Verified with official blueprints',
  },
  {
    id: '13',
    headline: 'Knowledge Economic City in Medina Secures New Biotech Research Hubs',
    content: 'Medina’s master developers have signed agreements to seed key biotech laboratories in @Medina. Research will focus on desert pharmacology and sustainability innovations in food production.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Medina Authority', url: '#' },
      { name: 'SPA', url: 'https://www.spa.gov.sa' }
    ],
    locationTags: ['@Medina', '@Saudi Arabia'],
    categoryTags: ['#Educational', '#Investment'],
    verifiedStatus: 'Verified by KEC Board',
  },
  {
    id: '14',
    headline: 'Dammam Industrial Zone Launches Smart Robot Assembly Platforms',
    content: 'Automated steel processing lines in the core hub of @Dammam are integrating automated robotic arms to increase precision. The upgrades are expected to double steel export speeds to GCC rail development partners.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Eastern Province Chamber', url: '#' },
      { name: 'Saudi Gazette', url: 'https://saudigazette.com.sa' }
    ],
    locationTags: ['@Dammam', '@Saudi Arabia'],
    categoryTags: ['#Commercial', '#Economic'],
    verifiedStatus: 'Verified and active',
  },
  {
    id: '15',
    headline: 'Al Khobar Coastal Business Park Unveils Green Tech Incubator',
    content: 'The new entrepreneurship park in @Khobar has expanded incubators for start-ups creating eco-friendly industrial software. Up to 15 startups have already been selected for seed allocations.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'SPA', url: 'https://www.spa.gov.sa' },
      { name: 'Arab News', url: 'https://www.arabnews.com' }
    ],
    locationTags: ['@Khobar', '@Saudi Arabia'],
    categoryTags: ['#Investment', '#Economic'],
    verifiedStatus: 'Verified first-hand by Arab News Desk',
  },
  {
    id: '16',
    headline: 'Muscat Green Hydrogen Hub Secures Landmark Multi-Billion Sovereign Pledge',
    content: 'The Ministry of Energy in @Muscat has authorized a massive hydrogen production plant. The grid will utilize Muscat’s central maritime facilities and desalination channels to supply clean energy alternatives to international export docks.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Oman Ministry of Energy', url: '#' },
      { name: 'ONA', url: 'http://omannews.gov.om' }
    ],
    locationTags: ['@Muscat', '@Oman'],
    categoryTags: ['#Economic', '#Investment', '#Global'],
    verifiedStatus: 'Verified across Oman news wires',
  },
  {
    id: '17',
    headline: 'Salalah Free Zone Launches Advanced Food Preservation Packaging Parks',
    content: 'To enhance trade resilience, @Salalah Free Zone has launched a packaging park optimized for regional citrus exports. The automated facility guarantees zero carbon cargo footprint during transit.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Salalah SFZ', url: '#' },
      { name: 'Times of Oman', url: 'https://timesofoman.com' }
    ],
    locationTags: ['@Salalah', '@Oman'],
    categoryTags: ['#Commercial', '#Economic'],
    verifiedStatus: 'Verified by Salalah Customs Dispatch',
  },
  {
    id: '18',
    headline: 'Nizwa Heritage University Initiates Archeological AI Preservation',
    content: 'The history and preservation department in @Nizwa is utilizing algorithmic neural nets to digitize old Omani manuscript libraries. The dynamic project enables scholars worldwide to study verified texts.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 34).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'ONA', url: 'http://omannews.gov.om' },
      { name: 'Oman Observer', url: 'https://www.omanobserver.om' }
    ],
    locationTags: ['@Nizwa', '@Oman'],
    categoryTags: ['#Educational', '#Local'],
    verifiedStatus: 'Verified by Ministry of Culture',
  },
  {
    id: '19',
    headline: 'Doha Sovereign Web-AI Tech Hub Launches Sovereign LLM Cluster',
    content: 'Cooperative development circles in @Doha have launched the first regional sovereign large language models. Fully hosted on high-security native servers, the platform guarantees private localized database classification.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'QNA', url: 'https://www.qna.org.qa' },
      { name: 'Al Jazeera', url: 'https://www.aljazeera.com' }
    ],
    locationTags: ['@Doha', '@Qatar'],
    categoryTags: ['#Investment', '#Political', '#Global'],
    verifiedStatus: 'Verified on Qatari State Channels',
  },
  {
    id: '20',
    headline: 'Al Wakrah Modern Seaport Logistics Integrates Automated Crane Grid',
    content: 'Port operations in the southern hub of @Al Wakrah have integrated real-time container tracking with automatic gantry cranes. The upgrades reduce off-loading timelines by 30%.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 38).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Mwani Qatar', url: '#' },
      { name: 'Qatar Tribune', url: 'https://www.qatar-tribune.com' }
    ],
    locationTags: ['@Al Wakrah', '@Qatar'],
    categoryTags: ['#Commercial', '#Economic'],
    verifiedStatus: 'Verified by Port Master Logs',
  },
  {
    id: '21',
    headline: 'Al Khor Regional Aquaculture Laboratory Reports Biotech Breakthrough',
    content: 'Biologists in @Al Khor have engineered highly adaptive micro-algae feed to optimize local fish farm yields. The breakthrough targets food security targets set by the Ministry of Environment.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'QNA', url: 'https://www.qna.org.qa' },
      { name: 'Gulf Times', url: 'https://www.gulf-times.com' }
    ],
    locationTags: ['@Al Khor', '@Qatar'],
    categoryTags: ['#Educational', '#Local'],
    verifiedStatus: 'Verified by Al Khor Biological Division',
  },
  {
    id: '22',
    headline: 'Bahrain Fintech Bay Upgrades Digital Sandbox Sandbox Parameters',
    content: 'The central administration bank headquartered in @Manama has authorized broader digital sovereign tokens frameworks. FinTech Bay will monitor testing to guarantee cybersecurity compliance across local banking targets.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'BNA', url: 'https://www.bna.bh' },
      { name: 'GDN Online', url: 'https://www.gdnonline.com' }
    ],
    locationTags: ['@Manama', '@Bahrain'],
    categoryTags: ['#Investment', '#Economic', '#International'],
    verifiedStatus: 'Verified by Central Bank of Bahrain',
  },
  {
    id: '23',
    headline: 'Muharraq Pearl Path UNESCO Initiative Connects Historic Restorations',
    content: 'The historical core of @Muharraq has launched interactive pedestrian trails mapping authentic pearling structures. Municipal planners utilized historic property logs to catalog architecture dating to the 19th century.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 44).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1460574283810-2aab119d8511?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Bahrain Culture Authority', url: '#' },
      { name: 'Al Ayam', url: 'https://www.alayam.com' }
    ],
    locationTags: ['@Muharraq', '@Bahrain'],
    categoryTags: ['#Educational', '#Local'],
    verifiedStatus: 'Verified by UNESCO Regional Office',
  },
  {
    id: '24',
    headline: 'Riffa Industrial Park Deploys Eco-Conscious Solar Farms',
    content: 'Industrial zones in @Riffa are now drawing up to 35% of power supplies from the newly constructed solar arrays. The initiative marks Bahrain’s transition towards clean manufacturing targets.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'BNA', url: 'https://www.bna.bh' },
      { name: 'Al Ayam', url: 'https://www.alayam.com' }
    ],
    locationTags: ['@Riffa', '@Bahrain'],
    categoryTags: ['#Investment', '#Economic'],
    verifiedStatus: 'Verified and Active Feed',
  },
  {
    id: '25',
    headline: 'Kuwait City Sovereign Fund Expands Cross-Border AI Seeding Capital',
    content: 'The national sovereign reserves of Kuwait, based in @Kuwait City, have allocated a focused percentage of assets strictly inside machine learning hubs globally, marking a massive diversification target.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'KUNA', url: 'https://www.kuna.net.kw' },
      { name: 'Kuwait Times', url: 'https://www.kuwaittimes.com' }
    ],
    locationTags: ['@Kuwait City', '@Kuwait'],
    categoryTags: ['#Investment', '#Economic', '#International'],
    verifiedStatus: 'Verified on KUNA National Wire',
  },
  {
    id: '26',
    headline: 'Al Ahmadi Refinery Implements Advanced Low-Emission Abatement Towers',
    content: 'Sovereign oil refining centers in @Al Ahmadi have completed building modern carbon capture towers. The infrastructure reduces sulfur standard exhaust concentrations by 92% to preserve local air quality.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1535732820275-9ffd998cac22?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Kuwait National Petroleum', url: '#' },
      { name: 'KUNA', url: 'https://www.kuna.net.kw' }
    ],
    locationTags: ['@Al Ahmadi', '@Kuwait'],
    categoryTags: ['#Commercial', '#Economic'],
    verifiedStatus: 'Verified and Audited Plant Telemetry',
  },
  {
    id: '27',
    headline: 'Hawalli District Establishes Unified Medical Technology Research Center',
    content: 'The municipal district of @Hawalli is partnering with local universities to establish a unified cluster for medical technology research. Upgrades focus on telemedicine diagnostics to support isolated populations.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Kuwait Times', url: 'https://www.kuwaittimes.com' },
      { name: 'Al-Anba', url: 'https://www.alanba.com.kw' }
    ],
    locationTags: ['@Hawalli', '@Kuwait'],
    categoryTags: ['#Educational', '#Local'],
    verifiedStatus: 'Verified via Al-Anba Regional Brief',
  },
  {
    id: '28',
    headline: 'MISINFORMATION BLOCK: Central Bank of UAE Dismisses Deepfake Trading Advice',
    content: 'A viral audio recording allegedly depicting an official of the @Abu Dhabi executive recommending speculative investments has been flagged as simulated. The @Central Bank of UAE verified the synthesis is synthetic and warned public actors to check official channels.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Central Bank of UAE', url: 'https://www.centralbank.ae' },
      { name: 'WAM (Emirates News Agency)', url: 'https://www.wam.ae' }
    ],
    locationTags: ['@Abu Dhabi', '@UAE'],
    categoryTags: ['#Economic', '#Local'],
    verifiedStatus: 'DEBUNKED RUMOR: Verified Artificial Deepfake Audio',
  },
  {
    id: '29',
    headline: 'RUMOR DEBUNKED: Riyadh Metro Municipality Denies Purported Soft-Launch Postponements',
    content: 'Misleading claims on social networks stated that the commercial opening of Riyadh’s public metro corridors in @Riyadh had been indefinitely deferred. The High Commission for @Riyadh Development officially confirmed the testing phases are progressing as scheduled and lines will begin service on the planned Q3 timeline.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'SPA (Saudi Press Agency)', url: 'https://www.spa.gov.sa' },
      { name: 'Saudi Gazette', url: 'https://saudigazette.com.sa' }
    ],
    locationTags: ['@Riyadh', '@Saudi Arabia'],
    categoryTags: ['#Political', '#Local'],
    verifiedStatus: 'DEBUNKED RUMOR: Confirmed Schedule Accurate',
  },
  {
    id: '30',
    headline: 'DISPUTED REPORT: Kuwait and Iraq Resolve Maritime Boundary Logistics Misinterpretations',
    content: 'Initial foreign filings suggested that maritime patrol units in @Kuwait City had arrested commercial logistics trawlers over contested international shipping lanes. The Ministry of Foreign Affairs of @Kuwait cleared the misinformation, stating that a joint coordination audit has successfully aligned maritime tracking coordinates.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1502014822147-1aedfb0676e0?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'KUNA (Kuwait News Agency)', url: 'https://www.kuna.net.kw' },
      { name: 'Sovereign Diplomatic Office', url: '#' }
    ],
    locationTags: ['@Kuwait City', '@Kuwait'],
    categoryTags: ['#Political', '#International', '#Global'],
    verifiedStatus: 'VERIFIED DISPUTE RESOLVED: Aligned Maritime Boundary',
  },
  {
    id: '31',
    headline: 'FACT CHECK: Qatar Free Zone Denies Purported Liquidation Rumors of Green Seeding Fund',
    content: 'Reports originating from overseas forums claiming that the GCC Investment board of @Doha had liquidating its clean-tech startup pool are false. The QFZ Authority in @Doha confirmed that funds are actual, fully backed by sovereign green bonds, and growing.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'QFZ Authority', url: 'https://qfz.gov.qa' },
      { name: 'QNA (Qatar News Agency)', url: 'https://www.qna.org.qa' }
    ],
    locationTags: ['@Doha', '@Qatar'],
    categoryTags: ['#Investment', '#Economic'],
    verifiedStatus: 'FACT CHECK: False Liquidation Claims Refuted',
  },
  {
    id: '32',
    headline: 'RUMOR CLARIFICATION: Bahrain Central Bank Refutes Alleged Crypto Sovereign Fund Partnership',
    content: 'Viral social rumors indicated that the Sovereign Investment Council in @Manama had allocated 5% of assets to high-risk digital assets. The Central Bank of @Bahrain released a strict policy declaring they maintain standard sovereign bond criteria and have no active digital asset trading desk.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Central Bank of Bahrain', url: 'https://www.cbb.gov.bh' },
      { name: 'BNA (Bahrain News Agency)', url: 'https://www.bna.bh' }
    ],
    locationTags: ['@Manama', '@Bahrain'],
    categoryTags: ['#Investment', '#Economic'],
    verifiedStatus: 'DEBUNKED RUMOR: 100% False Investment Rumor Dismissed',
  },
  {
    id: '33',
    headline: 'BORDER FALSE DATA: Oman and UAE Clarify Hatta Entry Visa Fee Misinformation',
    content: 'A flurry of complaints appeared online stating that Hatta land borders between @Dubai and @Muscat had implemented an unannounced fee increase. The Joint Border Coordination Committee issued a unified statement verifying the fees are completely unchanged, and tourists are protected by the standard unified visa regulations.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'ONA (Oman News Agency)', url: 'http://omannews.gov.om' },
      { name: 'WAM (Emirates News Agency)', url: 'https://www.wam.ae' }
    ],
    locationTags: ['@Dubai', '@Muscat', '@UAE', '@Oman'],
    categoryTags: ['#Local', '#International'],
    verifiedStatus: 'VERIFIED MULTI-STATE FACT-CHECK: Tariff Fixed',
  },
  {
    id: '34',
    headline: 'Dubai Freehold Ownership Rumor: Clarification of Municipal Zone Boundaries',
    content: 'Rumors alleging new restrictions with respect to freehold land allocations in @Dubai Marina have been dismissed. The Land Department of @Dubai released a memo confirming that ownership regulations are solid, backed by state decrees, and fully secure for sovereign expatriate investors.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Dubai Land Department', url: 'https://dubailand.gov.ae' },
      { name: 'Gulf News', url: 'https://gulfnews.com' }
    ],
    locationTags: ['@Dubai', '@UAE'],
    categoryTags: ['#Commercial', '#Investment', '#Local'],
    verifiedStatus: 'DEBUNKED MYTH: Regulations Secured',
  },
  {
    id: '35',
    headline: 'Sharjah Environment Council Restores Spilled Waters; Confirms Coastal Safety',
    content: 'After online images showed false coloring near the industrial harbor of @Sharjah, misinformation circulated claiming chemical contamination. High-fidelity water scans by @Sharjah Municipality showed only standard natural organic seaweed sediment shift, confirming complete shoreline safety and pristine biodiversity checks.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1621451537084-482c730737ee?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Sharjah Municipality Desk', url: '#' },
      { name: 'WAM (Emirates News Agency)', url: 'https://www.wam.ae' }
    ],
    locationTags: ['@Sharjah', '@UAE'],
    categoryTags: ['#Local', '#Global'],
    verifiedStatus: 'VERIFIED Coastal Test Completed',
  },
  {
    id: '36',
    headline: 'Saudi Aramco and NEOM Debunk Alleged Solar Installation Delays in Tabuk Area',
    content: 'Disputed reports originating from trade outlets suggested that supply-chain barriers delayed clean energy arrays supporting sustainable hubs near @Riyadh. Saudi Aramco issued a report illustrating a 100% on-time milestone for carbon energy solar plants in Saudi Arabia.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 650).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'SPA (Saudi Press Agency)', url: 'https://www.spa.gov.sa' },
      { name: 'Aramco News Center', url: 'https://www.aramco.com' }
    ],
    locationTags: ['@Riyadh', '@Saudi Arabia'],
    categoryTags: ['#Economic', '#Investment', '#Local'],
    verifiedStatus: 'DEBUNKED CANARD: Projects Verified On Schedule',
  },
  {
    id: '37',
    headline: 'Omani Port Cyber Threat Hoax: Sohar Port Authority Confirms Telemetry Safety',
    content: 'Circulating online blogs hinted that a cyber outage disrupted transport cranes in @Sohar. The Ministry of Transport confirmed that Omani cybersecurity teams ran an audit, demonstrating zero breach of industrial networks; and lines remained at peak capacity.',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    sources: [
      { name: 'Sohar Port Authority Office', url: '#' },
      { name: 'Oman Observer', url: 'https://www.omanobserver.om' }
    ],
    locationTags: ['@Sohar', '@Oman'],
    categoryTags: ['#Commercial', '#Local'],
    verifiedStatus: 'DEBUNKED MYTH: Network Telemetry Secure',
  }
];
