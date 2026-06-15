# Multi-Agent Development Prompts

Since you want to distribute the workload to different agents to save tokens and use specific models (like Gemini Flash for UI and Ollama for Git), use the prompts below. 

For each module, there is a **Build Prompt** (feed this to Gemini Flash or MiniMax for code generation), a **Test/Fix Prompt** (if things break), and a **Commit Prompt** (feed this to your local Ollama running `qwen2.5` or `kimi-k2.7-code:cloud`).

---

## Module 3: Monaco Editor Integration

### 1. Build (Copy to Gemini Flash)
> **Role**: Expert React Developer
> **Task**: Implement the Monaco Editor wrapper for a browser-based LaTeX editor.
> **Context**: We are using `@monaco-editor/react` inside a Vite/TypeScript project. The global state is managed by Zustand in `useProjectStore`.
> **Action Items**:
> 1. Create `src/components/editor/latexGrammar.ts`. Define a custom Monarch language definition for LaTeX. It must highlight commands (starting with `\`), environments (`\begin{}` and `\end{}`), math mode (`$`), and comments (`%`).
> 2. Create `src/components/editor/MonacoEditor.tsx`. Import the `@monaco-editor/react` component.
> 3. Use the `onMount` prop to register the custom LaTeX grammar. Also, register a `completionItemProvider` that suggests common LaTeX commands (like `\section`, `\textbf`, `\begin{itemize}`).
> 4. Bind the editor's `value` to `currentProject.files.find(f => f.name === currentProject.mainFile)?.content` from the Zustand store.
> 5. Add an `onChange` handler that debounces by 500ms and calls `updateFileContent(mainFile, newContent)` in the store.
> 6. Add a keyboard shortcut: `Cmd+Enter` (or `Ctrl+Enter`) should trigger `setCompileStatus('COMPILING')`.
> 7. Replace the `EditorPlaceholder` in `src/components/layout/EditorLayout.tsx` with this new `<MonacoEditor />` component.
> Ensure you use pure CSS/inline styles without Tailwind. Provide the full code for both new files.

### 2. Test & Finalize (Copy to Claude/Gemini Pro if issues arise)
> **Role**: Senior Debugger
> **Task**: The Monaco Editor integration has a bug. 
> [PASTE ERROR MESSAGE OR BUG BEHAVIOR HERE]
> Please review `src/components/editor/MonacoEditor.tsx` and provide the fix. Keep in mind that Monaco's `onMount` executes asynchronously.

### 3. Git Push (Copy to Local Ollama: qwen2.5 / kimi-k2.7-code:cloud)
> Write a concise Conventional Commit message for this `git diff`. Output ONLY the commit message without any markdown formatting or pleasantries.
> [PASTE `git diff --cached` OUTPUT HERE]

---

## Module 4: SwiftLaTeX WASM Compiler

### 1. Build (Copy to Gemini Flash / Pro)
> **Role**: WebAssembly / Web Worker Expert
> **Task**: Set up a Web Worker to handle LaTeX compilation without blocking the React UI thread.
> **Context**: We have a Zustand store (`useProjectStore`) that holds a LaTeX project (an array of files with string content). 
> **Action Items**:
> 1. Create `src/workers/compiler.worker.ts`. This worker should listen for `message` events containing an array of files.
> 2. Inside the worker, write a mock function that simulates compilation. It should wait 2 seconds, then return a `SUCCESS` message containing a dummy PDF Blob URL and a dummy log string. (We will integrate the real SwiftLaTeX WASM engine later, just set up the worker architecture first).
> 3. Create `src/services/CompilerService.ts`. This service should instantiate the worker: `new Worker(new URL('../workers/compiler.worker.ts', import.meta.url), { type: 'module' })`.
> 4. Add a `compileProject(files)` function in the service that sends the files to the worker and returns a Promise.
> 5. Update `src/store/useProjectStore.ts`: Create an action `triggerCompile()` that reads `currentProject.files`, sets status to `COMPILING`, calls `CompilerService.compileProject()`, and upon resolution, calls `setCompilationResult()` with the PDF Blob and logs.
> Provide the code for the Worker, the Service, and the necessary Store updates.

### 2. Git Push (Copy to Local Ollama: qwen2.5 / kimi-k2.7-code:cloud)
> Write a concise Conventional Commit message for this `git diff`. Output ONLY the commit message.
> [PASTE `git diff --cached` OUTPUT HERE]

---

## Module 5: PDF Preview

### 1. Build (Copy to Gemini Flash)
> **Role**: React Developer
> **Task**: Implement a PDF viewer using `react-pdf`.
> **Context**: The PDF Blob URL is stored in the Zustand store under `compilationState.pdfBlobUrl`.
> **Action Items**:
> 1. Create `src/components/preview/PDFPreview.tsx`.
> 2. Import `Document` and `Page` from `react-pdf`. Ensure you configure the PDF.js worker path correctly for Vite using: `pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();`
> 3. Connect to the Zustand store. If `pdfBlobUrl` is null, show a placeholder message ("Compile document to view PDF").
> 4. If `pdfBlobUrl` exists, render the `<Document file={pdfBlobUrl}>` and a `<Page>` inside it.
> 5. Add basic zoom state (`scale`, default 1.0) and pagination state (`pageNumber`). 
> 6. Create a small absolute positioned toolbar overlaid on the PDF to zoom in/out and switch pages.
> 7. Replace `PreviewPlaceholder` in the `EditorLayout.tsx` with this component.
> Provide the full component code.

### 2. Git Push (Copy to Local Ollama: qwen2.5 / kimi-k2.7-code:cloud)
> Write a concise Conventional Commit message for this `git diff`. Output ONLY the commit message.
> [PASTE `git diff --cached` OUTPUT HERE]

---

## Module 6: File Manager (Sidebar)

### 1. Build (Copy to MiniMax M3 or Gemini Flash)
> **Role**: Frontend Developer
> **Task**: Build a sidebar file tree component.
> **Context**: The `currentProject` in Zustand has a `files` array. Each file has a `name` and `type` ('tex', 'bib', 'image').
> **Action Items**:
> 1. Create `src/components/sidebar/FileTree.tsx`.
> 2. Map over `currentProject.files` and render a list of files. Use `lucide-react` icons (e.g., `FileCode` for .tex, `FileText` for .bib, `Image` for images).
> 3. Add a "New File" button that prompts for a filename and calls `createFile` from the store.
> 4. Ensure the currently active file (the one being edited in Monaco) is highlighted. Clicking a file should set it as the active file in the store (you may need to add `activeFile` to the Zustand store if it doesn't exist, falling back to `mainFile` initially).
> 5. Replace `SidebarPlaceholder` with `<FileTree />`.
> Provide the component code.

### 2. Git Push (Copy to Local Ollama: qwen2.5 / kimi-k2.7-code:cloud)
> Write a concise Conventional Commit message for this `git diff`. Output ONLY the commit message.
> [PASTE `git diff --cached` OUTPUT HERE]

---

## Module 7: Toolbar & Error Logs

### 1. Build (Copy to Gemini Flash)
> **Role**: Frontend UI Developer
> **Task**: Build the top toolbar and an error log panel.
> **Action Items**:
> 1. Create `src/components/layout/Toolbar.tsx`. It should float above the Editor layout (or exist in a top grid row).
> 2. Add a highly visible "Compile" button. When clicked, it should call `triggerCompile()` from the store. If `compilationState.status === 'COMPILING'`, show a loading spinner on the button.
> 3. Add a "Download PDF" button that triggers an anchor tag download of `pdfBlobUrl`.
> 4. Create `src/components/layout/ErrorLog.tsx`. It should render the array of strings from `compilationState.logs`. If `status === 'ERROR'`, it should highlight the panel in red.
> Provide both components and instructions on where to mount them in `EditorLayout.tsx`.

### 2. Git Push (Copy to Local Ollama: qwen2.5 / kimi-k2.7-code:cloud)
> Write a concise Conventional Commit message for this `git diff`. Output ONLY the commit message.
> [PASTE `git diff --cached` OUTPUT HERE]

---

*Note: Once you reach Module 8 (Templates) and Module 10 (Landing Page), you can reuse the Gemini Flash prompts above, simply adjusting the context to request standard React components based on the Design System tokens we set up.*
