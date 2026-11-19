import { useRef } from 'react'
import { SPHERES, type SphereId } from './data.ts'
import { SphereIcon } from './icons.tsx'
import { importance, type State } from './priority.ts'

const C = 210
const R0 = 30
const R = 150
const STEP = 360 / SPHERES.length

const xy = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return [C + r * Math.cos(a), C + r * Math.sin(a)]
}
const polar = (r: number, deg: number) => xy(r, deg).map((n) => n.toFixed(2)).join(' ')

function sector(r1: number, r2: number, a1: number, a2: number) {
  return `M ${polar(r1, a1)} L ${polar(r2, a1)} A ${r2} ${r2} 0 0 1 ${polar(r2, a2)} L ${polar(r1, a2)} A ${r1} ${r1} 0 0 0 ${polar(r1, a1)} Z`
}

const at = (r: number, deg: number) => {
  const [x, y] = xy(r, deg)
  return { x, y }
}
const radius = (score: number) => R0 + (score / 10) * (R - R0)
const startAngle = (i: number) => -90 + i * STEP

type Props = {
  state: State
  focus: SphereId[]
  active?: SphereId
  onScore: (id: SphereId, score: number) => void
  onHover: (id?: SphereId) => void
}

export function Wheel({ state, focus, active, onScore, onHover }: Props) {
  const svg = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)

  // Click or drag on a slice to set how it feels: closer to the edge = better.
  function pick(e: React.PointerEvent) {
    const box = svg.current!.getBoundingClientRect()
    const x = ((e.clientX - box.left) / box.width) * 420 - C
    const y = ((e.clientY - box.top) / box.height) * 420 - C
    const dist = Math.hypot(x, y)
    if (dist > R + 14) return
    const deg = ((Math.atan2(y, x) * 180) / Math.PI + 90 + 360) % 360
    const sphere = SPHERES[Math.floor(deg / STEP)]
    const score = Math.min(10, Math.max(1, Math.round(((dist - R0) / (R - R0)) * 10)))
    onScore(sphere.id, score)
  }

  const summary = SPHERES.map((s) => `${s.name} ${state.spheres[s.id].score} of 10`).join(', ')

  return (
    <svg
      ref={svg}
      className="wheel"
      viewBox="0 0 420 420"
      role="img"
      aria-label={`Wheel of life: ${summary}`}
      onPointerDown={(e) => {
        dragging.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        pick(e)
      }}
      onPointerMove={(e) => dragging.current && pick(e)}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => onHover(undefined)}
    >
      {[2, 4, 6, 8, 10].map((n) => (
        <circle key={n} cx={C} cy={C} r={radius(n)} className="grid" />
      ))}

      {SPHERES.map((s, i) => {
        const st = state.spheres[s.id]
        const a1 = startAngle(i) + 1.2
        const a2 = startAngle(i + 1) - 1.2
        const mid = (a1 + a2) / 2
        const letGo = st.outOfControl || st.goodEnough
        const isFocus = focus.includes(s.id)
        const stars = importance(s.id, state.values) - 1
        return (
          <g
            key={s.id}
            className={`slice${active === s.id ? ' active' : ''}${letGo ? ' let-go' : ''}`}
            onPointerEnter={() => onHover(s.id)}
          >
            <path d={sector(R0, R, a1, a2)} fill={s.color} className="slice-bg" />
            <path d={sector(R0, radius(st.score), a1, a2)} fill={s.color} className="slice-fill" />
            {isFocus && <path d={sector(R0, R, a1, a2)} className="slice-focus" stroke={s.color} />}
            {Array.from({ length: st.energy }, (_, k) => {
              const a = a1 + ((a2 - a1) * (k + 0.5)) / Math.max(st.energy, 6)
              const [x, y] = xy(R + 9, a)
              return <circle key={k} cx={x} cy={y} r={3.2} fill={s.color} />
            })}
            <SphereIcon id={s.id} size={24} x={at(R + 32, mid).x - 12} y={at(R + 32, mid).y - 12} />
            {stars > 0 && (
              <text {...at(R + 50, mid)} className="slice-stars">
                {'★'.repeat(stars)}
              </text>
            )}
          </g>
        )
      })}
      <circle cx={C} cy={C} r={R0 - 4} className="hub" />
    </svg>
  )
}
