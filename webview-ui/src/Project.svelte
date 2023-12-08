<script lang="ts">
  import InlineButton from './InlineButton.svelte';

  import { provideVSCodeDesignSystem, vsCodeButton } from '@vscode/webview-ui-toolkit';
  import { vscode } from './utilities/vscode';
  import type { Project } from '../../src/ui-components/interfaces';

  provideVSCodeDesignSystem().register(vsCodeButton());

  // To register more toolkit components, simply import the component
  // registration function and call it from within the register
  // function, like so:
  //
  // provideVSCodeDesignSystem().register(
  //   vsCodeButton(),
  //   vsCodeCheckbox()
  // );
  //
  // Finally, if you would like to register all of the toolkit
  // components at once, there's a handy convenience function:
  //
  // provideVSCodeDesignSystem().register(allComponents);
  export let project: Project;
</script>

<div class="group/project w-full flex pl-2 hover:bg-vscode-list-hoverBackground" id={project.id}>
  <InlineButton icon="file-code"></InlineButton>
</div>

<style>
</style>
