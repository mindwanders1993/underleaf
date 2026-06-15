import { useEffect, useMemo, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { Monaco } from '@monaco-editor/react';
import { useProjectStore } from '../../store/useProjectStore';
import { latexGrammar } from './latexGrammar';
import { getLLMClient, isProviderConfigured } from '../../llm';
import { rewriteForImpact } from '../../ai/rewriteForImpact';
import type { ResumeData } from '../../types/resume';

const MonacoEditor = () => {
  const { currentProject, editorSettings, updateFileContent, setCompileStatus } = useProjectStore();
  const setResume = useProjectStore((s) => s.setResume);
  const llmSettings = useProjectStore((s) => s.llmSettings);

  const projectMode = currentProject?.mode ?? 'raw';
  const resume = currentProject?.resume;
  const mainFile = currentProject?.mainFile || '';
  const fileContent = currentProject?.files.find((f) => f.name === mainFile)?.content || '';

  const isStructured = projectMode === 'structured';
  const structuredText = useMemo(
    () => (resume ? JSON.stringify(resume, null, 2) : '{}'),
    [resume],
  );
  const displayContent = isStructured ? structuredText : fileContent;
  const displayMainFile = isStructured ? 'resume.json' : mainFile;
  const displayLanguage = isStructured ? 'json' : 'latex';

  // Local state to manage editor value without lag/cursor issues during debounced sync
  const [localValue, setLocalValue] = useState(displayContent);
  const [prevDisplayContent, setPrevDisplayContent] = useState(displayContent);
  const [prevMainFile, setPrevMainFile] = useState(displayMainFile);
  const [rewriteStatus, setRewriteStatus] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Sync local state when the displayed content or label changes externally (file switch, mode switch, eject)
  if (displayContent !== prevDisplayContent || displayMainFile !== prevMainFile) {
    setLocalValue(displayContent);
    setPrevDisplayContent(displayContent);
    setPrevMainFile(displayMainFile);
    setJsonError(null);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // References to keep callbacks current without resetting editor command/listener closures
  const updateFileContentRef = useRef(updateFileContent);
  const setCompileStatusRef = useRef(setCompileStatus);
  const setResumeRef = useRef(setResume);
  const mainFileRef = useRef(mainFile);
  const isStructuredRef = useRef(isStructured);
  const llmSettingsRef = useRef(llmSettings);
  const setRewriteStatusRef = useRef(setRewriteStatus);

  useEffect(() => {
    updateFileContentRef.current = updateFileContent;
  }, [updateFileContent]);

  useEffect(() => {
    setCompileStatusRef.current = setCompileStatus;
  }, [setCompileStatus]);

  useEffect(() => {
    setResumeRef.current = setResume;
  }, [setResume]);

  useEffect(() => {
    mainFileRef.current = mainFile;
  }, [mainFile]);

  useEffect(() => {
    isStructuredRef.current = isStructured;
  }, [isStructured]);

  useEffect(() => {
    llmSettingsRef.current = llmSettings;
  }, [llmSettings]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    const newValue = value ?? '';
    setLocalValue(newValue);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (isStructuredRef.current) {
        try {
          const parsed = JSON.parse(newValue) as ResumeData;
          setResumeRef.current(parsed);
          setJsonError(null);
        } catch (err) {
          setJsonError((err as Error).message);
        }
      } else if (mainFileRef.current) {
        updateFileContentRef.current(mainFileRef.current, newValue);
      }
    }, 500);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runRewriteForImpact = async (editor: any) => {
    if (isStructuredRef.current) return; // raw-mode-only action
    if (!isProviderConfigured(llmSettingsRef.current)) {
      setRewriteStatusRef.current('Configure an LLM provider in AI Assist → Settings.');
      window.setTimeout(() => setRewriteStatusRef.current(null), 3500);
      return;
    }
    const model = editor.getModel();
    if (!model) return;
    const selection = editor.getSelection();
    if (!selection) return;
    const isCollapsed =
      selection.startLineNumber === selection.endLineNumber &&
      selection.startColumn === selection.endColumn;
    const range = isCollapsed
      ? {
          startLineNumber: selection.startLineNumber,
          startColumn: 1,
          endLineNumber: selection.startLineNumber,
          endColumn: model.getLineMaxColumn(selection.startLineNumber),
        }
      : selection;
    const original = model.getValueInRange(range) as string;
    if (!original.trim()) return;

    setRewriteStatusRef.current('rewriting…');
    try {
      const client = getLLMClient(llmSettingsRef.current);
      const rewritten = await rewriteForImpact(original, client);
      editor.executeEdits('underleaf.rewriteForImpact', [
        { range, text: rewritten, forceMoveMarkers: true },
      ]);
      setRewriteStatusRef.current(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setRewriteStatusRef.current(`error: ${message}`);
      window.setTimeout(() => setRewriteStatusRef.current(null), 4000);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    // Register LaTeX language if it hasn't been registered yet
    const registeredLanguages = monaco.languages.getLanguages();
    const isLatexRegistered = registeredLanguages.some((lang: { id: string }) => lang.id === 'latex');

    if (!isLatexRegistered) {
      monaco.languages.register({ id: 'latex' });

      // Register custom Monarch syntax highlighter
      monaco.languages.setMonarchTokensProvider('latex', latexGrammar);

      // Register completion item provider for LaTeX commands & snippets
      monaco.languages.registerCompletionItemProvider('latex', {
        triggerCharacters: ['\\'],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provideCompletionItems: (model: any, position: any) => {
          const word = model.getWordUntilPosition(position);
          const lineContent = model.getLineContent(position.lineNumber);

          // Check if we should include the backslash in the replacement range
          let startCol = word.startColumn;
          if (startCol > 1 && lineContent[startCol - 2] === '\\') {
            startCol = startCol - 1;
          }

          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: startCol,
            endColumn: position.column,
          };

          const suggestions = [
            {
              label: '\\section',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: '\\section{${1:title}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'Section heading',
              documentation: 'Create a new major section heading.',
            },
            {
              label: '\\subsection',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: '\\subsection{${1:title}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'Subsection heading',
              documentation: 'Create a subsection heading.',
            },
            {
              label: '\\subsubsection',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: '\\subsubsection{${1:title}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'Subsubsection heading',
              documentation: 'Create a sub-subsection heading.',
            },
            {
              label: '\\textbf',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: '\\textbf{${1:text}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'Bold text font',
              documentation: 'Make the enclosed text bold.',
            },
            {
              label: '\\textit',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: '\\textit{${1:text}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'Italic text font',
              documentation: 'Make the enclosed text italicized.',
            },
            {
              label: '\\texttt',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: '\\texttt{${1:text}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'Typewriter/monospace font',
              documentation: 'Set the enclosed text in monospace font.',
            },
            {
              label: '\\begin{itemize}',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '\\begin{itemize}\n\t\\item ${1:item}\n\\end{itemize}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'Bulleted list',
              documentation: 'Begin a bulleted itemize list.',
            },
            {
              label: '\\begin{enumerate}',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '\\begin{enumerate}\n\t\\item ${1:item}\n\\end{enumerate}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'Numbered list',
              documentation: 'Begin a numbered list.',
            },
            {
              label: '\\begin{equation}',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '\\begin{equation}\n\t${1:e = mc^2}\n\\end{equation}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'Numbered equation',
              documentation: 'Create a numbered math equation block.',
            },
            {
              label: '\\begin{document}',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: '\\begin{document}\n\t${1:}\n\\end{document}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'Document environment',
              documentation: 'Initialize the main document environment body.',
            },
            {
              label: '\\usepackage',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: '\\usepackage{${1:package}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'Import package',
              documentation: 'Import a LaTeX style package in the preamble.',
            },
            {
              label: '\\documentclass',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: '\\documentclass{${1:article}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'Document class',
              documentation: 'Declare the type of document (article, report, book, etc.).',
            },
            {
              label: '\\maketitle',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: '\\maketitle',
              range,
              detail: 'Generate title block',
              documentation: 'Generate the title, author, and date block in the document.',
            },
            {
              label: '\\tableofcontents',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: '\\tableofcontents',
              range,
              detail: 'Generate table of contents',
              documentation: 'Generate a table of contents automatically.',
            },
            {
              label: '\\today',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: '\\today',
              range,
              detail: 'Current date',
              documentation: 'Insert the formatted date of compilation.',
            },
            {
              label: '\\frac',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: '\\frac{${1:num}}{${2:den}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'Fraction command',
              documentation: 'Create a fraction with a numerator and denominator.',
            },
            {
              label: '\\label',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: '\\label{${1:label}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'Label reference',
              documentation: 'Create a label tag for cross-references.',
            },
            {
              label: '\\ref',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: '\\ref{${1:label}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'Cross-reference',
              documentation: 'Reference a labelled item.',
            },
            {
              label: '\\cite',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: '\\cite{${1:key}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              range,
              detail: 'Bibliography citation',
              documentation: 'Cite a reference entry from bib database.',
            },
          ];

          return { suggestions };
        },
      });
    }

    // Register beautiful custom dark theme
    monaco.editor.defineTheme('underleaf-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '818CF8', fontStyle: 'bold' }, // indigo
        { token: 'keyword.environment', foreground: '6EE7B7', fontStyle: 'bold' }, // mint green
        { token: 'variable.environment', foreground: 'F1F5F9', fontStyle: 'italic' },
        { token: 'string.math', foreground: 'FBBF24' }, // amber for math
        { token: 'comment', foreground: '475569', fontStyle: 'italic' }, // muted slate
        { token: 'delimiter', foreground: '94A3B8' },
      ],
      colors: {
        'editor.background': '#0A0E1A', // deep space navy
        'editor.foreground': '#F1F5F9',
        'editorCursor.foreground': '#6EE7B7', // mint green cursor
        'editor.lineHighlightBackground': '#1C2333', // surface2
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#6EE7B7',
        'editor.selectionBackground': '#2D3748',
      },
    });

    // Register beautiful custom light theme
    monaco.editor.defineTheme('underleaf-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '4F46E5', fontStyle: 'bold' }, // indigo
        { token: 'keyword.environment', foreground: '059669', fontStyle: 'bold' }, // darker mint green
        { token: 'variable.environment', foreground: '0F172A', fontStyle: 'italic' },
        { token: 'string.math', foreground: 'D97706' }, // amber math
        { token: 'comment', foreground: '94A3B8', fontStyle: 'italic' },
        { token: 'delimiter', foreground: '475569' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#0F172A',
        'editorCursor.foreground': '#059669',
        'editor.lineHighlightBackground': '#F1F5F9',
        'editorLineNumber.foreground': '#94A3B8',
        'editorLineNumber.activeForeground': '#059669',
        'editor.selectionBackground': '#E2E8F0',
      },
    });

    // Add keyboard shortcut to trigger compilation (Cmd+Enter or Ctrl+Enter)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      setCompileStatusRef.current('COMPILING');
    });

    // Module 8 — Underleaf inline AI action (raw mode only; gated at runtime).
    editor.addAction({
      id: 'underleaf.rewriteForImpact',
      label: 'Underleaf: Rewrite for impact',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyR],
      contextMenuGroupId: '1_modification',
      contextMenuOrder: 1.5,
      run: () => runRewriteForImpact(editor),
    });
  };

  const themeName = editorSettings.theme === 'light' ? 'underleaf-light' : 'underleaf-dark';
  const headerLabel = isStructured ? 'JSON' : 'LaTeX';
  const statusText = rewriteStatus ?? (isStructured && jsonError ? `JSON: ${jsonError.slice(0, 60)}` : null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      {/* Editor Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--spacing-xs) var(--spacing-md)',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          height: '40px',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-hero)',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            fontSize: '0.85rem',
            letterSpacing: '0.5px',
          }}
        >
          {displayMainFile || 'No file selected'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          {statusText && (
            <span
              data-testid="ul-editor-status"
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-ui)',
                color: jsonError && !rewriteStatus ? 'var(--color-danger)' : 'var(--color-accent-primary)',
                fontStyle: 'italic',
              }}
            >
              {statusText}
            </span>
          )}
          <span
            style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-ui)',
              fontWeight: '500',
              color: 'var(--color-text-secondary)',
              background: 'var(--color-surface2)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid var(--color-border)',
            }}
          >
            {headerLabel}
          </span>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
        <Editor
          height="100%"
          language={displayLanguage}
          theme={themeName}
          value={localValue}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize: editorSettings.fontSize || 14,
            fontFamily: 'var(--font-code)',
            fontLigatures: true,
            minimap: { enabled: false },
            wordWrap: 'on' as const,
            lineNumbers: 'on' as const,
            scrollbar: {
              vertical: 'visible' as const,
              horizontal: 'visible' as const,
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            lineHeight: 22,
            cursorBlinking: 'smooth' as const,
            cursorSmoothCaretAnimation: 'on' as const,
            smoothScrolling: true,
            padding: { top: 12, bottom: 12 },
            roundedSelection: true,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

export default MonacoEditor;
