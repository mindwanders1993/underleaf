import { useMemo } from 'react'
import { useProjectStore } from '../../store/useProjectStore'
import { runAtsHints } from '../../ai/atsHints'

const AtsHintsPanel = () => {
  const resume = useProjectStore((s) => s.currentProject?.resume)
  const hints = useMemo(() => (resume ? runAtsHints(resume) : []), [resume])

  if (!resume) return null

  if (hints.length === 0) {
    return (
      <div className="ul-assistant__stub" data-testid="ul-ats-empty">
        Nice — no ATS hints surfaced from the heuristic pass. Run a JD match for deeper feedback.
      </div>
    )
  }

  return (
    <div data-testid="ul-ats-hints">
      {hints.map((h) => (
        <div key={h.id} className="ul-hint" data-severity={h.severity}>
          <h4 className="ul-hint__title">{h.title}</h4>
          <p className="ul-hint__detail">{h.detail}</p>
        </div>
      ))}
    </div>
  )
}

export default AtsHintsPanel
