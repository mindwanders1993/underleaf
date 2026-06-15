import { useProjectStore } from '../../store/useProjectStore'

const PreviewPlaceholder = () => {
  const status = useProjectStore((s) => s.compilationState.status)
  const pdfBlobUrl = useProjectStore((s) => s.compilationState.pdfBlobUrl)
  const errors = useProjectStore((s) => s.compilationState.errors)

  const showColdStart = status === 'COMPILING' && !pdfBlobUrl

  return (
    <div
      style={{
        padding: 'var(--spacing-md)',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-surface2)',
      }}
    >
      <div
        className="ul-glass-panel"
        style={{
          width: '80%',
          height: '90%',
          padding: 'var(--spacing-xl)',
          background: 'white',
          color: 'black',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--spacing-md)',
          textAlign: 'center',
        }}
      >
        {showColdStart && (
          <>
            <div
              aria-label="Preparing engine"
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: '4px solid var(--color-border)',
                borderTopColor: 'var(--color-accent-primary)',
                animation: 'ul-spin 1s linear infinite',
              }}
            />
            <h2 style={{ margin: 0 }}>Preparing LaTeX engine…</h2>
            <p style={{ margin: 0, color: '#555' }}>
              First compile fetches the WASM bundle and may take ~30 seconds.
              Subsequent compiles are near-instant.
            </p>
          </>
        )}

        {status === 'ERROR' && (
          <>
            <h2 style={{ margin: 0, color: 'var(--color-danger)' }}>Compilation failed</h2>
            <ul style={{ textAlign: 'left', maxHeight: '60%', overflow: 'auto', margin: 0 }}>
              {errors.slice(0, 10).map((e, i) => (
                <li key={i} style={{ marginBottom: 8 }}>
                  <code>{e.file}:{e.line}</code> — {e.message}
                </li>
              ))}
            </ul>
          </>
        )}

        {status === 'IDLE' && !pdfBlobUrl && (
          <>
            <h2 style={{ margin: 0 }}>Press Cmd/Ctrl + Enter to compile</h2>
            <p style={{ margin: 0, color: '#555' }}>
              Your PDF will render here once Module 3 lands.
            </p>
          </>
        )}

        {status === 'SUCCESS' && pdfBlobUrl && (
          <>
            <h2 style={{ margin: 0, color: 'var(--color-accent-primary)' }}>Compiled</h2>
            <p style={{ margin: 0, color: '#555', wordBreak: 'break-all' }}>
              PDF blob ready at <code>{pdfBlobUrl.slice(0, 64)}…</code>
            </p>
          </>
        )}
      </div>
      <style>{`@keyframes ul-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default PreviewPlaceholder
