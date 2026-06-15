import { describe, it, expect } from 'vitest'
import { toJsonResume, JSON_RESUME_SCHEMA } from './jsonResume'
import { sampleResume } from '../templates/sampleResume'

describe('toJsonResume', () => {
  it('maps work.company to work.name', () => {
    const v = toJsonResume(sampleResume)
    expect(v.work[0]!.name).toBe(sampleResume.work[0]!.company)
    expect(v.work[0]!.position).toBe(sampleResume.work[0]!.position)
  })

  it('flattens grouped skills to {name, keywords}', () => {
    const v = toJsonResume(sampleResume)
    expect(v.skills[0]).toEqual({
      name: 'Languages',
      keywords: ['TypeScript', 'Go', 'Python', 'SQL'],
    })
  })

  it('maps education degree+field to studyType+area', () => {
    const v = toJsonResume(sampleResume)
    expect(v.education[0]!.studyType).toBe('B.S.')
    expect(v.education[0]!.area).toBe('Computer Science')
  })

  it('maps location string to { city } object', () => {
    const v = toJsonResume(sampleResume)
    expect(v.basics.location).toEqual({ city: 'San Francisco, CA' })
  })

  it('omits awards key entirely when absent', () => {
    const v = toJsonResume({
      basics: { name: 'X' },
      work: [],
      education: [],
      projects: [],
      skills: [],
    })
    expect(v.awards).toBeUndefined()
  })

  it('emits the jsonresume schema URL', () => {
    expect(toJsonResume(sampleResume).$schema).toBe(JSON_RESUME_SCHEMA)
  })
})
