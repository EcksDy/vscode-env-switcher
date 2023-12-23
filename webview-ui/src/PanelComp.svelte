<script lang="ts">
  import { provideVSCodeDesignSystem, vsCodeProgressRing } from '@vscode/webview-ui-toolkit';
  import {
    WebviewEventType,
    type PresetsViewState,
    type UiProject,
    type WebviewEvents,
  } from '../../src/ui-components/interfaces';
  import FolderComp from './FolderComp.svelte';
  import IconButtonComp from './components/IconButtonComp.svelte';
  import ToolbarComp from './components/ToolbarComp.svelte';
  import { vscode } from './utilities/vscode';

  provideVSCodeDesignSystem().register(vsCodeProgressRing());

  // This is needed because if the webview is out of focus, no events are sent to it, and there's no way to update the state from which it resumes.
  // Meaning that the data is stale and needs to be refreshed.
  vscode.postMessage({ action: WebviewEventType.Refresh });

  const DEFAULT_STATE: PresetsViewState = {
    multiSwitch: false,
    collapsedState: {},
  };

  let { multiSwitch, collapsedState } = vscode.getState() ?? DEFAULT_STATE;
  let isLoading = true;
  let projects: UiProject[] = [];

  window.addEventListener('message', (event: MessageEvent<WebviewEvents>) => {
    if (!event.data) return;
    isLoading = true;
    console.log(`[WebView - event - ${event.data.action}]`);

    switch (event.data.action) {
      case WebviewEventType.Data: {
        const { projects: newProjects } = event.data;
        projects = newProjects;
        // TODO: Handle collapsed state perstistance
        // collapsedState = {};
        break;
      }
      case WebviewEventType.CommandSelected: {
        const { presetPath } = event.data;
        for (const project of projects) {
          const isParentProject = project.presets.some((preset) => preset.path === presetPath);
          if (!isParentProject) continue;

          project.presets = project.presets.map((preset) => ({
            ...preset,
            isSelected: preset.path === presetPath,
          }));
          break;
        }
        break;
      }
    }

    isLoading = false;
  });

  function updateState() {
    vscode.setState({ multiSwitch, collapsedState });
  }
</script>

<ToolbarComp>
  <svelte:fragment slot="buttons">
    <IconButtonComp icons="checklist" tooltip="Multi switch mode" isToggled={multiSwitch} />
    <IconButtonComp
      icons={['collapse-all', 'expand-all']}
      onClick={() => {
        if (!projects?.length) return;

        const isOpen = projects.some((project) => project.isOpen);
        projects = projects.map((project) => ({ ...project, isOpen: !isOpen }));
        // TODO: Handle collapsed state perstistance
        // collapsedState = {};
        // updateState();
      }}
      tooltip="Collapse all projects"
    />
  </svelte:fragment>
</ToolbarComp>

{#if isLoading}
  <div class="flex h-full w-full items-center justify-center">
    <vscode-progress-ring></vscode-progress-ring>
  </div>
{:else if projects?.length}
  <ul class="list-none p-0">
    {#each projects as project}
      <FolderComp {project} {updateState} />
    {/each}
  </ul>
{:else}
  <div class="flex min-h-[100px] w-full items-center justify-center">
    <span class="text-base opacity-80">No presets found</span>
  </div>
{/if}
