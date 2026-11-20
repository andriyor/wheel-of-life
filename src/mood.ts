import type { SphereId } from './data.ts'

const MAPPINESS = 'https://dam.ukdataservice.ac.uk/media/605020/mackerron.pdf'

// What an activity gives you. Hand-made grouping (my judgement, not measured) used to suggest stand-ins.
export type Need = 'closeness' | 'touch' | 'body' | 'together' | 'nature' | 'calm' | 'mind' | 'play'

export const NEEDS: Record<Need, { label: string; tip?: string }> = {
  closeness: { label: 'Closeness with people' },
  touch: { label: 'Physical touch', tip: 'Hugs, cuddling, massage, holding hands — not measured in this study.' },
  body: { label: 'Moving your body' },
  together: { label: 'Doing something together' },
  nature: { label: 'Being outdoors' },
  calm: { label: 'Calm' },
  mind: { label: 'Absorbing your mind' },
  play: { label: 'Play' },
}

export type Activity = {
  name: string
  sphere: SphereId
  // Mappiness study (MacKerron & Mourato, LSE): change in momentary happiness (0–100) vs. baseline,
  // controlling for person, place, time and company.
  now: number
  note?: string
  link?: string // defaults to the Mappiness table
  // Only for the scatter plot: my rough read of the linked study, -2 (harms) … +2 (strong benefit). Not measured.
  long?: number
  short?: string
  // False for things we shouldn't nudge anyone toward.
  suggest?: false
  gives?: Need[]
}

export const ACTIVITIES: Activity[] = [
  { name: 'Sex, intimacy', sphere: 'love', now: 14.2, short: 'Sex', long: 1, suggest: false, note: 'Kahneman’s day-reconstruction study (2004) also ranked it #1.', link: 'https://doi.org/10.1126/science.1103572', gives: ['closeness', 'touch', 'body'] },
  { name: 'Dancing, theatre, concert', sphere: 'fun', now: 9.29, short: 'Dancing', long: 1, note: 'Doing it with others beats listening alone.', gives: ['together', 'play'] },
  { name: 'Museum, exhibition, library', sphere: 'growth', now: 8.77, gives: ['mind'] },
  { name: 'Sports, running, exercise', sphere: 'health', now: 8.12, note: 'A big lift now — and linked to extra years (see below).', gives: ['body', 'together'] },
  { name: 'Gardening', sphere: 'home', now: 7.83, gives: ['nature', 'body', 'calm'] },
  { name: 'Singing, performing', sphere: 'fun', now: 6.95, short: 'Singing', long: 1, note: 'Active and shared, so it lifts more than passive music.', gives: ['together', 'play'] },
  { name: 'Talking in person', sphere: 'love', now: 6.38, short: 'Talking in person', long: 2, note: 'Harvard’s 80-year study: close relationships best predict health and happiness.', link: 'https://www.adultdevelopmentstudy.org', gives: ['closeness'] },
  { name: 'Birdwatching, nature watching', sphere: 'mind', now: 6.28, gives: ['nature', 'calm'] },
  { name: 'Walking, hiking', sphere: 'health', now: 6.18, gives: ['body', 'nature'] },
  { name: 'Fishing, hunting', sphere: 'fun', now: 5.82, gives: ['nature', 'calm'] },
  { name: 'Drinking alcohol', sphere: 'health', now: 5.73, short: 'Alcohol', long: -2, suggest: false, note: 'Lift comes mostly from the company. Long-term it raises anxiety and depression; the safest amount is zero (Lancet 2018).', link: 'https://doi.org/10.1016/S0140-6736(18)31310-2', gives: ['closeness', 'together'] },
  { name: 'Hobbies, arts, crafts', sphere: 'fun', now: 5.53, gives: ['play', 'mind'] },
  { name: 'Meditating, religious activities', sphere: 'mind', now: 4.95, gives: ['calm'] },
  { name: 'Watching a sports match', sphere: 'fun', now: 4.39, gives: ['together'] },
  { name: 'Playing with children', sphere: 'family', now: 4.1, gives: ['closeness', 'play'] },
  { name: 'Playing with pets', sphere: 'family', now: 3.63, gives: ['touch', 'calm'] },
  { name: 'Listening to music', sphere: 'fun', now: 3.56, short: 'Music', long: 0.5, note: 'A cheap, reliable mood nudge.', gives: ['calm'] },
  { name: 'Games, puzzles', sphere: 'fun', now: 3.07, gives: ['play', 'mind'] },
  { name: 'Shopping, errands', sphere: 'home', now: 2.74 },
  { name: 'Gambling, betting', sphere: 'money', now: 2.62, suggest: false, note: 'A small lift with a real money risk.' },
  { name: 'Watching TV, films', sphere: 'fun', now: 2.55, note: '2+ hours a day is linked to a shorter life (see below).' },
  { name: 'Computer, phone games', sphere: 'fun', now: 2.39 },
  { name: 'Eating, snacking', sphere: 'health', now: 2.38 },
  { name: 'Cooking', sphere: 'home', now: 2.14 },
  { name: 'Reading', sphere: 'growth', now: 1.47, short: 'Reading', long: 1.5, note: 'Calm, not a thrill — but book readers lived ~2 years longer (Yale, 2016).', link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5105607', gives: ['mind', 'calm'] },
  { name: 'Texting, email, social media', sphere: 'love', now: 0.56, short: 'Texting', long: -0.5, note: 'About a tenth of the lift of talking face to face.' },
  { name: 'Working, studying', sphere: 'career', now: -5.43, short: 'Work', long: 1.5, suggest: false, note: 'Feels worst in the moment, yet having work is one of the strongest drivers of life satisfaction.', link: 'https://www.sole-jole.org/assets/docs/13058.pdf' },
]

export const linkOf = (a: Activity) => a.link ?? MAPPINESS

export type MoodSummary = {
  average?: number // mean lift of what you do
  best?: Activity // your biggest everyday lift
  tryNext: Activity[] // biggest lifts you don't do yet
  alcohol: boolean
}

export function moodSummary(doing: string[]): MoodSummary {
  const mine = ACTIVITIES.filter((a) => doing.includes(a.name))
  const average = mine.length ? Math.round((mine.reduce((s, a) => s + a.now, 0) / mine.length) * 10) / 10 : undefined
  const best = mine.filter((a) => a.suggest !== false).sort((a, b) => b.now - a.now)[0]
  const tryNext = ACTIVITIES.filter((a) => a.suggest !== false && !doing.includes(a.name))
    .sort((a, b) => b.now - a.now)
    .slice(0, 3)
  return { average, best, tryNext, alcohol: doing.includes('Drinking alcohol') }
}

export type StandIn = { need: Need; label: string; tip?: string; options: Activity[] }

// For something you miss: per need it met, the two biggest safe lifts that meet the same need.
export function standIns(missing: string): StandIn[] {
  const gone = ACTIVITIES.find((a) => a.name === missing)
  return (gone?.gives ?? []).map((need) => ({
    need,
    ...NEEDS[need],
    options: ACTIVITIES.filter((a) => a !== gone && a.suggest !== false && a.gives?.includes(need))
      .sort((a, b) => b.now - a.now)
      .slice(0, 2),
  }))
}
