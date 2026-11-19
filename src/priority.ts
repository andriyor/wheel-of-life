import { ENERGY, LOW_ENERGY, SPHERES, VALUES, type SphereId } from './data.ts'

export type SphereState = {
  score: number // 1–10, how it feels right now
  outOfControl: boolean // "not mine to fix right now" — let it go
  goodEnough: boolean // "fine for this season" — no need to push
  energy: number // energy points planned this week
  stepsDone: boolean[]
  notEnough: boolean // "the 'I'm not enough' voice is loud here"
  didAnyway: string // evidence against that voice: one thing done, however small
}

export type State = {
  values: string[]
  lowEnergy: boolean // body or mind has less to give right now
  spheres: Record<SphereId, SphereState>
}

const freshSphere = (): SphereState => ({
  score: 5,
  outOfControl: false,
  goodEnough: false,
  energy: 0,
  stepsDone: [],
  notEnough: false,
  didAnyway: '',
})

export const initialState = (): State => ({
  values: [],
  lowEnergy: false,
  spheres: Object.fromEntries(SPHERES.map((s): [SphereId, SphereState] => [s.id, freshSphere()])) as Record<SphereId, SphereState>,
})

/** Fill in defaults so answers saved by an older version still load. */
export function withDefaults(saved: Partial<State>): State {
  return {
    values: saved.values ?? [],
    lowEnergy: saved.lowEnergy ?? false,
    spheres: Object.fromEntries(
      SPHERES.map((s): [SphereId, SphereState] => [s.id, { ...freshSphere(), ...saved.spheres?.[s.id] }]),
    ) as Record<SphereId, SphereState>,
  }
}

/** Most areas feel rough: shrink the plan to one area so it doesn't add to the weight. */
export const isHeavy = (state: State) =>
  SPHERES.reduce((sum, s) => sum + state.spheres[s.id].score, 0) / SPHERES.length <= 4

/** 1 = baseline, +1 for every chosen core value this sphere feeds. */
export function importance(id: SphereId, values: string[]): number {
  return 1 + VALUES.filter((v) => values.includes(v.id) && v.feeds.includes(id)).length
}

export type Ranked = { id: SphereId; weight: number; gap: number; priority: number }

/** Spheres worth your energy now: big gap × matters to you, minus what you chose to let go of. */
export function focusAreas(state: State, limit = 3): Ranked[] {
  return SPHERES.map((s) => {
    const st = state.spheres[s.id]
    const weight = importance(s.id, state.values)
    const gap = 10 - st.score
    return { id: s.id, weight, gap, priority: st.outOfControl || st.goodEnough ? 0 : gap * weight }
  })
    .filter((r) => r.priority > 0)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)
}

export const budget = (state: State) => (state.lowEnergy ? LOW_ENERGY : ENERGY)

/** Can go negative when the budget shrinks after planning; the UI asks to take points back. */
export const energyLeft = (state: State) =>
  budget(state) - SPHERES.reduce((sum, s) => sum + state.spheres[s.id].energy, 0)

/** When energy runs out, the sphere you'd give up a point from first: the least important one that has some. */
export function tradeoffFrom(state: State, forId: SphereId): SphereId | undefined {
  return SPHERES.filter((s) => s.id !== forId && state.spheres[s.id].energy > 0)
    .map((s) => ({ id: s.id, p: importance(s.id, state.values) * (10 - state.spheres[s.id].score) }))
    .sort((a, b) => a.p - b.p)[0]?.id
}
