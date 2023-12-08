<script lang="ts">
  import { provideVSCodeDesignSystem, vsCodeProgressRing } from '@vscode/webview-ui-toolkit';
  import Project from './Project.svelte';
  import { vscode } from './utilities/vscode';

  provideVSCodeDesignSystem().register(vsCodeProgressRing());

  let isLoading = true;

  window.addEventListener('message', (event) => {
    if (!event.data?.value) return;
    console.log(event.data);

    console.log(`its init`);
    const {
      action,
      value: { projects, presets, multiSwitch },
    } = event.data; //as { action: string; value: PresetsViewData };

    console.log(`its init`, action);
    // projects = Object.fromEntries(projectsArr.map((project) => [project.id, project]));
    // presets = Object.fromEntries(presetsArr.map((preset) => [preset.id, preset]));

    console.log(`its init`, action);
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
  } = { values: { projects: [] } } as any;

  setTimeout(() => {
    const x = vscode.getState() as any;
    action = x.action;
    projects = x.values.projects;
    isLoading = false;
  }, 1000);
  console.log('vscode.getState()', vscode.getState());
  console.log('action', action);
  console.log('projects', projects);
</script>

{#if isLoading}
  <vscode-progress-ring></vscode-progress-ring>
{:else}
  <ul class="list-none p-0">
    {#each projects as project}
      <Project {project}></Project>
    {/each}
  </ul>
{/if}
