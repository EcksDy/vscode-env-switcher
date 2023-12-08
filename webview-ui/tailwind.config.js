/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: {
    enabled: !process.env.ROLLUP_WATCH,
    content: ['./public/index.html', './src/**/*.svelte'],
    options: {
      defaultExtractor: (content) => [
        ...(content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []),
        ...(content.match(/(?<=class:)[^=>\/\s]*/g) || []),
      ],
    },
  },
  darkMode: `media`,
  theme: {
    colors: {
      'vscode-list-hoverBackground': 'var(--vscode-list-hoverBackground)',
      'vscode-toolbar-activeBackground': 'var(--vscode-toolbar-activeBackground)',
      'vscode-toolbar-hoverBackground': 'var(--vscode-toolbar-hoverBackground)',
      'vscode-toolbar-hoverBackground': 'var(--vscode-list-activeSelectionBackground)',
      'vscode-toolbar-hoverBackground': 'var(--vscode-tree-indentGuidesStroke)',
      'vscode-toolbar-hoverBackground': 'var(--vscode-tree-inactiveIndentGuidesStroke',
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
