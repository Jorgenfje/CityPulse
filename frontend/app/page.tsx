'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false })

const CITY_META: Record<string, { tagline: string, gradient: string }> = {
  Oslo:         { tagline: 'Hovedstaden',      gradient: 'from-blue-950 via-slate-900 to-gray-950' },
  Bergen:       { tagline: 'Fjordenes by',     gradient: 'from-cyan-950 via-slate-900 to-gray-950' },
  Trondheim:    { tagline: 'Midtens rike',     gradient: 'from-purple-950 via-slate-900 to-gray-950' },
  Stavanger:    { tagline: 'Oljehovedstaden',  gradient: 'from-orange-950 via-slate-900 to-gray-950' },
  Tromsø:       { tagline: 'Nord-Norges hjerte',gradient: 'from-indigo-950 via-slate-900 to-gray-950' },
  Bodø:         { tagline: 'Arktisk by',       gradient: 'from-sky-950 via-slate-900 to-gray-950' },
  Kristiansand: { tagline: 'Sørlandet',        gradient: 'from-rose-950 via-slate-900 to-gray-950' },
  Ålesund:      { tagline: 'Jugendstilbyen',   gradient: 'from-teal-950 via-slate-900 to-gray-950' },
  Drammen:      { tagline: 'Byens puls',       gradient: 'from-lime-950 via-slate-900 to-gray-950' },
  Fredrikstad:  { tagline: 'Østfolds perle',   gradient: 'from-emerald-950 via-slate-900 to-gray-950' },
  Moss:         { tagline: 'Mossesundet',      gradient: 'from-violet-950 via-slate-900 to-gray-950' },
  Sarpsborg:    { tagline: 'Historisk by',     gradient: 'from-amber-950 via-slate-900 to-gray-950' },
  Halden:       { tagline: 'Grensebyen',       gradient: 'from-red-950 via-slate-900 to-gray-950' },
  Hamar:        { tagline: 'Innlandets by',    gradient: 'from-green-950 via-slate-900 to-gray-950' },
  Lillehammer:  { tagline: 'OL-byen',          gradient: 'from-yellow-950 via-slate-900 to-gray-950' },
  Tønsberg:     { tagline: 'Norges eldste by', gradient: 'from-pink-950 via-slate-900 to-gray-950' },
  Arendal:      { tagline: 'Aust-Agder',       gradient: 'from-fuchsia-950 via-slate-900 to-gray-950' },
  Harstad:      { tagline: 'Troms og Ofoten',  gradient: 'from-cyan-950 via-slate-900 to-gray-950' },
  Haugesund:    { tagline: 'Vestlandets perle',  gradient: 'from-orange-950 via-slate-900 to-gray-950' },
  Skien:        { tagline: 'Ibsens hjemby',      gradient: 'from-stone-950 via-slate-900 to-gray-950' },
  Sogndal:      { tagline: 'Fjordlandet',        gradient: 'from-emerald-950 via-slate-900 to-gray-950' },
  'Mo i Rana':  { tagline: 'Porten til Nord',    gradient: 'from-slate-900 via-blue-950 to-gray-950' },
  Kautokeino:   { tagline: 'Samenes hjerte',     gradient: 'from-purple-950 via-slate-900 to-gray-950' },
  default:      { tagline: 'Norge',            gradient: 'from-slate-900 via-slate-900 to-gray-950' },
}

function getWeatherIcon(temp: number): string {
  if (temp <= 0) return '❄️'
  if (temp <= 5) return '🌨️'
  if (temp <= 10) return '🌥️'
  if (temp <= 18) return '⛅'
  return '☀️'
}

