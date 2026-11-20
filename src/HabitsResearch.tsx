import { SPHERES, type SphereId } from './data.ts'
import { SphereIcon } from './icons.tsx'

type Row = { name: string; sphere: SphereId; value: number; note: string; link: string }

// Extra years of life vs. not doing the habit. Observational cohorts: association, not proof of cause.
const YEARS: Row[] = [
  {
    name: 'All 5 healthy habits (women)',
    sphere: 'health',
    value: 14,
    note: 'At age 50: no smoking, healthy weight, 30 min/day of exercise, moderate alcohol, good diet (Li 2018, 123k people).',
    link: 'https://www.hsph.harvard.edu/news/press-releases/five-healthy-lifestyle-habits/',
  },
  {
    name: 'All 5 healthy habits (men)',
    sphere: 'health',
    value: 12.2,
    note: 'Same study. People with all five had 74% lower risk of dying during follow-up.',
    link: 'https://www.hsph.harvard.edu/news/press-releases/five-healthy-lifestyle-habits/',
  },
  {
    name: 'Never smoking',
    sphere: 'health',
    value: 10,
    note: 'Smokers lose at least 10 years; quitting before 40 avoids about 90% of the extra risk (Jha 2013).',
    link: 'https://www.nejm.org/doi/full/10.1056/NEJMsa1211128',
  },
  {
    name: 'Brisk walking 7.5+ h a week',
    sphere: 'health',
    value: 4.5,
    note: 'Compared with no leisure exercise (Moore 2012, 650k people).',
    link: 'https://pubmed.ncbi.nlm.nih.gov/23139642/',
  },
  {
    name: 'Reading books',
    sphere: 'growth',
    value: 1.9,
    note: 'Book readers lived about 23 months longer over 12 years of follow-up (Bavishi 2016).',
    link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5105607',
  },
  {
    name: 'Brisk walking up to 75 min a week',
    sphere: 'health',
    value: 1.8,
    note: 'Even a little movement counts (Moore 2012).',
    link: 'https://pubmed.ncbi.nlm.nih.gov/23139642/',
  },
]

// Fewer self-reported poor-mental-health days per month vs. people who don't exercise (1.2M US adults).
const MOOD: Row[] = [
  { name: 'Team sports', sphere: 'love', value: 22.3, note: 'Movement plus people.', link: 'https://doi.org/10.1016/S2215-0366(18)30227-X' },
  { name: 'Cycling', sphere: 'health', value: 21.6, note: '', link: 'https://doi.org/10.1016/S2215-0366(18)30227-X' },
  { name: 'Aerobics, gym', sphere: 'health', value: 20.1, note: 'Best dose: about 45 min, 3–5 times a week. More than 90 min a day was not better.', link: 'https://doi.org/10.1016/S2215-0366(18)30227-X' },
]

const color = Object.fromEntries(SPHERES.map((s) => [s.id, s.color])) as Record<SphereId, string>

function Bars({ rows, unit, sign = '+' }: { rows: Row[]; unit: string; sign?: string }) {
  const max = Math.max(...rows.map((r) => r.value))
  return (
    <ul className="bars">
      {rows.map((r) => (
        <li key={r.name} style={{ '--c': color[r.sphere] } as React.CSSProperties}>
          <span className="label">
            <SphereIcon id={r.sphere} size={16} className="inline" /> {r.name}
          </span>
          <span className="track">
            <span className="bar" style={{ left: 0, width: `${(r.value / max) * 100}%` }} />
          </span>
          <span className="val">
            {sign}
            {r.value}
            {unit}
          </span>
          <small className="later">
            {r.note}{' '}
            <a href={r.link} target="_blank" rel="noreferrer">
              Study ↗
            </a>
          </small>
        </li>
      ))}
    </ul>
  )
}

export function HabitsResearch() {
  return (
    <section className="card research" aria-label="Habits that add years and happiness, according to research">
      <h2>Habits that add years — and good days</h2>
      <h3>Extra years of life</h3>
      <Bars rows={YEARS} unit="y" />
      <h3>Fewer bad mental-health days, by type of exercise</h3>
      <Bars rows={MOOD} unit="%" sign="−" />
      <p className="support">
        These are large long-term studies of real people. They show links, not proof that the habit alone caused the
        result — healthier or richer people often do more of these things too.
      </p>
    </section>
  )
}
