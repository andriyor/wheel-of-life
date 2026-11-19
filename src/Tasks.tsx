import { useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { SPHERES, type SphereId } from './data.ts'
import { rankTasks, type Effort, type State, type Task } from './priority.ts'
import { SphereIcon } from './icons.tsx'

const EFFORT: Record<Effort, string> = { 1: 'tiny', 2: 'medium', 3: 'big' }
const byId = Object.fromEntries(SPHERES.map((s) => [s.id, s]))
const tint = (color: string) => ({ '--c': color }) as React.CSSProperties

export function Tasks({ state, setState }: { state: State; setState: React.Dispatch<React.SetStateAction<State>> }) {
  const [title, setTitle] = useState('')
  const [sphere, setSphere] = useState<SphereId>(SPHERES[0].id)
  const [effort, setEffort] = useState<Effort>(1)
  const [urgent, setUrgent] = useState(false)

  const setTasks = (f: (tasks: Task[]) => Task[]) => setState((s) => ({ ...s, tasks: f(s.tasks) }))
  const patch = (id: string, p: Partial<Task>) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...p } : t)))
  const remove = (id: string) => setTasks((ts) => ts.filter((t) => t.id !== id))

  const ranked = rankTasks(state)
  const [now, ...later] = ranked
  const done = state.tasks.filter((t) => t.done)

  return (
    <section className="card tasks" aria-label="Tasks">
      <h2>What to do right now</h2>
      <form
        className="task-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) return
          setTasks((ts) => [...ts, { id: crypto.randomUUID(), title: title.trim(), sphere, effort, urgent, done: false }])
          setTitle('')
          setUrgent(false)
        }}
      >
        <input aria-label="Task" placeholder="Add a task…" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select aria-label="Area" value={sphere} onChange={(e) => setSphere(e.target.value as SphereId)}>
          {SPHERES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select aria-label="Effort" value={effort} onChange={(e) => setEffort(+e.target.value as Effort)}>
          {([1, 2, 3] as const).map((n) => (
            <option key={n} value={n}>
              {EFFORT[n]}
            </option>
          ))}
        </select>
        <label>
          <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} /> urgent
        </label>
        <button className="primary small">Add</button>
      </form>

      {now ? (
        <div className="focus-card now" style={tint(byId[now.task.sphere].color)}>
          <small>Focus on this now</small>
          <h3>
            <SphereIcon id={now.task.sphere} size={22} className="inline" /> {now.task.title}
          </h3>
          <p className="why">
            {byId[now.task.sphere].name} · {EFFORT[now.task.effort]}
            {now.reasons.length > 0 && <> — because {now.reasons.join(', ')}.</>}
          </p>
          <button className="primary small" onClick={() => patch(now.task.id, { done: true })}>
            <Check size={16} className="inline" /> Done
          </button>
        </div>
      ) : (
        <p className="intro">{state.tasks.length ? 'All done. Rest counts too.' : 'Add a task and pick its area — I\'ll tell you which one to start with.'}</p>
      )}

      {later.length > 0 && (
        <>
          <h4>Then, if you have more in you</h4>
          <div className="list">
            {later.map(({ task }) => (
              <TaskRow key={task.id} task={task} onToggle={() => patch(task.id, { done: true })} onRemove={() => remove(task.id)} />
            ))}
          </div>
        </>
      )}

      {done.length > 0 && (
        <details>
          <summary>
            {done.length} done{' '}
            <button className="ghost small" onClick={(e) => {
                e.preventDefault() // don't also toggle the <details>
                setTasks((ts) => ts.filter((t) => !t.done))
              }}>
              Clear
            </button>
          </summary>
          <div className="list">
            {done.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={() => patch(task.id, { done: false })} onRemove={() => remove(task.id)} />
            ))}
          </div>
        </details>
      )}
    </section>
  )
}

function TaskRow({ task, onToggle, onRemove }: { task: Task; onToggle: () => void; onRemove: () => void }) {
  return (
    <div className={`row compact${task.done ? ' let-go' : ''}`} style={tint(byId[task.sphere].color)}>
      <input type="checkbox" aria-label={`Mark ${task.title} ${task.done ? 'not done' : 'done'}`} checked={task.done} onChange={onToggle} />
      <span className="icon">
        <SphereIcon id={task.sphere} size={20} />
      </span>
      <span className="grow">
        <strong>{task.title}</strong>
        <small>
          {byId[task.sphere].name} · {EFFORT[task.effort]}
          {task.urgent && <span className="tag">urgent</span>}
        </small>
      </span>
      <button className="round" aria-label={`Delete ${task.title}`} onClick={onRemove}>
        <Trash2 size={16} />
      </button>
    </div>
  )
}
