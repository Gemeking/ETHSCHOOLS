import Link from 'next/link'
import {
  Search, MapPin, ArrowRight, Globe, Lock, Building2, Users, Star,
  ChevronRight, GraduationCap, BookOpen, CheckCircle
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
  const featured = FEATURED_SCHOOL_IDS
    .map((id) => schools.find((s) => s.id === id))
    .filter(Boolean) as typeof schools

  const featuredUnis = FEATURED_UNI_IDS
    .map((id) => universities.find((u) => u.id === id))
    .filter(Boolean) as typeof universities

  const typeCards = [
    {
      type: 'international', label: 'International', count: stats.international,
      icon: Globe, color: 'from-violet-500 to-indigo-600',
      href: '/schools?type=international', desc: 'IB, Cambridge, American & French curricula',
    },
    {
      type: 'private', label: 'Private', count: stats.private,
      icon: Lock, color: 'from-blue-500 to-cyan-600',
      href: '/schools?type=private', desc: 'Quality education at various price points',
    },
    {
      type: 'public', label: 'Public', count: stats.public,
      icon: Building2, color: 'from-green-500 to-emerald-600',
      href: '/schools?type=public', desc: 'Government schools — free for all students',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 text-white overflow-hidden">
        {/* Ethiopian flag stripe */}
        <div className="absolute top-0 left-0 right-0 flex h-1.5">
          <div className="flex-1 bg-ethiopia-green" />
          <div className="flex-1 bg-ethiopia-yellow" />
          <div className="flex-1 bg-ethiopia-red" />
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-green-500/10" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-green-500/10" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Left: text + search */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-5">
                <MapPin size={13} className="text-green-400" />
                <span className="text-slate-300">Schools & Universities across Ethiopia</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
                Find the Perfect{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                  School
                </span>{' '}
                or{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
                  University
                </span>
                <br />in Ethiopia
              </h1>

              <p className="text-slate-300 max-w-lg mb-8 text-base lg:mx-0 mx-auto">
                Search and compare {stats.total}+ schools and {universityStats.total}+ universities.
                Filter by type, location, fees, and programs.
              </p>

              {/* Search */}
              <form action="/schools" method="get" className="max-w-lg mx-auto lg:mx-0">
                <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-2xl">
                  <div className="flex-1 flex items-center gap-3 px-3">
                    <Search size={17} className="text-slate-400 shrink-0" />
                    <input
                      type="text"
                      name="q"
                      placeholder="School name, sub-city, or curriculum..."
                      className="flex-1 text-slate-800 placeholder-slate-400 outline-none text-sm bg-transparent py-2"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm shrink-0"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Quick links */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-4">
                {[
                  { label: 'All Schools', href: '/schools' },
                  { label: 'International', href: '/schools?type=international' },
                  { label: 'Free Public', href: '/schools?type=public' },
                  { label: 'Universities', href: '/universities' },
                  { label: 'Map View', href: '/map' },
                ].map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: visual showcase cards */}
            <div className="hidden lg:flex flex-col gap-3 w-72 shrink-0">
              {/* Type preview cards */}
              {[
                { gradient: 'from-violet-600 to-indigo-700', icon: Globe, label: 'International Schools', count: stats.international, sample: 'IB · Cambridge · American' },
                { gradient: 'from-blue-600 to-cyan-700', icon: Lock, label: 'Private Schools', count: stats.private, sample: 'Ethiopian Curriculum · Private' },
                { gradient: 'from-emerald-600 to-teal-700', icon: GraduationCap, label: 'Universities', count: universityStats.total, sample: 'Nationwide · All regions' },
              ].map(({ gradient, icon: Icon, label, count, sample }) => (
                <div key={label} className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-4 overflow-hidden`}>
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                  <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm">{label}</div>
                      <div className="text-white/70 text-xs mt-0.5">{sample}</div>
                    </div>
                    <div className="text-2xl font-black text-white/80 shrink-0">{count}</div>
                  </div>
                </div>
              ))}

              {/* Verified badge teaser */}
              <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl p-3.5">
                <CheckCircle size={18} className="text-green-400 shrink-0" />
                <div>
                  <div className="text-white text-xs font-semibold">Verified listings</div>
                  <div className="text-white/60 text-xs">Data verified by our team</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { value: `${stats.total}+`, label: 'Schools Listed' },
            { value: `${universityStats.total}+`, label: 'Universities' },
            { value: `${universityStats.regions}`, label: 'Regions Covered' },
            { value: 'Free', label: 'Always Free to Search' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-extrabold text-primary-600">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BROWSE BY SCHOOL TYPE ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Browse Schools by Type</h2>
          <p className="text-slate-500 mt-2">Choose the education style that fits your family</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {typeCards.map(({ label, count, icon: Icon, color, href, desc }) => (
            <Link
              key={label}
              href={href}
              className="group relative rounded-2xl overflow-hidden p-6 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${color}`} />
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-16 translate-x-16" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon size={24} />
                  </div>
                  <span className="text-3xl font-black text-white/80">{count}</span>
                </div>
                <h3 className="text-xl font-bold mb-1">{label} Schools</h3>
                <p className="text-sm text-white/70 mb-4">{desc}</p>
                <div className="flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all">
                  Browse {label} <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED SCHOOLS ── */}
      <section className="bg-slate-50 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-7">
            <div>
              <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm mb-1">
                <Star size={14} fill="currentColor" /> Featured Schools
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Top Schools in Ethiopia</h2>
            </div>
            <Link
              href="/schools"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              View all {stats.total} schools <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((school) => (
              <SchoolCard key={school.id} school={school} featured />
            ))}
          </div>
          <div className="mt-5 text-center sm:hidden">
            <Link href="/schools" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
              View all {stats.total} schools <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── UNIVERSITIES SECTION ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-7">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-1">
              <GraduationCap size={14} /> Higher Education
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Universities Across Ethiopia</h2>
            <p className="text-slate-500 mt-1 text-sm">
              Explore {universityStats.total} universities in {universityStats.regions} regions
            </p>
          </div>
          <Link
            href="/universities"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            View all universities <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {featuredUnis.map((uni) => (
            <UniversityCard key={uni.id} university={uni} featured />
          ))}
        </div>

        {/* University stats */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { value: universityStats.public, label: 'Public Universities', color: 'text-emerald-600' },
              { value: universityStats.private, label: 'Private Universities', color: 'text-blue-600' },
              { value: universityStats.regions, label: 'Regions Covered', color: 'text-teal-600' },
              {
                value: universities.reduce((s, u) => s + u.departments.reduce((x, d) => x + d.programs.length, 0), 0) + '+',
                label: 'Total Programs',
                color: 'text-indigo-600',
              },
            ].map(({ value, label, color }) => (
              <div key={label}>
                <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 text-center">
            <Link
              href="/universities"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              <BookOpen size={16} /> Explore All Universities
            </Link>
          </div>
        </div>
      </section>

      {/* ── MAP CTA ── */}
      <section className="bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-gradient-to-r from-slate-900 to-green-950 rounded-3xl overflow-hidden p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center gap-8">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-green-500/10 translate-x-32 -translate-y-32" />
            </div>
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-2 text-green-400 font-semibold text-sm mb-2">
                <MapPin size={14} /> Interactive Map
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Explore Schools on the Map</h2>
              <p className="text-slate-300 text-sm max-w-md">
                See every school pinned on a live map of Ethiopia.
                Find schools near your home, workplace, or preferred area.
              </p>
            </div>
            <Link
              href="/map"
              className="relative z-10 flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-lg shrink-0"
            >
              <MapPin size={18} /> Open Map View
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white py-14 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="text-slate-500 mt-2">Finding the right school or university has never been easier</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Search', desc: 'Type a school or university name, city, or browse by category and region' },
              { step: '02', title: 'Filter', desc: 'Narrow down by price, type, curriculum, location, and programs offered' },
              { step: '03', title: 'Connect', desc: 'Get contact info, see the map location, and reach the institution directly' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 font-black text-xl mb-4">
                  {step}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-primary-600 py-14 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <Users size={40} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to find the right institution?</h2>
          <p className="text-primary-100 mb-6 text-sm">
            Browse {stats.total}+ schools and {universityStats.total}+ universities across Ethiopia
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/schools"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-bold px-7 py-3.5 rounded-2xl hover:bg-primary-50 transition-colors shadow-lg"
            >
              Browse Schools <ArrowRight size={16} />
            </Link>
            <Link
              href="/universities"
              className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-7 py-3.5 rounded-2xl transition-colors border border-white/30"
            >
              <GraduationCap size={16} /> Browse Universities
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
