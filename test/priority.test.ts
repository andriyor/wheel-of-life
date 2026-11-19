import { test } from 'node:test'
import assert from 'node:assert/strict'
import { budget, energyLeft, focusAreas, importance, initialState, isHeavy, rankTasks, tradeoffFrom, withDefaults } from '../src/priority.ts'

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

test('a heavy season is when the average feels 4 or lower', () => {
  const s = initialState()
  assert.equal(isHeavy(s), false)
  for (const id of Object.keys(s.spheres) as (keyof typeof s.spheres)[]) s.spheres[id].score = 3
  assert.equal(isHeavy(s), true)
})

test('older saved answers get the new fields', () => {
  const s = withDefaults({ spheres: { home: { score: 2 } } } as never)
  assert.equal(s.spheres.home.score, 2)
  assert.equal(s.spheres.home.didAnyway, '')
  assert.equal(s.spheres.money.score, 5)
})

test('a low-energy stretch halves the budget and can leave you over it', () => {
  const s = initialState()
  s.spheres.love.energy = 7
  s.lowEnergy = true
  assert.equal(budget(s), 5)
  assert.equal(energyLeft(s), -2)
})

test('tasks rank by sphere need, urgency and effort; low energy sinks big tasks', () => {
  const s = initialState()
  s.spheres.health.score = 2
  s.spheres.fun.score = 9
  const task = (id: string, sphere: 'health' | 'fun', effort: 1 | 2 | 3, urgent = false) =>
    ({ id, title: id, sphere, effort, urgent, done: false })
  s.tasks = [task('gym', 'health', 3), task('game', 'fun', 1), task('water', 'health', 1), { ...task('old', 'fun', 1), done: true }]
  assert.deepEqual(rankTasks(s).map((r) => r.task.id), ['water', 'gym', 'game']) // done tasks drop out
  s.tasks.push(task('bill', 'fun', 1, true))
  assert.equal(rankTasks(s)[0].task.id, 'bill') // urgent beats a calm area
  s.tasks = [task('gym', 'health', 3), task('game', 'fun', 1)]
  assert.equal(rankTasks(s)[0].task.id, 'gym')
  s.lowEnergy = true
  assert.equal(rankTasks(s)[0].task.id, 'game')
})
