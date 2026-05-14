import Link from 'next/link'
import { GraduationCap, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <span className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
                <GraduationCap size={18} />
              </span>
              Ethio<span className="text-primary-400">School</span>
            </Link>
            <p className="text-sm leading-relaxed">
              The most comprehensive school directory in Ethiopia.
              Helping parents find the perfect school for their children.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/schools?type=international" className="hover:text-white transition-colors">International Schools</Link></li>
              <li><Link href="/schools?type=private" className="hover:text-white transition-colors">Private Schools</Link></li>
              <li><Link href="/schools?type=public" className="hover:text-white transition-colors">Public Schools</Link></li>
              <li><Link href="/map" className="hover:text-white transition-colors">School Map</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><MapPin size={14} /> Ethiopia</li>
              <li className="flex items-center gap-2"><Mail size={14} /> info@ethioschool.et</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-6 text-sm text-center">
          © {new Date().getFullYear()} EthioSchool Finder. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
