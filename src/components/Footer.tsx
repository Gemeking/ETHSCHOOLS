import Link from 'next/link'
import { GraduationCap, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <span className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
                <GraduationCap size={18} />
              </span>
              Ethio<span className="text-primary-400">School</span>
            </Link>
            <p className="text-sm leading-relaxed">
              The most comprehensive school and university directory in Ethiopia. Helping families find the right education.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/schools/type/international" className="hover:text-white transition-colors">International Schools</Link></li>
              <li><Link href="/schools/type/private"       className="hover:text-white transition-colors">Private Schools</Link></li>
              <li><Link href="/schools/type/public"        className="hover:text-white transition-colors">Public Schools</Link></li>
              <li><Link href="/schools/type/tvet"          className="hover:text-white transition-colors">TVET / Technical</Link></li>
              <li><Link href="/universities"               className="hover:text-white transition-colors">Universities</Link></li>
              <li><Link href="/map"                        className="hover:text-white transition-colors">Map View</Link></li>
            </ul>
          </div>

          {/* Popular cities */}
          <div>
            <h4 className="text-white font-semibold mb-3">Schools by City</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/schools/in/bole"      className="hover:text-white transition-colors">Schools in Bole</Link></li>
              <li><Link href="/schools/in/yeka"      className="hover:text-white transition-colors">Schools in Yeka</Link></li>
              <li><Link href="/schools/in/kirkos"    className="hover:text-white transition-colors">Schools in Kirkos</Link></li>
              <li><Link href="/schools/in/bahir-dar" className="hover:text-white transition-colors">Schools in Bahir Dar</Link></li>
              <li><Link href="/schools/in/adama"     className="hover:text-white transition-colors">Schools in Adama</Link></li>
              <li><Link href="/schools/in/hawassa"   className="hover:text-white transition-colors">Schools in Hawassa</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-3">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://t.me/abrolabs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  🏫 Register your school
                </a>
              </li>
              <li>
                <a href="https://t.me/abrolabs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  ⚠️ Report wrong info
                </a>
              </li>
              <li>
                <a href="https://t.me/abrolabs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  💻 Website development
                </a>
              </li>
              <li>
                <a href="https://t.me/abrolabs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  📩 General enquiries
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://t.me/abrolabs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 group"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#229ED9]/20 group-hover:bg-[#229ED9]/40 transition-colors shrink-0">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#229ED9]">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </span>
                  <div>
                    <span className="block text-white font-semibold group-hover:text-[#229ED9] transition-colors">@abrolabs</span>
                    <span className="text-xs text-slate-500">Telegram</span>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="tel:+251937595664"
                  className="flex items-center gap-2.5 group"
                >
                  <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-500/40 transition-colors shrink-0">
                    <Phone size={15} className="text-emerald-400" />
                  </span>
                  <div>
                    <span className="block text-white font-semibold group-hover:text-emerald-400 transition-colors">0937 595 664</span>
                    <span className="text-xs text-slate-500">Call / WhatsApp</span>
                  </div>
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-700 shrink-0">
                  <MapPin size={15} className="text-slate-400" />
                </span>
                <div>
                  <span className="block text-white font-semibold">Ethiopia</span>
                  <span className="text-xs text-slate-500">Addis Ababa</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <span>© {new Date().getFullYear()} EthioSchool Finder. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href="https://t.me/abrolabs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#229ED9]">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              @abrolabs
            </a>
            <span className="text-slate-700">·</span>
            <a href="tel:+251937595664" className="hover:text-white transition-colors">0937 595 664</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
