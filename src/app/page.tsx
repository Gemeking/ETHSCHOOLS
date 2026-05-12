"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Search, MapPin, ArrowRight, Globe, Lock, Building2, Users, Star,
  ChevronRight, GraduationCap, BookOpen, CheckCircle, Layers,
  Compass, Sparkles, Target, Shield
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SchoolCard from '@/components/SchoolCard'
import UniversityCard from '@/components/UniversityCard'
import { schools, stats } from '@/lib/data'
import { universities, universityStats } from '@/lib/university-data'

const FEATURED_SCHOOL_IDS = [1, 2, 38]
const FEATURED_UNI_IDS = [1, 3, 5] // AAU, Jimma, Bahir Dar

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [language, setLanguage] = useState<'en' | 'am'>('en')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const featured = FEATURED_SCHOOL_IDS
    .map((id) => schools.find((s) => s.id === id))
    .filter(Boolean) as typeof schools

  const featuredUnis = FEATURED_UNI_IDS
    .map((id) => universities.find((u) => u.id === id))
    .filter(Boolean) as typeof universities

  // Content dictionary for bilingual support
  const content = {
    en: {
      nav: { schools: 'Schools', universities: 'Universities', map: 'Map', dashboard: 'Dashboard' },
      hero: {
        badge: 'Schools & Universities across Ethiopia',
        title1: 'Find the Perfect',
        title2: 'School',
        title3: 'or',
        title4: 'University',
        title5: 'in Ethiopia',
        subtitle: 'Search and compare 500+ schools and 60+ universities. Filter by type, location, fees, and programs.',
        searchPlaceholder: 'School name, sub-city, or curriculum...',
        searchBtn: 'Search',
        quickLinks: ['All Schools', 'International', 'Free Public', 'Universities', 'Map View']
      },
      stats: [
        { label: 'Schools Listed' },
        { label: 'Universities' },
        { label: 'Regions Covered' },
        { label: 'Free to Search' }
      ],
      browseTypes: {
        title: 'Browse by Institution Type',
        subtitle: 'Choose the education path that aligns with your aspirations',
        types: [
          { label: 'International', desc: 'IB, Cambridge, American & French curricula' },
          { label: 'Private', desc: 'Premium education with modern facilities' },
          { label: 'Public', desc: 'Government institutions accessible to all' }
        ]
      },
      featuredSchools: {
        badge: 'Featured Institutions',
        title: 'Premier Schools in Addis Ababa',
        viewAll: 'View all schools'
      },
      universities: {
        badge: 'Higher Education',
        title: 'Universities Across Ethiopia',
        subtitle: 'Explore comprehensive programs nationwide',
        viewAll: 'View all universities',
        stats: [
          { label: 'Public Universities' },
          { label: 'Private Universities' },
          { label: 'Regions Covered' },
          { label: 'Total Programs' }
        ],
        cta: 'Explore All Universities'
      },
      mapCta: {
        badge: 'Location Intelligence',
        title: 'Discover on Interactive Map',
        subtitle: 'Visualize every institution on a dynamic map of Ethiopia. Find schools and universities near your preferred location.',
        button: 'Open Map Interface'
      },
      howItWorks: {
        title: 'Streamlined Process',
        subtitle: 'Three steps to your educational match',
        steps: [
          { title: 'Search', desc: 'Enter institution name, city, or browse categories' },
          { title: 'Filter', desc: 'Refine by type, fees, location, and programs' },
          { title: 'Connect', desc: 'Access direct contact and location details' }
        ]
      },
      cta: {
        title: 'Ready to discover your path?',
        subtitle: "Explore Ethiopia's most comprehensive education directory",
        buttons: { schools: 'Browse Schools', universities: 'Browse Universities' }
      }
    },
    am: {
      nav: { schools: 'ትምህርት ቤቶች', universities: 'ዩኒቨርሲቲዎች', map: 'ካርታ', dashboard: 'ዳሽቦርድ' },
      hero: {
        badge: 'በኢትዮጵያ ውስጥ ትምህርት ቤቶች እና ዩኒቨርሲቲዎች',
        title1: 'ፍጹሙን',
        title2: 'ትምህርት ቤት',
        title3: 'ወይም',
        title4: 'ዩኒቨርሲቲ',
        title5: 'በኢትዮጵያ ያግኙ',
        subtitle: 'ከ500+ ትምህርት ቤቶች እና ከ60+ ዩኒቨርሲቲዎች መካከል ይፈልጉ እና ያወዳድሩ። በአይነት፣ በአካባቢ፣ በክፍያ እና በፕሮግራሞች ይፈልጉ።',
        searchPlaceholder: 'የትምህርት ቤት ስም፣ ንዑስ ከተማ ወይም ሥርዓተ ትምህርት...',
        searchBtn: 'ፈልግ',
        quickLinks: ['ሁሉም ትምህርት ቤቶች', 'አለም አቀፍ', 'ነጻ መንግስታዊ', 'ዩኒቨርሲቲዎች', 'ካርታ እይታ']
      },
      stats: [
        { label: 'የተዘረዘሩ ትምህርት ቤቶች' },
        { label: 'ዩኒቨርሲቲዎች' },
        { label: 'የተሸፈኑ ክልሎች' },
        { label: 'ለመፈለግ ነጻ' }
      ],
      browseTypes: {
        title: 'በተቋም አይነት ይመልከቱ',
        subtitle: 'ከምኞትዎ ጋር የሚስማማ የትምህርት መንገድ ይምረጡ',
        types: [
          { label: 'አለም አቀፍ', desc: 'አይቢ፣ ካምብሪጅ፣ አሜሪካዊ እና ፈረንሳዊ መርሃ ግብሮች' },
          { label: 'ግል', desc: 'ዘመናዊ መገልገያዎች ያሉት ጥራት ያለው ትምህርት' },
          { label: 'መንግስታዊ', desc: 'ለሁሉም ተደራሽ የሆኑ መንግስታዊ ተቋማት' }
        ]
      },
      featuredSchools: {
        badge: 'የተመረጡ ተቋማት',
        title: 'በአዲስ አበባ ውስጥ ዋና ትምህርት ቤቶች',
        viewAll: 'ሁሉንም ትምህርት ቤቶች ይመልከቱ'
      },
      universities: {
        badge: 'ከፍተኛ ትምህርት',
        title: 'በኢትዮጵያ ያሉ ዩኒቨርሲቲዎች',
        subtitle: 'በአገር አቀፍ ደረጃ አጠቃላይ ፕሮግራሞችን ያስሱ',
        viewAll: 'ሁሉንም ዩኒቨርሲቲዎች ይመልከቱ',
        stats: [
          { label: 'መንግስታዊ ዩኒቨርሲቲዎች' },
          { label: 'ግል ዩኒቨርሲቲዎች' },
          { label: 'የተሸፈኑ ክልሎች' },
          { label: 'ጠቅላላ ፕሮግራሞች' }
        ],
        cta: 'ሁሉንም ዩኒቨርሲቲዎች ያስሱ'
      },
      mapCta: {
        badge: 'የአካባቢ መረጃ',
        title: 'በይነተገናኝ ካርታ ላይ ያግኙ',
        subtitle: 'በኢትዮጵያ ተለዋዋጭ ካርታ ላይ እያንዳንዱን ተቋም ይመልከቱ። በሚመርጡት አካባቢ አቅራቢያ ትምህርት ቤቶችን እና ዩኒቨርሲቲዎችን ያግኙ።',
        button: 'ካርታ በይነገጽ ይክፈቱ'
      },
      howItWorks: {
        title: 'የተስተካከለ ሂደት',
        subtitle: 'ወደ ትምህርትዎ ግጥሚያ ሶስት ደረጃዎች',
        steps: [
          { title: 'ፈልግ', desc: 'የተቋም ስም፣ ከተማ ወይም ምድብ ያስገቡ' },
          { title: 'አጣራ', desc: 'በአይነት፣ በክፍያ፣ በአካባቢ እና በፕሮግራሞች ይጥሩ' },
          { title: 'ተገናኝ', desc: 'ቀጥተኛ ግንኙነት እና አካባቢ ዝርዝሮችን ያግኙ' }
        ]
      },
      cta: {
        title: 'መንገድዎን ለማግኘት ዝግጁ ነዎት?',
        subtitle: 'የኢትዮጵያ አጠቃላይ የትምህርት ማውጫ',
        buttons: { schools: 'ትምህርት ቤቶችን ይመልከቱ', universities: 'ዩኒቨርሲቲዎችን ይመልከቱ' }
      }
    }
  }

  const t = content[language]
  const heroT = t.hero
  const statsT = t.stats
  const browseT = t.browseTypes
  const featuredT = t.featuredSchools
  const uniT = t.universities
  const mapT = t.mapCta
  const howT = t.howItWorks
  const ctaT = t.cta

  const typeCards = [
    {
      type: 'international', label: browseT.types[0].label, count: stats.international,
      icon: Globe, color: 'from-violet-600 to-indigo-700',
      href: '/schools?type=international', desc: browseT.types[0].desc,
    },
    {
      type: 'private', label: browseT.types[1].label, count: stats.private,
      icon: Lock, color: 'from-blue-600 to-cyan-700',
      href: '/schools?type=private', desc: browseT.types[1].desc,
    },
    {
      type: 'public', label: browseT.types[2].label, count: stats.public,
      icon: Building2, color: 'from-emerald-600 to-teal-700',
      href: '/schools?type=public', desc: browseT.types[2].desc,
    },
  ]

  const totalPrograms = universities.reduce((sum, uni) => sum + uni.departments.reduce((s, d) => s + d.programs.length, 0), 0)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Language Switcher - Floating Pill */}
      <div className="fixed top-24 right-4 z-50 flex gap-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-slate-200 p-1">
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
            language === 'en' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('am')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 font-sans ${
            language === 'am' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          አማ
        </button>
      </div>

      <Navbar />

      {/* ── HERO SECTION with enhanced design ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 text-white overflow-hidden">
        {/* Ethiopian flag stripe */}
        <div className="absolute top-0 left-0 right-0 flex h-1.5 z-10">
          <div className="flex-1 bg-ethiopia-green" />
          <div className="flex-1 bg-ethiopia-yellow" />
          <div className="flex-1 bg-ethiopia-red" />
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-green-500/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-green-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-green-500/5 to-emerald-500/5 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 lg:pt-20 lg:pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left: text + search */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6 animate-fade-in">
                <MapPin size={13} className="text-green-400" />
                <span className="text-slate-300">{heroT.badge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-slide-up">
                {heroT.title1}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                  {heroT.title2}
                </span>{' '}
                {heroT.title3}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
                  {heroT.title4}
                </span>
                <br />
                <span className="text-white/90">{heroT.title5}</span>
              </h1>

              <p className="text-slate-300 max-w-lg text-lg mb-8 lg:mx-0 mx-auto animate-fade-in-up">
                {heroT.subtitle}
              </p>

              {/* Search Form */}
              <form action="/schools" method="get" className="max-w-lg mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-2xl ring-1 ring-black/5">
                  <div className="flex-1 flex items-center gap-3 px-3">
                    <Search size={18} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      name="q"
                      placeholder={heroT.searchPlaceholder}
                      className="flex-1 text-slate-800 placeholder:text-slate-400 outline-none text-sm bg-transparent py-2.5"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-sm shrink-0"
                  >
                    {heroT.searchBtn}
                  </button>
                </div>
              </form>

              {/* Quick links */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {heroT.quickLinks.map((label, idx) => {
                  const hrefs = ['/schools', '/schools?type=international', '/schools?type=public', '/universities', '/map']
                  return (
                    <Link
                      key={idx}
                      href={hrefs[idx]}
                      className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all duration-200"
                    >
                      {label}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right: visual showcase cards */}
            <div className="hidden lg:flex flex-col gap-3 w-80 shrink-0 animate-fade-in-right">
              {[
                { gradient: 'from-violet-600 to-indigo-700', icon: Globe, label: typeCards[0].label, count: stats.international, sample: 'IB · Cambridge · American' },
                { gradient: 'from-blue-600 to-cyan-700', icon: Lock, label: typeCards[1].label, count: stats.private, sample: 'Ethiopian Curriculum · Private' },
                { gradient: 'from-emerald-600 to-teal-700', icon: GraduationCap, label: language === 'en' ? 'Universities' : 'ዩኒቨርሲቲዎች', count: universityStats.total, sample: language === 'en' ? 'Nationwide · All regions' : 'በሀገር አቀፍ ደረጃ · ሁሉም ክልሎች' },
              ].map((item, idx) => (
                <div key={idx} className={`relative bg-gradient-to-br ${item.gradient} rounded-2xl p-4 overflow-hidden group hover:scale-105 transition-transform duration-300`}>
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10 group-hover:bg-white/20 transition-all" />
                  <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <item.icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm">{item.label}</div>
                      <div className="text-white/70 text-xs mt-0.5">{item.sample}</div>
                    </div>
                    <div className="text-2xl font-black text-white/80 shrink-0">{item.count}</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl p-3.5">
                <Shield size={18} className="text-green-400 shrink-0" />
                <div>
                  <div className="text-white text-xs font-semibold">{language === 'en' ? 'Verified listings' : 'የተረጋገጡ ዝርዝሮች'}</div>
                  <div className="text-white/60 text-xs">{language === 'en' ? 'Data verified by our team' : 'መረጃ በቡድናችን የተረጋገጠ'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR with animation ── */}
      <section className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { value: `${stats.total}+`, label: statsT[0].label },
            { value: `${universityStats.total}+`, label: statsT[1].label },
            { value: `${universityStats.regions}`, label: statsT[2].label },
            { value: language === 'en' ? 'Free' : 'ነጻ', label: statsT[3].label },
          ].map((item, idx) => (
            <div key={idx} className="group">
              <div className="text-2xl sm:text-3xl font-extrabold text-primary-600 group-hover:scale-105 transition-transform duration-200">
                {item.value}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 tracking-wide">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BROWSE BY SCHOOL TYPE ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <Layers size={14} /> {language === 'en' ? 'Categories' : 'ምድቦች'}
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">{browseT.title}</h2>
          <p className="text-slate-500 mt-3 max-w-lg mx-auto">{browseT.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {typeCards.map((card, idx) => (
            <Link
              key={card.label}
              href={card.href}
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} transition-transform duration-700 group-hover:scale-110`} />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              <div className="relative z-10 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <card.icon size={24} />
                  </div>
                  <span className="text-3xl font-black text-white/90">{card.count}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">{card.label}</h3>
                <p className="text-sm text-white/80 mb-4 leading-relaxed">{card.desc}</p>
                <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all">
                  {language === 'en' ? 'Browse' : 'ያስሱ'} <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED SCHOOLS ── */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm mb-2">
                <Star size={14} fill="currentColor" /> {featuredT.badge}
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">{featuredT.title}</h2>
            </div>
            <Link
              href="/schools"
              className="group flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm border border-primary-200 hover:border-primary-300 rounded-full px-5 py-2.5 transition-all"
            >
              {featuredT.viewAll} <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {featured.map((school, idx) => (
              <div key={school.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <SchoolCard school={school} featured />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UNIVERSITIES SECTION ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-2">
              <GraduationCap size={14} /> {uniT.badge}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">{uniT.title}</h2>
            <p className="text-slate-500 mt-2 text-sm">{uniT.subtitle}</p>
          </div>
          <Link
            href="/universities"
            className="group flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold text-sm border border-emerald-200 hover:border-emerald-300 rounded-full px-5 py-2.5 transition-all"
          >
            {uniT.viewAll} <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mb-12">
          {featuredUnis.map((uni, idx) => (
            <div key={uni.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <UniversityCard university={uni} featured />
            </div>
          ))}
        </div>

        {/* University stats */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-8 border border-emerald-100 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: universityStats.public, label: uniT.stats[0].label, color: 'text-emerald-700' },
              { value: universityStats.private, label: uniT.stats[1].label, color: 'text-blue-700' },
              { value: universityStats.regions, label: uniT.stats[2].label, color: 'text-teal-700' },
              { value: totalPrograms + '+', label: uniT.stats[3].label, color: 'text-indigo-700' },
            ].map((item, idx) => (
              <div key={idx} className="group">
                <div className={`text-2xl sm:text-3xl font-extrabold ${item.color} group-hover:scale-105 transition-transform`}>
                  {item.value}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/universities"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <BookOpen size={16} /> {uniT.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* ── MAP CTA ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="relative p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-8 justify-between">
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs font-semibold text-emerald-300 mb-4">
                  <Compass size={12} /> {mapT.badge}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">{mapT.title}</h2>
                <p className="text-slate-300 max-w-md text-sm leading-relaxed">{mapT.subtitle}</p>
              </div>
              <Link
                href="/map"
                className="group flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <MapPin size={18} /> {mapT.button}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white py-16 lg:py-20 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 py-1.5 text-sm font-semibold text-slate-700 mb-4">
              <Target size={14} /> {language === 'en' ? 'Process' : 'ሂደት'}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">{howT.title}</h2>
            <p className="text-slate-500 mt-3">{howT.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {howT.steps.map((step, idx) => (
              <div key={idx} className="text-center group">
                <div className="relative w-20 h-20 mx-auto mb-5">
                  <div className="absolute inset-0 bg-primary-100 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
                  <div className="relative bg-primary-600 text-white w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-primary-700 py-16 lg:py-20 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary-600/0 via-white/5 to-primary-800/0" />
        <div className="relative max-w-3xl mx-auto px-4">
          <Sparkles size={36} className="mx-auto mb-5 opacity-80" />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 tracking-tight">{ctaT.title}</h2>
          <p className="text-primary-100 mb-8 text-base max-w-md mx-auto">{ctaT.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/schools"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-bold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl"
            >
              {ctaT.buttons.schools} <ArrowRight size={16} />
            </Link>
            <Link
              href="/universities"
              className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold px-8 py-3.5 rounded-xl transition-all border border-white/30"
            >
              <GraduationCap size={16} /> {ctaT.buttons.universities}
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Global animation styles */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.7s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}