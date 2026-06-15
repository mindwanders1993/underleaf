import { create } from 'zustand'
import type {
  Project,
  ProjectFile,
  ProjectMode,
  CompilationState,
  EditorSettings,
  UIState,
  AuthState,
  CompileStatus,
  CompileError,
  AuthUser,
} from '../types/project'
import type { ResumeData } from '../types/resume'
import { getTemplate } from '../templates'

// Default mock LaTeX project
const DEFAULT_PROJECT: Project = {
  id: 'local-demo',
  name: 'My First Project',
  mode: 'raw',
  mainFile: 'main.tex',
  files: [
    {
      name: 'main.tex',
      type: 'tex',
      content: `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}

\\title{Welcome to Underleaf}
\\author{Author Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
Welcome to \\textbf{Underleaf}, a beautiful, free, and open-source LaTeX editor that runs entirely in your browser. 

\\section{Key Features}
\\begin{itemize}
    \\item \\textbf{Zero Server Cost}: LaTeX compiles entirely on your machine using WebAssembly.
    \\item \\textbf{Privacy-First}: Your source code and files never leave your browser.
    \\item \\textbf{Responsive Design}: Access and edit your documents on desktop, tablet, or mobile.
    \\item \\textbf{Offline-Ready}: Since compilation is local, you can compile without internet access.
\\end{itemize}

\\section{Equations Example}
Here is a famous physics equation:
\\begin{equation}
    E = mc^2
\\end{equation}

And the quadratic formula:
\\begin{equation}
    x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
\\end{equation}

\\section{Conclusion}
Start writing your documents, resumes, and research papers locally with zero setup!

\\end{document}
`,
    },
    {
      name: 'refs.bib',
      type: 'bib',
      content: `@article{einstein1905,
  author = {Einstein, Albert},
  title = {Zur Elektrodynamik bewegter Körper},
  journal = {Annalen der Physik},
  volume = {322},
  number = {10},
  pages = {891--921},
  year = {1905}
}
`,
    },
  ],
}

interface ProjectStoreState {
  currentProject: Project | null
  compilationState: CompilationState
  editorSettings: EditorSettings
  uiState: UIState
  authState: AuthState

  // Project Actions
  setCurrentProject: (project: Project | null) => void
  setMainFile: (fileName: string) => void
  updateFileContent: (fileName: string, content: string) => void
  createFile: (fileName: string, type: 'tex' | 'bib' | 'image' | 'other', initialContent?: string) => void
  deleteFile: (fileName: string) => void
  renameFile: (oldName: string, newName: string) => void

  // Resume / template actions (Module 5)
  setProjectMode: (mode: ProjectMode, seedResume?: ResumeData, seedTemplateId?: string) => void
  updateResume: (patch: Partial<ResumeData>) => void
  setTemplate: (templateId: string) => void
  ejectToRaw: () => void

  // Compilation Actions
  setCompileStatus: (status: CompileStatus) => void
  setCompilationResult: (pdfBlobUrl: string | null, logs: string[], errors: CompileError[]) => void
  resetCompilation: () => void

  // Settings Actions
  updateSettings: (settings: Partial<EditorSettings>) => void

  // UI Actions
  setUIState: (state: Partial<UIState>) => void

  // Auth Actions
  setAuth: (user: AuthUser | null) => void
}

