<div class="absolute right-0 ml-auto inline-flex items-center p-0">
  <span
    class={`h-6 w-4 ${
      $$slots.default
        ? 'from-vscode-editor-background bg-gradient-to-l to-transparent'
        : 'bg-transparent'
    }`}
  />
  <span class="bg-vscode-editor-background"><slot /></span>
</div>
