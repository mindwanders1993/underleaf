import harvardCes from './posts/harvard-ces'
import stanfordBeam from './posts/stanford-beam'
import aiPromptCookbook from './posts/ai-prompt-cookbook'
import type { BlogPost } from './types'

export const POSTS: Record<string, BlogPost> = {
  [harvardCes.id]: harvardCes,
  [stanfordBeam.id]: stanfordBeam,
  [aiPromptCookbook.id]: aiPromptCookbook,
}

export function listPosts(): BlogPost[] {
  return Object.values(POSTS).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getPost(id: string): BlogPost | null {
  return POSTS[id] ?? null
}
