---
name: ul-add-component
description: Scaffold a new React component with styled CSS and proper TypeScript definitions, conforming to the Underleaf design system.
trigger: /ul-add-component
---

# Skill: /ul-add-component

Scaffold a React component folder under `src/components/`.

## When to invoke
- When the user asks you to create a new component, button, dialog, preview card, or sidebar section.

## Inputs
- **Name**: The name of the component (in PascalCase, e.g. `CompileButton`).
- **Description**: What does the component do?
- **Properties**: What props does it accept?

## Steps

### 1. Resolve Path and Structure
For a component named `MyComponent`, create a directory:
```bash
mkdir -p src/components/MyComponent
```

Inside this directory, create two files:
1. `MyComponent.tsx` (component logic and markup)
2. `MyComponent.css` (vanilla CSS, scoped manually or using CSS Modules if configured)

### 2. Scaffold `MyComponent.tsx`
Use this template:
```tsx
import React from 'react';
import './MyComponent.css';

interface MyComponentProps {
  children?: React.ReactNode;
  className?: string;
  // Define other props here
}

export const MyComponent: React.FC<MyComponentProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`ul-my-component ${className}`} {...props}>
      {children}
    </div>
  );
};
```

### 3. Scaffold `MyComponent.css`
Use the custom properties defined in `CLAUDE.md`. Avoid raw color hex values; instead, use `--color-surface`, `--color-accent-primary`, etc.
```css
.ul-my-component {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  color: var(--color-text-primary);
  font-family: 'Inter', sans-serif;
  padding: 16px;
  transition: all 0.2s ease-in-out;
}

/* Glassmorphism example */
.ul-my-component.glass {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

### 4. Verify & Register
- Run `/ul-validate` or `npm run build` to make sure it compiles cleanly.
- Export the component from a global index file if one exists (e.g. `src/components/index.ts`).
