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

export type Effort = 1 | 2 | 3 // tiny, medium, big

export type Task = {
  id: string
  title: string
  sphere: SphereId
  effort: Effort
  urgent: boolean
  done: boolean
}

export type State = {
  values: string[]
  tasks: Task[]
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
  tasks: [],
  lowEnergy: false,
  spheres: Object.fromEntries(SPHERES.map((s): [SphereId, SphereState] => [s.id, freshSphere()])) as Record<SphereId, SphereState>,
})

/** Fill in defaults so answers saved by an older version still load. */
export function withDefaults(saved: Partial<State>): State {
  return {
    values: saved.values ?? [],
    tasks: saved.tasks ?? [],
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

export type RankedTask = { task: Task; score: number; reasons: string[] }

/**
 * Open tasks, best one to do right now first. A task inherits its sphere's need (gap × importance, nothing if
 * you let it go), gains from energy you planned there and from being urgent, and loses by effort — much more so
 * on a heavy or low-energy day, so a small step beats a big one when you have less to give.
 */
export function rankTasks(state: State): RankedTask[] {
  const small = isHeavy(state) || state.lowEnergy
  return state.tasks
    .filter((t) => !t.done)
    .map((task) => {
      const st = state.spheres[task.sphere]
      const letGo = st.outOfControl || st.goodEnough
      const reasons: string[] = []
      if (task.urgent) reasons.push('it can\'t wait')
      if (letGo) reasons.push('you set this area aside for now')
      else if (st.score <= 5) reasons.push(`this area feels ${st.score}/10`)
      if (!letGo && importance(task.sphere, state.values) > 1) reasons.push('it connects to what matters to you')
      if (st.energy > 0) reasons.push(`you planned ${st.energy} energy here`)
      if (small && task.effort === 1) reasons.push('it\'s small enough for today')
      const raw = (letGo ? 1 : 1 + (10 - st.score) * importance(task.sphere, state.values)) + st.energy * 2 + (task.urgent ? 15 : 0)
      return { task, reasons, score: raw / (small ? task.effort ** 2 : task.effort) }
    })
    .sort((a, b) => b.score - a.score)
}
