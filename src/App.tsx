import { useEffect, useRef } from 'react';
import { useProjectStore } from './store/useProjectStore';
import EditorLayout from './components/layout/EditorLayout';
import OfflineBadge from './components/system/OfflineBadge';
import { useCompileTrigger } from './hooks/useCompileTrigger';
import { useProjectPersistence } from './hooks/useProjectPersistence';
import { loadLlmSettings, saveLlmSettings } from './persistence/llmSettings';

function App() {
  const editorSettings = useProjectStore((s) => s.editorSettings);
  const llmSettings = useProjectStore((s) => s.llmSettings);
  const setLlmSettings = useProjectStore((s) => s.setLlmSettings);
  useCompileTrigger();
  useProjectPersistence();

  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const loaded = loadLlmSettings();
    setLlmSettings(loaded);
  }, [setLlmSettings]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    saveLlmSettings(llmSettings);
  }, [llmSettings]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', editorSettings.theme);
  }, [editorSettings.theme]);

  return (
    <>
      <EditorLayout />
      <OfflineBadge />
    </>
  );
}

export default App;
