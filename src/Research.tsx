import { useState } from 'react'
import { MoodResearch } from './MoodResearch.tsx'
import { HowILive } from './HowILive.tsx'
import { HabitsResearch } from './HabitsResearch.tsx'
import { SocialConnection } from './SocialConnection.tsx'
import { Activity, HeartHandshake, Sparkles, TrendingUp } from 'lucide-react'

const TABS = [
  { id: 'mood', label: 'What lifts mood', hint: 'right now', Icon: Sparkles, Panel: MoodResearch },
  { id: 'life', label: 'How you live', hint: 'your read-out', Icon: Activity, Panel: HowILive },
  { id: 'years', label: 'Years & risk', hint: 'the evidence', Icon: TrendingUp, Panel: HabitsResearch },
  { id: 'connection', label: 'Social connection', hint: 'small steps', Icon: HeartHandshake, Panel: SocialConnection },
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
            <strong><t.Icon size={18} aria-hidden="true" /> {t.label}</strong>
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
