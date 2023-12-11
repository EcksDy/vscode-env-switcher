<script lang="ts">
  import { provideVSCodeDesignSystem, vsCodeProgressRing } from '@vscode/webview-ui-toolkit';
  import FolderComp from './FolderComp.svelte';
  import { vscode } from './utilities/vscode';
  import type { Preset, Project } from '../../src/ui-components/interfaces';
  import IconButtonComp from './components/IconButtonComp.svelte';
  import ToolbarComp from './components/ToolbarComp.svelte';

  provideVSCodeDesignSystem().register(vsCodeProgressRing());

  let isLoading = true;
  // vscode.setState(null);

  let { action, projects, presets } = {
    action: 'init', // TODO: use discriminated union type
    projects: [] as Project[],
    presets: [] as Preset[],
  };

  window.addEventListener('message', (event) => {
    console.log('event', event);
    if (!event.data?.value) return;

    const {
      action,
      value: { projects: newProjects, presets, multiSwitch },
    } = event.data; //as { action: string; value: PresetsViewData };

    switch (action) {
      case 'init': {
        console.log('init', action);
        vscode.setState({ action, projects: newProjects, presets });
        projects = newProjects;
        break;
      }
    }
  });

  // vscode.postMessage({ action: 'init' });

  setTimeout(() => {
    const x = vscode.getState() as any;
    console.log('x', x);
    action = x.action;
    projects = x.projects;
    presets = x.presets;
    isLoading = false;
  }, 1000);
</script>

<ToolbarComp>
  <svelte:fragment slot="buttons">
    <IconButtonComp icons="checklist" tooltip="Multi switch mode" />
    <IconButtonComp
      icons={['collapse-all', 'expand-all']}
      onClick={() => {
        if (!projects?.length) return;

        const open = projects.some((project) => project.open);
        projects = projects.map((project) => ({ ...project, open: !open }));
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
      <FolderComp {project} presets={presets.filter(({ projectId }) => projectId === project.id)} />
    {/each}
  </ul>
{:else}
  <div class="flex min-h-[100px] w-full items-center justify-center">
    <span class="text-base opacity-80">No presets found</span>
  </div>
{/if}
