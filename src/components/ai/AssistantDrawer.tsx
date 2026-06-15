import { useEffect, useState } from 'react'
import { FileSearch, ListChecks, Settings, X } from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import AtsHintsPanel from './AtsHintsPanel'
import JdMatchPanel from './JdMatchPanel'
import LlmSettingsPanel from './LlmSettingsPanel'
import './AssistantDrawer.css'

type Tab = 'ats' | 'jd' | 'settings'

interface Props {
  open: boolean
  onClose: () => void
}

const TABS: Array<{ id: Tab; label: string; icon: typeof ListChecks }> = [
  { id: 'ats', label: 'ATS Hints', icon: ListChecks },
  { id: 'jd', label: 'JD Match', icon: FileSearch },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const AssistantDrawer = ({ open, onClose }: Props) => {
  const mode = useProjectStore((s) => s.currentProject?.mode ?? 'raw')
  const hasResume = useProjectStore((s) => !!s.currentProject?.resume)
  const [activeTab, setActiveTab] = useState<Tab>('ats')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const showStub = mode !== 'structured' || !hasResume

  return (
    <>
      <div
        className="ul-assistant__backdrop"
        onClick={onClose}
        role="presentation"
        data-testid="ul-assistant-backdrop"
      />
      <aside
        className="ul-assistant"
        role="dialog"
        aria-label="AI Assistant"
        data-testid="ul-assistant"
      >
        <div className="ul-assistant__header">
          <h2 className="ul-assistant__title">AI Assistant</h2>
          <button
            type="button"
            className="ul-assistant__close"
            onClick={onClose}
            aria-label="Close AI assistant"
          >
            <X size={16} />
          </button>
        </div>

        <div className="ul-assistant__tabs" role="tablist">
          {TABS.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTab === t.id}
                data-active={activeTab === t.id}
                className="ul-assistant__tab"
                onClick={() => setActiveTab(t.id)}
                data-testid={`ul-tab-${t.id}`}
              >
                <Icon size={14} />
                {t.label}
              </button>
            )
          })}
        </div>

        <div className="ul-assistant__body">
          {showStub && activeTab !== 'settings' ? (
            <div className="ul-assistant__stub" data-testid="ul-assistant-stub">
              <p>
                AI features run on the <strong>structured</strong> resume data, not raw .tex files.
                Switch to structured mode (sidebar footer) to see ATS hints and JD matching here.
              </p>
              <p>The Settings tab still works in raw mode so you can configure your provider up front.</p>
            </div>
          ) : activeTab === 'ats' ? (
            <AtsHintsPanel />
          ) : activeTab === 'jd' ? (
            <JdMatchPanel />
          ) : (
            <LlmSettingsPanel />
          )}
        </div>
      </aside>
    </>
  )
}

export default AssistantDrawer
