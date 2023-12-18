<script lang="ts">
  /** Icons to display, if provided an array(of 2) will cycle provided icons on click */
  export let icons: string | [string, string];

  export let tooltip: string = '';

  /** Space separated list of classes to be added on toggled state */
  export let toggledClasses: string = '';

  /** Whether to indicate mouse interaction with the button */
  export let indicateMouse: boolean = true;

  /** The onClick prop is a function that is executed when the IconButton component is clicked.
   * It accepts an optional MouseEvent object as its argument.
   */
  export let onClick: (event?: MouseEvent) => void = () => {};

  /** State of the button */
  export let isToggled = false;

  function handleClick(event: MouseEvent) {
    isToggled = !isToggled;

    onClick(event);
  }

  $: currentIcon = (Array.isArray(icons) && icons[Number(!!isToggled)]) || icons;
  $: currentClasses =
    isToggled && `${indicateMouse && 'bg-vscode-toolbar-activeBackground'} ${toggledClasses}`;
</script>

<i
  title={tooltip}
  on:click={handleClick}
  class={`mr-1 inline-flex rounded p-0.5 focus:outline-0
${indicateMouse && 'hover:bg-vscode-toolbar-activeBackground cursor-pointer'} ${
    $$props.class
  } ${currentClasses}`}
>
  <span class={`codicon codicon-${currentIcon}`}></span>
</i>
