import { useEffect, useState } from 'react'
import { MAX_VALUES, SPHERES, VALUES, type Sphere, type SphereId } from './data.ts'
import {
  budget,
  energyLeft,
  focusAreas,
  importance,
  initialState,
  isHeavy,
  tradeoffFrom,
  withDefaults,
  type SphereState,
  type State,
} from './priority.ts'
import { HeartHandshake, Sparkles } from 'lucide-react'
import { SphereIcon } from './icons.tsx'
import { Wheel } from './Wheel.tsx'
import { Tasks } from './Tasks.tsx'
import { MoodResearch } from './MoodResearch.tsx'
import { HabitsResearch } from './HabitsResearch.tsx'

const KEY = 'wheel-of-life:v1'
const byId = Object.fromEntries(SPHERES.map((s) => [s.id, s])) as Record<SphereId, Sphere>

function load(): State {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (saved?.spheres) return withDefaults(saved)
  } catch {
    /* private mode or bad data: start fresh */
  }
  return initialState()
}

const feeling = (n: number) => (n <= 3 ? 'rough' : n <= 5 ? 'so-so' : n <= 7 ? 'okay' : n <= 9 ? 'good' : 'great')

const STEPS = ['Check in', 'What matters', 'Tradeoffs', 'Focus'] as const

type Update = (id: SphereId, patch: Partial<SphereState>) => void
type Hover = (id?: SphereId) => void

export default function App() {
  const [state, setState] = useState(load)
  const [step, setStep] = useState(0)
  const [hover, setHover] = useState<SphereId>()

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage blocked: the app still works for this visit */
    }
  }, [state])

  const update: Update = (id, patch) =>
    setState((s) => ({ ...s, spheres: { ...s.spheres, [id]: { ...s.spheres[id], ...patch } } }))

  const heavy = isHeavy(state)
  // Less to give = fewer areas to hold.
  const focus = focusAreas(state, heavy ? 1 : state.lowEnergy ? 2 : 3)
  const setLowEnergy = (lowEnergy: boolean) => setState((s) => ({ ...s, lowEnergy }))
  const focusIds = focus.map((f) => f.id)

  return (
    <div className="app">
      <header>
        <h1>Wheel of Life</h1>
        <p className="lede">
          A gentle check-in. You can't pour into every area at once — and you don't have to. Let's find the one or two
          that matter most right now.
        </p>
      </header>

      <Tasks state={state} setState={setState} />

      <main>
        <section className="card wheel-card" aria-label="Your wheel">
          <Wheel state={state} focus={focusIds} active={hover} onScore={(id, score) => update(id, { score })} onHover={setHover} />
          <p className="hint" aria-live="polite">
            {hover ? (
              <>
                <SphereIcon id={hover} size={18} className="inline" /> <strong>{byId[hover].name}</strong> feels {feeling(state.spheres[hover].score)} (
                {state.spheres[hover].score}/10)
              </>
            ) : (
              'Tap or drag a slice to change it. Bumpy is normal — no wheel is perfectly round.'
            )}
          </p>
          <ul className="legend">
            <li>
              <span className="swatch dashed" /> focus
            </li>
            <li>★ matters to you</li>
            <li>● energy this week</li>
            <li>
              <span className="swatch faded" /> letting go
            </li>
          </ul>
        </section>

        <section className="card panel">
          <nav className="steps" aria-label="Steps">
            {STEPS.map((label, i) => (
              <button key={label} aria-current={i === step ? 'step' : undefined} onClick={() => setStep(i)}>
                <span className="num">{i + 1}</span> {label}
              </button>
            ))}
          </nav>

          {step === 0 && <CheckIn state={state} update={update} onHover={setHover} setLowEnergy={setLowEnergy} />}
          {step === 1 && <Values state={state} setState={setState} />}
          {step === 2 && <Tradeoffs state={state} update={update} focus={focusIds} onHover={setHover} setLowEnergy={setLowEnergy} />}
          {step === 3 && <Focus state={state} update={update} focus={focus} heavy={heavy} />}

          <footer className="panel-nav">
            {step > 0 && (
              <button className="ghost" onClick={() => setStep(step - 1)}>
                ← Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button className="primary" onClick={() => setStep(step + 1)}>
                Next: {STEPS[step + 1]} →
              </button>
            ) : (
              <button
                className="ghost"
                onClick={() => {
                  if (confirm('Start a fresh check-in? This clears your answers (tasks stay).')) {
                    setState((s) => ({ ...initialState(), tasks: s.tasks }))
                    setStep(0)
                  }
                }}
              >
                Start fresh
              </button>
            )}
          </footer>
        </section>
      </main>

      <MoodResearch />
      <HabitsResearch />
    </div>
  )
}

