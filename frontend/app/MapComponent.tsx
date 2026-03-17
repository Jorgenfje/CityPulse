'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  coords: [number, number] | null
  city: string
  onCitySelect: (city: string, coords: [number, number]) => void
  fullMap?: boolean
}

const MAJOR_CITIES = [
  { name: 'Oslo',         coords: [59.9139, 10.7522] as [number, number] },
  { name: 'Bergen',       coords: [60.3913, 5.3221]  as [number, number] },
  { name: 'Trondheim',    coords: [63.4305, 10.3951] as [number, number] },
  { name: 'Stavanger',    coords: [58.9700, 5.7331]  as [number, number] },
  { name: 'Tromsø',       coords: [69.6496, 18.9560] as [number, number] },
  { name: 'Bodø',         coords: [67.2804, 14.4049] as [number, number] },
  { name: 'Kristiansand', coords: [58.1599, 8.0182]  as [number, number] },
  { name: 'Ålesund',      coords: [62.4723, 6.1549]  as [number, number] },
  { name: 'Drammen',      coords: [59.7440, 10.2045] as [number, number] },
  { name: 'Fredrikstad',  coords: [59.2181, 10.9298] as [number, number] },
  { name: 'Moss',         coords: [59.4339, 10.6577] as [number, number] },
  { name: 'Sarpsborg',    coords: [59.2842, 11.1097] as [number, number] },
  { name: 'Halden',       coords: [59.1228, 11.3875] as [number, number] },
  { name: 'Hamar',        coords: [60.7945, 11.0679] as [number, number] },
  { name: 'Lillehammer',  coords: [61.1153, 10.4662] as [number, number] },
  { name: 'Tønsberg',     coords: [59.2672, 10.4076] as [number, number] },
  { name: 'Arendal',      coords: [58.4615, 8.7718]  as [number, number] },
  { name: 'Harstad',      coords: [68.7983, 16.5434] as [number, number] },
  { name: 'Haugesund',    coords: [59.4138, 5.2680]  as [number, number] },
  { name: 'Skien',        coords: [59.2090, 9.6094]  as [number, number] },
  { name: 'Sogndal',      coords: [61.2294, 7.1003]  as [number, number] },
  { name: 'Mo i Rana',    coords: [66.3126, 14.1425] as [number, number] },
  { name: 'Kautokeino',   coords: [69.0082, 23.0426] as [number, number] },
]

export default function MapComponent({ coords, city, onCitySelect, fullMap = false }: Props) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<any>(null)
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    import('leaflet').then(L => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
      if (!containerRef.current) return

      const center: [number, number] = fullMap ? [65.0, 15.0] : (coords || [65.0, 15.0])
      const zoom = fullMap ? 4 : 12

      const map = L.map(containerRef.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map)

      if (fullMap) {
        MAJOR_CITIES.forEach(c => {
          const isSelected = c.name.toLowerCase() === city.toLowerCase()
          const marker = L.circleMarker(c.coords, {
            radius: isSelected ? 10 : 7,
            fillColor: isSelected ? '#10b981' : '#6b7280',
            color: '#fff',
            weight: isSelected ? 2 : 1,
            opacity: 1,
            fillOpacity: 0.9,
          }).addTo(map)

          marker.bindTooltip(c.name, {
            permanent: isSelected,
            direction: 'top',
            className: 'citypulse-tooltip',
            offset: [0, -8],
          })

          marker.on('click', () => {
            onCitySelect(c.name, c.coords)
          })
        })
      } else if (coords) {
        const m = L.circleMarker(coords, {
          radius: 8,
          fillColor: '#10b981',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(map)
        markerRef.current = m
      }

      mapRef.current = map

      setTimeout(() => {
        map.invalidateSize()
        if (!fullMap && coords) {
          map.setView(coords, 12)
        }
      }, 150)
    })

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
      markerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !coords || fullMap) return
    import('leaflet').then(L => {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
      const m = L.circleMarker(coords, {
        radius: 8,
        fillColor: '#10b981',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(mapRef.current)
      markerRef.current = m

      setTimeout(() => {
        mapRef.current?.invalidateSize()
        mapRef.current?.setView(coords, 12)
      }, 50)
    })
  }, [coords])

  async function searchCity() {
    if (!search.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search + ', Norge')}&format=json&limit=1&countrycode=no`,
        { headers: { 'User-Agent': 'CityPulse/1.0 (post@fjellstadteknologi.no)' } }
      )
      const data = await res.json()
      if (data.length > 0) {
        const newCoords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)]
        const name = search.charAt(0).toUpperCase() + search.slice(1).toLowerCase()
        onCitySelect(name, newCoords)
        setSearch('')
      }
    } catch (e) {
      console.error(e)
    }
    setSearching(false)
  }

  return (
    <div style={{ position: 'relative', height: fullMap ? '400px' : '220px' }}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>{`
        .citypulse-tooltip {
          background: rgba(0,0,0,0.8) !important;
          border: 1px solid rgba(16,185,129,0.4) !important;
          color: #10b981 !important;
          font-size: 11px !important;
          padding: 2px 8px !important;
          border-radius: 20px !important;
          box-shadow: none !important;
        }
        .citypulse-tooltip::before { display: none !important; }
      `}</style>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />

      {fullMap && (
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, display: 'flex', gap: 8, width: '80%', maxWidth: 320,
        }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchCity()}
            placeholder="Søk etter by..."
            style={{
              flex: 1, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 20, padding: '6px 14px', color: '#fff', fontSize: 12,
              backdropFilter: 'blur(8px)', outline: 'none',
            }}
          />
          <button
            onClick={searchCity}
            disabled={searching}
            style={{
              background: '#10b981', border: 'none', borderRadius: 20,
              padding: '6px 14px', color: '#fff', fontSize: 12,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {searching ? '...' : 'Søk'}
          </button>
        </div>
      )}

      {!fullMap && (
        <div style={{
          position: 'absolute', bottom: 8, left: 8, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', padding: '4px 10px',
          borderRadius: 20, fontSize: 11, color: '#10b981',
          backdropFilter: 'blur(8px)', border: '1px solid rgba(16,185,129,0.3)'
        }}>
          {city}
        </div>
      )}
    </div>
  )
}