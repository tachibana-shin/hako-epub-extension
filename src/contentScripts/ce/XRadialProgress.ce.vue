<!-- daisyUI radial progress: https://daisyui.com/components/radial-progress/ -->
<script lang="ts" setup>
defineProps<{
  value: number
  size: number
}>()
</script>

<template>
  <div
    class="radial-progress"
    :style="{ '--value': value, '--size': `${size}px` }"
    :aria-valuenow="value"
    role="progressbar"
  >
    {{ value }}%
  </div>
</template>

<style lang="scss" scoped>
.radial-progress {
  height: var(--size);
  width: var(--size);
  vertical-align: middle;
  box-sizing: content-box;
  --value: 0;
  --size: 5rem;
  --thickness: calc(var(--size) / 10);
  --radialprogress: calc(var(--value) * 1%);
  background-color: #0000;
  border-radius: 3.40282e38px;
  place-content: center;
  transition: --radialprogress 0.3s linear;
  display: inline-grid;
  position: relative;
  &:before {
    content: "";
    background:
      radial-gradient(farthest-side, currentColor 98%, #0000)
        top/var(--thickness) var(--thickness) no-repeat,
      conic-gradient(currentColor var(--radialprogress), #0000 0);
    mask: radial-gradient(
      farthest-side,
      #0000 calc(100% - var(--thickness)),
      #000 calc(100% + 0.5px - var(--thickness))
    );
    border-radius: 3.40282e38px;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  &:after {
    content: "";
    inset: calc(50% - var(--thickness) / 2);
    transform: rotate(calc(var(--value) * 3.6deg - 90deg))
      translate(calc(var(--size) / 2 - 50%));
    background-color: currentColor;
    border-radius: 3.40282e38px;
    transition: transform 0.3s linear;
    position: absolute;
  }
}
</style>
