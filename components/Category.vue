<template>
  <div class="mb-12 text-left">
    <h2 class="text-gray-100 text-xl border-b-2" v-bind:class="borderColor">{{ title }}</h2>
    <div class="text-gray-400 text-base pt-2">
      <slot />
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      title: String,
      borderColor: String
    }
  }
</script>
