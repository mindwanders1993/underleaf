import { useState } from 'react'
import { useProjectStore } from '../../store/useProjectStore'
import { analyzeJobDescription, type JdMatchResult } from '../../ai/jdMatcher'
import { getLLMClient, isProviderConfigured } from '../../llm'

const JdMatchPanel = () => {
  const resume = useProjectStore((s) => s.currentProject?.resume)
  const llmSettings = useProjectStore((s) => s.llmSettings)
  const configured = isProviderConfigured(llmSettings)

  const [jd, setJd] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<JdMatchResult | null>(null)

  if (!resume) return null

  const runAnalyze = async () => {
    if (!resume || !jd.trim()) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const client = getLLMClient(llmSettings)
      const r = await analyzeJobDescription(resume, jd, client)
      setResult(r)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div data-testid="ul-jd-panel">
      <p className="ul-assistant__stub">
        Paste a job description; the LLM scores fit and suggests bullet rewrites.
      </p>

      <textarea
        className="ul-jd__textarea"
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste the job description here…"
        aria-label="Job description"
        data-testid="ul-jd-textarea"
      />

      <div className="ul-jd__row">
        <button
          type="button"
          className="ul-jd__btn"
          onClick={runAnalyze}
          disabled={!configured || !jd.trim() || busy}
          data-testid="ul-jd-analyze"
        >
          {busy ? 'Analyzing…' : 'Analyze'}
        </button>
        {!configured && (
          <span className="ul-jd__status">Configure an LLM provider in Settings first.</span>
        )}
      </div>

      {error && (
        <div className="ul-jd__error" role="alert">
          {error}
        </div>
      )}

      {result && (
        <div data-testid="ul-jd-result">
          <div className="ul-jd__score">
            Fit score <span className="ul-jd__score-num">{result.score}</span> / 100
          </div>

          {result.gaps.length > 0 && (
            <>
              <h4 style={{ margin: '12px 0 6px' }}>Gaps</h4>
              {result.gaps.map((g, i) => (
                <div key={i} className="ul-jd__gap">
                  {g}
                </div>
              ))}
            </>
          )}

          {result.suggestions.length > 0 && (
            <>
              <h4 style={{ margin: '12px 0 6px' }}>Suggested rewrites</h4>
              {result.suggestions.map((s, i) => (
                <div key={i} className="ul-jd__suggestion">
                  <div style={{ marginBottom: 4, color: 'var(--color-text-secondary)' }}>
                    Original
                  </div>
                  <code>{s.bullet}</code>
                  <div style={{ marginBottom: 4, color: 'var(--color-text-secondary)' }}>
                    Rewrite
                  </div>
                  <code>{s.rewrite}</code>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Why: {s.reason}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default JdMatchPanel