const tint = (color: string) => ({ '--c': color }) as React.CSSProperties

function LowEnergyToggle({ on, set }: { on: boolean; set: (on: boolean) => void }) {
  return (
    <label className={`low-energy${on ? ' on' : ''}`}>
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} />
      <span>
        <strong>My body or mind has less to give right now</strong>
        <small>Illness, pain, depression, burnout, a bad week. Halves your energy and makes every step rest-sized.</small>
      </span>
    </label>
  )
}

function CheckIn({
  state,
  update,
  onHover,
  setLowEnergy,
}: {
  state: State
  update: Update
  onHover: Hover
  setLowEnergy: (on: boolean) => void
}) {
  return (
    <div>
      <p className="intro">No right answers. Go with your first feeling — you can change it any time.</p>
      <LowEnergyToggle on={state.lowEnergy} set={setLowEnergy} />
      <div className="list">
        {SPHERES.map((s) => {
          const st = state.spheres[s.id]
          return (
            <div key={s.id} className="row" style={tint(s.color)} onMouseEnter={() => onHover(s.id)}>
              <label className="row-head" htmlFor={`score-${s.id}`}>
                <span className="icon">
                  <SphereIcon id={s.id} size={24} />
                </span>
                <span className="grow">
                  <strong>{s.name}</strong>
                  <small>{s.question}</small>
                </span>
                <span className="score">
                  {st.score}
                  <small>{feeling(st.score)}</small>
                </span>
              </label>
              <input
                id={`score-${s.id}`}
                type="range"
                min={1}
                max={10}
                value={st.score}
                onChange={(e) => update(s.id, { score: +e.target.value })}
              />
              <div className="checks">
                <label>
                  <input type="checkbox" checked={st.outOfControl} onChange={(e) => update(s.id, { outOfControl: e.target.checked })} />
                  Not in my control right now
                </label>
                <label>
                  <input type="checkbox" checked={st.goodEnough} onChange={(e) => update(s.id, { goodEnough: e.target.checked })} />
                  Good enough for this season
                </label>
                <label>
                  <input type="checkbox" checked={st.notEnough} onChange={(e) => update(s.id, { notEnough: e.target.checked })} />
                  The “I'm not enough” voice is loud here
                </label>
              </div>
              {st.notEnough && (
                <div className="kind">
                  <p>
                    <HeartHandshake size={18} className="inline" /> {s.reframe}
                  </p>
                  <label>
                    One thing I did here anyway, even tiny:
                    <input
                      type="text"
                      value={st.didAnyway}
                      placeholder="e.g. I got out of bed, I replied to one message, I washed one plate"
                      onChange={(e) => update(s.id, { didAnyway: e.target.value })}
                    />
                  </label>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Values({ state, setState }: { state: State; setState: React.Dispatch<React.SetStateAction<State>> }) {
  const full = state.values.length >= MAX_VALUES
  const toggle = (id: string, on: boolean) =>
    setState((s) => ({ ...s, values: on ? [...s.values, id] : s.values.filter((v) => v !== id) }))
  return (
    <div>
      <p className="intro">
        Pick up to <strong>{MAX_VALUES}</strong> things that matter most to you. They decide which areas are worth your
        limited energy. ({state.values.length}/{MAX_VALUES})
      </p>
      <div className="values">
        {VALUES.map((v) => {
          const on = state.values.includes(v.id)
          return (
            <label key={v.id} className={`value${on ? ' on' : ''}${full && !on ? ' off' : ''}`}>
              <input type="checkbox" checked={on} disabled={full && !on} onChange={(e) => toggle(v.id, e.target.checked)} />
              <span>
                <strong>{v.name}</strong>
                <small>{v.hint}</small>
                <span className="feeds" title={`Feeds ${v.feeds.map((f) => byId[f].name).join(', ')}`}>
                  {v.feeds.map((f) => (
                    <SphereIcon key={f} id={f} size={16} />
                  ))}
                </span>
              </span>
            </label>
          )
        })}
      </div>
      {full && <p className="note">That's your three. To swap one, untick it first.</p>}
    </div>
  )
}

function Tradeoffs({
  state,
  update,
  focus,
  onHover,
  setLowEnergy,
}: {
  state: State
  update: Update
  focus: SphereId[]
  onHover: Hover
  setLowEnergy: (on: boolean) => void
}) {
  const total = budget(state)
  const left = energyLeft(state)
  const used = Math.min(total, total - left)
  const [blocked, setBlocked] = useState<SphereId>()
  const from = blocked && tradeoffFrom(state, blocked)

  function add(id: SphereId) {
    if (left > 0) {
      setBlocked(undefined)
      update(id, { energy: state.spheres[id].energy + 1 })
    } else setBlocked(id)
  }

  return (
    <div>
      <p className="intro">
        You have <strong>{total} energy points</strong> this week. A point given to one area can't go to another —
        that's a tradeoff, not a failure.
      </p>
      <LowEnergyToggle on={state.lowEnergy} set={setLowEnergy} />
      <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={total} aria-valuenow={used} aria-label="Energy planned">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < used ? 'used' : ''} />
        ))}
        <em>{left >= 0 ? `${left} left` : `${-left} over`}</em>
      </div>
      {left < 0 && (
        <p className="tradeoff" role="status">
          You have less to give than you planned — that's okay. Take {-left} point{left === -1 ? '' : 's'} back from
          wherever hurts least.
        </p>
      )}

      {blocked && from && (
        <div className="tradeoff" role="status">
          <span>
            Out of energy. To give <strong>{byId[blocked].name}</strong> more, take one from <strong>{byId[from].name}</strong>?
          </span>
          <span className="actions">
            <button
              className="primary small"
              onClick={() => {
                update(from, { energy: state.spheres[from].energy - 1 })
                update(blocked, { energy: state.spheres[blocked].energy + 1 })
                setBlocked(undefined)
              }}
            >
              Move it
            </button>
            <button className="ghost small" onClick={() => setBlocked(undefined)}>
              Keep as is
            </button>
          </span>
        </div>
      )}

      <div className="list">
        {SPHERES.map((s) => {
          const st = state.spheres[s.id]
          const letGo = st.outOfControl || st.goodEnough
          return (
            <div key={s.id} className={`row compact${letGo ? ' let-go' : ''}`} style={tint(s.color)} onMouseEnter={() => onHover(s.id)}>
              <span className="icon">
                <SphereIcon id={s.id} size={22} />
              </span>
              <span className="grow">
                <strong>{s.name}</strong>
                <small>
                  {'★'.repeat(importance(s.id, state.values) - 1)} feels {st.score}/10
                  {focus.includes(s.id) && <span className="tag">suggested</span>}
                  {letGo && <span className="tag muted">letting go</span>}
                </small>
              </span>
              <button className="round" aria-label={`Less energy for ${s.name}`} disabled={!st.energy} onClick={() => update(s.id, { energy: st.energy - 1 })}>
                −
              </button>
              <span className="energy" aria-label={`${st.energy} points`}>
                {st.energy}
              </span>
              <button className="round" aria-label={`More energy for ${s.name}`} onClick={() => add(s.id)}>
                +
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Focus({
  state,
  update,
  focus,
  heavy,
}: {
  state: State
  update: Update
  focus: ReturnType<typeof focusAreas>
  heavy: boolean
}) {
  const small = heavy || state.lowEnergy
  const hurting = SPHERES.filter((s) => (s.id === 'health' || s.id === 'mind') && state.spheres[s.id].score <= 3)
  const resting = SPHERES.filter((s) => state.spheres[s.id].outOfControl || state.spheres[s.id].goodEnough)
  const wins = SPHERES.filter((s) => state.spheres[s.id].didAnyway.trim())
  return (
    <div>
      {heavy && (
        <div className="heavy" role="note">
          <h4>This looks like a heavy season.</h4>
          <p>
            When everything feels low, the goal is not to fix your life — it's to get through today a little more
            gently. So here is just <strong>one</strong> area and its smallest step. Getting through is enough.
          </p>
          <p className="support">
            If the heaviness doesn't lift, or you have thoughts of hurting yourself, you deserve real support: talk to
            someone you trust, a doctor, or a free helpline — find one in your country at{' '}
            <a href="https://findahelpline.com" target="_blank" rel="noreferrer">
              findahelpline.com
            </a>
            .
          </p>
        </div>
      )}

      {state.lowEnergy && (
        <div className="heavy" role="note">
          <h4>Low-energy mode</h4>
          <p>
            Rest is part of the plan, not a break from it. Every step below is rest-sized — doable from bed, on a bad
            day. Doing none of them is also allowed.
          </p>
        </div>
      )}

      {!heavy && hurting.length > 0 && (
        <p className="support">
          {hurting.map((s) => s.name).join(' and ')} {hurting.length === 1 ? 'feels' : 'feel'} rough. If it has been like
          this for a while, talking to a doctor or therapist is looking after yourself — not making a fuss.
        </p>
      )}

      {wins.length > 0 && (
        <div className="wins">
          <h4>You did these anyway</h4>
          <ul>
            {wins.map((s) => (
              <li key={s.id}>
                <SphereIcon id={s.id} size={16} className="inline" /> {state.spheres[s.id].didAnyway}
              </li>
            ))}
          </ul>
          <p>On a hard day, that is not “not enough”. That is effort.</p>
        </div>
      )}

      <p className="intro">
        {focus.length === 0
          ? 'Everything is either feeling great or set aside on purpose. Enjoy that.'
          : `Just ${focus.length === 1 ? 'this one' : `these ${focus.length}`}. Everything else can wait. Pick one tiny step — starting is the hard part.`}
      </p>

      <ol className="focus">
        {focus.map((f, i) => {
          const s = byId[f.id]
          const st = state.spheres[f.id]
          const why = VALUES.filter((v) => state.values.includes(v.id) && v.feeds.includes(f.id)).map((v) => v.name)
          const done = st.stepsDone.filter(Boolean).length
          return (
            <li key={f.id} className="focus-card" style={tint(s.color)}>
              <h3>
                <SphereIcon id={f.id} size={22} className="inline" /> {i + 1}. {s.name}
              </h3>
              <p className="why">
                Feels {st.score}/10{why.length > 0 && <> and connects to {why.join(' & ')}</>}.
                {st.energy > 0 && <> {st.energy} energy planned.</>}
              </p>
              {st.notEnough && <p className="kind small-note">
                  <HeartHandshake size={16} className="inline" /> {s.reframe}
                </p>}
              <ul className="tiny">
                {/* rest step uses its own slot (3) so ticks don't jump between modes */}
                {(small ? [[s.restStep, 3] as const] : s.tinySteps.map((t, k) => [t, k] as const)).map(([t, k]) => (
                  <li key={t}>
                    <label>
                      <input
                        type="checkbox"
                        checked={!!st.stepsDone[k]}
                        onChange={(e) => {
                          const stepsDone = [...st.stepsDone]
                          stepsDone[k] = e.target.checked
                          update(f.id, { stepsDone })
                        }}
                      />
                      {t}
                    </label>
                  </li>
                ))}
              </ul>
              {done > 0 && <p className="cheer">
                  <Sparkles size={16} className="inline" /> {done === 1 ? 'One step done. That counts.' : `${done} steps done. Look at you.`}</p>}
            </li>
          )
        })}
      </ol>

      {resting.length > 0 && (
        <div className="resting">
          <h4>Resting on purpose</h4>
          <p>
            {resting.map((s, i) => (
              <span key={s.id}>
                {i > 0 && ' · '}
                <SphereIcon id={s.id} size={16} className="inline" /> {s.name}
              </span>
            ))}{' '}
            — you chose to let {resting.length === 1 ? 'this' : 'these'} be
            for now. That's a decision, not a failure.
          </p>
        </div>
      )}
    </div>
  )
}
