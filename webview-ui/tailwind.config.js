/** @type {import('tailwindcss').Config} */
module.exports = {
  // TODO: Remove when certain that purge is not needed
  // purge: {
  //   enabled: !process.env.ROLLUP_WATCH,
  //   content: ['./public/index.html', './src/**/*.svelte'],
  //   options: {
  //     defaultExtractor: (content) => [
  //       ...(content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []),
  //       ...(content.match(/(?<=class:)[^=>\/\s]*/g) || []),
  //     ],
  //   },
  // },

  content: [('./public/index.html', './src/**/*.svelte')],
  darkMode: `media`,
  theme: {
    extend: {
      content: {
        '': '""',
      },
      colors: {
        'vscode-list-hoverBackground': 'var(--vscode-list-hoverBackground)',
        'vscode-toolbar-activeBackground': 'var(--vscode-toolbar-activeBackground)',
        'vscode-toolbar-hoverBackground': 'var(--vscode-toolbar-hoverBackground)',
        'vscode-toolbar-activeSelectionBackground': 'var(--vscode-list-activeSelectionBackground)',
        'vscode-tree-indentGuidesStroke': 'var(--vscode-tree-indentGuidesStroke)',
        'vscode-tree-inactiveIndentGuidesStroke': 'var(--vscode-tree-inactiveIndentGuidesStroke)',
        'vscode-editor-background': 'var(--vscode-editor-background)',
      },
    },
  },
  variants: {},
  plugins: [],
};
