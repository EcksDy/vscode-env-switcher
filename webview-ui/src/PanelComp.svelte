<script lang="ts">
  import { provideVSCodeDesignSystem, vsCodeProgressRing } from '@vscode/webview-ui-toolkit';
  import { WebviewEventType } from '../../src/ui-components/interfaces';
  import FolderComp from './FolderComp.svelte';
  import IconButtonComp from './components/IconButtonComp.svelte';
  import ToolbarComp from './components/ToolbarComp.svelte';
  import { vscode } from './utilities/vscode';

  provideVSCodeDesignSystem().register(vsCodeProgressRing());

  const DEFAULT_STATE = {
    projects: [],
    multiSwitch: false,
  };

  let { projects, multiSwitch } = vscode.getState() ?? DEFAULT_STATE;
  let isLoading = !projects.length;

  window.addEventListener('message', (event) => {
    if (!event.data) return;
    isLoading = true;
    console.log(`[WebView - event - ${event.data.action}]`);

    switch (event.data.action) {
      case WebviewEventType.Data: {
        const { projects: newProjects } = event.data;
        const oldState = vscode.getState() ?? DEFAULT_STATE;
        vscode.setState({ ...oldState, projects: newProjects });
        projects = newProjects;
        break;
      }
      case WebviewEventType.CommandSelected: {
        const { presetPath } = event.data;
        const oldState = vscode.getState() ?? DEFAULT_STATE;
        for (const project of oldState.projects) {
          const isParentProject = project.presets.some((preset) => preset.path === presetPath);
          if (!isParentProject) continue;

          project.presets = project.presets.map((preset) => ({
            ...preset,
            isSelected: preset.path === presetPath,
          }));
          break;
        }
        vscode.setState(oldState);
        projects = oldState.projects;
        break;
      }
    }

    isLoading = false;
  });

  function updateState() {
    vscode.setState({ multiSwitch, projects });
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
