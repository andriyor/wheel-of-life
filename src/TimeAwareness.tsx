import { Clock3 } from 'lucide-react'

const CYCLE = [
  ['Observe', 'For 2–4 weeks, note time only in a few areas you want to understand better. Start with 3–4.'],
  ['Review', 'Once a week, look for patterns. Rough estimates are enough; the point is perspective, not precision.'],
  ['Adjust', 'If you want, change one small thing about your plan, time, or priorities. Then let the next week happen.'],
]

export function TimeAwareness() {
  return (
    <section className="card research time-awareness" aria-label="Time and attention">
      <h2><Clock3 size={22} className="inline" /> Use time tracking as a window, not a scoreboard</h2>
      <p>
        We can misremember how much time we give to the things that matter. A light record can help compare
        intentions with real life and show whether a goal fits the time you actually have.
      </p>

      <div className="connection-note">
        <strong>Time spent is not a measure of worth or quality.</strong>
        <p>
          Rest, a walk, or an unplanned conversation can matter without producing a measurable result. Avoid
          “productive” and “unproductive” labels, and stop tracking if it adds more pressure than clarity.
        </p>
      </div>

      <h3>A gentle review cycle</h3>
      <ol>
        {CYCLE.map(([title, description]) => <li key={title}><strong>{title}:</strong> {description}</li>)}
      </ol>

      <div className="connection-note">
        <strong>Numbers are a record you made, not an objective verdict.</strong>
        <p>
          You choose what to track and how to label it, so the picture is always partial. Time is a resource,
          not proof of progress: hours spent on a goal do not guarantee the approach is working. If setting up
          timers and reports starts replacing the activity itself, simplify or stop. Sometimes the useful next
          step is just to begin.
        </p>
      </div>

      <p className="support">
        Track only activities you want to understand, such as focused work, learning, movement, a hobby, or
        meaningful social time. Skip the rest of the day, don’t make up missed hours, and use your own baseline
        before setting goals. The system should take less effort than the question it helps answer.
      </p>

      <div className="sources">
        <h3>Sources</h3>
        <ul>
          <li><a href="https://doi.org/10.1080/01621459.1986.10478283" target="_blank" rel="noreferrer">Juster, “Response Errors in the Measurement of Time Use”</a> — recall period affects the quality of time-use estimates.</li>
          <li><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC13112514/" target="_blank" rel="noreferrer">Systematic review of workplace time-management interventions</a> — finds a small and mixed evidence base on wellbeing.</li>
          <li><a href="https://doi.org/10.1037/bul0000025" target="_blank" rel="noreferrer">Harkin et al., meta-analysis of goal-progress monitoring</a> — monitoring can support goal attainment; this is not evidence that tracking every hour improves life.</li>
        </ul>
      </div>
    </section>
  )
}
