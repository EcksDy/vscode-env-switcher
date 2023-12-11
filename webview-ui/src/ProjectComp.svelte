<script lang="ts">
  import IconButton from './components/IconButtonComp.svelte';

  import { provideVSCodeDesignSystem, vsCodeButton } from '@vscode/webview-ui-toolkit';
  import { vscode } from './utilities/vscode';
  import type { Preset, Project } from '../../src/ui-components/interfaces';
  import PresetEntryComp from './PresetEntryComp.svelte';
  import ButtonContainer from './components/ButtonContainer.svelte';

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
