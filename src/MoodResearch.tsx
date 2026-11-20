import { SPHERES, type SphereId } from './data.ts'
import { SphereIcon } from './icons.tsx'

// Mappiness study (MacKerron & Mourato, LSE): ~22k UK people, >1M phone mood reports.
// `long` = my rough read of the linked study, -2 (harms) … +2 (strong benefit); not a measured number.
// `now` = change in momentary happiness (0–100 scale) vs. baseline, controlling for person, place, time, company.
const ACTIVITIES: { name: string; short: string; long: number; sphere: SphereId; now: number; later: string; link: string }[] = [
  { name: 'Sex, intimacy', short: 'Sex', long: 1, sphere: 'love', now: 14.2, later: 'Kahneman’s day-reconstruction study (2004) also ranked it #1.', link: 'https://doi.org/10.1126/science.1103572' },
  { name: 'Dancing, theatre, concert', short: 'Dancing', long: 1, sphere: 'fun', now: 9.29, later: 'Doing it with others beats listening alone.', link: 'https://dam.ukdataservice.ac.uk/media/605020/mackerron.pdf' },
  { name: 'Singing, performing', short: 'Singing', long: 1, sphere: 'fun', now: 6.95, later: 'Active and shared, so it lifts more than passive music.', link: 'https://dam.ukdataservice.ac.uk/media/605020/mackerron.pdf' },
  { name: 'Talking in person', short: 'Talking in person', long: 2, sphere: 'love', now: 6.38, later: 'Harvard’s 80-year study: close relationships best predict health and happiness.', link: 'https://www.adultdevelopmentstudy.org' },
  { name: 'Drinking alcohol', short: 'Alcohol', long: -2, sphere: 'health', now: 5.73, later: 'Lift comes mostly from the company. Long-term it raises anxiety and depression; the safest amount is zero (Lancet 2018).', link: 'https://doi.org/10.1016/S0140-6736(18)31310-2' },
  { name: 'Listening to music', short: 'Music', long: 0.5, sphere: 'fun', now: 3.56, later: 'A cheap, reliable mood nudge.', link: 'https://dam.ukdataservice.ac.uk/media/605020/mackerron.pdf' },
  { name: 'Reading', short: 'Reading', long: 1.5, sphere: 'growth', now: 1.47, later: 'Calm, not a thrill — but book readers lived ~2 years longer (Yale, 2016).', link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5105607' },
  { name: 'Texting, email, social media', short: 'Texting', long: -0.5, sphere: 'love', now: 0.56, later: 'About a tenth of the lift of talking face to face.', link: 'https://dam.ukdataservice.ac.uk/media/605020/mackerron.pdf' },
  { name: 'Working, studying', short: 'Work', long: 1.5, sphere: 'career', now: -5.43, later: 'Feels worst in the moment, yet having work is one of the strongest drivers of life satisfaction.', link: 'https://www.sole-jole.org/assets/docs/13058.pdf' },
]

const color = Object.fromEntries(SPHERES.map((s) => [s.id, s.color])) as Record<SphereId, string>
const max = Math.max(...ACTIVITIES.map((a) => Math.abs(a.now)))
const neg = Math.max(0, ...ACTIVITIES.map((a) => -a.now))
const zero = (neg / (max + neg)) * 100 // % from left where 0 sits

export function MoodResearch() {
  return (
    <section className="card research" aria-label="What lifts mood, according to research">
      <h2>What lifts mood in the moment</h2>
      <p className="intro">
        Happiness while doing each activity, compared to an average moment. Colours match the area of your wheel it
        feeds. The grey note under each bar is the long-term picture.
      </p>
      <ul className="bars">
        {ACTIVITIES.map((a) => {
          const w = (Math.abs(a.now) / (max + neg)) * 100
          return (
            <li key={a.name} style={{ '--c': color[a.sphere] } as React.CSSProperties}>
              <span className="label">
                <SphereIcon id={a.sphere} size={16} className="inline" /> {a.name}
              </span>
              <span className="track">
                <span className="zero" style={{ left: `${zero}%` }} />
                <span className="bar" style={{ left: `${a.now < 0 ? zero - w : zero}%`, width: `${w}%` }} />
              </span>
              <span className="val">
                {a.now > 0 ? '+' : ''}
                {a.now.toFixed(1)}
              </span>
              <small className="later">
                {a.later}{' '}
                <a href={a.link} target="_blank" rel="noreferrer">
                  Study ↗
                </a>
              </small>
            </li>
          )
        })}
      </ul>
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
        {ACTIVITIES.map((a) => (
          <g key={a.name}>
            <title>{`${a.name}: ${a.now > 0 ? '+' : ''}${a.now} now. ${a.later}`}</title>
            <circle cx={x(a.now)} cy={y(a.long)} r={7} fill={color[a.sphere]} />
            {/* shortcut: one hand-placed label below to dodge an overlap; revisit if data changes */}
            <text className="point" x={x(a.now)} y={y(a.long) + (a.short === 'Singing' ? 22 : -12)} textAnchor="middle">
              {a.short}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="support">
        Across: the measured mood change from the bars above. Up and down: a rough rating of what the linked study says
        happens over months and years — a summary, not a measured number.
      </figcaption>
    </figure>
  )
}
