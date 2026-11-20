import { test } from 'node:test'
import assert from 'node:assert/strict'
import { moodSummary } from '../src/mood.ts'

test('nothing ticked: no average, suggests the top safe lifts', () => {
  const s = moodSummary([])
  assert.equal(s.average, undefined)
  assert.deepEqual(
    s.tryNext.map((a) => a.name),
    ['Dancing, theatre, concert', 'Museum, exhibition, library', 'Sports, running, exercise'],
  )
})

test('averages what you do and never suggests alcohol, gambling or work', () => {
  const s = moodSummary(['Walking, hiking', 'Working, studying', 'Drinking alcohol'])
  assert.equal(s.average, 2.2) // (6.18 - 5.43 + 5.73) / 3
  assert.equal(s.best?.name, 'Walking, hiking')
  assert.ok(s.alcohol)
  const all = moodSummary(['Dancing, theatre, concert', 'Museum, exhibition, library', 'Sports, running, exercise', 'Gardening', 'Singing, performing', 'Talking in person', 'Birdwatching, nature watching', 'Walking, hiking', 'Fishing, hunting', 'Hobbies, arts, crafts', 'Meditating, religious activities', 'Watching a sports match', 'Playing with children', 'Playing with pets', 'Listening to music', 'Games, puzzles', 'Shopping, errands', 'Watching TV, films', 'Computer, phone games', 'Eating, snacking', 'Cooking', 'Reading', 'Texting, email, social media'])
  assert.deepEqual(all.tryNext, [])
})
