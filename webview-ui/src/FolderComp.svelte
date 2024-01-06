<script lang="ts">
  import IconButton from './components/IconButtonComp.svelte';

  import { WebviewEventType, type UiProject } from '../../src/ui-components/interfaces';
  import PresetEntryComp from './PresetEntryComp.svelte';
  import ButtonContainer from './components/ButtonContainer.svelte';
  import { vscode } from './utilities/vscode';

  export let project: UiProject;
  export let updateState: () => void;

  $: hasPresets = !!project.presets.length;
</script>

<li class={`group/project w-full ${!hasPresets && 'text-vscode-tab-inactiveForeground'}`}>
  <div
    class="hover:bg-vscode-list-hoverBackground relative flex cursor-pointer items-center pl-2"
    on:click={() => (project.isOpen = !project.isOpen)}
  >
    <IconButton
      icons={['chevron-right', 'chevron-down']}
      indicateMouse={false}
      isToggled={project.isOpen}
    />
    <span class="whitespace-nowrap py-0 pr-2">{project.name}</span>
    {#if hasPresets}
      <ButtonContainer>
        <IconButton
          icons="lock-small"
          tooltip="Multi switch won't affect this project"
          class={`${!project.isLocked && 'hidden'} group-hover/project:!inline-flex`}
          onClick={(event) => {
            event?.stopPropagation();
            project.isLocked = !project.isLocked;
          }}
        />
      </ButtonContainer>
    {/if}
  </div>
  {#if project.isOpen}
    <ul class="list-none p-0">
      {#if !!project.presets.length}
        {#each project.presets as preset}
          <PresetEntryComp
            {preset}
            on:click={() => {
              project.presets = project.presets.map((p) => ({
                ...p,
                isSelected: p.path === preset.path,
              }));

              vscode.postMessage({
                action: WebviewEventType.Selected,
                selected: [{ presetPath: preset.path, projectPath: preset.projectPath }],
              });
              updateState();
            }}
          />
        {/each}
      {:else}
        <li class="p-0 text-center">No presets found</li>
      {/if}
    </ul>
  {/if}
</li>
