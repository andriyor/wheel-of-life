import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TYPES, fitsYou, parseType, tips } from '../src/personality.ts'
import { ACTIVITIES } from '../src/mood.ts'

test('parses 16Personalities codes, with or without -A/-T, any case', () => {
  assert.deepEqual(parseType(' infp-t '), {
    extraversion: 'low',
    openness: 'high',
    agreeableness: 'high',
    conscientiousness: 'low',
    stability: 'low',
  })
  assert.equal(parseType('ESTJ')?.stability, undefined)
  assert.equal(parseType('XYZW'), undefined)
  assert.equal(parseType('INFP-X'), undefined)
})

test('tips follow the type, and every highlighted activity exists on the mood tab', () => {
  const p = parseType('INFP-T')!
  assert.deepEqual(
    tips(p).map((t) => t.trait),
    ['stability', 'extraversion', 'conscientiousness', 'openness'],
  )
  const names = new Set(ACTIVITIES.map((a) => a.name))
  for (const type of ['INFP-T', 'ESTJ-A', 'ENFJ-T', 'ISTP'])
    for (const a of fitsYou(parseType(type)!)) assert.ok(names.has(a), a)
})

test('the picker lists all 16 types, each parseable', () => {
  assert.equal(new Set(TYPES).size, 16)
  assert.ok(TYPES.every((t) => parseType(t)))
})
