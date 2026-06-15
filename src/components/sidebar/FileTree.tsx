import { useEffect, useRef, useState } from 'react'
import {
  BookText,
  Cloud,
  FileCode,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  MoreVertical,
  Plus,
  Sparkles,
} from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useProjectSizeUsage } from '../../hooks/useProjectPersistence'
import { DEFAULT_TEMPLATE_ID } from '../../templates'
import { sampleResume } from '../../templates/sampleResume'
import TemplatePickerModal from '../templates/TemplatePickerModal'
import AssistantDrawer from '../ai/AssistantDrawer'
import BackupModal from '../backup/BackupModal'
import type { ProjectFile } from '../../types/project'
import './FileTree.css'

const TYPE_ICON: Record<ProjectFile['type'], typeof FileCode> = {
  tex: FileCode,
  bib: BookText,
  image: ImageIcon,
  other: FileText,
}

const CREATABLE_TYPES: Array<ProjectFile['type']> = ['tex', 'bib', 'other']

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

const FileTree = () => {
  const project = useProjectStore((s) => s.currentProject)
  const setMainFile = useProjectStore((s) => s.setMainFile)
  const createFile = useProjectStore((s) => s.createFile)
  const renameFile = useProjectStore((s) => s.renameFile)
  const deleteFile = useProjectStore((s) => s.deleteFile)
  const setProjectMode = useProjectStore((s) => s.setProjectMode)
  const setTemplate = useProjectStore((s) => s.setTemplate)
  const ejectToRaw = useProjectStore((s) => s.ejectToRaw)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerTriggerRef = useRef<HTMLButtonElement>(null)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const assistantTriggerRef = useRef<HTMLButtonElement>(null)
  const [backupOpen, setBackupOpen] = useState(false)
  const backupTriggerRef = useRef<HTMLButtonElement>(null)

  const [creating, setCreating] = useState<{ name: string; type: ProjectFile['type'] } | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [menuFor, setMenuFor] = useState<string | null>(null)

  const createInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  const { usagePercent, bytes, limit } = useProjectSizeUsage()

  useEffect(() => {
    if (creating) createInputRef.current?.focus()
  }, [creating])

  useEffect(() => {
    if (editingName) editInputRef.current?.focus()
  }, [editingName])

  useEffect(() => {
    if (!menuFor) return
    const close = () => setMenuFor(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuFor])

  if (!project) {
    return (
      <div className="ul-file-tree" data-testid="ul-file-tree-empty">
        <div className="ul-file-tree__header">
          <h3 className="ul-file-tree__title">Files</h3>
        </div>
        <p style={{ padding: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
          No project loaded.
        </p>
      </div>
    )
  }

  const startCreate = () => {
    setCreateError(null)
    setCreating({ name: '', type: 'tex' })
  }

  const commitCreate = () => {
    if (!creating) return
    const name = creating.name.trim()
    if (!name) {
      setCreateError('Name required.')
      return
    }
    if (project.files.some((f) => f.name === name)) {
      setCreateError('Name already exists.')
      return
    }
    createFile(name, creating.type, '')
    setCreating(null)
    setCreateError(null)
  }

  const startRename = (name: string) => {
    setEditingName(name)
    setEditValue(name)
    setEditError(null)
    setMenuFor(null)
  }

  const commitRename = () => {
    if (!editingName) return
    const next = editValue.trim()
    if (!next) {
      setEditError('Name required.')
      return
    }
    if (next === editingName) {
      setEditingName(null)
      return
    }
    if (project.files.some((f) => f.name === next)) {
      setEditError('Name already exists.')
      return
    }
    renameFile(editingName, next)
    setEditingName(null)
    setEditError(null)
  }

  const askDelete = (name: string) => {
    setMenuFor(null)
    const confirmed = typeof window !== 'undefined' && window.confirm(`Delete ${name}?`)
    if (confirmed) deleteFile(name)
  }

  const usageWarn = usagePercent > 80
  const usageOver = usagePercent > 100

  return (
    <div className="ul-file-tree" data-testid="ul-file-tree">
      <div className="ul-file-tree__header">
        <h3 className="ul-file-tree__title">Files</h3>
        <button
          type="button"
          className="ul-file-tree__new-btn"
          onClick={startCreate}
          aria-label="New file"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="ul-file-tree__list" role="listbox" aria-label="Project files">
        {creating && (
          <div className="ul-file-tree__new-row">
            <select
              className="ul-file-tree__type-select"
              value={creating.type}
              onChange={(e) =>
                setCreating({ ...creating, type: e.target.value as ProjectFile['type'] })
              }
              aria-label="File type"
            >
              {CREATABLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  .{t}
                </option>
              ))}
            </select>
            <input
              ref={createInputRef}
              className="ul-file-tree__row-input"
              value={creating.name}
              onChange={(e) => setCreating({ ...creating, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitCreate()
                if (e.key === 'Escape') setCreating(null)
              }}
              placeholder="filename.tex"
              aria-label="New file name"
            />
          </div>
        )}
        {createError && (
          <div className="ul-file-tree__error" role="alert">
            {createError}
          </div>
        )}

        {project.files.map((file) => {
          const Icon = TYPE_ICON[file.type] ?? FileText
          const isActive = file.name === project.mainFile
          const isEditing = editingName === file.name

          return (
            <div
              key={file.name}
              role="option"
              aria-selected={isActive}
              data-active={isActive}
              className="ul-file-tree__row"
              onClick={() => !isEditing && file.type === 'tex' && setMainFile(file.name)}
              onContextMenu={(e) => {
                e.preventDefault()
                setMenuFor(file.name)
              }}
            >
              <Icon size={14} className="ul-file-tree__row-icon" />
              {isEditing ? (
                <input
                  ref={editInputRef}
                  className="ul-file-tree__row-input"
                  value={editValue}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename()
                    if (e.key === 'Escape') {
                      setEditingName(null)
                      setEditError(null)
                    }
                  }}
                  onBlur={commitRename}
                  aria-label={`Rename ${file.name}`}
                />
              ) : (
                <span className="ul-file-tree__row-name">{file.name}</span>
              )}
              <button
                type="button"
                className="ul-file-tree__menu-btn"
                aria-label={`File actions for ${file.name}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuFor((current) => (current === file.name ? null : file.name))
                }}
              >
                <MoreVertical size={14} />
              </button>
              {menuFor === file.name && (
                <div
                  className="ul-file-tree__menu"
                  onClick={(e) => e.stopPropagation()}
                  role="menu"
                >
                  <button
                    type="button"
                    className="ul-file-tree__menu-item"
                    onClick={() => startRename(file.name)}
                    role="menuitem"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="ul-file-tree__menu-item ul-file-tree__menu-item--danger"
                    onClick={() => askDelete(file.name)}
                    role="menuitem"
                  >
                    Delete
                  </button>
                </div>
              )}
              {isEditing && editError && (
                <div className="ul-file-tree__error" role="alert">
                  {editError}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="ul-file-tree__footer" data-testid="ul-file-tree-footer">
        <div className="ul-file-tree__meter" aria-label="Storage usage">
          <span>{formatBytes(bytes)}</span>
          <div className="ul-file-tree__meter-bar">
            <div
              className="ul-file-tree__meter-fill"
              data-warn={usageWarn && !usageOver}
              data-over={usageOver}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <span>{Math.round(usagePercent)}%</span>
        </div>
        <span>limit {formatBytes(limit)} (localStorage)</span>
        {usageWarn && (
          <div className="ul-file-tree__warning" role="alert">
            {usageOver
              ? 'Over quota — recent changes are not being persisted.'
              : 'Project nearing localStorage limit.'}
          </div>
        )}

        {project.mode === 'raw' ? (
          <button
            type="button"
            className="ul-file-tree__mode-btn"
            onClick={() => setProjectMode('structured', sampleResume, DEFAULT_TEMPLATE_ID)}
            data-testid="ul-mode-toggle"
          >
            <FileText size={14} /> Switch to structured
          </button>
        ) : (
          <button
            type="button"
            className="ul-file-tree__mode-btn"
            onClick={ejectToRaw}
            data-testid="ul-mode-toggle"
          >
            <FileCode size={14} /> Eject to raw .tex
          </button>
        )}

        <button
          type="button"
          className="ul-file-tree__mode-btn"
          onClick={() => setPickerOpen(true)}
          ref={pickerTriggerRef}
          data-testid="ul-templates-btn"
        >
          <LayoutGrid size={14} /> Browse templates
        </button>

        <button
          type="button"
          className="ul-file-tree__mode-btn"
          onClick={() => setAssistantOpen(true)}
          ref={assistantTriggerRef}
          data-testid="ul-assistant-btn"
        >
          <Sparkles size={14} /> AI Assist
        </button>

        <button
          type="button"
          className="ul-file-tree__mode-btn"
          onClick={() => setBackupOpen(true)}
          ref={backupTriggerRef}
          data-testid="ul-backup-btn"
        >
          <Cloud size={14} /> Backup &amp; sync
        </button>
      </div>

      <TemplatePickerModal
        open={pickerOpen}
        selectedId={project.templateId ?? null}
        onPick={(id) => {
          if (project.mode === 'raw') {
            setProjectMode('structured', sampleResume, id)
          } else {
            setTemplate(id)
          }
          setPickerOpen(false)
          queueMicrotask(() => pickerTriggerRef.current?.focus())
        }}
        onClose={() => {
          setPickerOpen(false)
          queueMicrotask(() => pickerTriggerRef.current?.focus())
        }}
      />

      <AssistantDrawer
        open={assistantOpen}
        onClose={() => {
          setAssistantOpen(false)
          queueMicrotask(() => assistantTriggerRef.current?.focus())
        }}
      />

      <BackupModal
        key={backupOpen ? 'open' : 'closed'}
        open={backupOpen}
        onClose={() => {
          setBackupOpen(false)
          queueMicrotask(() => backupTriggerRef.current?.focus())
        }}
      />
    </div>
  )
}

export default FileTree
