import { test } from 'node:test'
import assert from 'node:assert/strict'
import { habitResult, noHabits } from '../src/habits.ts'

test('no habits checked: nothing gained or lost, suggests starting to move', () => {
  const r = habitResult(noHabits())
  assert.equal(r.gained, 0)
  assert.equal(r.lost, 0)
  assert.match(r.next ?? '', /Start small/)
})

test('years add up, sitting and TV are not double counted', () => {
  const r = habitResult({ ...noHabits(), smoke: true, drink: true, sit: true, tv: true, exercise: 'some', read: true })
  assert.equal(r.lost, 16.5) // 10 + 4.5 + 2 (TV overlaps sitting)
  assert.equal(r.gained, 5.3) // 3.4 + 1.9
  assert.match(r.next ?? '', /smoking/)
  assert.equal(r.effects[0].label, 'Smoking')
})

test('an hour a day of movement cancels the all-day sitting risk', () => {
  const lazy = habitResult({ ...noHabits(), sitAllDay: true })
  const active = habitResult({ ...noHabits(), sitAllDay: true, exercise: 'lots' })
  assert.ok(lazy.effects.some((e) => e.risk === 59))
  assert.ok(!active.effects.some((e) => e.risk === 59))
  assert.equal(active.next, undefined)
  assert.ok(active.moodLift)
})
