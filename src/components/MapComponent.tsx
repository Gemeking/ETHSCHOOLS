'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import type { School } from '@/lib/types'
import { typeLabel } from '@/lib/utils'

// Fix default marker icons in Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const markerColors: Record<School['school_type'], string> = {
  international: '#7c3aed',
  private: '#1d4ed8',
  public: '#15803d',
}

function makeIcon(type: School['school_type']) {
  const color = markerColors[type]
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.383 0 0 5.383 0 12c0 9 12 24 12 24s12-15 12-24C24 5.383 18.617 0 12 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  })
}

interface Props {
  schools: School[]
  center?: [number, number]
  zoom?: number
  height?: string
}

export default function MapComponent({ schools, center = [9.02, 38.75], zoom = 12, height = '100%' }: Props) {
  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {schools.map((school) => (
          <Marker
            key={school.id}
            position={[school.latitude, school.longitude]}
            icon={makeIcon(school.school_type)}
          >
            <Popup maxWidth={260}>
              <div className="p-1">
                <div className="font-bold text-slate-900 text-sm mb-0.5">{school.name_en}</div>
                <div className="text-xs text-slate-500 mb-2">{school.sub_city}</div>
                <div className="flex gap-2 text-xs mb-3">
                  <span className="bg-slate-100 px-2 py-0.5 rounded-full">{typeLabel(school.school_type)}</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-full">{school.fee_range_etb.includes('Free') ? 'Free' : `${school.fee_range_etb} ETB`}</span>
                </div>
                <Link
                  href={`/schools/${school.id}`}
                  className="block text-center text-xs font-semibold bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