export const useProjectStore = create<ProjectStoreState>((set) => ({
  // Initial States
  currentProject: DEFAULT_PROJECT,
  compilationState: {
    status: 'IDLE',
    pdfBlobUrl: null,
    logs: [],
    errors: [],
  },
  editorSettings: {
    theme: 'dark',
    fontSize: 14,
    autoCompile: false,
  },
  uiState: {
    activePanel: 'editor',
    sidebarOpen: true,
    logOpen: false,
  },
  authState: {
    user: null,
    isLoggedIn: false,
  },

  // Project Actions
  setCurrentProject: (project) => set({ currentProject: project }),

  setMainFile: (fileName) =>
    set((state) => {
      if (!state.currentProject) return {}
      if (!state.currentProject.files.some((f) => f.name === fileName)) return {}
      return {
        currentProject: {
          ...state.currentProject,
          mainFile: fileName,
        },
      }
    }),

  updateFileContent: (fileName, content) =>
    set((state) => {
      if (!state.currentProject) return {}
      const updatedFiles = state.currentProject.files.map((file) =>
        file.name === fileName ? { ...file, content } : file
      )
      return {
        currentProject: {
          ...state.currentProject,
          files: updatedFiles,
        },
      }
    }),

  createFile: (fileName, type, initialContent = '') =>
    set((state) => {
      if (!state.currentProject) return {}
      // Prevent duplicates
      if (state.currentProject.files.some((f) => f.name === fileName)) return {}

      const newFile: ProjectFile = {
        name: fileName,
        type,
        content: initialContent,
      }
      return {
        currentProject: {
          ...state.currentProject,
          files: [...state.currentProject.files, newFile],
        },
      }
    }),

  deleteFile: (fileName) =>
    set((state) => {
      if (!state.currentProject) return {}
      const filteredFiles = state.currentProject.files.filter((f) => f.name !== fileName)
      
      // If we deleted the main file, reassign to another tex file, or empty
      let nextMainFile = state.currentProject.mainFile
      if (nextMainFile === fileName) {
        const remainingTex = filteredFiles.find((f) => f.type === 'tex')
        nextMainFile = remainingTex ? remainingTex.name : ''
      }

      return {
        currentProject: {
          ...state.currentProject,
          files: filteredFiles,
          mainFile: nextMainFile,
        },
      }
    }),

  renameFile: (oldName, newName) =>
    set((state) => {
      if (!state.currentProject) return {}
      const updatedFiles = state.currentProject.files.map((file) =>
        file.name === oldName ? { ...file, name: newName } : file
      )
      const nextMainFile = state.currentProject.mainFile === oldName ? newName : state.currentProject.mainFile

      return {
        currentProject: {
          ...state.currentProject,
          files: updatedFiles,
          mainFile: nextMainFile,
        },
      }
    }),

  // Resume / template actions (Module 5)
  setProjectMode: (mode, seedResume, seedTemplateId) =>
    set((state) => {
      if (!state.currentProject) return {}
      const next: Project = { ...state.currentProject, mode }
      if (mode === 'structured') {
        if (!next.resume && seedResume) next.resume = seedResume
        if (!next.templateId && seedTemplateId) next.templateId = seedTemplateId
      }
      return { currentProject: next }
    }),

  updateResume: (patch) =>
    set((state) => {
      if (!state.currentProject) return {}
      const base: ResumeData = state.currentProject.resume ?? {
        basics: { name: '' },
        work: [],
        education: [],
        projects: [],
        skills: [],
      }
      return {
        currentProject: {
          ...state.currentProject,
          resume: { ...base, ...patch },
        },
      }
    }),

  setTemplate: (templateId) =>
    set((state) => {
      if (!state.currentProject) return {}
      return {
        currentProject: { ...state.currentProject, templateId },
      }
    }),

  ejectToRaw: () =>
    set((state) => {
      const project = state.currentProject
      if (!project || project.mode !== 'structured' || !project.resume) return {}
      const template = getTemplate(project.templateId)
      if (!template) return {}

      const rendered = template.render(project.resume)
      const mainTex: ProjectFile = { name: 'main.tex', type: 'tex', content: rendered.mainTex }
      const merged: ProjectFile[] = [mainTex, ...rendered.files.filter((f) => f.name !== 'main.tex')]

      return {
        currentProject: {
          ...project,
          mode: 'raw',
          files: merged,
          mainFile: 'main.tex',
          resume: undefined,
          templateId: undefined,
        },
      }
    }),

  // Compilation Actions
  setCompileStatus: (status) =>
    set((state) => ({
      compilationState: {
        ...state.compilationState,
        status,
      },
    })),

  setCompilationResult: (pdfBlobUrl, logs, errors) =>
    set({
      compilationState: {
        status: errors.length > 0 ? 'ERROR' : 'SUCCESS',
        pdfBlobUrl,
        logs,
        errors,
      },
    }),

  resetCompilation: () =>
    set({
      compilationState: {
        status: 'IDLE',
        pdfBlobUrl: null,
        logs: [],
        errors: [],
      },
    }),

  // Settings Actions
  updateSettings: (newSettings) =>
    set((state) => ({
      editorSettings: {
        ...state.editorSettings,
        ...newSettings,
      },
    })),

  // UI Actions
  setUIState: (newUIState) =>
    set((state) => ({
      uiState: {
        ...state.uiState,
        ...newUIState,
      },
    })),

  // Auth Actions
  setAuth: (user) =>
    set({
      authState: {
        user,
        isLoggedIn: !!user,
      },
    }),
}))
