// A 16Personalities type (e.g. "INFP-T") read as rough Big Five traits.
// McCrae & Costa 1989: I/E ≈ extraversion, S/N ≈ openness, T/F ≈ agreeableness, J/P ≈ conscientiousness.
// The -A/-T suffix is 16Personalities' own addition and resembles emotional stability.

export type Trait = 'extraversion' | 'agreeableness' | 'conscientiousness' | 'stability' | 'openness'
export type Level = 'low' | 'high'

export const TRAITS: Record<Trait, { name: string; low: string; high: string }> = {
  extraversion: { name: 'Mind', low: 'quiet, reserved (I)', high: 'outgoing, energetic (E)' },
  openness: { name: 'Energy', low: 'practical, likes the familiar (S)', high: 'curious, imaginative (N)' },
  agreeableness: { name: 'Nature', low: 'logical, direct (T)', high: 'warm, caring (F)' },
  conscientiousness: { name: 'Tactics', low: 'spontaneous, flexible (P)', high: 'organised, planned (J)' },
  stability: { name: 'Identity', low: 'sensitive, worries more (-T)', high: 'calm, self-assured (-A)' },
}

export type Profile = Partial<Record<Trait, Level>>

// All 16 four-letter codes, for the picker.
export const TYPES = ['I', 'E'].flatMap((a) =>
  ['N', 'S'].flatMap((b) => ['T', 'F'].flatMap((c) => ['J', 'P'].map((d) => a + b + c + d))),
)

const TYPE = /^([IE])([NS])([TF])([JP])(?:-([AT]))?$/

export function parseType(input: string): Profile | undefined {
  const m = TYPE.exec(input.trim().toUpperCase())
  if (!m) return undefined
  const [, mind, energy, nature, tactics, identity] = m
  const p: Profile = {
    extraversion: mind === 'E' ? 'high' : 'low',
    openness: energy === 'N' ? 'high' : 'low',
    agreeableness: nature === 'F' ? 'high' : 'low',
    conscientiousness: tactics === 'J' ? 'high' : 'low',
  }
  if (identity) p.stability = identity === 'A' ? 'high' : 'low'
  return p
}

export type Tip = { trait: Trait; text: string; link: string; activities: string[] }

const STEEL = 'https://pubmed.ncbi.nlm.nih.gov/18193998/'
const KERN = 'https://pubmed.ncbi.nlm.nih.gov/18823176/'
const FLEESON = 'https://www.apa.org/monitor/apr03/acting'
const MAPPINESS = 'https://dam.ukdataservice.ac.uk/media/605020/mackerron.pdf'

// Tips only where a study backs them. `activities` are names from mood.ts to highlight on the mood tab.
export function tips(p: Profile): Tip[] {
  const out: Tip[] = []
  if (p.stability === 'low')
    out.push({ trait: 'stability', link: STEEL, activities: ['Walking, hiking', 'Birdwatching, nature watching', 'Meditating, religious activities', 'Sports, running, exercise'], text: 'Worrying and getting upset easily is the trait most tied to lower wellbeing — so calming habits pay off most for you: walking, time in nature, meditation, regular exercise.' })
  if (p.extraversion === 'low')
    out.push({ trait: 'extraversion', link: FLEESON, activities: ['Talking in person'], text: 'Quiet people get the social lift too: in one study, introverts were happier when they acted outgoing. Small doses work — one friend, one short call.' })
  if (p.extraversion === 'high')
    out.push({ trait: 'extraversion', link: STEEL, activities: ['Dancing, theatre, concert', 'Sports, running, exercise', 'Talking in person'], text: 'Outgoing people tend to report better mood. People are your strongest lever: dancing, team sports, talking in person.' })
  if (p.conscientiousness === 'low')
    out.push({ trait: 'conscientiousness', link: KERN, activities: [], text: 'Conscientious people live longer, largely through steadier habits. Make the good ones automatic: tiny steps, same time every day.' })
  if (p.conscientiousness === 'high')
    out.push({ trait: 'conscientiousness', link: KERN, activities: [], text: 'Conscientiousness is linked to a longer life. Keep it — and let “good enough” be enough on hard days.' })
  if (p.openness === 'high')
    out.push({ trait: 'openness', link: MAPPINESS, activities: ['Museum, exhibition, library', 'Hobbies, arts, crafts', 'Dancing, theatre, concert'], text: 'Museums, arts and hobbies are among the biggest mood lifts in the study — likely a natural fit for you (our pairing, not a study finding).' })
  return out
}

// Mood activities your type points to, most-mentioned first, no duplicates.
export const fitsYou = (p: Profile) => [...new Set(tips(p).flatMap((t) => t.activities))]

export const TYPE_KEY = 'wheel-of-life:type'

export function loadType(): string {
  try {
    return localStorage.getItem(TYPE_KEY) ?? ''
  } catch {
    return '' // private mode
  }
}
