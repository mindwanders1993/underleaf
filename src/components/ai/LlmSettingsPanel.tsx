import { useState } from 'react'
import { useProjectStore } from '../../store/useProjectStore'
import { LLM_PROVIDERS, getLLMClient, type LLMProvider } from '../../llm'

const LlmSettingsPanel = () => {
  const settings = useProjectStore((s) => s.llmSettings)
  const setLlmSettings = useProjectStore((s) => s.setLlmSettings)
  const [testStatus, setTestStatus] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)

  const provider = LLM_PROVIDERS[settings.provider]

  const handleProviderChange = (id: LLMProvider) => {
    const info = LLM_PROVIDERS[id]
    setLlmSettings({ provider: id, model: info.defaultModel })
    setTestStatus(null)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestStatus(null)
    try {
      const client = getLLMClient(settings)
      const r = await client.complete({ user: 'Reply with the single word: pong.' })
      setTestStatus(`OK — model replied: "${r.text.slice(0, 80)}"`)
    } catch (err) {
      setTestStatus(`Failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div data-testid="ul-llm-settings">
      <div className="ul-settings__field">
        <label htmlFor="ul-provider">Provider</label>
        <select
          id="ul-provider"
          value={settings.provider}
          onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
        >
          {Object.values(LLM_PROVIDERS).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {provider.notes && <span className="ul-settings__notes">{provider.notes}</span>}
      </div>

      <div className="ul-settings__field">
        <label htmlFor="ul-model">Model</label>
        <input
          id="ul-model"
          value={settings.model}
          onChange={(e) => setLlmSettings({ model: e.target.value })}
          list="ul-model-suggestions"
        />
        <datalist id="ul-model-suggestions">
          {provider.suggestedModels.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </div>

      {provider.needsApiKey && (
        <div className="ul-settings__field">
          <label htmlFor="ul-apikey">API key</label>
          <input
            id="ul-apikey"
            type="password"
            value={settings.apiKey ?? ''}
            onChange={(e) => setLlmSettings({ apiKey: e.target.value })}
            placeholder="paste your key"
          />
          <span className="ul-settings__notes">
            Stored only in this browser's localStorage. Never sent anywhere except the provider above.
          </span>
        </div>
      )}

      {settings.provider === 'ollama' && (
        <div className="ul-settings__field">
          <label htmlFor="ul-ollama-host">Ollama host</label>
          <input
            id="ul-ollama-host"
            value={settings.ollamaHost ?? 'http://localhost:11434'}
            onChange={(e) => setLlmSettings({ ollamaHost: e.target.value })}
          />
        </div>
      )}

      <div className="ul-settings__row">
        <button type="button" onClick={handleTest} disabled={testing} data-testid="ul-test-llm">
          {testing ? 'Testing…' : 'Test connection'}
        </button>
      </div>
      {testStatus && (
        <p className="ul-assistant__stub" data-testid="ul-test-status" style={{ marginTop: 8 }}>
          {testStatus}
        </p>
      )}
    </div>
  )
}

export default LlmSettingsPanel
