// Subset of jsonresume.org schema v1.0.0 that we actually emit.

export interface JsonResumeBasics {
  name: string
  label?: string
  email?: string
  phone?: string
  url?: string
  summary?: string
  location?: { city?: string }
}

export interface JsonResumeWork {
  name: string // organisation
  position: string
  startDate?: string
  endDate?: string
  location?: string
  highlights?: string[]
}

export interface JsonResumeEducation {
  institution: string
  area?: string
  studyType?: string
  startDate?: string
  endDate?: string
  score?: string
}

export interface JsonResumeProject {
  name: string
  description?: string
  url?: string
  keywords?: string[]
  highlights?: string[]
}

export interface JsonResumeSkill {
  name: string // category
  keywords: string[]
}

export interface JsonResumeAward {
  title: string
  date?: string
  awarder?: string
  summary?: string
}

export interface JsonResumeRoot {
  $schema: string
  basics: JsonResumeBasics
  work: JsonResumeWork[]
  education: JsonResumeEducation[]
  projects: JsonResumeProject[]
  skills: JsonResumeSkill[]
  awards?: JsonResumeAward[]
}
