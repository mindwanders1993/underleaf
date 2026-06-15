
const EditorPlaceholder = () => {
  return (
    <div style={{ padding: 'var(--spacing-md)', height: '100%', background: 'var(--color-bg)' }}>
      <h3 style={{ color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-md)' }}>main.tex</h3>
      <pre style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-code)' }}>
        {`\\documentclass{article}
\\begin{document}
Hello World!
\\end{document}`}
      </pre>
    </div>
  );
};

export default EditorPlaceholder;
