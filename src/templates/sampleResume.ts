import type { ResumeData } from '../types/resume'

export const sampleResume: ResumeData = {
  basics: {
    name: 'Jane Doe',
    label: 'Software Engineer',
    email: 'jane@example.com',
    phone: '+1 555 0100',
    url: 'https://jane.example.com',
    location: 'San Francisco, CA',
    summary:
      'Software engineer with 6 years of experience building TypeScript and Go services. Comfortable owning a feature end-to-end from RFC to ramp-up.',
  },
  work: [
    {
      company: 'Acme Corp',
      position: 'Senior Engineer',
      startDate: '2023',
      endDate: 'Present',
      location: 'Remote',
      highlights: [
        'Led migration of the billing service from monolith to event-sourced architecture, cutting p99 latency 40%.',
        'Mentored two junior engineers; both promoted within 18 months.',
      ],
    },
    {
      company: 'Initech',
      position: 'Software Engineer',
      startDate: '2020',
      endDate: '2023',
      highlights: [
        'Shipped self-serve API onboarding used by 300+ partners.',
        'Designed an idempotency layer that eliminated double-charge incidents.',
      ],
    },
  ],
  education: [
    {
      institution: 'State University',
      degree: 'B.S.',
      field: 'Computer Science',
      startDate: '2016',
      endDate: '2020',
      gpa: '3.8',
    },
  ],
  projects: [
    {
      name: 'tex-pdf-diff',
      description: 'Visual diff tool for LaTeX-rendered PDFs.',
      stack: ['TypeScript', 'Vite', 'PDF.js'],
      url: 'https://github.com/jane/tex-pdf-diff',
      highlights: ['Used by ~50 academic writers; 600 stars.'],
    },
  ],
  skills: [
    { category: 'Languages', items: ['TypeScript', 'Go', 'Python', 'SQL'] },
    { category: 'Tooling', items: ['React', 'Postgres', 'Kafka', 'Kubernetes'] },
  ],
  awards: [
    {
      title: 'Engineering Excellence Award',
      date: '2024',
      awarder: 'Acme Corp',
      summary: 'For the billing migration.',
    },
  ],
}
