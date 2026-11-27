import { HeartHandshake } from 'lucide-react'

const IDEAS = [
  'Send a short message or voice note to someone you like',
  'Take a walk, have lunch, or share a small everyday moment with someone',
  'Call a friend or family member for a few minutes',
]

export function SocialConnection() {
  return (
    <section className="card research social-connection" aria-label="Social connection">
      <h2><HeartHandshake size={22} className="inline" /> A little human contact can change the feel of a day</h2>
      <p>
        A quiet day on its own is not a problem. Chosen solitude can be restorative. It may feel different when
        you wanted company but had no chance to connect, especially if that happens often.
      </p>

      <div className="connection-note">
        <strong>Notice the pattern, and how it feels.</strong>
        <p>
          If you work remotely, live alone, or spend most of the day at a screen, contact can disappear from the
          routine without you noticing. A real conversation, shared walk, meal, or phone call can offer a small
          moment of connection. It does not have to be a deep talk.
        </p>
      </div>

      <h3>Want a low-pressure starting point?</h3>
      <ul>
        {IDEAS.map((idea) => <li key={idea}>{idea}</li>)}
      </ul>

      <p className="support">
        There is no established daily minute target that suits everyone. Use 10–20 minutes as an easy invitation
        to connect if it would feel good, not as a quota. The quality of contact and whether it meets your needs
        matter more than watching a clock.
      </p>

      <div className="sources">
        <h3>Sources</h3>
        <ul>
          <li><a href="https://pubmed.ncbi.nlm.nih.gov/37337095/" target="_blank" rel="noreferrer">Systematic review of 90 cohort studies on social isolation, loneliness, and mortality</a> — long-term associations, not proof that one quiet day causes harm.</li>
          <li><a href="https://www.socialconnectionguidelines.org/en/evidence-briefs/how-much-social-time-do-we-need" target="_blank" rel="noreferrer">Social Connection Guidelines: How much social time do we need?</a> — survey findings and proposed ranges; not a clinical minimum.</li>
        </ul>
      </div>
    </section>
  )
}
