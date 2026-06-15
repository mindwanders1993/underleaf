export interface ResumeBasics {
  name: string
  label?: string
  email?: string
  phone?: string
  url?: string
  location?: string
  summary?: string
}

export interface ResumeWork {
  company: string
  position: string
  startDate?: string
  endDate?: string
  location?: string
  highlights?: string[]
}

export interface ResumeEducation {
  institution: string
  degree?: string
  field?: string
  startDate?: string
  endDate?: string
  gpa?: string
  highlights?: string[]
}

export interface ResumeProject {
  name: string
  description?: string
  url?: string
  stack?: string[]
  highlights?: string[]
}

export interface ResumeSkillGroup {
  category: string
  items: string[]
}

export interface ResumeAward {
  title: string
  date?: string
  awarder?: string
  summary?: string
}

export interface ResumeData {
  basics: ResumeBasics
  work: ResumeWork[]
  education: ResumeEducation[]
  projects: ResumeProject[]
  skills: ResumeSkillGroup[]
  awards?: ResumeAward[]
}
