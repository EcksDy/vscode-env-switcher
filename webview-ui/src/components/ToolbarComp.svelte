<script lang="ts">
  import ButtonContainer from './ButtonContainer.svelte';
</script>

<div class="m-0 flex items-center">
  <slot name="main" />
  <ButtonContainer>
    <slot name="buttons" />
  </ButtonContainer>
</div>
