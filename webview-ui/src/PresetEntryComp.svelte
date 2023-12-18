<script lang="ts">
  import { type UiPreset } from '../../src/ui-components/interfaces';
  import ButtonContainer from './components/ButtonContainer.svelte';
  import IconComp from './components/IconComp.svelte';

  export let preset: UiPreset;
</script>

<li
  class={`hover:bg-vscode-list-hoverBackground relative flex w-full items-center hover:cursor-pointer ${
    preset.isSelected && 'bg-vscode-toolbar-activeSelectionBackground'
  }`}
  on:click
>
  <span
    class="indentation border-vscode-tree-inactiveIndentGuidesStroke group-hover/project:border-vscode-tree-indentGuidesStroke !ml-4 border-r border-solid"
  />
  <IconComp icon={preset.isSelected ? 'check' : ''} />
  <span class="p-0 leading-none">{preset.name}</span>
  <ButtonContainer>
    <!-- TODO: Preview file button -->
  </ButtonContainer>
</li>
