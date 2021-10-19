<template>
  <div class="mb-12 text-left">
    <h2 class="text-gray-100 text-xl border-b-2" :class="borderColor">
      {{ title }}
    </h2>
    <div class="text-gray-300 text-base pt-2">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue"

export default Vue.extend({
  props: {
    title: { type: String, required: true } as PropOptions<string>,
    borderColor: { type: String, required: true } as PropOptions<string>,
  },
})
</script>
