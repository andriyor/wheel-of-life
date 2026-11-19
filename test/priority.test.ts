import { test } from 'node:test'
import assert from 'node:assert/strict'
import { energyLeft, focusAreas, importance, initialState, tradeoffFrom } from '../src/priority.ts'

test('core values raise the importance of the spheres they feed', () => {
  assert.equal(importance('money', []), 1)
  assert.equal(importance('money', ['security', 'freedom']), 3)
})

test('focus ranks gap × importance and skips what you let go of', () => {
  const s = initialState()
  s.values = ['connection']
  s.spheres.love.score = 3 // gap 7 × 2 = 14
  s.spheres.health.score = 2 // gap 8 × 1 = 8
  s.spheres.money.score = 1
  s.spheres.money.outOfControl = true
  s.spheres.fun.score = 1
  s.spheres.fun.goodEnough = true
  const ids = focusAreas(s).map((r) => r.id)
  assert.deepEqual(ids, ['love', 'family', 'health']) // connection also feeds family: gap 5 × 2
  assert.ok(!ids.includes('money') && !ids.includes('fun'))
})

test('energy is a fixed budget; tradeoff takes from the least important funded sphere', () => {
  const s = initialState()
  s.values = ['connection']
  s.spheres.love.energy = 6
  s.spheres.fun.energy = 4
  assert.equal(energyLeft(s), 0)
  assert.equal(tradeoffFrom(s, 'health'), 'fun')
  assert.equal(tradeoffFrom(s, 'fun'), 'love')
})
