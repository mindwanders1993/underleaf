---
name: ul-new-template
description: Scaffold and register a new LaTeX starter template in the Underleaf gallery.
trigger: /ul-new-template
---

# Skill: /ul-new-template

Scaffold and register a new LaTeX template.

## When to invoke
- When the user asks you to add a new document starter, template, or LaTeX preset (e.g. a new CV layout, lab report template, or thesis outline).

## Inputs
- **Name**: Name of the template (e.g. `Academic Paper (IEEE)`).
- **Key**: A unique lowercase slug (e.g. `ieee-article`).
- **Description**: Summary of the template structure and use case.
- **LaTeX Code**: Initial LaTeX source code (or you can generate a professional standard scaffold).

## Steps

### 1. Create the Template File
Templates are kept under `src/templates/` as source `.tex` files.
Create the directory if it doesn't exist:
```bash
mkdir -p src/templates
```
Save the LaTeX code to `src/templates/<key>.tex`. Example for a cover letter:
```latex
% src/templates/cover-letter.tex
\documentclass{letter}
\usepackage[utf8]{inputenc}
\usepackage{geometry}
\geometry{a4paper, margin=1in}

\address{Your Name \\ Your Address \\ Email: mail@domain.com}
\signature{Your Name}

\begin{document}
\begin{letter}{Recipient Name \\ Company Name \\ Recipient Address}
\opening{Dear Recipient Name,}

Subject of your letter here.

\closing{Sincerely,}
\end{letter}
\end{document}
```

### 2. Register the Template in Config
Add the template metadata to the registry file `src/templates/registry.ts` (or create it if initializing).
The metadata schema should look like:
```typescript
export interface LaTeXTemplate {
  key: string;
  name: string;
  description: string;
  category: 'academic' | 'professional' | 'minimal' | 'presentation';
  mainFile: string;
  files: { [filename: string]: string };
}
```
Register the new template in the exported template array:
```typescript
{
  key: 'cover-letter',
  name: 'Cover Letter',
  description: 'Professional layout for job applications and official correspondence.',
  category: 'professional',
  mainFile: 'main.tex',
  files: {
    'main.tex': `... LaTeX code loadable from cover-letter.tex or raw string ...`
  }
}
```

### 3. Verify Build and Output
- Run `/ul-validate` or `npm run build` to ensure the registry imports and exports compile cleanly.
- Verify the template is rendered correctly in the `<TemplateGallery>` component.
