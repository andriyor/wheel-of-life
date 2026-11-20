import { useEffect, useState } from 'react'
import { habitResult, noHabits, type Exercise, type Habits } from './habits.ts'

const KEY = 'wheel-of-life:habits'

function load(): Habits {
  try {
    return { ...noHabits(), ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return noHabits() // private mode or bad data
  }
}

const EXERCISE: [Exercise, string][] = [
  ['none', 'Rarely'],
  ['little', 'A little (under 75 min a week)'],
  ['some', 'About 2.5 h a week'],
  ['lots', 'About an hour a day'],
]

const CHECKS: [Exclude<keyof Habits, 'exercise'>, string][] = [
  ['smoke', 'I smoke'],
  ['drink', 'I have 25+ drinks a week'],
  ['sit', 'I sit 3+ hours a day'],
  ['tv', 'I watch TV or screens 2+ hours a day for fun'],
  ['sitAllDay', 'Most days I sit 8+ hours and barely move'],
  ['alone', 'I live alone'],
  ['isolated', 'I rarely see people in person'],
  ['lonely', 'I often feel lonely'],
  ['read', 'I read books'],
]

export function HowILive() {
  const [h, setH] = useState(load)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(h))
    } catch {
      /* storage blocked: still works for this visit */
    }
  }, [h])

  const r = habitResult(h)
  const total = Math.max(r.gained + r.lost, 1)

  return (
    <section className="card research how-i-live" aria-label="How I live">
      <h2>How do you live?</h2>
      <p className="intro">Tick what's true for you. Nothing leaves this device.</p>

      <div className="habit-form">
        <fieldset>
          <legend>How much do you move on purpose (walking briskly counts)?</legend>
          {EXERCISE.map(([id, label]) => (
            <label key={id}>
              <input type="radio" name="exercise" checked={h.exercise === id} onChange={() => setH({ ...h, exercise: id })} /> {label}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Which of these are true?</legend>
          {CHECKS.map(([id, label]) => (
            <label key={id}>
              <input type="checkbox" checked={h[id]} onChange={(e) => setH({ ...h, [id]: e.target.checked })} /> {label}
            </label>
          ))}
        </fieldset>
      </div>

      <div className="habit-result" aria-live="polite">
        <div className="tally">
          <span className="gain">+{r.gained} years</span>
          <span className="loss">−{r.lost} years</span>
        </div>
        <div className="split" aria-hidden="true">
          <span className="gain" style={{ width: `${(r.gained / total) * 100}%` }} />
          <span className="loss" style={{ width: `${(r.lost / total) * 100}%` }} />
        </div>
        {r.effects.length > 0 && (
          <ul>
            {r.effects.map((e) => (
              <li key={e.label} className={(e.years ?? -1) < 0 ? 'loss' : 'gain'}>
                {e.label}: {e.years !== undefined ? `${e.years > 0 ? '+' : '−'}${Math.abs(e.years)} years` : `+${e.risk}% risk of dying early`}
              </li>
            ))}
            {r.moodLift && <li className="gain">Better mood: about 20% fewer bad mental-health days</li>}
          </ul>
        )}
        <p className="next">
          <strong>Your best next step:</strong> {r.next ?? 'You are already doing the big things. Keep going, and be kind to yourself on off days.'}
        </p>
        <p className="support">
          A rough guide, not a forecast: each number comes from a different study below, compared with people without
          that habit. Real effects overlap and depend on genes, money, and luck.
        </p>
      </div>
    </section>
  )
}
