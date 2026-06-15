import { useEffect, useRef, useState } from 'react'
import { Cloud, Download, Upload, X } from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { exportProjectToFile, importProjectFromFile } from '../../sync/projectIo'
import './BackupModal.css'

interface Props {
  open: boolean
  onClose: () => void
}

const BackupModal = ({ open, onClose }: Props) => {
  const project = useProjectStore((s) => s.currentProject)
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const onExport = () => {
    if (!project) return
    try {
      const name = exportProjectToFile(project)
      setStatus(`Saved ${name}`)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const onPickImport = () => fileInputRef.current?.click()

  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-pick of same file
    if (!file) return
    try {
      const imported = await importProjectFromFile(file)
      setCurrentProject(imported)
      setStatus(`Imported ${imported.name}`)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div
      className="ul-backup__backdrop"
      onClick={onClose}
      role="presentation"
      data-testid="ul-backup-backdrop"
    >
      <div
        className="ul-backup"
        role="dialog"
        aria-label="Backup and sync"
        onClick={(e) => e.stopPropagation()}
        data-testid="ul-backup"
      >
        <div className="ul-backup__header">
          <h2 className="ul-backup__title">Backup &amp; sync</h2>
          <button
            type="button"
            className="ul-backup__close"
            onClick={onClose}
            aria-label="Close backup dialog"
          >
            <X size={16} />
          </button>
        </div>

        <div className="ul-backup__body">
          {error && (
            <div className="ul-backup__error" role="alert">
              {error}
            </div>
          )}
          {status && (
            <div className="ul-backup__success" role="status">
              {status}
            </div>
          )}

          <div className="ul-backup__row">
            <Download className="ul-backup__row-icon" size={20} />
            <div className="ul-backup__row-body">
              <p className="ul-backup__row-title">Export project</p>
              <p className="ul-backup__row-detail">
                Download the whole project as a JSON file. Includes resume content; do not share with
                anyone you wouldn't share your resume with.
              </p>
              <button
                type="button"
                className="ul-backup__btn"
                onClick={onExport}
                disabled={!project}
                data-testid="ul-backup-export"
              >
                Export .json
              </button>
            </div>
          </div>

          <div className="ul-backup__row">
            <Upload className="ul-backup__row-icon" size={20} />
            <div className="ul-backup__row-body">
              <p className="ul-backup__row-title">Import project</p>
              <p className="ul-backup__row-detail">
                Replace the current project with a previously exported `.json`. Validated before
                load.
              </p>
              <button
                type="button"
                className="ul-backup__btn"
                onClick={onPickImport}
                data-testid="ul-backup-import"
              >
                Import .json
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                style={{ display: 'none' }}
                onChange={onImportFile}
                data-testid="ul-backup-file-input"
              />
            </div>
          </div>

          <div className="ul-backup__row">
            <Cloud className="ul-backup__row-icon" size={20} />
            <div className="ul-backup__row-body">
              <p className="ul-backup__row-title">Cloud sync</p>
              <p className="ul-backup__row-detail">
                Underleaf is local-first. Cloud sync (account-based) is on the roadmap — until then
                Export/Import keeps projects portable across browsers and devices.
              </p>
              <button type="button" className="ul-backup__btn" disabled data-testid="ul-backup-cloud">
                Connect cloud (coming soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BackupModal
