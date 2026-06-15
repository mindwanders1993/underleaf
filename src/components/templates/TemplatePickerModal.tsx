import { useEffect, useRef } from 'react'
import { Check, X } from 'lucide-react'
import { listTemplates } from '../../templates'
import './TemplatePickerModal.css'

interface Props {
  open: boolean
  selectedId: string | null
  onPick: (templateId: string) => void
  onClose: () => void
}

const TemplatePickerModal = ({ open, selectedId, onPick, onClose }: Props) => {
  const firstCardRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    queueMicrotask(() => firstCardRef.current?.focus())
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const templates = listTemplates()

  return (
    <div
      className="ul-template-modal__backdrop"
      onClick={onClose}
      role="presentation"
      data-testid="ul-template-modal-backdrop"
    >
      <div
        className="ul-template-modal"
        role="dialog"
        aria-label="Choose a resume template"
        onClick={(e) => e.stopPropagation()}
        data-testid="ul-template-modal"
      >
        <div className="ul-template-modal__header">
          <h2 className="ul-template-modal__title">Choose a template</h2>
          <button
            type="button"
            className="ul-template-modal__close"
            onClick={onClose}
            aria-label="Close template picker"
          >
            <X size={16} />
          </button>
        </div>

        <div className="ul-template-modal__body">
          <div className="ul-template-modal__grid" role="list">
            {templates.map((t, idx) => {
              const selected = t.id === selectedId
              return (
                <button
                  key={t.id}
                  type="button"
                  ref={idx === 0 ? firstCardRef : null}
                  className="ul-template-card"
                  data-selected={selected}
                  data-template-id={t.id}
                  onClick={() => onPick(t.id)}
                  role="listitem"
                  aria-pressed={selected}
                >
                  <div className="ul-template-card__header">
                    <h3 className="ul-template-card__name">{t.name}</h3>
                    {selected && (
                      <span className="ul-template-card__badge">
                        <Check size={12} /> Selected
                      </span>
                    )}
                  </div>
                  <p className="ul-template-card__description">{t.description}</p>
                  <span className="ul-template-card__action">
                    {selected ? 'Currently in use' : 'Use this template'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplatePickerModal
