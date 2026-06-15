
const PreviewPlaceholder = () => {
  return (
    <div style={{ 
      padding: 'var(--spacing-md)', 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--color-surface2)'
    }}>
      <div className="ul-glass-panel" style={{ width: '80%', height: '90%', padding: 'var(--spacing-xl)', background: 'white' }}>
        <h1 style={{ color: 'black', textAlign: 'center' }}>Hello World!</h1>
      </div>
    </div>
  );
};

export default PreviewPlaceholder;
