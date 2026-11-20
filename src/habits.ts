// "How I live" checklist → a rough, research-based read-out. Numbers come from the studies in HabitsResearch.tsx.

export type Exercise = 'none' | 'little' | 'some' | 'lots'

export type Habits = {
  exercise: Exercise
  smoke: boolean
  drink: boolean // 25+ drinks a week
  sit: boolean // 3+ h a day
  tv: boolean // 2+ h a day
  sitAllDay: boolean // 8+ h a day and barely moving
  read: boolean
  alone: boolean
  isolated: boolean
  lonely: boolean
}

export const noHabits = (): Habits => ({
  exercise: 'none',
  smoke: false,
  drink: false,
  sit: false,
  tv: false,
  sitAllDay: false,
  read: false,
  alone: false,
  isolated: false,
  lonely: false,
})

// Years vs. no leisure exercise (Moore 2012).
export const EXERCISE_YEARS: Record<Exercise, number> = { none: 0, little: 1.8, some: 3.4, lots: 4.5 }

export type Effect = { label: string; years?: number; risk?: number }

export type Result = {
  gained: number
  lost: number
  effects: Effect[] // harms first, then helps
  next?: string // the single change worth the most
  moodLift: boolean // any exercise → ~20% fewer bad mental-health days (Chekroud 2018)
}

export function habitResult(h: Habits): Result {
  const effects: Effect[] = []
  if (h.smoke) effects.push({ label: 'Smoking', years: -10 })
  if (h.drink) effects.push({ label: 'Heavy drinking', years: -4.5 })
  // Sitting and TV time overlap, so only the larger one counts toward the total.
  if (h.sit) effects.push({ label: 'Sitting 3+ hours a day', years: -2 })
  else if (h.tv) effects.push({ label: 'TV 2+ hours a day', years: -1.4 })
  // An hour a day of moderate activity seemed to cancel this risk (Ekelund 2016).
  if (h.sitAllDay && h.exercise !== 'lots') effects.push({ label: 'Sitting all day, barely moving', risk: 59 })
  if (h.alone) effects.push({ label: 'Living alone', risk: 32 })
  if (h.isolated) effects.push({ label: 'Rarely seeing people', risk: 29 })
  if (h.lonely) effects.push({ label: 'Feeling lonely', risk: 26 })
  if (h.exercise !== 'none') effects.push({ label: 'Moving regularly', years: EXERCISE_YEARS[h.exercise] })
  if (h.read) effects.push({ label: 'Reading books', years: 1.9 })

  const years = effects.map((e) => e.years ?? 0)
  const gained = round(years.filter((y) => y > 0).reduce((a, b) => a + b, 0))
  const lost = round(years.filter((y) => y < 0).reduce((a, b) => a - b, 0))

  return { gained, lost, effects, next: nextStep(h), moodLift: h.exercise !== 'none' }
}

// Ordered by how much the research says the change is worth.
function nextStep(h: Habits): string | undefined {
  if (h.smoke) return 'Quitting smoking is the biggest win — up to 10 years, and quitting before 40 avoids about 90% of the risk.'
  if (h.drink) return 'Cutting down to under ~7 drinks a week is linked to 4–5 more years.'
  if (h.sitAllDay && h.exercise !== 'lots') return 'Your all-day sitting risk seemed to vanish with about an hour of brisk walking a day.'
  if (h.exercise === 'none') return 'Start small: even up to 75 minutes of brisk walking a week is linked to 1.8 more years — and better mood.'
  if (h.isolated || h.lonely) return 'See someone in person this week. Being cut off is linked to about 30% higher risk of dying early.'
  if (h.sit || h.tv) return 'Stand up or walk for a few minutes every hour you sit, and swap some screen time for movement.'
  if (h.exercise !== 'lots') return 'Moving more pays off further: about an hour a day was linked to 4.5 extra years.'
  return undefined
}

const round = (n: number) => Math.round(n * 10) / 10
