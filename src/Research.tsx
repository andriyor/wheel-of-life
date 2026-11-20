import { useState } from 'react'
import { MoodResearch } from './MoodResearch.tsx'
import { HowILive } from './HowILive.tsx'
import { HabitsResearch } from './HabitsResearch.tsx'

const TABS = [
  { id: 'mood', label: 'What lifts mood', hint: 'right now', Panel: MoodResearch },
  { id: 'life', label: 'How you live', hint: 'your read-out', Panel: HowILive },
  { id: 'years', label: 'Years & risk', hint: 'the evidence', Panel: HabitsResearch },
] as const

// One topic at a time instead of one very long scroll.
export function Research() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('mood')
  const { Panel } = TABS.find((t) => t.id === tab)!
  return (
    <>
      <div className="tabs" role="tablist" aria-label="Research topics">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="research-panel"
            onClick={() => setTab(t.id)}
          >
            <strong>{t.label}</strong>
            <small>{t.hint}</small>
          </button>
        ))}
      </div>
      <div id="research-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        <Panel />
      </div>
    </>
  )
}
