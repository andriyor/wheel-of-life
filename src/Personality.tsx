import { TRAITS, TYPES, parseType, tips, type Trait } from './personality.ts'

// Lives inside the mood tab; the parent owns and saves `type` (e.g. "INFP-T").
export function Personality({ type, setType }: { type: string; setType: (t: string) => void }) {
  const p = parseType(type)
  const [code = '', suffix] = p ? type.trim().toUpperCase().split('-') : []
  const identity = suffix ? `-${suffix}` : ''
  const t = p && tips(p)

  return (
    <div className="personality">
      <div className="type-input">
        <label>
          My{' '}
          <a href="https://www.16personalities.com/free-personality-test" target="_blank" rel="noreferrer">
            16Personalities
          </a>{' '}
          type:{' '}
          <select value={code} onChange={(e) => setType(e.target.value && e.target.value + identity)}>
            <option value="">Choose…</option>
            {TYPES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Identity:{' '}
          <select value={identity} disabled={!code} onChange={(e) => setType(code + e.target.value)}>
            <option value="">Not sure</option>
            <option value="-A">Assertive (-A)</option>
            <option value="-T">Turbulent (-T)</option>
          </select>
        </label>
      </div>

      {p && t && (
        <details>
          <summary>What your type means</summary>
          <p className="support">
            The letters line up roughly with the Big Five traits psychologists use (
            <a href="https://pubmed.ncbi.nlm.nih.gov/2709300/" target="_blank" rel="noreferrer">
              McCrae &amp; Costa 1989
            </a>
            ), so we can match them to the research.
          </p>
          <ul className="traits">
            {(Object.keys(TRAITS) as Trait[]).map((trait) => (
              <li key={trait}>
                <strong>{TRAITS[trait].name}</strong>
                <span>{p[trait] ? TRAITS[trait][p[trait]] : 'pick Assertive or Turbulent to see this'}</span>
              </li>
            ))}
          </ul>
          {t.length > 0 && (
            <ul className="trait-tips">
              {t.map((tip) => (
                <li key={tip.text}>
                  <strong>{TRAITS[tip.trait].name}:</strong> {tip.text}{' '}
                  <a href={tip.link} target="_blank" rel="noreferrer">
                    Study ↗
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p className="support">A type is a rough picture, not a diagnosis. Real traits are on a sliding scale.</p>
        </details>
      )}
    </div>
  )
}
