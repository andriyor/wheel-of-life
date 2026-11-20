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

// Years of life expectancy lost vs. the healthier option. Observational: association, not proof of cause.
const YEARS_LOST: Row[] = [
  {
    name: 'Smoking',
    sphere: 'health',
    value: 10,
    note: 'Smokers lose at least 10 years; quitting before 40 avoids about 90% of the extra risk (Jha 2013).',
    link: 'https://www.nejm.org/doi/full/10.1056/NEJMsa1211128',
  },
  {
    name: 'Heavy drinking (25+ drinks a week)',
    sphere: 'health',
    value: 4.5,
    note: 'Over 350 g of alcohol a week: 4–5 years shorter life at age 40 than drinking under 100 g (Wood 2018, 600k drinkers).',
    link: 'https://pubmed.ncbi.nlm.nih.gov/29676281/',
  },
  {
    name: 'Sitting 3+ hours a day',
    sphere: 'home',
    value: 2,
    note: 'Cutting daily sitting below 3 hours could add about 2 years in the US (Katzmarzyk 2012).',
    link: 'https://pubmed.ncbi.nlm.nih.gov/22777603/',
  },
  {
    name: 'TV 2+ hours a day',
    sphere: 'fun',
    value: 1.4,
    note: 'Cutting TV below 2 hours a day could add about 1.4 years (same study).',
    link: 'https://pubmed.ncbi.nlm.nih.gov/22777603/',
  },
]

// Higher risk of dying during follow-up.
const RISK: Row[] = [
  {
    name: 'Sitting 8+ h a day and barely moving',
    sphere: 'home',
    value: 59,
    note: 'Vs. sitting under 4 h and very active, 1M people. About 60–75 min of moderate activity a day seemed to cancel the sitting risk (Ekelund 2016).',
    link: 'https://doi.org/10.1016/S0140-6736(16)30370-1',
  },
  {
    name: 'Living alone',
    sphere: 'home',
    value: 32,
    note: 'Meta-analysis of 70 studies, 3.4M people (Holt-Lunstad 2015).',
    link: 'https://pubmed.ncbi.nlm.nih.gov/25910392/',
  },
  {
    name: 'Social isolation',
    sphere: 'love',
    value: 29,
    note: 'Few contacts or rarely seeing people. Strongest under age 65 (same review).',
    link: 'https://pubmed.ncbi.nlm.nih.gov/25910392/',
  },
  {
    name: 'Feeling lonely',
    sphere: 'love',
    value: 26,
    note: 'Feeling alone mattered as much as being alone (same review).',
    link: 'https://pubmed.ncbi.nlm.nih.gov/25910392/',
  },
]

const color = Object.fromEntries(SPHERES.map((s) => [s.id, s.color])) as Record<SphereId, string>

function Bars({ rows, unit, sign = '+', bad = false }: { rows: Row[]; unit: string; sign?: string; bad?: boolean }) {
  const max = Math.max(...rows.map((r) => r.value))
  return (
    <ul className={bad ? 'bars bad' : 'bars'}>
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
      <h2>Habits that add years — and habits that take them</h2>
      <h3>Years of life gained</h3>
      <Bars rows={YEARS} unit="y" />
      <h3>Years of life lost</h3>
      <Bars rows={YEARS_LOST} unit="y" sign="−" bad />
      <h3>Higher risk of dying early</h3>
      <Bars rows={RISK} unit="%" bad />
      <h3>Fewer bad mental-health days, by type of exercise</h3>
      <Bars rows={MOOD} unit="%" sign="−" />
      <p className="support">
        These are large long-term studies of real people. They show links, not proof that the habit alone caused the
        result — healthier or richer people often do more of these things too.
      </p>
    </section>
  )
}
