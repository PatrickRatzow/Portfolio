<template>
  <div class="container">
    <h1 v-if="error.statusCode === 404">Page not found</h1>
    <h1 v-else>An error occured</h1>
    <nuxt-link to="/">Go to the home page</nuxt-link>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from "vue"

export default Vue.extend({
  props: {
    error: { type: Object, required: true } as PropOptions<{
      statusCode: number
    }>,
  },
})
</script>