export default function Home() {
  const [city, setCity] = useState('Oslo')
  const [coords, setCoords] = useState<[number, number]>([59.9139, 10.7522])
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<any>(null)
  const [summary, setSummary] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [trace, setTrace] = useState<string[]>([])
  const [visibleTrace, setVisibleTrace] = useState<string[]>([])

  useEffect(() => {
    if (trace.length === 0) { setVisibleTrace([]); return }
    trace.forEach((t, i) => {
      setTimeout(() => setVisibleTrace(prev => [...prev, t]), i * 300)
    })
  }, [trace])

  function handleCitySelect(name: string, newCoords: [number, number]) {
    setCity(name)
    setCoords(newCoords)
    setResult(null)
    setSummary('')
    setTrace([])
  }

  async function ask(q: string) {
    if (!q.trim()) return
    setLoading(true)
    setTrace([])
    setVisibleTrace([])
    setResult(null)
    setSummary('')
    try {
      const res = await axios.post('https://citypulse-production-0124.up.railway.app/ask', { city, question: q })
      setTrace(res.data.trace)
      setResult(res.data)
      setSummary(res.data.summary)
      if (res.data.data?.weather?.coords) {
        const c = res.data.data.weather.coords
        setCoords([c.lat, c.lon])
      }
    } catch (e) {
      setTrace(['Feil: kunne ikke nå API'])
    }
    setLoading(false)
  }

  const data = result?.data
  const meta = CITY_META[city] || CITY_META.default

  return (
    <main className="min-h-screen bg-gray-950 text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .fade-in { animation: fadeSlideIn 0.4s ease forwards; }
        .trace-item { animation: fadeSlideIn 0.3s ease forwards; opacity: 0; }
        .pulse-dot { animation: pulse-dot 1.2s ease-in-out infinite; }
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(12px); }
        .hero-glow { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.15), transparent); pointer-events: none; }
      `}</style>

      {/* Hero */}
      <div className={`relative bg-gradient-to-b ${meta.gradient} pt-16 pb-12 px-8 overflow-hidden`}>
        <div className="hero-glow" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-400 mb-2">Multi-agent by-intelligens</p>
              <h1 className="text-6xl font-extrabold tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                City<span className="text-emerald-400">Pulse</span>
              </h1>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>{city}</p>
              <p className="text-sm text-gray-400">{meta.tagline}</p>
            </div>
          </div>

          {/* Norge-kart */}
          <div className="rounded-2xl overflow-hidden mb-8" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <MapComponent
              coords={coords}
              city={city}
              onCitySelect={handleCitySelect}
              fullMap={true}
            />
          </div>

          <div className="flex gap-2 flex-wrap mb-6">
            {['Oversikt', 'Hva skjer fremover?', 'Hvordan er været?', 'Siste nyheter', 'Boligpriser'].map(q => (
              <button
                key={q}
                onClick={() => ask(q)}
                disabled={loading}
                className="px-4 py-1.5 rounded-full text-xs font-medium text-emerald-300 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && ask(question)}
              disabled={loading}
              placeholder={`Spør om ${city}...`}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all disabled:opacity-40"
            />
            <button
              onClick={() => ask(question)}
              disabled={loading}
              className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20 min-w-[120px] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Jobber...
                </>
              ) : 'Spør'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-8">

        {loading && visibleTrace.length === 0 && (
          <div className="card rounded-2xl p-5 mb-4 fade-in">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="w-2 h-2 bg-emerald-400 rounded-full pulse-dot" />
              Aktiverer agenter...
            </div>
          </div>
        )}

        {visibleTrace.length > 0 && (
          <div className="card rounded-2xl p-5 mb-4">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Agenter i arbeid</p>
            <div className="space-y-1.5">
              {visibleTrace.map((t, i) => (
                <div key={i} className="trace-item flex items-center gap-2.5 text-sm" style={{ animationDelay: `${i * 0.05}s` }}>
                  <span className={`w-1.5 h-1.5 rounded-full ${i === visibleTrace.length - 1 && loading ? 'bg-emerald-400 pulse-dot' : 'bg-emerald-500'}`} />
                  <span className={i === visibleTrace.length - 1 ? 'text-emerald-300' : 'text-gray-400'}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary && (
          <div className="rounded-2xl p-6 mb-6 fade-in" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.03))', border: '1px solid rgba(16,185,129,0.2)' }}>
            <p className="text-xs uppercase tracking-widest text-emerald-400 mb-2">CityPulse svarer</p>
            <div className="text-white leading-relaxed prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
        )}

        {data && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 fade-in">

            {data.weather?.forecast && (
              <div className="card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs uppercase tracking-widest text-gray-500">Vær i {city}</p>
                  <span className="text-3xl">{getWeatherIcon(data.weather.forecast[0]?.temperature)}</span>
                </div>
                <div className="text-4xl font-bold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {data.weather.forecast[0]?.temperature}°C
                </div>
                <p className="text-sm text-gray-400 mb-4">Vind {data.weather.forecast[0]?.wind_speed} m/s · Fuktighet {data.weather.forecast[0]?.humidity}%</p>
                <div className="space-y-2 border-t border-white/5 pt-4">
                  {data.weather.forecast.slice(1, 4).map((f: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-500">{f.time.slice(11, 16)}</span>
                      <span className="text-white font-medium">{f.temperature}°C</span>
                      <span className="text-gray-500">{f.wind_speed} m/s</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card rounded-2xl overflow-hidden" style={{ minHeight: '220px' }}>
              <MapComponent key={`small-${coords[0]}-${coords[1]}`} coords={coords} city={city} onCitySelect={handleCitySelect} />
            </div>

            {data.events && (
              <div className="card rounded-2xl p-5">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Arrangementer</p>
                {data.events.events?.length > 0 ? (
                  <div className="space-y-3">
                    {data.events.events.slice(0, 5).map((e: any, i: number) => (
                      <a key={i} href={e.link} target="_blank" className="block group">
                        <div className="flex items-start gap-3">
                          <div className="w-10 text-center shrink-0">
                            <div className="text-xs text-emerald-400 font-medium">{e.date?.slice(5).split('-').reverse().join('.')}</div>
                          </div>
                          <div>
                            <p className="text-sm text-white group-hover:text-emerald-400 transition-colors font-medium leading-snug">{e.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{e.venue}</p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Se svaret over for kommende arrangementer.</p>
                )}
              </div>
            )}

            {data.news?.articles?.length > 0 && (
              <div className="card rounded-2xl p-5">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Nyheter</p>
                <div className="space-y-3">
                  {data.news.articles.slice(0, 5).map((a: any, i: number) => (
                    <a key={i} href={a.link} target="_blank" className="block group">
                      <p className="text-sm text-white group-hover:text-emerald-400 transition-colors font-medium leading-snug">{a.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.published?.slice(0, 16)}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {data.property?.price_index && (
              <div className="card rounded-2xl p-5">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Boligprisindeks</p>
                <div className="space-y-2">
                  {data.property.price_index.slice(-5).map((p: any, i: number, arr: any[]) => {
                    const prev = arr[i - 1]
                    const change = prev ? ((p.index - prev.index) / prev.index * 100).toFixed(1) : null
                    return (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">{p.year}</span>
                        <div className="flex items-center gap-2">
                          {change && (
                            <span className={`text-xs ${parseFloat(change) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {parseFloat(change) >= 0 ? '+' : ''}{change}%
                            </span>
                          )}
                          <span className="text-white font-medium">{p.index}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-600 mt-3">{data.property.note}</p>
              </div>
            )}

          </div>
        )}

        {/* Om-seksjon */}
        <div className="card rounded-2xl p-8 mt-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Om CityPulse</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Hva er CityPulse?</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                CityPulse er en multi-agent AI-plattform som samler sanntidsdata fra flere kilder og gir deg en intelligent oversikt over norske byer. Still spørsmål på naturlig norsk og få svar basert på ekte data.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>Agentene</h3>
              <div className="space-y-2">
                {[
                  { name: 'WeatherAgent', desc: 'Yr.no – sanntidsvær for alle norske byer' },
                  { name: 'EventAgent',   desc: 'Ticketmaster – kommende arrangementer' },
                  { name: 'NewsAgent',    desc: 'NRK – lokale nyheter per region' },
                  { name: 'PropertyAgent',desc: 'SSB – historisk boligprisindeks' },
                ].map(a => (
                  <div key={a.name} className="flex items-start gap-2 text-sm">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                    <span><span className="text-emerald-400 font-medium">{a.name}</span> <span className="text-gray-500">– {a.desc}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 mt-4">
          <p className="text-xs text-gray-600">
            Utviklet av{' '}
            <a href="https://fjellstadteknologi.no" target="_blank" className="text-emerald-500 hover:text-emerald-400 transition-colors">
              Fjellstad Teknologi
            </a>
            {' '}· CityPulse {new Date().getFullYear()}
          </p>
        </div>

      </div>
    </main>
  )
}