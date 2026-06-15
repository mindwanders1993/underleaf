// Custom Monarch language definition for LaTeX
// Highlights commands, environments, math mode, and comments.

export const latexGrammar = {
  displayName: 'LaTeX',
  name: 'latex',
  defaultToken: '',

  tokenizer: {
    root: [
      // Comments: starting with % and going to the end of the line
      [/%.*$/, 'comment'],

      // Environments: \begin{env} and \end{env}
      [/\\(begin|end)\s*({)([^}]+)(})/, ['keyword.environment', 'delimiter.curly', 'variable.environment', 'delimiter.curly']],

      // LaTeX Commands: e.g. \section, \textbf, etc.
      [/\\([a-zA-Z]+)/, 'keyword'],

      // Single character escape commands (like \{, \}, \\, \_)
      [/\\./, 'keyword'],

      // Math Mode - Block ($$ ... $$) and Inline ($ ... $)
      [/\$\$/, { token: 'string.math', next: '@mathBlock' }],
      [/\$/, { token: 'string.math', next: '@mathInline' }],

      // Brackets and delimiters
      [/[{}()[\]]/, 'delimiter'],

      // Numbers
      [/\d+/, 'number'],
    ],

    mathBlock: [
      [/\$\$/, { token: 'string.math', next: '@pop' }],
      [/[^$]+/, 'string.math'],
      [/./, 'string.math'],
    ],

    mathInline: [
      [/\$/, { token: 'string.math', next: '@pop' }],
      [/[^$]+/, 'string.math'],
      [/./, 'string.math'],
    ],
  },
};
