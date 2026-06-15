import { describe, it, expect } from 'vitest'
import { listPosts, getPost } from './registry'

describe('content registry', () => {
  it('lists at least three posts', () => {
    expect(listPosts().length).toBeGreaterThanOrEqual(3)
  })

  it('sorts by updatedAt descending', () => {
    const posts = listPosts()
    for (let i = 1; i < posts.length; i++) {
      expect(posts[i - 1]!.updatedAt.localeCompare(posts[i]!.updatedAt)).toBeGreaterThanOrEqual(0)
    }
  })

  it('every post has id, title, body and tags', () => {
    for (const p of listPosts()) {
      expect(p.id).toBeTruthy()
      expect(p.title).toBeTruthy()
      expect(p.body.length).toBeGreaterThan(100)
      expect(Array.isArray(p.tags)).toBe(true)
    }
  })

  it('getPost returns null for an unknown id', () => {
    expect(getPost('nope')).toBeNull()
  })

  it('getPost returns the matching post', () => {
    expect(getPost('harvard-ces')?.title).toMatch(/Harvard/i)
  })
})
