import { useEffect } from 'react';
import { useProjectStore } from './store/useProjectStore';
import EditorLayout from './components/layout/EditorLayout';

function App() {
  const { editorSettings } = useProjectStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', editorSettings.theme);
  }, [editorSettings.theme]);

  return (
    <EditorLayout />
  );
}

export default App;
