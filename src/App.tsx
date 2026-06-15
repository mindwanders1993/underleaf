import { useEffect } from 'react';
import { useProjectStore } from './store/useProjectStore';
import EditorLayout from './components/layout/EditorLayout';
import { useCompileTrigger } from './hooks/useCompileTrigger';

function App() {
  const { editorSettings } = useProjectStore();
  useCompileTrigger();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', editorSettings.theme);
  }, [editorSettings.theme]);

  return (
    <EditorLayout />
  );
}

export default App;
