<script lang="ts">
  import { provideVSCodeDesignSystem, vsCodeProgressRing } from '@vscode/webview-ui-toolkit';
  import ProjectComp from './ProjectComp.svelte';
  import { vscode } from './utilities/vscode';
  import type { Preset, Project } from '../../src/ui-components/interfaces';
  import IconButtonComp from './components/IconButtonComp.svelte';
  import ToolbarComp from './components/ToolbarComp.svelte';

  provideVSCodeDesignSystem().register(vsCodeProgressRing());

  let isLoading = true;

  window.addEventListener('message', (event) => {
    if (!event.data?.value) return;

    const {
      action,
      value: { projects, presets, multiSwitch },
    } = event.data; //as { action: string; value: PresetsViewData };

    // projects = Object.fromEntries(projectsArr.map((project) => [project.id, project]));
    // presets = Object.fromEntries(presetsArr.map((preset) => [preset.id, preset]));

    switch (action) {
      case 'init': {
        vscode.setState({ action, projects });
        break;
      }
    }
  });

  let {
    action,
    values: { projects, presets },
  } = { action: 'init', values: { projects: [] as Project[], presets: [] as Preset[] } };

  setTimeout(() => {
    const x = vscode.getState() as any;
    action = x.action;
    projects = x.values.projects;
    presets = x.values.presets;
    isLoading = false;
  }, 1);
</script>

{#if isLoading}
  <vscode-progress-ring></vscode-progress-ring>
{:else}
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
  <ul class="list-none p-0">
    {#each projects as project}
      <ProjectComp
        {project}
        presets={presets.filter(({ projectId }) => projectId === project.id)}
      />
    {/each}
  </ul>
{/if}
