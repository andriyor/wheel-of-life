import { useEffect, useState } from 'react'
import { ENERGY, MAX_VALUES, SPHERES, VALUES, type Sphere, type SphereId } from './data.ts'
import {
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
import { Wheel } from './Wheel.tsx'

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
  const focus = focusAreas(state, heavy ? 1 : 3)
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

      <main>
        <section className="card wheel-card" aria-label="Your wheel">
          <Wheel state={state} focus={focusIds} active={hover} onScore={(id, score) => update(id, { score })} onHover={setHover} />
          <p className="hint" aria-live="polite">
            {hover ? (
              <>
                {byId[hover].emoji} <strong>{byId[hover].name}</strong> feels {feeling(state.spheres[hover].score)} (
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

          {step === 0 && <CheckIn state={state} update={update} onHover={setHover} />}
          {step === 1 && <Values state={state} setState={setState} />}
          {step === 2 && <Tradeoffs state={state} update={update} focus={focusIds} onHover={setHover} />}
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
                  if (confirm('Start a fresh check-in? This clears your answers.')) {
                    setState(initialState())
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
    </div>
  )
}

const tint = (color: string) => ({ '--c': color }) as React.CSSProperties

function CheckIn({ state, update, onHover }: { state: State; update: Update; onHover: Hover }) {
  return (
    <div>
      <p className="intro">No right answers. Go with your first feeling — you can change it any time.</p>
      <div className="list">
        {SPHERES.map((s) => {
          const st = state.spheres[s.id]
          return (
            <div key={s.id} className="row" style={tint(s.color)} onMouseEnter={() => onHover(s.id)}>
              <label className="row-head" htmlFor={`score-${s.id}`}>
                <span className="emoji">{s.emoji}</span>
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
                  <p>💛 {s.reframe}</p>
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
                  {v.feeds.map((f) => byId[f].emoji).join(' ')}
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

function Tradeoffs({ state, update, focus, onHover }: { state: State; update: Update; focus: SphereId[]; onHover: Hover }) {
  const left = energyLeft(state)
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
        You have <strong>{ENERGY} energy points</strong> this week. A point given to one area can't go to another —
        that's a tradeoff, not a failure.
      </p>
      <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={ENERGY} aria-valuenow={ENERGY - left} aria-label="Energy planned">
        {Array.from({ length: ENERGY }, (_, i) => (
          <span key={i} className={i < ENERGY - left ? 'used' : ''} />
        ))}
        <em>{left} left</em>
      </div>

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
              <span className="emoji">{s.emoji}</span>
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

      {wins.length > 0 && (
        <div className="wins">
          <h4>You did these anyway</h4>
          <ul>
            {wins.map((s) => (
              <li key={s.id}>
                {s.emoji} {state.spheres[s.id].didAnyway}
              </li>
            ))}
          </ul>
          <p>On a hard day, that is not “not enough”. That is effort.</p>
        </div>
      )}

      <p className="intro">
        {focus.length === 0
          ? 'Everything is either feeling great or set aside on purpose. Enjoy that. 🌤️'
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
                <span className="emoji">{s.emoji}</span> {i + 1}. {s.name}
              </h3>
              <p className="why">
                Feels {st.score}/10{why.length > 0 && <> and connects to {why.join(' & ')}</>}.
                {st.energy > 0 && <> {st.energy} energy planned.</>}
              </p>
              {st.notEnough && <p className="kind small-note">💛 {s.reframe}</p>}
              <ul className="tiny">
                {(heavy ? s.tinySteps.slice(0, 1) : s.tinySteps).map((t, k) => (
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
              {done > 0 && <p className="cheer">✨ {done === 1 ? 'One step done. That counts.' : `${done} steps done. Look at you.`}</p>}
            </li>
          )
        })}
      </ol>

      {resting.length > 0 && (
        <div className="resting">
          <h4>Resting on purpose</h4>
          <p>
            {resting.map((s) => `${s.emoji} ${s.name}`).join(' · ')} — you chose to let {resting.length === 1 ? 'this' : 'these'} be
            for now. That's a decision, not a failure.
          </p>
        </div>
      )}
    </div>
  )
}
