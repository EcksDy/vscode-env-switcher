<script lang="ts">
  import IconButton from './components/IconButtonComp.svelte';

  import type { Preset, Project } from '../../src/ui-components/interfaces';
  import PresetEntryComp from './PresetEntryComp.svelte';
  import ButtonContainer from './components/ButtonContainer.svelte';

  export let project: Project;
  export let presets: Preset[];
</script>

<li class="group/project w-full">
  <div
    class="hover:bg-vscode-list-hoverBackground flex cursor-pointer items-center pl-2"
    id={project.id}
    on:click={() => (project.open = !project.open)}
  >
    <IconButton
      icons={['chevron-right', 'chevron-down']}
      indicateMouse={false}
      isToggled={project.open}
    />
    <span class="py-0 pr-2">{project.name}</span>
    <ButtonContainer>
      <IconButton
        icons="lock-small"
        tooltip="Multi switch won't affect this project"
        class={`${!project.locked && 'hidden'} group-hover/project:!inline-flex`}
        onClick={(event) => {
          event?.stopPropagation();
          project.locked = !project.locked;
        }}
      />
    </ButtonContainer>
  </div>
  {#if project.open}
    <ul class="list-none p-0">
      {#each presets as preset}
        <PresetEntryComp
          {preset}
          on:click={() => {
            presets = presets.map((p) => ({
              ...p,
              selected: p.id === preset.id,
            }));
          }}
        />
      {/each}
    </ul>
  {/if}
</li>
