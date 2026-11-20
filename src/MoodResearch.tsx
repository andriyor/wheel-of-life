import { useEffect, useState } from 'react'
import { SPHERES, type SphereId } from './data.ts'
import { SphereIcon } from './icons.tsx'
import { ACTIVITIES, linkOf, moodSummary, type Activity } from './mood.ts'

const KEY = 'wheel-of-life:doing'
const color = Object.fromEntries(SPHERES.map((s) => [s.id, s.color])) as Record<SphereId, string>
const max = Math.max(...ACTIVITIES.map((a) => Math.abs(a.now)))
const neg = Math.max(0, ...ACTIVITIES.map((a) => -a.now))
const zero = (neg / (max + neg)) * 100 // % from left where 0 sits
type Plotted = Activity & { long: number; short: string }
const PLOTTED = ACTIVITIES.filter((a): a is Plotted => a.long !== undefined && a.short !== undefined)

type Sort = 'now' | 'long'

const longTerm = (v: number) => (v >= 1.5 ? 'clearly good for you' : v > 0 ? 'a little good for you' : v === 0 ? 'neutral' : 'costs you later')
const signed = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(1)}`
// No long-term rating = unknown, so it sorts as neutral; ties break on mood now.
const sortKey = (a: Activity, sort: Sort) => (sort === 'now' ? a.now : (a.long ?? 0) * 100 + a.now)

function load(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return [] // private mode or bad data
  }
}

export function MoodResearch() {
  const [sort, setSort] = useState<Sort>('now')
  const [doing, setDoing] = useState(load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(doing))
    } catch {
      /* storage blocked: still works for this visit */
    }
  }, [doing])

  const rows = [...ACTIVITIES].sort((a, b) => sortKey(b, sort) - sortKey(a, sort))
  const sum = moodSummary(doing)
  const toggle = (name: string, on: boolean) => setDoing((d) => (on ? [...d, name] : d.filter((n) => n !== name)))
  return (
    <section className="card research" aria-label="What lifts mood, according to research">
      <h2>What lifts mood in the moment</h2>
      <p className="intro">
        Happiness while doing each activity, compared to an average moment. <strong>Tick what you do in a normal week</strong>{' '}
        to see what you already have and what's worth trying.
      </p>

      {/* Wrapper bounds the sticky result box to the list, so it lets go before the scatter. */}
      <div className="mood-picker">
      <div className="habit-result mood-result" aria-live="polite">
        {sum.average === undefined ? (
          <p>Nothing ticked yet.</p>
        ) : (
          <p>
            You do <strong>{doing.length}</strong> of these. Your average lift: <strong>{signed(sum.average)}</strong>
            {sum.best && (
              <>
                {' '}
                — your best one is <strong>{sum.best.name.toLowerCase()}</strong> ({signed(sum.best.now)}).
              </>
            )}
          </p>
        )}
        {sum.tryNext.length > 0 && (
          <p>
            <strong>Worth trying:</strong>{' '}
            {sum.tryNext.map((a, i) => (
              <span key={a.name}>
                {i > 0 && ', '}
                {a.name.toLowerCase()} ({signed(a.now)})
              </span>
            ))}
            .
          </p>
        )}
        {sum.alcohol && (
          <p className="loss">
            Alcohol's lift is real but costs years. Dancing, a match or talking with friends give a similar lift without
            it.
          </p>
        )}
      </div>

      <div className="sort" role="group" aria-label="Sort activities">
        Sort by:
        {(
          [
            ['now', 'Feels good now'],
            ['long', 'Good for you later'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} className={sort === id ? 'primary small' : 'ghost small'} aria-pressed={sort === id} onClick={() => setSort(id)}>
            {label}
          </button>
        ))}
      </div>
      <ul className="bars mood-bars">
        {rows.map((a) => {
          const w = (Math.abs(a.now) / (max + neg)) * 100
          const on = doing.includes(a.name)
          return (
            <li key={a.name} data-on={on || undefined} style={{ '--c': color[a.sphere] } as React.CSSProperties}>
              <label className="label">
                <input type="checkbox" checked={on} onChange={(e) => toggle(a.name, e.target.checked)} />
                <SphereIcon id={a.sphere} size={16} className="inline" /> {a.name}
              </label>
              <span className="track">
                <span className="zero" style={{ left: `${zero}%` }} />
                <span className="bar" style={{ left: `${a.now < 0 ? zero - w : zero}%`, width: `${w}%` }} />
              </span>
              <span className="val">{signed(a.now)}</span>
              {a.note && (
                <small className="later">
                  {a.note}{' '}
                  <a href={linkOf(a)} target="_blank" rel="noreferrer">
                    Study ↗
                  </a>
                </small>
              )}
            </li>
          )
        })}
      </ul>
      </div>
      <Scatter />
      <p className="support">
        Source:{' '}
        <a href="https://dam.ukdataservice.ac.uk/media/605020/mackerron.pdf" target="_blank" rel="noreferrer">
          Mappiness study
        </a>
        , MacKerron &amp; Mourato (LSE) — about 22,000 UK people, over a million mood reports (
        <a href="https://www.sole-jole.org/assets/docs/13058.pdf" target="_blank" rel="noreferrer">
          activity table
        </a>
        ). Shows how people feel during an activity, not whether it causes long-term wellbeing.
      </p>
    </section>
  )
}

// x: mood right now (measured), y: long-term effect (rough rating). Quadrants show the tradeoff.
function Scatter() {
  const [picked, setPicked] = useState<string>()
  const active = PLOTTED.find((a) => a.name === picked)
  const W = 640, H = 380, P = 44
  const x = (v: number) => P + ((v + 7) / 23) * (W - 2 * P) // domain -7 … 16
  const y = (v: number) => H - P - ((v + 2.5) / 5) * (H - 2 * P) // domain -2.5 … 2.5
  return (
    <figure className="scatter">
      <h3>Feels good now vs. good for you later</h3>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Scatter plot: mood right now against long-term effect for each activity">
        <line className="axis" x1={x(0)} x2={x(0)} y1={P} y2={H - P} />
        <line className="axis" x1={P} x2={W - P} y1={y(0)} y2={y(0)} />
        <text className="quad" x={W - P} y={P - 8} textAnchor="end">feels good · good for you</text>
        <text className="quad" x={P} y={P - 8}>feels bad now · pays off later</text>
        <text className="quad" x={W - P} y={H - P + 20} textAnchor="end">feels good now · costs you later</text>
        <text className="axis-label" x={W - P} y={y(0) - 6} textAnchor="end">mood right now →</text>
        <text className="axis-label" x={x(0) + 6} y={P + 12}>↑ long-term</text>
        {PLOTTED.map((a) => (
          <g key={a.name} tabIndex={0} role="img" aria-label={`${a.name}: ${signed(a.now)} now, ${longTerm(a.long)}`} onClick={() => setPicked(a.name)} onFocus={() => setPicked(a.name)}>
            <circle cx={x(a.now)} cy={y(a.long)} r={active?.name === a.name ? 11 : 7} fill={color[a.sphere]} />
            {/* shortcut: one hand-placed label below to dodge an overlap; revisit if data changes */}
            <text className="point" x={x(a.now)} y={y(a.long) + (a.short === 'Singing' ? 22 : -12)} textAnchor="middle">
              {a.short}
            </text>
          </g>
        ))}
      </svg>
      <p className="detail" aria-live="polite">
        {active ? (
          <>
            <strong>{active.name}</strong>: {signed(active.now)} mood right now, {longTerm(active.long)}. {active.note}
          </>
        ) : (
          'Click or tab to a dot to see its story.'
        )}
      </p>
      <figcaption className="support">
        Across: the measured mood change from the bars above. Up and down: a rough rating of what the linked study says
        happens over months and years — a summary, not a measured number.
      </figcaption>
    </figure>
  )
}
