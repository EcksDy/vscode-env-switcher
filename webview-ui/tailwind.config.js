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
    extend: {
      colors: {
        'vscode-list-hoverBackground': 'var(--vscode-list-hoverBackground)',
        'vscode-toolbar-activeBackground': 'var(--vscode-toolbar-activeBackground)',
        'vscode-toolbar-hoverBackground': 'var(--vscode-toolbar-hoverBackground)',
        'vscode-toolbar-activeSelectionBackground': 'var(--vscode-list-activeSelectionBackground)',
        'vscode-tree-indentGuidesStroke': 'var(--vscode-tree-indentGuidesStroke)',
        'vscode-tree-inactiveIndentGuidesStroke': 'var(--vscode-tree-inactiveIndentGuidesStroke)',
      },
    },
  },
  variants: {},
  plugins: [],
};
