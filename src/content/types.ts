export interface BlogPost {
  id: string
  title: string
  summary: string
  tags: string[]
  source?: { label: string; url: string }
  updatedAt: string // ISO date
  body: string // markdown
}
