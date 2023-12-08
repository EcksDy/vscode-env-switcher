<script lang="ts">
  import InlineButton from './InlineButton.svelte';

  import { provideVSCodeDesignSystem, vsCodeButton } from '@vscode/webview-ui-toolkit';

  import { vscode } from './utilities/vscode';
  import type { Project } from '../../src/ui-components/interfaces';
  import type { GenericOnClickHandler } from './utilities/interfaces';

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
  export let icon: string;
  export let toggleIcon: string;
  export let tooltip: string = '';
  export let classes: string[] = [];
  export let onClick: GenericOnClickHandler<HTMLSpanElement> = () => {};
</script>

<vscode-button appearance="icon" title={tooltip} on:click={onClick}>
  <span class={`codicon codicon-${icon} ${classes.join(' ')}`}></span>
</vscode-button>

<style>
</style>
