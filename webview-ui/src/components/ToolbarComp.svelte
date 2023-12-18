<script lang="ts">
  import ButtonContainer from './ButtonContainer.svelte';
</script>

<div class="relative m-0 flex h-[1.25rem] items-center">
  <slot name="main" />
  <ButtonContainer>
    <slot name="buttons" />
  </ButtonContainer>
</div>
