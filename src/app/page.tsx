import Link from 'next/link'
import { Search, MapPin, ArrowRight, Globe, Lock, Building2, Users, Star, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SchoolCard from '@/components/SchoolCard'
import { schools, stats } from '@/lib/data'

const FEATURED_IDS = [1, 2, 38] // ICS, Sandford, Tafari Makonnen

export default function HomePage() {
  const featured = FEATURED_IDS.map((id) => schools.find((s) => s.id === id)).filter(Boolean) as typeof schools

  const typeCards = [
    { type: 'international', label: 'International', count: stats.international, icon: Globe, color: 'from-violet-500 to-indigo-600', href: '/schools?type=international', desc: 'IB, Cambridge, American & French curricula' },
    { type: 'private', label: 'Private', count: stats.private, icon: Lock, color: 'from-blue-500 to-cyan-600', href: '/schools?type=private', desc: 'Quality education at various price points' },
    { type: 'public', label: 'Public', count: stats.public, icon: Building2, color: 'from-green-500 to-emerald-600', href: '/schools?type=public', desc: 'Government schools — free for all students' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 text-white overflow-hidden">
        {/* Ethiopian flag stripe */}
        <div className="absolute top-0 left-0 right-0 flex h-1">
          <div className="flex-1 bg-ethiopia-green" />
          <div className="flex-1 bg-ethiopia-yellow" />
          <div className="flex-1 bg-ethiopia-red" />
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-green-500/10" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-green-500/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-green-900/20" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <MapPin size={14} className="text-green-400" />
            <span className="text-slate-300">Addis Ababa, Ethiopia</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
            Find the Perfect{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              School
            </span>{' '}
            in Ethiopia
          </h1>

          <p className="text-lg text-slate-300 max-w-xl mx-auto mb-10">
            Search and compare {stats.total}+ schools across {stats.subCities} sub-cities.
            Filter by type, price, location, and curriculum.
          </p>

          {/* Search bar */}
          <form action="/schools" method="get" className="max-w-2xl mx-auto">
            <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-2xl">
              <div className="flex-1 flex items-center gap-3 px-3">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search by school name, sub-city, or curriculum..."
                  className="flex-1 text-slate-800 placeholder-slate-400 outline-none text-sm bg-transparent py-2"
                />
              </div>
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {[
              { label: 'All Schools', href: '/schools' },
              { label: 'International', href: '/schools?type=international' },
              { label: 'Private', href: '/schools?type=private' },
              { label: 'Free / Public', href: '/schools?type=public' },
              { label: 'Bole Area', href: '/schools?city=Bole' },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition-all"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { value: stats.total + '+', label: 'Schools Listed' },
            { value: stats.subCities, label: 'Sub-cities' },
            { value: '11', label: 'Curricula Types' },
            { value: 'Free', label: 'Always Free to Search' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-extrabold text-primary-600">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BROWSE BY TYPE ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Browse by School Type</h2>
          <p className="text-slate-500 mt-2">Choose the education style that fits your family</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {typeCards.map(({ label, count, icon: Icon, color, href, desc }) => (
            <Link
              key={label}
              href={href}
              className="group relative bg-gradient-to-br rounded-2xl overflow-hidden p-6 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-100`} />
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
      <section className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm mb-1">
                <Star size={14} fill="currentColor" /> Featured Schools
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Top Schools in Addis Ababa</h2>
            </div>
            <Link
              href="/schools"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              View all {stats.total} schools <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((school) => (
              <SchoolCard key={school.id} school={school} featured />
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Link href="/schools" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
              View all {stats.total} schools <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── MAP CTA ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
              See every school pinned on a live map of Addis Ababa.
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
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How It Works</h2>
            <p className="text-slate-500 mt-2">Finding a great school has never been easier</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Search', desc: 'Type a school name, sub-city, or browse by category' },
              { step: '02', title: 'Filter', desc: 'Narrow down by price, type, curriculum, and location' },
              { step: '03', title: 'Connect', desc: 'Get the school contact info and visit the school' },
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

      {/* ── FIND A SCHOOL CTA ── */}
      <section className="bg-primary-600 py-14 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <Users size={40} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to find the right school?</h2>
          <p className="text-primary-100 mb-6 text-sm">Browse {stats.total}+ schools across all sub-cities of Addis Ababa</p>
          <Link
            href="/schools"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-3.5 rounded-2xl hover:bg-primary-50 transition-colors shadow-lg"
          >
            Browse All Schools <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
